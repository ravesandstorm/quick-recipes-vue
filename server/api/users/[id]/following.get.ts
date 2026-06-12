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

    const followDocs = await follows.find({ followerId: userId }).toArray()
    const followingIds = followDocs.map(f => new ObjectId(f.followingId as string))

    if (followingIds.length === 0) {
      return { success: true, data: [] }
    }

    const followingUsers = await users
      .find({ _id: { $in: followingIds } })
      .project({ name: 1, email: 1, bio: 1, avatar: 1 })
      .toArray()

    return {
      success: true,
      data: followingUsers.map(u => ({
        id: u._id.toString(),
        name: u.name,
        email: u.email,
        bio: u.bio,
        avatar: u.avatar
      }))
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('Get following error:', error)
    throw createError({ statusCode: 500, statusMessage: 'Internal server error' })
  }
})
