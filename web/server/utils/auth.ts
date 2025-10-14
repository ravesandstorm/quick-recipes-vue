import { SignJWT, jwtVerify } from 'jose'
import type { TokenPayload } from '../../types'

const config = useRuntimeConfig()

const secret = new TextEncoder().encode( config.authSecret )

/**
 * Create a JOSE token with 48-hour expiration
 */
export async function createToken(payload: Omit<TokenPayload, 'iat' | 'exp'>): Promise<string> {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt(Math.floor(Date.now() / 1000))
    .setExpirationTime('48h')
    .sign(secret)
  
  return token
}

/**
 * Verify and decode a JOSE token
 */
export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload as TokenPayload
  } catch (error) {
    console.error('Token verification failed:', error)
    return null
  }
}

/**
 * Set HTTP-only cookie with token
 */
export function setAuthCookie(event: any, token: string) {
  setCookie(event, 'auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 2 * 24 * 60 * 60, // 48 hours in seconds
    path: '/'
  })
}

/**
 * Clear authentication cookie
 */
export function clearAuthCookie(event: any) {
  deleteCookie(event, 'auth-token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/'
  })
}

/**
 * Get token from request cookies
 */
export function getTokenFromCookies(event: any): string | undefined {
  return getCookie(event, 'auth-token')
}

/**
 * Get authenticated user from request
 */
export async function getAuthenticatedUser(event: any): Promise<TokenPayload | null> {
  const token = getTokenFromCookies(event)
  if (!token) {
    return null
  }
  
  return await verifyToken(token) as TokenPayload
}
