import { MongoClient, ObjectId } from 'mongodb'
import { getAuthenticatedUser } from '../../../utils/auth'

const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017')

export default defineEventHandler(async (event) => {
  try {
    // Get authenticated user
    const currentUser = await getAuthenticatedUser(event)
    if (!currentUser) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Authentication required'
      })
    }

    const targetUserId = getRouterParam(event, 'id')
    if (!targetUserId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'User ID is required'
      })
    }

    // Can't follow yourself
    if (currentUser.userId === targetUserId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Cannot follow yourself'
      })
    }

    await client.connect()
    const db = client.db('quick-recipes')
    const usersCollection = db.collection('users')

    // Check if target user exists
    const targetUser = await usersCollection.findOne({ _id: new ObjectId(targetUserId) })
    if (!targetUser) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found'
      })
    }

    // Check if already following
    const currentUserDoc = await usersCollection.findOne({ _id: new ObjectId(currentUser.userId) })
    const isCurrentlyFollowing = currentUserDoc?.following?.includes(targetUserId) || false

    if (isCurrentlyFollowing) {
      // Unfollow: Remove from current user's following and target user's followers
      await usersCollection.updateOne(
        { _id: new ObjectId(currentUser.userId) },
        { $pull: { following: targetUserId } }
      )
      
      await usersCollection.updateOne(
        { _id: new ObjectId(targetUserId) },
        { $pull: { followers: currentUser.userId } }
      )
    } else {
      // Follow: Add to current user's following and target user's followers
      await usersCollection.updateOne(
        { _id: new ObjectId(currentUser.userId) },
        { $addToSet: { following: targetUserId } }
      )
      
      await usersCollection.updateOne(
        { _id: new ObjectId(targetUserId) },
        { $addToSet: { followers: currentUser.userId } }
      )
    }

    // Get updated follower count
    const updatedTargetUser = await usersCollection.findOne({ _id: new ObjectId(targetUserId) })
    const followersCount = updatedTargetUser?.followers?.length || 0

    return {
      success: true,
      data: {
        isFollowing: !isCurrentlyFollowing,
        followersCount
      }
    }

  } catch (error) {
    console.error('Follow/unfollow error:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  } finally {
    await client.close()
  }
})
