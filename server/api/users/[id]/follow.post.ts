import { ObjectId } from 'mongodb'
import { connectToDatabase, getCollection } from '../../../utils/db'

export default defineEventHandler(async (event) => {
  try {
    const currentUser = event.context.user
    if (!currentUser) {
      throw createError({ statusCode: 401, statusMessage: 'Authentication required' })
    }

    const targetUserId = getRouterParam(event, 'id')
    if (!targetUserId) {
      throw createError({ statusCode: 400, statusMessage: 'User ID is required' })
    }

    if (currentUser.userId === targetUserId) {
      throw createError({ statusCode: 400, statusMessage: 'Cannot follow yourself' })
    }

    await connectToDatabase()
    const users = getCollection('users')
    const follows = getCollection('follows')

    const targetUser = await users.findOne({ _id: new ObjectId(targetUserId) })
    if (!targetUser) {
      throw createError({ statusCode: 404, statusMessage: 'User not found' })
    }

    const existing = await follows.findOne({
      followerId: currentUser.userId,
      followingId: targetUserId
    })

    if (existing) {
      await follows.deleteOne({ followerId: currentUser.userId, followingId: targetUserId })
    } else {
      await follows.insertOne({
        followerId: currentUser.userId,
        followingId: targetUserId,
        createdAt: new Date()
      })
    }

    const followersCount = await follows.countDocuments({ followingId: targetUserId })

    return {
      success: true,
      data: {
        isFollowing: !existing,
        followersCount
      }
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('Follow/unfollow error:', error)
    throw createError({ statusCode: 500, statusMessage: 'Internal server error' })
  }
})
