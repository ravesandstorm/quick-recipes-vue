export default defineNuxtRouteMiddleware((to) => {
  const protectedRoutes = ['/recipes/create', '/profile', '/my-recipes']
  if (!protectedRoutes.some(route => to.path.startsWith(route))) return

  // Prevent redirect loops
  if (to.path === '/auth/login') return

  const { status, user } = useSimpleAuth()

  // If the plugin has resolved auth and user is not authenticated, redirect
  if (status.value === 'unauthenticated' || (status.value !== 'loading' && !user.value)) {
    return navigateTo(`/auth/login?redirect=${encodeURIComponent(to.fullPath)}`)
  }
  // If status is 'loading', the server plugin is still resolving — let it through
  // and the page itself will handle any protected UI
})
