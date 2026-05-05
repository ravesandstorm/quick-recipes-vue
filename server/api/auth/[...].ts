// Simple auth handler - for now we'll make auth optional
export default defineEventHandler(async (event) => {
  // For development, we'll create a simple auth endpoint
  // This allows the app to work without complex auth setup

  const url = getRequestURL(event)
  const path = url.pathname.replace('/api/auth/', '')

  // Handle different auth routes
  switch (path) {
    case 'session':
      return {
        user: null,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      }

    case 'signin':
    case 'signin/credentials':
      if (getMethod(event) === 'POST') {
        // Mock successful login
        return {
          url: '/',
          user: {
            id: 'mock-user',
            email: 'user@example.com',
            name: 'Demo User'
          }
        }
      }
      return { url: '/auth/login' }

    case 'signout':
      return { url: '/' }

    case 'providers':
      return {
        credentials: {
          id: 'credentials',
          name: 'Credentials',
          type: 'credentials'
        }
      }

    default:
      return { error: 'Not implemented' }
  }
})
