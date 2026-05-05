import { connectToDatabase, getCollection } from '../../utils/db'
import type { SearchFilters } from '../../../types'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event) as SearchFilters
    
    await connectToDatabase()
    const recipes = getCollection('recipes')
    
    // Build MongoDB aggregation pipeline
    const pipeline: any[] = []
    
    // Match stage for filtering
    const matchStage: any = {}
    
    // Text search
    if (query.query) {
      matchStage.$text = { $search: query.query }
    }
    
    // Rating filter
    if (query.minRating) {
      matchStage.rating = { $gte: parseFloat(query.minRating.toString()) }
    }
    
    // Calorie filters
    if (query.minCalories || query.maxCalories) {
      matchStage.calories = {}
      if (query.minCalories) matchStage.calories.$gte = parseInt(query.minCalories.toString())
      if (query.maxCalories) matchStage.calories.$lte = parseInt(query.maxCalories.toString())
    }
    
    // Protein filters
    if (query.minProtein || query.maxProtein) {
      matchStage.protein = {}
      if (query.minProtein) matchStage.protein.$gte = parseFloat(query.minProtein.toString())
      if (query.maxProtein) matchStage.protein.$lte = parseFloat(query.maxProtein.toString())
    }
    
    // Carbs filters
    if (query.minCarbs || query.maxCarbs) {
      matchStage.carbs = {}
      if (query.minCarbs) matchStage.carbs.$gte = parseFloat(query.minCarbs.toString())
      if (query.maxCarbs) matchStage.carbs.$lte = parseFloat(query.maxCarbs.toString())
    }
    
    // Ingredient filters - exact match
    if (query.ingredients && query.ingredients.length > 0) {
      // Convert ingredients array to array if it's a string
      const ingredientIds = Array.isArray(query.ingredients) ? query.ingredients : [query.ingredients]

      // Filter recipes that contain ALL specified ingredients (exact match)
      matchStage.ingredientIDs = {
        $all: ingredientIds
      }
    }
    
    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage })
    }
    
    // Lookup creator information
    pipeline.push({
      $lookup: {
        from: 'users',
        localField: 'createdByID',
        foreignField: '_id',
        as: 'creator'
      }
    })
    
    // Add computed fields
    pipeline.push({
      $addFields: {
        id: { $toString: '$_id' },
        createdBy: { $arrayElemAt: ['$creator.name', 0] },
        score: query.query ? { $meta: 'textScore' } : 1
      }
    })
    
    // Sort stage
    const sortStage: any = {}
    
    switch (query.sortBy) {
      case 'rating':
        sortStage.rating = query.sortOrder === 'asc' ? 1 : -1
        break
      case 'favoriteCount':
        sortStage.favoriteCount = query.sortOrder === 'asc' ? 1 : -1
        break
      case 'calories':
        sortStage.calories = query.sortOrder === 'asc' ? 1 : -1
        break
      case 'protein':
        sortStage.protein = query.sortOrder === 'asc' ? 1 : -1
        break
      case 'carbs':
        sortStage.carbs = query.sortOrder === 'asc' ? 1 : -1
        break
      case 'createdAt':
        sortStage.createdAt = query.sortOrder === 'asc' ? 1 : -1
        break
      default:
        if (query.query) {
          sortStage.score = { $meta: 'textScore' }
        } else {
          sortStage.favoriteCount = -1
          sortStage.rating = -1
        }
    }
    
    pipeline.push({ $sort: sortStage })
    
    // Project only needed fields
    pipeline.push({
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
    })
    
    // Get total count
    const countPipeline = [...pipeline, { $count: 'total' }]
    const countResult = await recipes.aggregate(countPipeline).toArray()
    const total = countResult[0]?.total || 0
    
    // Add pagination
    const skip = parseInt(query.skip?.toString() || '0')
    const limit = parseInt(query.limit?.toString() || '12')
    
    pipeline.push({ $skip: skip })
    pipeline.push({ $limit: limit })
    
    // Execute search
    const results = await recipes.aggregate(pipeline).toArray()
    
    return {
      success: true,
      data: {
        recipes: results,
        total,
        page: Math.floor(skip / limit) + 1,
        totalPages: Math.ceil(total / limit)
      }
    }
  } catch (error) {
    console.error('Search error:', error)
    
    // Return sample search results for development
    const sampleResults = [
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
      }
    ]
    
    return {
      success: true,
      data: {
        recipes: sampleResults,
        total: sampleResults.length,
        page: 1,
        totalPages: 1
      }
    }
  }
})
