
import { ObjectId } from 'mongodb'
import { connectToDatabase, getCollection } from '../../utils/db'
import type { User, Error } from '../../../types'

export default defineEventHandler(async (event) => {
  try {
    const userId = getRouterParam(event, 'id')
    
    if (!userId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'User ID is required'
      })
    }
    
    await connectToDatabase()
    const users = getCollection('users')
    
    const user = await users.findOne({ _id: new ObjectId(userId) })
    
    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found'
      })
    }
    
    // Transform user data for response
    const userData = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      bio: user.bio,
      followers: user.followers || [],
      following: user.following || [],
      createdRecipes: user.createdRecipes || []
    }
    
    return {
      data: userData
    }
  } catch (error: unknown) {
    if ((error as Error).statusCode) {
      throw error
    }
    
    console.error('Error fetching user:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})

