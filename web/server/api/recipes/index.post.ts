import { ObjectId } from 'mongodb'
import { connectToDatabase, getCollection } from '../../utils/db'
import type { Recipe, RecipeFormData } from '../../../types'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event) as RecipeFormData & {
      calories: number
      protein: number
      carbs: number
      userId?: string
    }

    // Get user ID from request body
    const userId = body.userId

    if (!userId) {
      throw createError({
        statusCode: 401,
        statusMessage: 'User ID is required'
      })
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
      isGlutenFree: body.isGlutenFree || false,
      isLactoseFree: body.isLactoseFree || false,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    const result = await recipes.insertOne(newRecipe)
    const recipeId = result.insertedId.toString()

    // Update user's created recipes
    try {
      await users.updateOne(
        { _id: new ObjectId(userId) },
        {
          $push: { createdRecipes: recipeId },
          $set: { updatedAt: new Date() }
        }
      )
    } catch (userUpdateError) {
      console.warn('Failed to update user created recipes:', userUpdateError)
      // Don't fail the recipe creation if user update fails
    }
    
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
