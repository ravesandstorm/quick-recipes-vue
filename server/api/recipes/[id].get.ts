import { ObjectId } from 'mongodb'
import { connectToDatabase, getCollection } from '../../utils/db'
import type { Recipe } from '../../../types'

export default defineEventHandler(async (event) => {
  try {
    const recipeId = getRouterParam(event, 'id')
    
    if (!recipeId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Recipe ID is required'
      })
    }
    
    await connectToDatabase()
    const recipes = getCollection('recipes')
    const users = getCollection('users')
    const ingredients = getCollection('ingredients')
    
    // Find recipe with creator and ingredient details
    const recipe = await recipes
      .aggregate([
        {
          $match: { _id: new ObjectId(recipeId) }
        },
        {
          $addFields: {
            createdByObjectId: {
              $cond: {
                if: { $type: "$createdByID" },
                then: { $toObjectId: "$createdByID" },
                else: null
              }
            }
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'createdByObjectId',
            foreignField: '_id',
            as: 'creator'
          }
        },
        {
          $addFields: {
            id: { $toString: '$_id' },
            creator: { $arrayElemAt: ['$creator', 0] }
          }
        },
        {
          $project: {
            _id: 0,
            id: 1,
            title: 1,
            description: 1,
            calories: 1,
            protein: 1,
            carbs: 1,
            instructions: 1,
            rating: 1,
            difficultyRating: 1,
            favoriteCount: 1,
            ingredients: 1,
            createdByID: 1,
            isGlutenFree: 1,
            isLactoseFree: 1,
            createdAt: 1,
            updatedAt: 1,
            createdBy: {
              $ifNull: ['$creator.name', 'Deleted User']
            },
            'creator.id': {
              $cond: {
                if: { $ne: ['$creator', null] },
                then: { $toString: '$creator._id' },
                else: null
              }
            },
            'creator.name': {
              $ifNull: ['$creator.name', 'Deleted User']
            },
            'creator.avatar': '$creator.avatar'
          }
        }
      ])
      .toArray()
    
    if (!recipe || recipe.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Recipe not found'
      })
    }
    
    const recipeData = recipe[0]
    
    // Populate ingredient details
    if (recipeData.ingredients && recipeData.ingredients.length > 0) {
      const ingredientIds = recipeData.ingredients
        .map((ing: any) => ing.ingredientId)
        .filter((id: string) => id)
        .map((id: string) => new ObjectId(id))
      
      if (ingredientIds.length > 0) {
        const ingredientDetails = await ingredients
          .find({ _id: { $in: ingredientIds } })
          .toArray()
        
        // Map ingredient details to recipe ingredients
        recipeData.ingredients = recipeData.ingredients.map((recipeIng: any) => {
          const ingredientDetail = ingredientDetails.find(
            (ing: any) => ing._id.toString() === recipeIng.ingredientId
          )
          
          return {
            ...recipeIng,
            ingredient: ingredientDetail ? {
              ...ingredientDetail,
              id: ingredientDetail._id.toString()
            } : null
          }
        })
      }
    }
    
    return {
      success: true,
      data: recipeData
    }
  } catch (error: unknown) {
    if ((error as any).statusCode) {
      throw error
    }
    console.error('Error fetching recipe:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch recipe'
    })
  }
})
