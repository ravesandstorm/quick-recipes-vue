import { ObjectId } from 'mongodb'
import { connectToDatabase, getCollection } from '../../../utils/db'
import type { Recipe, Error, User } from '../../../../types'

export default defineEventHandler(async (event) => {
  try {
    const userId = getRouterParam(event, 'id')
    
    if (!userId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'User ID is required'
      })
    }
    
    await connectToDatabase()
    const recipes = getCollection('recipes')
    const users = getCollection('users')
    
    // First verify the user exists and get their favorite recipe IDs
    const user = await users.findOne({ _id: ObjectId.createFromHexString(userId) }) as User | null
    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found'
      })
    }
    
    // Get the user's favorite recipe IDs
    const favoriteRecipeIds = user.favRecipes || []
    
    if (favoriteRecipeIds.length === 0) {
      return {
        success: true,
        data: []
      }
    }
    
    // Convert string IDs to ObjectIds for MongoDB query
    const objectIds = favoriteRecipeIds.map(id => {
      try {
        return ObjectId.createFromHexString(id)
      } catch (error) {
        console.warn(`Invalid ObjectId: ${id}`)
        return null
      }
    }).filter(id => id !== null)
    
    if (objectIds.length === 0) {
      return {
        success: true,
        data: []
      }
    }
    
    // Find all favorite recipes with creator information
    const favoriteRecipes = await recipes
      .aggregate([
        {
          $match: { 
            _id: { $in: objectIds }
          }
        },
        {
          $addFields: {
            createdByObjectId: { $toObjectId: '$createdByID' }
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'createdByObjectId',
            foreignField: '_id',
            as: 'creator',
            pipeline: [
              {
                $project: {
                  _id: 1,
                  name: 1,
                  avatar: 1
                }
              }
            ]
          }
        },
        {
          $addFields: {
            id: { $toString: '$_id' },
            createdBy: { $arrayElemAt: ['$creator.name', 0] }
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
            createdBy: 1,
            createdAt: 1,
            updatedAt: 1
          }
        },
        {
          $sort: { favoriteCount: -1, rating: -1 } // Most popular first
        }
      ])
      .toArray()
    
    return {
      success: true,
      data: favoriteRecipes
    }
  } catch (error: unknown) {
    if ((error as Error).statusCode) {
      throw error
    }
    
    console.error('Error fetching user favorite recipes:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})
