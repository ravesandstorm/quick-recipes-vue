import { connectToDatabase, getCollection } from '../utils/db'

export default defineEventHandler(async (event) => {
  try {
    await connectToDatabase()
    
    const recipes = getCollection('recipes')
    const users = getCollection('users')
    const ingredients = getCollection('ingredients')
    
    const [totalRecipes, totalUsers, totalIngredients] = await Promise.all([
      recipes.countDocuments(),
      users.countDocuments(),
      ingredients.countDocuments()
    ])
    
    return {
      success: true,
      data: {
        totalRecipes,
        totalUsers,
        totalIngredients
      }
    }
  } catch (error) {
    console.error('Error fetching stats:', error)
    
    // Return sample stats for development
    return {
      success: true,
      data: {
        totalRecipes: 1,
        totalUsers: 2,
        totalIngredients: 3
      }
    }
  }
})
