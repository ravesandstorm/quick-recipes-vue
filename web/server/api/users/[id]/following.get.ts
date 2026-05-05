import { MongoClient, ObjectId } from 'mongodb'

const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017')

export default defineEventHandler(async (event) => {
  try {
    const userId = getRouterParam(event, 'id')
    if (!userId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'User ID is required'
      })
    }

    await client.connect()
    const db = client.db('quick-recipes')
    const usersCollection = db.collection('users')

    // Get the user and their following list
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) })
    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found'
      })
    }

    const followingIds = user.following || []
    
    // Fetch following user details
    const following = await usersCollection
      .find({ 
        _id: { $in: followingIds.map((id: string) => new ObjectId(id)) }
      })
      .project({
        name: 1,
        email: 1,
        bio: 1,
        createdRecipes: 1,
        followers: 1,
        following: 1
      })
      .toArray()

    // Transform the data
    const transformedFollowing = following.map(followedUser => ({
      id: followedUser._id.toString(),
      name: followedUser.name,
      email: followedUser.email,
      bio: followedUser.bio,
      createdRecipes: followedUser.createdRecipes || [],
      followers: followedUser.followers || [],
      following: followedUser.following || []
    }))

    return {
      success: true,
      data: transformedFollowing
    }

  } catch (error) {
    console.error('Get following error:', error)
    
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
