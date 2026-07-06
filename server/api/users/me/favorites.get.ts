import { connectToDatabase, getCollection } from '../../../utils/db'

export default defineEventHandler(async (event) => {
  try {
    const user = event.context.user

    if (!user || !user.userId) {
      throw createError({ statusCode: 401, statusMessage: 'Authentication required' })
    }

    await connectToDatabase()
    const favorites = getCollection('favorites')

    // Return the list of favorited recipe IDs for the current user
    const favDocs = await favorites.find({ userId: user.userId }).toArray()
    const recipeIds = favDocs.map(f => f.recipeId)

    return { success: true, data: recipeIds }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('Error fetching user favorites:', error)
    throw createError({ statusCode: 500, statusMessage: 'Internal server error' })
  }
})
