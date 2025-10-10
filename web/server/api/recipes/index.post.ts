import { connectToDatabase, getCollection } from '../../utils/db'
import type { Recipe, RecipeFormData } from '../../../types'

export default defineEventHandler(async (event) => {
  try {
    // Mock authentication for now
    const userId = 'mock-user-id'

    if (!userId) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Authentication required'
      })
    }
    
    const body = await readBody(event) as RecipeFormData & {
      calories: number
      protein: number
      carbs: number
    }
    
    if (!body.title || !body.description || !body.instructions?.length || !body.ingredients?.length) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required fields'
      })
    }
    
    await connectToDatabase()
    const recipes = getCollection('recipes')
    const users = getCollection('users')
    
    // Create new recipe
    const newRecipe: Omit<Recipe, '_id' | 'id'> = {
      title: body.title,
      description: body.description,
      calories: body.calories,
      protein: body.protein,
      carbs: body.carbs,
      instructions: body.instructions.filter(inst => inst.trim()),
      createdByID: userId,
      favoriteCount: 0,
      rating: undefined,
      difficultyRating: body.difficultyRating,
      ingredientIDs: body.ingredients.map(ing => ing.ingredientId),
      ingredients: body.ingredients,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    const result = await recipes.insertOne(newRecipe)
    const recipeId = result.insertedId.toString()
    
    // Update user's created recipes (mock for now)
    // await users.updateOne(
    //   { _id: userId },
    //   {
    //     $push: { createdRecipes: recipeId },
    //     $set: { updatedAt: new Date() }
    //   }
    // )
    
    return {
      success: true,
      data: {
        id: recipeId,
        ...newRecipe
      }
    }
  } catch (error) {
    if (error.statusCode) {
      throw error
    }
    
    console.error('Error creating recipe:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})
