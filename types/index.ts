import { ObjectId } from 'mongodb'

export interface User {
  _id?: ObjectId
  email: string
  name: string
  bio?: string
  password?: string // Only for email/password auth
  googleId?: string // For Google OAuth
  avatar?: string
  // followers/following/createdRecipes removed — stored in 'follows' and 'recipes' collections
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

export interface Recipe {
  _id?: ObjectId
  title: string
  description: string
  calories: number
  protein: number
  carbs: number
  instructions: string[]
  createdByID: string
  // favoriteCount and rating removed — computed from 'favorites' and 'ratings' collections
  difficultyRating?: number
  ingredientIDs: string[]
  ingredients: RecipeIngredient[]
  isGlutenFree: boolean
  isLactoseFree: boolean
  createdAt: Date
  updatedAt: Date
}

// API response shape — Recipe document enriched with computed relational fields
export interface RecipeResponse extends Omit<Recipe, '_id'> {
  id: string
  favoriteCount: number
  averageRating: number | null
  totalRatings: number
  createdBy?: string
}

// Relation document types (stored in their own collections)

export interface Follow {
  _id?: ObjectId
  followerId: string   // user doing the following
  followingId: string  // user being followed
  createdAt: Date
}

export interface Favorite {
  _id?: ObjectId
  userId: string
  recipeId: string
  createdAt: Date
}

export interface Rating {
  _id?: ObjectId
  userId: string
  recipeId: string
  rating: number
  createdAt: Date
  updatedAt: Date
}

export interface RecipeIngredient {
  ingredientId: string
  quantity: number
  unit: string
  ingredient?: Ingredient
}

export interface Ingredient {
  _id?: ObjectId
  id?: string
  name: string
  isLiquid: boolean
  isCountable: boolean
  caloriesPerUnit: number
  proteinPerUnit: number
  carbsPerUnit: number
  defaultUnit: string
  category?: string
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
  isGlutenFree?: boolean
  isLactoseFree?: boolean
  sortBy?: 'rating' | 'calories' | 'protein' | 'carbs' | 'favoriteCount' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
  limit?: number
  skip?: number
}

export interface AuthUser {
  id?: string
  email: string
  name?: string
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
  isGlutenFree: boolean
  isLactoseFree: boolean
}

export interface AppError {
  statusCode: number
  statusMessage: string
}

export interface AppResponse {
  success?: boolean
  error?: AppError
  user?: AuthUser
}

export interface TokenPayload {
  userId?: string
  email?: string
  name?: string
  iat: number
  exp: number
}
