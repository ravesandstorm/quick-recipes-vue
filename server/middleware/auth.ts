import { getAuthenticatedUser } from '../utils/auth'

export default defineEventHandler(async (event) => {
  const url = getRequestURL(event)

  // Only apply to API routes
  if (!url.pathname.startsWith('/api/')) return

  const publicRoutes = [
    '/api/auth/',
    '/api/recipes/search',
    '/api/recipes/featured',
    '/api/ingredients/',
    '/api/seed-data',
    '/api/stats'
  ]

  const isPublicRoute = publicRoutes.some(route => url.pathname.startsWith(route))
  const method = getMethod(event)
  const isPublicRecipeView = url.pathname.match(/^\/api\/recipes\/[^\/]+$/) && method === 'GET'
  const isPublicUserView = url.pathname.match(/^\/api\/users\/[^\/]+/) && method === 'GET'

  if (isPublicRoute || isPublicRecipeView || isPublicUserView) {
    const user = await getAuthenticatedUser(event)
    if (user) event.context.user = user
    return
  }

  const user = await getAuthenticatedUser(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Authentication required' })
  }
  event.context.user = user
})
