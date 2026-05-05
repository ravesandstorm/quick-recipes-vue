import { connectToDatabase, getCollection } from '../../../utils/db'

export default defineEventHandler(async (event) => {
  try {
    // Get authenticated user from context (set by auth middleware)
    const user = event.context.user

    if (!user || !user.userId) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Authentication required'
      })
    }

    const recipeId = getRouterParam(event, 'id')
    const userId = user.userId

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
