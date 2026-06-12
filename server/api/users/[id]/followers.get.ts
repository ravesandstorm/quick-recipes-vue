import { ObjectId } from 'mongodb'
import { connectToDatabase, getCollection } from '../../../utils/db'

export default defineEventHandler(async (event) => {
  try {
    const userId = getRouterParam(event, 'id')
    if (!userId) {
      throw createError({ statusCode: 400, statusMessage: 'User ID is required' })
    }

    await connectToDatabase()
    const follows = getCollection('follows')
    const users = getCollection('users')

    const followDocs = await follows.find({ followingId: userId }).toArray()
    const followerIds = followDocs.map(f => new ObjectId(f.followerId as string))

    if (followerIds.length === 0) {
      return { success: true, data: [] }
    }

    const followerUsers = await users
      .find({ _id: { $in: followerIds } })
      .project({ name: 1, email: 1, bio: 1, avatar: 1 })
      .toArray()

    return {
      success: true,
      data: followerUsers.map(u => ({
        id: u._id.toString(),
        name: u.name,
        email: u.email,
        bio: u.bio,
        avatar: u.avatar
      }))
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('Get followers error:', error)
    throw createError({ statusCode: 500, statusMessage: 'Internal server error' })
  }
})
