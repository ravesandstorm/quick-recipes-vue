
import { ObjectId } from 'mongodb'
import { connectToDatabase, getCollection } from '../../utils/db'
import type { AppError } from '../../../types'

export default defineEventHandler(async (event) => {
  try {
    const userId = getRouterParam(event, 'id')
    const body = await readBody(event)
    
    if (!userId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'User ID is required'
      })
    }
    
    if (!body.name && !body.bio) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Name or bio is required'
      })
    }
    
    await connectToDatabase()
    const users = getCollection('users')
    
    const updateData: any = {
      updatedAt: new Date()
    }
    
    if (body.name) updateData.name = body.name
    if (body.bio !== undefined) updateData.bio = body.bio
    
    const result = await users.updateOne(
      { _id: new ObjectId(userId) },
      { $set: updateData }
    )
    
    if (result.matchedCount === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found'
      })
    }

    // Fetch and return the updated user data
    const updatedUser = await users.findOne({ _id: new ObjectId(userId) })

    if (!updatedUser) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found after update'
      })
    }

    // Return only the updatable fields
    const userData = {
      id: updatedUser._id.toString(),
      email: updatedUser.email,
      name: updatedUser.name,
      bio: updatedUser.bio,
      avatar: updatedUser.avatar
    }

    return {
      success: true,
      data: userData
    }
  } catch (error: unknown) {
    if ((error as AppError).statusCode) {
      throw error
    }
    
    console.error('Error updating user:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})

