import { MongoClient, Db, Collection } from 'mongodb'

let client: MongoClient
let db: Db

export async function connectToDatabase(): Promise<Db> {
  if (db) {
    return db
  }

  const config = useRuntimeConfig()
  const uri = config.mongodbUri || 'mongodb://localhost:27017/quick-recipes'

  if (!uri) {
    throw new Error('MONGODB_URI is not defined in environment variables')
  }

  try {
    client = new MongoClient(uri)
    await client.connect()
    db = client.db()
    
    // Create indexes for better performance
    await createIndexes()
    
    console.log('Connected to MongoDB')
    return db
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error)
    throw error
  }
}

async function createIndexes() {
  try {
    // User indexes
    await db.collection('users').createIndex({ email: 1 }, { unique: true })
    await db.collection('users').createIndex({ name: 1 })
    
    // Recipe indexes for search
    await db.collection('recipes').createIndex({ title: 'text', description: 'text' })
    await db.collection('recipes').createIndex({ createdByID: 1 })
    await db.collection('recipes').createIndex({ favoriteCount: -1 })
    await db.collection('recipes').createIndex({ rating: -1 })
    await db.collection('recipes').createIndex({ calories: 1 })
    await db.collection('recipes').createIndex({ protein: 1 })
    await db.collection('recipes').createIndex({ carbs: 1 })
    await db.collection('recipes').createIndex({ ingredientIDs: 1 })
    
    // Ingredient indexes
    await db.collection('ingredients').createIndex({ name: 'text' })
    await db.collection('ingredients').createIndex({ name: 1 })

    // Favorites (relational table — replaces user.favRecipes array and recipe.favoriteCount)
    await db.collection('favorites').createIndex({ userId: 1, recipeId: 1 }, { unique: true })
    await db.collection('favorites').createIndex({ recipeId: 1 })

    // Ratings (relational table)
    await db.collection('ratings').createIndex({ userId: 1, recipeId: 1 }, { unique: true })
    await db.collection('ratings').createIndex({ recipeId: 1 })

    console.log('Database indexes created successfully')
  } catch (error) {
    console.error('Error creating indexes:', error)
  }
}

export function getCollection(name: string): Collection {
  if (!db) {
    throw new Error('Database not connected')
  }
  return db.collection(name)
}

export async function closeConnection() {
  if (client) {
    await client.close()
  }
}
