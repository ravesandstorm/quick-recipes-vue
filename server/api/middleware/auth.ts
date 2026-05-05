import { getAuthenticatedUser } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  // Only apply auth middleware to API routes that need authentication
  const url = getRequestURL(event)
  const method = getMethod(event)

  // Skip auth for public API routes
  const publicRoutes = [
    '/api/auth/',
    '/api/recipes/search',
    '/api/recipes/featured',
    '/api/ingredients/',
    '/api/seed-data',
    '/api/stats'
  ]

  const isPublicRoute = publicRoutes.some(route => url.pathname.startsWith(route))

  // Skip auth for GET requests to individual recipes and users (public viewing)
  const isPublicRecipeView = url.pathname.match(/^\/api\/recipes\/[^\/]+$/) && method === 'GET'
  const isPublicUserView = url.pathname.match(/^\/api\/users\/[^\/]+/) && method === 'GET'

  if (isPublicRoute || isPublicRecipeView || isPublicUserView) {
    // Still try to get user if available (for optional auth)
    const user = await getAuthenticatedUser(event)
    if (user) {
      event.context.user = user
    }
    return
  }

  // For protected routes, verify authentication
  const user = await getAuthenticatedUser(event)

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication required'
    })
  }

  // Attach user to the event context for use in handlers
  event.context.user = user
})
