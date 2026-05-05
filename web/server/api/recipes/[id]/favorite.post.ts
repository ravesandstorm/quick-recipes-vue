import { ObjectId } from 'mongodb'
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
    const users = getCollection('users')
    const recipes = getCollection('recipes')

    // Check if recipe exists
    const recipe = await recipes.findOne({ _id: new ObjectId(recipeId) })
    if (!recipe) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Recipe not found'
      })
    }

    // Get user's current favorites
    const userDoc = await users.findOne({ _id: new ObjectId(userId) })
    if (!userDoc) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found'
      })
    }

    const favorites = userDoc.favRecipes || []
    const isFavorited = favorites.includes(recipeId)

    if (isFavorited) {
      // Remove from favorites
      await users.updateOne(
        { _id: new ObjectId(userId) },
        {
          $pull: { favRecipes: recipeId },
          $set: { updatedAt: new Date() }
        }
      )
      
      // Decrease favorite count
      await recipes.updateOne(
        { _id: new ObjectId(recipeId) },
        { 
          $inc: { favoriteCount: -1 },
          $set: { updatedAt: new Date() }
        }
      )
    } else {
      // Add to favorites
      await users.updateOne(
        { _id: new ObjectId(userId) },
        {
          $addToSet: { favRecipes: recipeId },
          $set: { updatedAt: new Date() }
        }
      )
      
      // Increase favorite count
      await recipes.updateOne(
        { _id: new ObjectId(recipeId) },
        { 
          $inc: { favoriteCount: 1 },
          $set: { updatedAt: new Date() }
        }
      )
    }

    return {
      success: true,
      data: {
        isFavorited: !isFavorited,
        favoriteCount: recipe.favoriteCount + (isFavorited ? -1 : 1)
      }
    }
  } catch (error: unknown) {
    if ((error as any).statusCode) {
      throw error
    }
    
    console.error('Error toggling favorite:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})
