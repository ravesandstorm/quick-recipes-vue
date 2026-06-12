import { ObjectId } from 'mongodb'
import { connectToDatabase, getCollection } from '../../utils/db'

export default defineEventHandler(async (event) => {
  try {
    const userId = getRouterParam(event, 'id')
    if (!userId) {
      throw createError({ statusCode: 400, statusMessage: 'User ID is required' })
    }

    await connectToDatabase()
    const users = getCollection('users')
    const follows = getCollection('follows')
    const recipes = getCollection('recipes')

    const user = await users.findOne({ _id: new ObjectId(userId) })
    if (!user) {
      throw createError({ statusCode: 404, statusMessage: 'User not found' })
    }

    const [followersCount, followingCount, recipesCount] = await Promise.all([
      follows.countDocuments({ followingId: userId }),
      follows.countDocuments({ followerId: userId }),
      recipes.countDocuments({ createdByID: userId })
    ])

    const currentUser = event.context.user
    const isFollowing = currentUser
      ? !!(await follows.findOne({ followerId: currentUser.userId, followingId: userId }))
      : false

    return {
      data: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        bio: user.bio,
        avatar: user.avatar,
        followersCount,
        followingCount,
        recipesCount,
        isFollowing
      }
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('Error fetching user:', error)
    throw createError({ statusCode: 500, statusMessage: 'Internal server error' })
  }
})
