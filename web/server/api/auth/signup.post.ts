import bcrypt from 'bcryptjs'
import { connectToDatabase, getCollection } from '../../utils/db'
import type { User, SignupCredentials, Error } from '../../../types'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event) as SignupCredentials

    if (!body.email || !body.password || !body.name) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Email, password, and name are required'
      })
    }

    if (body.password.length < 6) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Password must be at least 6 characters long'
      })
    }

    await connectToDatabase()
    const users = getCollection('users')

    // Check if user already exists
    const existingUser = await users.findOne({ email: body.email })
    if (existingUser) {
      throw createError({
        statusCode: 409,
        statusMessage: 'User with this email already exists'
      })
    }

    // Hash password
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(body.password, saltRounds)

    // Create new user
    const newUser: Omit<User, '_id'> = {
      email: body.email,
      name: body.name,
      password: hashedPassword,
      followers: [],
      following: [],
      createdRecipes: [],
      favRecipes: []
    }

    const result = await users.insertOne(newUser)

    return {
      success: true,
      user: {
        id: result.insertedId.toString(),
        email: newUser.email,
        name: newUser.name
      }
    }
  } catch (error: unknown) {
    if ((error as Error).statusCode) {
      throw error
    }

    console.error('Signup error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})
