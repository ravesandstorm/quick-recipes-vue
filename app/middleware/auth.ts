export default defineNuxtRouteMiddleware(async (to) => {
  const protectedRoutes = ['/recipes/create', '/profile', '/my-recipes']
  const isProtectedRoute = protectedRoutes.some(route => to.path.startsWith(route))

  if (!isProtectedRoute) return

  // Prevent redirect loops
  if (to.path === '/auth/login') return

  try {
    const response = await $fetch('/api/auth/me') as { success: boolean, data: any }
    if (!response?.data) {
      return navigateTo(`/auth/login?redirect=${encodeURIComponent(to.fullPath)}`)
    }
  } catch {
    return navigateTo(`/auth/login?redirect=${encodeURIComponent(to.fullPath)}`)
  }
})
