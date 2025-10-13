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

    // Get the user and their followers
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) })
    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found'
      })
    }

    const followerIds = user.followers || []
    
    // Fetch follower details
    const followers = await usersCollection
      .find({ 
        _id: { $in: followerIds.map((id: string) => new ObjectId(id)) }
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
    const transformedFollowers = followers.map(follower => ({
      id: follower._id.toString(),
      name: follower.name,
      email: follower.email,
      bio: follower.bio,
      createdRecipes: follower.createdRecipes || [],
      followers: follower.followers || [],
      following: follower.following || []
    }))

    return {
      success: true,
      data: transformedFollowers
    }

  } catch (error) {
    console.error('Get followers error:', error)
    
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
