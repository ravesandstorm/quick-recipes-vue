import { ObjectId } from 'mongodb'
import { connectToDatabase, getCollection } from '../../../utils/db'
import type { AppError } from '../../../../types'

export default defineEventHandler(async (event) => {
  try {
    const userId = getRouterParam(event, 'id')

    if (!userId) {
      throw createError({ statusCode: 400, statusMessage: 'User ID is required' })
    }

    await connectToDatabase()
    const recipes = getCollection('recipes')
    const users = getCollection('users')

    const user = await users.findOne({ _id: new ObjectId(userId) })
    if (!user) {
      throw createError({ statusCode: 404, statusMessage: 'User not found' })
    }

    const userRecipes = await recipes
      .aggregate([
        { $match: { createdByID: userId } },
        {
          $addFields: {
            recipeIdStr: { $toString: '$_id' },
            createdByObjectId: { $toObjectId: '$createdByID' }
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'createdByObjectId',
            foreignField: '_id',
            as: 'creator',
            pipeline: [{ $project: { _id: 1, name: 1, avatar: 1 } }]
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
            _id: 0,
            id: 1,
            title: 1,
            description: 1,
            calories: 1,
            protein: 1,
            carbs: 1,
            difficultyRating: 1,
            favoriteCount: 1,
            averageRating: 1,
            totalRatings: 1,
            createdBy: 1,
            createdByID: 1,
            isGlutenFree: 1,
            isLactoseFree: 1,
            createdAt: 1,
            updatedAt: 1
          }
        },
        { $sort: { createdAt: -1 } }
      ])
      .toArray()

    return { success: true, data: userRecipes }
  } catch (error: unknown) {
    if ((error as AppError).statusCode) throw error
    console.error('Error fetching user recipes:', error)
    throw createError({ statusCode: 500, statusMessage: 'Internal server error' })
  }
})
