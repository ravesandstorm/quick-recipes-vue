import { ObjectId } from 'mongodb'
import { connectToDatabase, getCollection } from '../../../utils/db'

export default defineEventHandler(async (event) => {
  try {
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
    const recipes = getCollection('recipes')
    const favorites = getCollection('favorites')

    // Verify recipe exists
    const recipe = await recipes.findOne({ _id: new ObjectId(recipeId) })
    if (!recipe) {
      throw createError({ statusCode: 404, statusMessage: 'Recipe not found' })
    }

    // Check current favorite state
    const existing = await favorites.findOne({ userId, recipeId })
    const isFavorited = !!existing

    if (isFavorited) {
      await favorites.deleteOne({ userId, recipeId })
    } else {
      await favorites.insertOne({ userId, recipeId, createdAt: new Date() })
    }

    // Compute live count from favorites table
    const favoritesCount = await favorites.countDocuments({ recipeId })

    return {
      success: true,
      data: {
        isFavorited: !isFavorited,
        favoriteCount: favoritesCount
      }
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('Error toggling favorite:', error)
    throw createError({ statusCode: 500, statusMessage: 'Internal server error' })
  }
})
