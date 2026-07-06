import { connectToDatabase, getCollection } from '../../utils/db'
import type { Recipe, RecipeFormData } from '../../../types'

export default defineEventHandler(async (event) => {
  try {
    // Get authenticated user from context (set by auth middleware)
    const user = event.context.user

    if (!user || !user.userId) {
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

    const userId = user.userId
    
    if (!body.title || !body.description || !body.instructions?.length || !body.ingredients?.length) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required fields'
      })
    }
    
    await connectToDatabase()
    const recipes = getCollection('recipes')

    const newRecipe: Omit<Recipe, '_id'> = {
      title: body.title,
      description: body.description,
      calories: body.calories,
      protein: body.protein,
      carbs: body.carbs,
      instructions: body.instructions.filter(inst => inst.trim()),
      createdByID: userId,
      difficultyRating: body.difficultyRating,
      ingredientIDs: body.ingredients.map(ing => ing.ingredientId),
      ingredients: body.ingredients,
      isGlutenFree: body.isGlutenFree || false,
      isLactoseFree: body.isLactoseFree || false,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    const result = await recipes.insertOne(newRecipe)
    const recipeId = result.insertedId.toString()

    // Recipe stores createdByID as FK — no separate user array to update
    
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
