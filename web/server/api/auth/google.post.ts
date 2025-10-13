import { connectToDatabase, getCollection } from '../../utils/db'
import { createToken, setAuthCookie } from '../../utils/auth'
import type { User } from '../../../types'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { credential } = body

    if (!credential) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Google credential is required'
      })
    }

    // Verify Google token
    const config = useRuntimeConfig()
    const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`)
    
    if (!response.ok) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid Google token'
      })
    }

    const googleUser = await response.json()

    // Verify the token is for our client
    if (googleUser.aud !== config.googleClientId) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid token audience'
      })
    }

    await connectToDatabase()
    const users = getCollection('users')

    // Check if user exists
    let user = await users.findOne({ 
      $or: [
        { email: googleUser.email },
        { googleId: googleUser.sub }
      ]
    })

    if (!user) {
      // Create new user
      const newUser: Omit<User, '_id'> = {
        email: googleUser.email,
        name: googleUser.name,
        googleId: googleUser.sub,
        avatar: googleUser.picture,
        followers: [],
        following: [],
        createdRecipes: [],
        favRecipes: []
      }

      const result = await users.insertOne(newUser)
      user = { ...newUser, _id: result.insertedId }
    } else if (!user.googleId) {
      // Link Google account to existing user
      await users.updateOne(
        { _id: user._id },
        { 
          $set: { 
            googleId: googleUser.sub,
            avatar: googleUser.picture || user.avatar
          }
        }
      )
      user.googleId = googleUser.sub
      user.avatar = googleUser.picture || user.avatar
    }

    // Create JOSE token
    const token = await createToken({
      userId: user._id.toString(),
      email: user.email,
      name: user.name
    })

    // Set HTTP-only cookie
    setAuthCookie(event, token)

    return {
      success: true,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        avatar: user.avatar
      }
    }
  } catch (error) {
    if ((error as any).statusCode) {
      throw error
    }

    console.error('Google OAuth error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})
