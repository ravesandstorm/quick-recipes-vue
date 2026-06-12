import { connectToDatabase, getCollection } from '../../../utils/db'

export default defineEventHandler(async (event) => {
  const user = event.context.user
  if (!user || !user.userId) {
    throw createError({ statusCode: 401, statusMessage: 'Authentication required' })
  }

  const recipeId = getRouterParam(event, 'id')
  if (!recipeId) {
    throw createError({ statusCode: 400, statusMessage: 'Recipe ID is required' })
  }

  try {
    await connectToDatabase()
    const ratings = getCollection('ratings')

    const deleteResult = await ratings.deleteOne({ recipeId, userId: user.userId })
    if (deleteResult.deletedCount === 0) {
      throw createError({ statusCode: 404, statusMessage: 'Rating not found' })
    }

    // Frontend computes the new average locally from its existing state
    return { success: true, data: { userRating: null } }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('Error deleting rating:', error)
    throw createError({ statusCode: 500, statusMessage: 'Failed to delete rating' })
  }
})
