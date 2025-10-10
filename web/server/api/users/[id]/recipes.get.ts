import { ObjectId } from 'mongodb'
import { connectToDatabase, getCollection } from '../../../utils/db'
import type { Recipe, Error } from '../../../../types'

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
    
    // First verify the user exists
    const user = await users.findOne({ _id: new ObjectId(userId) })
    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found'
      })
    }
    
    // Find all recipes created by this user
    const userRecipes = await recipes
      .aggregate([
        {
          $match: { 
            createdByID: userId // Store as string in recipes collection
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
          $sort: { createdAt: -1 } // Most recent first
        }
      ])
      .toArray()
    
    return {
      success: true,
      data: userRecipes
    }
  } catch (error: unknown) {
    if ((error as Error).statusCode) {
      throw error
    }
    
    console.error('Error fetching user recipes:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})
