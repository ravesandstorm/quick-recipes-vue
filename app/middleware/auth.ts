export default defineNuxtRouteMiddleware(async (to, from) => {
  // Only protect specific routes that require user authentication
  const protectedRoutes = ['/recipes/create', '/profile', '/my-recipes']
  const isProtectedRoute = protectedRoutes.some(route => to.path.startsWith(route))

  if (isProtectedRoute) {
    // Check authentication status from server
    try {
      const { data } = await $fetch('/api/auth/me')
      if (!data) {
        return navigateTo('/auth/login')
      }
    } catch (error) {
      return navigateTo('/auth/login')
    }
  }
})
