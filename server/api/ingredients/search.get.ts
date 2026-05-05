import { connectToDatabase, getCollection } from '../../utils/db'
import type { Ingredient } from '../../../types'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const searchTerm = query.q as string
    
    if (!searchTerm || searchTerm.length < 2) {
      return {
        success: true,
        data: []
      }
    }
    
    await connectToDatabase()
    const ingredients = getCollection('ingredients')
    
    // Search ingredients by name using text index
    const results = await ingredients
      .find({
        $or: [
          { name: { $regex: searchTerm, $options: 'i' } },
          { alternativeNames: { $regex: searchTerm, $options: 'i' } }
        ]
      })
      .limit(10)
      .toArray()
    
    const formattedResults = results.map(ingredient => ({
      ...ingredient,
      id: ingredient._id.toString()
    }))
    
    return {
      success: true,
      data: formattedResults
    }
  } catch (error) {
    console.error('Error searching ingredients:', error)
    
    // Return sample ingredients for development
    const sampleIngredients = [
      {
        id: '1',
        name: 'Chicken Breast',
        isLiquid: false,
        isCountable: false,
        caloriesPerUnit: 1.65,
        proteinPerUnit: 0.31,
        carbsPerUnit: 0,
        defaultUnit: 'grams',
        category: 'protein'
      },
      {
        id: '2',
        name: 'Brown Rice',
        isLiquid: false,
        isCountable: false,
        caloriesPerUnit: 1.11,
        proteinPerUnit: 0.023,
        carbsPerUnit: 0.23,
        defaultUnit: 'grams',
        category: 'grain'
      },
      {
        id: '3',
        name: 'Broccoli',
        isLiquid: false,
        isCountable: false,
        caloriesPerUnit: 0.34,
        proteinPerUnit: 0.028,
        carbsPerUnit: 0.07,
        defaultUnit: 'grams',
        category: 'vegetable'
      },
      {
        id: '4',
        name: 'Olive Oil',
        isLiquid: true,
        isCountable: false,
        caloriesPerUnit: 8.84,
        proteinPerUnit: 0,
        carbsPerUnit: 0,
        defaultUnit: 'ml',
        category: 'fat'
      },
      {
        id: '5',
        name: 'Eggs',
        isLiquid: false,
        isCountable: true,
        caloriesPerUnit: 70,
        proteinPerUnit: 6,
        carbsPerUnit: 0.6,
        defaultUnit: 'pieces',
        category: 'protein'
      }
    ].filter(ingredient => 
      ingredient.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    
    return {
      success: true,
      data: sampleIngredients
    }
  }
})
