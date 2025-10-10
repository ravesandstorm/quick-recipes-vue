export default defineNuxtRouteMiddleware((to, from) => {
  // Dashboard and search are public - no auth required
  // Only protect specific routes like recipe creation

  const protectedRoutes = ['/recipes/create', '/profile']
  const isProtectedRoute = protectedRoutes.some(route => to.path.startsWith(route))

  if (isProtectedRoute) {
    // Check if user is logged in (simple localStorage check)
    if (process.client) {
      const user = localStorage.getItem('user')
      if (!user) {
        return navigateTo('/auth/login')
      }
    }
  }
})
