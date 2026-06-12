import { connectToDatabase, getCollection } from '../../../utils/db'
import { getAuthenticatedUser } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  const user = await getAuthenticatedUser(event)

  if (!user || !user.userId) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication required'
    })
  }

  const recipeId = getRouterParam(event, 'id')

  if (!recipeId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Recipe ID is required'
    })
  }

  try {
    await connectToDatabase()
    const ratings = getCollection('ratings')

    // Delete the user's rating (recipeId and userId are stored as strings)
    const deleteResult = await ratings.deleteOne({
      recipeId: recipeId,
      userId: user.userId
    })

    if (deleteResult.deletedCount === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Rating not found'
      })
    }

    // Recompute average live from ratings table (not cached on recipe document)
    const allRatings = await ratings.find({ recipeId: recipeId }).toArray()
    const totalRatings = allRatings.length
    const averageRating = totalRatings > 0
      ? allRatings.reduce((sum, r) => sum + r.rating, 0) / totalRatings
      : 0

    return {
      success: true,
      data: {
        userRating: null,
        averageRating: Math.round(averageRating * 10) / 10,
        totalRatings
      }
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    console.error('Error deleting rating:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to delete rating'
    })
  }
})
