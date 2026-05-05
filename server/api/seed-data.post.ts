import { connectToDatabase, getCollection } from '../../server/utils/db'
import bcrypt from 'bcryptjs'
import type { User, Recipe, Ingredient } from '../../types'

export default defineEventHandler(async (event) => {
  try {
    await connectToDatabase()
    
    const users = getCollection('users')
    const recipes = getCollection('recipes')
    const ingredients = getCollection('ingredients')
    
    // Clear existing data
    await Promise.all([
      users.deleteMany({}),
      recipes.deleteMany({}),
      ingredients.deleteMany({})
    ])
    
    // Sample ingredients
    const sampleIngredients: Omit<Ingredient, '_id'>[] = [
      {
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
        name: 'Eggs',
        isLiquid: false,
        isCountable: true,
        caloriesPerUnit: 70,
        proteinPerUnit: 6,
        carbsPerUnit: 0.6,
        defaultUnit: 'pieces',
        category: 'protein'
      },
      {
        name: 'Spaghetti',
        isLiquid: false,
        isCountable: false,
        caloriesPerUnit: 1.31,
        proteinPerUnit: 0.05,
        carbsPerUnit: 0.25,
        defaultUnit: 'grams',
        category: 'grain'
      },
      {
        name: 'Parmesan Cheese',
        isLiquid: false,
        isCountable: false,
        caloriesPerUnit: 4.31,
        proteinPerUnit: 0.38,
        carbsPerUnit: 0.04,
        defaultUnit: 'grams',
        category: 'dairy'
      },
      {
        name: 'Pancetta',
        isLiquid: false,
        isCountable: false,
        caloriesPerUnit: 3.0,
        proteinPerUnit: 0.21,
        carbsPerUnit: 0,
        defaultUnit: 'grams',
        category: 'protein'
      },
      {
        name: 'Quinoa',
        isLiquid: false,
        isCountable: false,
        caloriesPerUnit: 1.20,
        proteinPerUnit: 0.044,
        carbsPerUnit: 0.22,
        defaultUnit: 'grams',
        category: 'grain'
      },
      {
        name: 'Salmon Fillet',
        isLiquid: false,
        isCountable: false,
        caloriesPerUnit: 2.08,
        proteinPerUnit: 0.25,
        carbsPerUnit: 0,
        defaultUnit: 'grams',
        category: 'protein'
      }
    ]
    
    const ingredientResults = await ingredients.insertMany(sampleIngredients)
    const ingredientIds = Object.values(ingredientResults.insertedIds)
    
    // Sample users
    const hashedPassword = await bcrypt.hash('password123', 12)
    
    const sampleUsers: Omit<User, '_id'>[] = [
      {
        email: 'chef.mario@example.com',
        name: 'Chef Mario',
        bio: 'Italian cuisine specialist with 20 years of experience',
        password: hashedPassword,
        followers: [],
        following: [],
        createdRecipes: [],
        favRecipes: []
      },
      {
        email: 'sarah.green@example.com',
        name: 'Sarah Green',
        bio: 'Healthy cooking enthusiast and nutritionist',
        password: hashedPassword,
        followers: [],
        following: [],
        createdRecipes: [],
        favRecipes: []
      },
      {
        email: 'baker.betty@example.com',
        name: 'Baker Betty',
        bio: 'Professional baker specializing in desserts and pastries',
        password: hashedPassword,
        followers: [],
        following: [],
        createdRecipes: [],
        favRecipes: []
      }
    ]
    
    const userResults = await users.insertMany(sampleUsers)
    const userIds = Object.values(userResults.insertedIds)
    
    // Sample recipes
    const sampleRecipes: Omit<Recipe, '_id'>[] = [
      {
        title: 'Classic Spaghetti Carbonara',
        description: 'A traditional Italian pasta dish with eggs, cheese, and pancetta. This creamy and delicious recipe is perfect for a quick dinner.',
        calories: 520,
        protein: 25,
        carbs: 65,
        instructions: [
          'Bring a large pot of salted water to boil and cook spaghetti according to package directions until al dente.',
          'While pasta cooks, heat a large skillet over medium heat and cook pancetta until crispy, about 5-7 minutes.',
          'In a bowl, whisk together eggs, grated Parmesan cheese, and black pepper.',
          'Drain pasta, reserving 1 cup of pasta water. Add hot pasta to the skillet with pancetta.',
          'Remove from heat and quickly stir in the egg mixture, adding pasta water gradually to create a creamy sauce.',
          'Serve immediately with additional Parmesan cheese and freshly cracked black pepper.'
        ],
        createdByID: userIds[0].toString(),
        favoriteCount: 156,
        rating: 4.8,
        difficultyRating: 2,
        ingredientIDs: [ingredientIds[5].toString(), ingredientIds[7].toString(), ingredientIds[4].toString(), ingredientIds[6].toString()],
        ingredients: [
          {
            ingredientId: ingredientIds[5].toString(),
            quantity: 400,
            unit: 'grams'
          },
          {
            ingredientId: ingredientIds[7].toString(),
            quantity: 150,
            unit: 'grams'
          },
          {
            ingredientId: ingredientIds[4].toString(),
            quantity: 3,
            unit: 'pieces'
          },
          {
            ingredientId: ingredientIds[6].toString(),
            quantity: 100,
            unit: 'grams'
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Healthy Buddha Bowl',
        description: 'Nutritious bowl with quinoa, roasted vegetables, and tahini dressing. Perfect for a healthy lunch or dinner.',
        calories: 380,
        protein: 15,
        carbs: 45,
        instructions: [
          'Cook quinoa according to package instructions and let cool.',
          'Preheat oven to 400°F (200°C).',
          'Toss broccoli with olive oil, salt, and pepper. Roast for 20 minutes.',
          'Arrange quinoa, roasted broccoli in a bowl.',
          'Drizzle with tahini dressing and serve.'
        ],
        createdByID: userIds[1].toString(),
        favoriteCount: 89,
        rating: 4.6,
        difficultyRating: 1,
        ingredientIDs: [ingredientIds[8].toString(), ingredientIds[2].toString(), ingredientIds[3].toString()],
        ingredients: [
          {
            ingredientId: ingredientIds[8].toString(),
            quantity: 150,
            unit: 'grams'
          },
          {
            ingredientId: ingredientIds[2].toString(),
            quantity: 200,
            unit: 'grams'
          },
          {
            ingredientId: ingredientIds[3].toString(),
            quantity: 15,
            unit: 'ml'
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Grilled Salmon with Herbs',
        description: 'Fresh salmon fillet grilled to perfection with aromatic herbs. A healthy and delicious protein-rich meal.',
        calories: 420,
        protein: 35,
        carbs: 8,
        instructions: [
          'Preheat grill to medium-high heat.',
          'Season salmon fillets with salt, pepper, and herbs.',
          'Brush with olive oil.',
          'Grill for 4-5 minutes per side until cooked through.',
          'Serve with steamed broccoli.'
        ],
        createdByID: userIds[1].toString(),
        favoriteCount: 67,
        rating: 4.7,
        difficultyRating: 3,
        ingredientIDs: [ingredientIds[9].toString(), ingredientIds[2].toString(), ingredientIds[3].toString()],
        ingredients: [
          {
            ingredientId: ingredientIds[9].toString(),
            quantity: 200,
            unit: 'grams'
          },
          {
            ingredientId: ingredientIds[2].toString(),
            quantity: 150,
            unit: 'grams'
          },
          {
            ingredientId: ingredientIds[3].toString(),
            quantity: 10,
            unit: 'ml'
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]
    
    const recipeResults = await recipes.insertMany(sampleRecipes)
    const recipeIds = Object.values(recipeResults.insertedIds)
    
    // Update users with created recipes
    await users.updateOne(
      { _id: userIds[0] },
      { $set: { createdRecipes: [recipeIds[0].toString()] } }
    )
    
    await users.updateOne(
      { _id: userIds[1] },
      { $set: { createdRecipes: [recipeIds[1].toString(), recipeIds[2].toString()] } }
    )
    
    return {
      success: true,
      message: 'Sample data created successfully',
      data: {
        users: userIds.length,
        recipes: recipeIds.length,
        ingredients: ingredientIds.length
      }
    }
  } catch (error) {
    console.error('Error seeding data:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to seed data'
    })
  }
})
