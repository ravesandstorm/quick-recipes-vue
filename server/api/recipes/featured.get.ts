import { connectToDatabase, getCollection } from '../../utils/db'

export default defineEventHandler(async (event) => {
  try {
    await connectToDatabase()
    const recipes = getCollection('recipes')

    // Get featured recipes — favoriteCount and rating computed live from relational tables
    const featuredRecipes = await recipes
      .aggregate([
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
            rating: {
              $cond: {
                if: { $gt: [{ $size: '$ratingDocs' }, 0] },
                then: {
                  $round: [
                    { $divide: [{ $sum: '$ratingDocs.rating' }, { $size: '$ratingDocs' }] },
                    1
                  ]
                },
                else: null
              }
            }
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
            rating: 1,
            difficultyRating: 1,
            favoriteCount: 1,
            createdBy: 1,
            createdByID: 1,
            isGlutenFree: 1,
            isLactoseFree: 1,
            createdAt: 1
          }
        },
        { $sort: { favoriteCount: -1, rating: -1, createdAt: -1 } },
        { $limit: 6 }
      ])
      .toArray()

    return { success: true, data: featuredRecipes }
  } catch (error: any) {
    console.error('Error fetching featured recipes:', error)
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, statusMessage: 'Failed to fetch featured recipes' })
  }
})
