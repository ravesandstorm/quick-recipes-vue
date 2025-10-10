import { ObjectId } from 'mongodb'

export interface User {
  _id?: ObjectId
  id?: string
  email: string
  name: string
  bio?: string
  password?: string // Only for email/password auth
  googleId?: string // For Google OAuth
  avatar?: string
  followers: string[] // Array of user IDs
  following: string[] // Array of user IDs
  createdRecipes: string[] // Array of recipe IDs
  favRecipes: string[] // Array of recipe IDs
}

export interface Recipe {
  _id?: ObjectId
  id?: string
  title: string
  description: string
  calories: number
  protein: number
  carbs: number
  instructions: string[]
  createdByID: string
  favoriteCount: number
  rating?: number
  difficultyRating?: number
  ingredientIDs: string[] // Array of ingredient IDs with quantities
  ingredients: RecipeIngredient[] // Populated ingredient data
  createdAt: Date
  updatedAt: Date
}

export interface RecipeIngredient {
  ingredientId: string
  quantity: number
  unit: string // e.g., "cups", "grams", "pieces"
  ingredient?: Ingredient // Populated ingredient data
}

export interface Ingredient {
  _id?: ObjectId
  id?: string
  name: string
  isLiquid: boolean
  isCountable: boolean
  caloriesPerUnit: number // per gram/ml for weight/volume, per piece for countable
  proteinPerUnit: number
  carbsPerUnit: number
  defaultUnit: string // "grams", "ml", "pieces", etc.
  alternativeNames?: string[] // For better search
  category?: string // "vegetable", "protein", "grain", etc.
  createdAt: Date
}

export interface SearchFilters {
  query?: string
  ingredients?: string[]
  minRating?: number
  maxRating?: number
  minCalories?: number
  maxCalories?: number
  minProtein?: number
  maxProtein?: number
  minCarbs?: number
  maxCarbs?: number
  sortBy?: 'rating' | 'calories' | 'protein' | 'carbs' | 'favoriteCount' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
  limit?: number
  skip?: number
}

export interface AuthUser {
  id: string
  email: string
  name: string
  avatar?: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface SignupCredentials {
  email: string
  password: string
  name: string
}

export interface RecipeFormData {
  title: string
  description: string
  instructions: string[]
  ingredients: RecipeIngredient[]
  difficultyRating?: number
}

export interface UserProfile {
  id: string
  name: string
  bio?: string
  avatar?: string
  followersCount: number
  followingCount: number
  recipesCount: number
  isFollowing?: boolean
}

export interface error {
  statusCode: number
  statusMessage: string
}