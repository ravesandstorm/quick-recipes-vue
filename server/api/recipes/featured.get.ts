import { connectToDatabase, getCollection } from '../../utils/db'
import type { Recipe } from '../../../types'

export default defineEventHandler(async (event) => {
  try {
    await connectToDatabase()
    const recipes = getCollection('recipes')
    const users = getCollection('users')
    
    // Get featured recipes (top rated and most favorited)
    const featuredRecipes = await recipes
      .aggregate([
        {
          $addFields: {
            createdByIDObj: { $toObjectId: '$createdByID' }
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'createdByIDObj',
            foreignField: '_id',
            as: 'creator'
          }
        },
        {
          $addFields: {
            createdBy: { $arrayElemAt: ['$creator.name', 0] },
            id: { $toString: '$_id' }
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
            rating: 1,
            difficultyRating: 1,
            favoriteCount: 1,
            createdBy: 1,
            createdByID: 1,
            isGlutenFree: 1,
            isLactoseFree: 1,
            createdAt: 1
          }
        },
        {
          $sort: { favoriteCount: -1, rating: -1, createdAt: -1 }
        },
        {
          $limit: 6
        }
      ])
      .toArray()
    
    return {
      success: true,
      data: featuredRecipes
    }
  } catch (error: any) {
    console.error('Error fetching featured recipes:', error)
    if (error.statusCode) throw error
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch featured recipes'
    })
  }
})
