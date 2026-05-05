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

    const userId = user.userId
    
    await connectToDatabase()
    const users = getCollection('users')
    
    const userDoc = await users.findOne({ _id: new ObjectId(userId) })
    
    if (!userDoc) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found'
      })
    }
    
    return {
      success: true,
      data: userDoc.favRecipes || []
    }
  } catch (error: unknown) {
    if ((error as any).statusCode) {
      throw error
    }
    
    console.error('Error fetching user favorites:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})

