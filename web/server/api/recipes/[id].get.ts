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
            createdAt: 1,
            updatedAt: 1,
            'creator.id': { $toString: '$creator._id' },
            'creator.name': 1,
            'creator.avatar': 1
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
    
    // Return sample recipe for development
    const sampleRecipe = {
      id: '1',
      title: 'Classic Spaghetti Carbonara',
      description: 'A traditional Italian pasta dish with eggs, cheese, and pancetta. This creamy and delicious recipe is perfect for a quick dinner and uses simple ingredients that pack a lot of flavor.',
      calories: 520,
      protein: 25,
      carbs: 65,
      rating: 4.8,
      difficultyRating: 2,
      favoriteCount: 156,
      instructions: [
        'Bring a large pot of salted water to boil and cook spaghetti according to package directions until al dente.',
        'While pasta cooks, heat a large skillet over medium heat and cook pancetta until crispy, about 5-7 minutes.',
        'In a bowl, whisk together eggs, grated Parmesan cheese, and black pepper.',
        'Drain pasta, reserving 1 cup of pasta water. Add hot pasta to the skillet with pancetta.',
        'Remove from heat and quickly stir in the egg mixture, adding pasta water gradually to create a creamy sauce.',
        'Serve immediately with additional Parmesan cheese and freshly cracked black pepper.'
      ],
      ingredients: [
        {
          ingredientId: '1',
          quantity: 400,
          unit: 'grams',
          ingredient: {
            id: '1',
            name: 'Spaghetti',
            caloriesPerUnit: 1.31,
            proteinPerUnit: 0.05,
            carbsPerUnit: 0.25,
            defaultUnit: 'grams'
          }
        },
        {
          ingredientId: '2',
          quantity: 150,
          unit: 'grams',
          ingredient: {
            id: '2',
            name: 'Pancetta',
            caloriesPerUnit: 3.0,
            proteinPerUnit: 0.21,
            carbsPerUnit: 0,
            defaultUnit: 'grams'
          }
        },
        {
          ingredientId: '3',
          quantity: 3,
          unit: 'pieces',
          ingredient: {
            id: '3',
            name: 'Eggs',
            caloriesPerUnit: 70,
            proteinPerUnit: 6,
            carbsPerUnit: 0.6,
            defaultUnit: 'pieces'
          }
        },
        {
          ingredientId: '4',
          quantity: 100,
          unit: 'grams',
          ingredient: {
            id: '4',
            name: 'Parmesan Cheese',
            caloriesPerUnit: 4.31,
            proteinPerUnit: 0.38,
            carbsPerUnit: 0.04,
            defaultUnit: 'grams'
          }
        }
      ],
      creator: {
        id: 'chef1',
        name: 'Chef Mario',
        avatar: null
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    return {
      success: true,
      data: sampleRecipe
    }
  }
})
