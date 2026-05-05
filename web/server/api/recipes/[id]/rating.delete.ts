import { MongoClient, ObjectId } from 'mongodb'

export default defineEventHandler(async (event) => {
  const user = event.context.user
  
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

  const config = useRuntimeConfig()
  const client = new MongoClient(config.mongodbUri)

  try {
    await client.connect()
    const db = client.db('quick-recipes')
    const ratings = db.collection('ratings')
    const recipes = db.collection('recipes')

    // Delete the user's rating
    const deleteResult = await ratings.deleteOne({
      recipeId: new ObjectId(recipeId),
      userId: new ObjectId(user.userId)
    })

    if (deleteResult.deletedCount === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Rating not found'
      })
    }

    // Recalculate average rating
    const allRatings = await ratings.find({ recipeId: new ObjectId(recipeId) }).toArray()
    const totalRatings = allRatings.length
    const averageRating = totalRatings > 0
      ? allRatings.reduce((sum, r) => sum + r.rating, 0) / totalRatings
      : 0

    // Update recipe with new average rating
    await recipes.updateOne(
      { _id: new ObjectId(recipeId) },
      { 
        $set: { 
          rating: Math.round(averageRating * 10) / 10,
          numberOfRatings: totalRatings
        } 
      }
    )

    return {
      success: true,
      data: {
        userRating: null,
        averageRating: Math.round(averageRating * 10) / 10,
        totalRatings
      }
    }
  } catch (error: any) {
    console.error('Error deleting rating:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to delete rating'
    })
  } finally {
    await client.close()
  }
})

