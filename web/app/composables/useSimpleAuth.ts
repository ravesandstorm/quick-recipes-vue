import type { AuthUser } from '../../types'

export const useSimpleAuth = () => {
  const user = ref<AuthUser | null>(null)
  const status = ref('loading')

  // Check authentication status from server
  const checkAuth = async () => {
    try {
      status.value = 'loading'
      const response = await $fetch('/api/auth/me') as { success: boolean, data: AuthUser }
      user.value = response.data
      status.value = 'authenticated'
    } catch (error) {
      user.value = null
      status.value = 'unauthenticated'
    }
  }

  // Sign out function
  const signOut = async () => {
    try {
      await $fetch('/api/auth/logout', { method: 'POST' })
      user.value = null
      status.value = 'unauthenticated'
    } catch (error) {
      console.error('Logout error:', error)
      // Still clear local state even if server request fails
      user.value = null
      status.value = 'unauthenticated'
    }
  }

  // Initialize on mount
  onMounted(() => {
    checkAuth()
  })

  return {
    user: readonly(user),
    status: readonly(status),
    signOut,
    checkAuth
  }
}
