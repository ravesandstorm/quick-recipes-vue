import { connectToDatabase, getCollection } from '../../../utils/db'

export default defineEventHandler(async (event) => {
  try {
    const recipeId = getRouterParam(event, 'id')
    const query = getQuery(event)
    const userId = query.userId as string

    if (!userId) {
      throw createError({
        statusCode: 401,
        statusMessage: 'User ID is required'
      })
    }

    if (!recipeId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Recipe ID is required'
      })
    }

    await connectToDatabase()
    const ratings = getCollection('ratings')

    // Find user's rating for this recipe
    const userRating = await ratings.findOne({
      recipeId: recipeId,
      userId: userId
    })

    if (!userRating) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Rating not found'
      })
    }

    return {
      success: true,
      data: {
        rating: userRating.rating
      }
    }
  } catch (error: unknown) {
    if ((error as any).statusCode) {
      throw error
    }
    
    console.error('Error getting user rating:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})
