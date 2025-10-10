import { ObjectId } from 'mongodb'
import { connectToDatabase, getCollection } from '../../../utils/db'

export default defineEventHandler(async (event) => {
  try {
    const recipeId = getRouterParam(event, 'id')
    const body = await readBody(event)
    const { userId, rating } = body

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

    if (!rating || rating < 1 || rating > 5) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Rating must be between 1 and 5'
      })
    }

    await connectToDatabase()
    const ratings = getCollection('ratings')
    const recipes = getCollection('recipes')

    // Check if recipe exists
    const recipe = await recipes.findOne({ _id: new ObjectId(recipeId) })
    if (!recipe) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Recipe not found'
      })
    }

    // Check if user already rated this recipe
    const existingRating = await ratings.findOne({
      recipeId: recipeId,
      userId: userId
    })

    if (existingRating) {
      // Update existing rating
      await ratings.updateOne(
        { recipeId: recipeId, userId: userId },
        { 
          $set: { 
            rating: rating,
            updatedAt: new Date()
          }
        }
      )
    } else {
      // Create new rating
      await ratings.insertOne({
        recipeId: recipeId,
        userId: userId,
        rating: rating,
        createdAt: new Date(),
        updatedAt: new Date()
      })
    }

    // Calculate new average rating
    const allRatings = await ratings.find({ recipeId: recipeId }).toArray()
    const averageRating = allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length

    // Update recipe with new average rating
    await recipes.updateOne(
      { _id: new ObjectId(recipeId) },
      { 
        $set: { 
          rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
          updatedAt: new Date()
        }
      }
    )

    return {
      success: true,
      data: {
        userRating: rating,
        averageRating: Math.round(averageRating * 10) / 10,
        totalRatings: allRatings.length
      }
    }
  } catch (error: unknown) {
    if ((error as any).statusCode) {
      throw error
    }
    
    console.error('Error submitting rating:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})
