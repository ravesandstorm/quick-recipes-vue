import bcrypt from 'bcryptjs'
import { connectToDatabase, getCollection } from '../../utils/db'
import type { AuthUser, LoginCredentials, Error } from '../../../types'

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event) as LoginCredentials

        if (!body.email || !body.password) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Email and password are required'
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

        // Check if user exists
        const existingUser = await users.findOne({ email: body.email })
        if (!existingUser) {
            throw createError({
                statusCode: 409,
                statusMessage: 'Email not found in database, please sign up.'
            })
        }

        // Compare password with stored hash
        bcrypt.compare(body.password, existingUser.password).then((result) => {
            if (!result) {
                throw createError({
                    statusCode: 401,
                    statusMessage: 'Incorrect password'
                })
            }
        })

        return {
            success: true,
            user: {
                id: existingUser._id.toString(),
                email: existingUser.email,
                name: existingUser.name
            }
        }
    } catch (error: unknown) {
        if ((error as Error).statusCode) {
            throw error
        }

        console.error('Login error:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Internal server error'
        })
    }
})
