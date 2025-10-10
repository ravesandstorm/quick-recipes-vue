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
          $lookup: {
            from: 'users',
            localField: 'createdByID',
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
  } catch (error) {
    console.error('Error fetching featured recipes:', error)
    
    // Return sample data for development
    const sampleRecipes = [
      {
        id: '1',
        title: 'Classic Spaghetti Carbonara',
        description: 'A traditional Italian pasta dish with eggs, cheese, and pancetta',
        calories: 520,
        protein: 25,
        carbs: 65,
        rating: 4.8,
        difficultyRating: 2,
        favoriteCount: 156,
        createdBy: 'Chef Mario',
        createdAt: new Date()
      },
      {
        id: '2',
        title: 'Healthy Buddha Bowl',
        description: 'Nutritious bowl with quinoa, roasted vegetables, and tahini dressing',
        calories: 380,
        protein: 15,
        carbs: 45,
        rating: 4.6,
        difficultyRating: 1,
        favoriteCount: 89,
        createdBy: 'Sarah Green',
        createdAt: new Date()
      },
      {
        id: '3',
        title: 'Chocolate Chip Cookies',
        description: 'Soft and chewy homemade cookies with premium chocolate chips',
        calories: 180,
        protein: 3,
        carbs: 25,
        rating: 4.9,
        difficultyRating: 1,
        favoriteCount: 234,
        createdBy: 'Baker Betty',
        createdAt: new Date()
      },
      {
        id: '4',
        title: 'Grilled Salmon with Herbs',
        description: 'Fresh salmon fillet grilled to perfection with aromatic herbs',
        calories: 420,
        protein: 35,
        carbs: 8,
        rating: 4.7,
        difficultyRating: 3,
        favoriteCount: 67,
        createdBy: 'Chef Alex',
        createdAt: new Date()
      },
      {
        id: '5',
        title: 'Vegetarian Tacos',
        description: 'Colorful tacos filled with seasoned black beans and fresh vegetables',
        calories: 320,
        protein: 12,
        carbs: 48,
        rating: 4.5,
        difficultyRating: 2,
        favoriteCount: 123,
        createdBy: 'Maria Lopez',
        createdAt: new Date()
      },
      {
        id: '6',
        title: 'Banana Smoothie Bowl',
        description: 'Creamy smoothie bowl topped with fresh fruits and granola',
        calories: 280,
        protein: 8,
        carbs: 52,
        rating: 4.4,
        difficultyRating: 1,
        favoriteCount: 45,
        createdBy: 'Healthy Hannah',
        createdAt: new Date()
      }
    ]
    
    return {
      success: true,
      data: sampleRecipes
    }
  }
})
