import { ObjectId } from 'mongodb'
import { connectToDatabase, getCollection } from '../../../utils/db'

export default defineEventHandler(async (event) => {
  try {
    const user = event.context.user
    if (!user || !user.userId) {
      throw createError({ statusCode: 401, statusMessage: 'Authentication required' })
    }

    const recipeId = getRouterParam(event, 'id')
    const body = await readBody(event)
    const { rating } = body
    const userId = user.userId

    if (!recipeId) {
      throw createError({ statusCode: 400, statusMessage: 'Recipe ID is required' })
    }

    if (!rating || rating < 1 || rating > 5) {
      throw createError({ statusCode: 400, statusMessage: 'Rating must be between 1 and 5' })
    }

    await connectToDatabase()
    const ratings = getCollection('ratings')
    const recipes = getCollection('recipes')

    const recipe = await recipes.findOne({ _id: new ObjectId(recipeId) })
    if (!recipe) {
      throw createError({ statusCode: 404, statusMessage: 'Recipe not found' })
    }

    // Capture existing rating before upsert (needed for frontend to compute new average locally)
    const existingRating = await ratings.findOne({ recipeId, userId })
    const previousRating = existingRating?.rating ?? null
    const isNew = !existingRating

    if (existingRating) {
      await ratings.updateOne(
        { recipeId, userId },
        { $set: { rating, updatedAt: new Date() } }
      )
    } else {
      await ratings.insertOne({ recipeId, userId, rating, createdAt: new Date(), updatedAt: new Date() })
    }

    // Return only what the frontend needs to compute the new average locally
    return {
      success: true,
      data: { userRating: rating, previousRating, isNew }
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('Error submitting rating:', error)
    throw createError({ statusCode: 500, statusMessage: 'Internal server error' })
  }
})
