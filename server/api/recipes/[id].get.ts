import { ObjectId } from 'mongodb'
import { connectToDatabase, getCollection } from '../../utils/db'

export default defineEventHandler(async (event) => {
  try {
    const recipeId = getRouterParam(event, 'id')
    if (!recipeId) {
      throw createError({ statusCode: 400, statusMessage: 'Recipe ID is required' })
    }

    await connectToDatabase()
    const recipes = getCollection('recipes')

    const result = await recipes
      .aggregate([
        { $match: { _id: new ObjectId(recipeId) } },
        {
          $addFields: {
            recipeIdStr: { $toString: '$_id' },
            createdByObjectId: { $toObjectId: '$createdByID' }
          }
        },
        // Join creator
        {
          $lookup: {
            from: 'users',
            localField: 'createdByObjectId',
            foreignField: '_id',
            as: 'creator'
          }
        },
        // Join favorites for live count
        {
          $lookup: {
            from: 'favorites',
            localField: 'recipeIdStr',
            foreignField: 'recipeId',
            as: 'favoriteDocs'
          }
        },
        // Join ratings for live average + count
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
            creator: { $arrayElemAt: ['$creator', 0] },
            favoriteCount: { $size: '$favoriteDocs' },
            averageRating: {
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
            instructions: 1,
            difficultyRating: 1,
            favoriteCount: 1,
            averageRating: 1,
            totalRatings: 1,
            ingredients: 1,
            createdByID: 1,
            isGlutenFree: 1,
            isLactoseFree: 1,
            createdAt: 1,
            updatedAt: 1,
            createdBy: { $ifNull: ['$creator.name', 'Deleted User'] }
          }
        }
      ])
      .toArray()

    if (!result || result.length === 0) {
      throw createError({ statusCode: 404, statusMessage: 'Recipe not found' })
    }

    const recipeData = result[0]

    // Populate ingredient details from ingredients collection
    if (recipeData.ingredients?.length > 0) {
      const ingredientIds = recipeData.ingredients
        .map((ing: any) => ing.ingredientId)
        .filter(Boolean)
        .map((id: string) => new ObjectId(id))

      if (ingredientIds.length > 0) {
        const ingredientDetails = await getCollection('ingredients')
          .find({ _id: { $in: ingredientIds } })
          .toArray()

        recipeData.ingredients = recipeData.ingredients.map((recipeIng: any) => {
          const detail = ingredientDetails.find(
            (ing: any) => ing._id.toString() === recipeIng.ingredientId
          )
          return {
            ...recipeIng,
            ingredient: detail ? { ...detail, id: detail._id.toString() } : null
          }
        })
      }
    }

    return { success: true, data: recipeData }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('Error fetching recipe:', error)
    throw createError({ statusCode: 500, statusMessage: 'Failed to fetch recipe' })
  }
})
