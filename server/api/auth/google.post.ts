import { connectToDatabase, getCollection } from '../../utils/db'
import { createToken, setAuthCookie } from '../../utils/auth'
import { getFirebaseAuth } from '../../utils/firebase'
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

    // Verify Google ID token using Firebase Admin SDK
    let googleUser: { email: string; name: string; sub: string; picture?: string }
    try {
      const firebaseAuth = getFirebaseAuth()
      const decoded = await firebaseAuth.verifyIdToken(credential)
      googleUser = {
        email: decoded.email!,
        name: decoded.name || decoded.email!.split('@')[0],
        sub: decoded.uid,
        picture: decoded.picture
      }
    } catch (firebaseError: any) {
      console.error('Firebase token verification error:', firebaseError.message)
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid Google token'
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

    // Issue our own JWT cookie (same as email/password flow)
    const token = await createToken({
      userId: user._id.toString(),
      email: user.email,
      name: user.name
    })

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
  } catch (error: any) {
    if (error.statusCode) throw error

    console.error('Google OAuth error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})
