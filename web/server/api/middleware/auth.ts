import { getAuthenticatedUser } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  // Only apply auth middleware to API routes that need authentication
  const url = getRequestURL(event)
  
  // Skip auth for public API routes
  const publicRoutes = [
    '/api/auth/',
    '/api/recipes/search',
    '/api/recipes/index',
    '/api/ingredients/',
    '/api/seed-data'
  ]
  
  const isPublicRoute = publicRoutes.some(route => url.pathname.startsWith(route))
  
  // Skip auth for GET requests to individual recipes (public viewing)
  const isPublicRecipeView = url.pathname.match(/^\/api\/recipes\/[^\/]+$/) && getMethod(event) === 'GET'
  
  if (isPublicRoute || isPublicRecipeView) {
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
