import type { AuthUser } from '../../types'

// Simple auth composable for demo purposes
export const useLocalData = () => {
  const user = ref<AuthUser | null>(null)
  const status = ref('loading')

  // Check for user in localStorage on client side
  const checkAuth = () => {
    if (process.client) {
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        try {
          user.value = JSON.parse(storedUser)
          status.value = 'authenticated'
        } catch (e) {
          console.error('Error parsing stored user:', e)
          status.value = 'unauthenticated'
        }
      } else {
        status.value = 'unauthenticated'
      }
    }
  }

  // Sign out function
  const signOut = async () => {
    if (process.client) {
      localStorage.removeItem('user')
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
    signOut
  }
}
