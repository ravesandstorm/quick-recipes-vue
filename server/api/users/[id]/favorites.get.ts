import { ObjectId } from 'mongodb'
import { connectToDatabase, getCollection } from '../../../utils/db'

export default defineEventHandler(async (event) => {
  try {
    const userId = getRouterParam(event, 'id')

    if (!userId) {
      throw createError({ statusCode: 400, statusMessage: 'User ID is required' })
    }

    await connectToDatabase()
    const users = getCollection('users')
    const favorites = getCollection('favorites')
    const recipes = getCollection('recipes')

    // Verify user exists
    const user = await users.findOne({ _id: new ObjectId(userId) })
    if (!user) {
      throw createError({ statusCode: 404, statusMessage: 'User not found' })
    }

    // Get favorite recipe IDs from relational table
    const favDocs = await favorites.find({ userId }).toArray()
    if (favDocs.length === 0) {
      return { success: true, data: [] }
    }

    const recipeIds = favDocs.map(f => {
      try { return new ObjectId(f.recipeId) } catch { return null }
    }).filter(Boolean)

    if (recipeIds.length === 0) {
      return { success: true, data: [] }
    }

    // Fetch recipes with computed counts from relational tables
    const favoriteRecipes = await recipes
      .aggregate([
        { $match: { _id: { $in: recipeIds } } },
        {
          $addFields: {
            createdByIDObj: { $toObjectId: '$createdByID' },
            recipeIdStr: { $toString: '$_id' }
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'createdByIDObj',
            foreignField: '_id',
            as: 'creator'
          }
        },
        {
          $lookup: {
            from: 'favorites',
            localField: 'recipeIdStr',
            foreignField: 'recipeId',
            as: 'favoriteDocs'
          }
        },
        {
          $lookup: {
            from: 'ratings',
            localField: 'recipeIdStr',
            foreignField: 'recipeId',
            as: 'ratingDocs'
          }
        },
        {
          $addFields: {
            id: { $toString: '$_id' },
            createdBy: { $arrayElemAt: ['$creator.name', 0] },
            favoriteCount: { $size: '$favoriteDocs' },
            averageRating: {
              $cond: {
                if: { $gt: [{ $size: '$ratingDocs' }, 0] },
                then: { $round: [{ $divide: [{ $sum: '$ratingDocs.rating' }, { $size: '$ratingDocs' }] }, 1] },
                else: null
              }
            },
            totalRatings: { $size: '$ratingDocs' }
          }
        },
        {
          $project: {
            _id: 0, id: 1, title: 1, description: 1, calories: 1, protein: 1, carbs: 1,
            averageRating: 1, totalRatings: 1, difficultyRating: 1, favoriteCount: 1,
            createdBy: 1, createdByID: 1, isGlutenFree: 1, isLactoseFree: 1, createdAt: 1
          }
        },
        { $sort: { favoriteCount: -1, averageRating: -1 } }
      ])
      .toArray()

    return { success: true, data: favoriteRecipes }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('Error fetching user favorites:', error)
    throw createError({ statusCode: 500, statusMessage: 'Internal server error' })
  }
})
