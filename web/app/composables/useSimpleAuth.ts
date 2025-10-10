// Simple auth composable for demo purposes

export const useSimpleAuth = () => {
  const user = ref()
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

  // Sign in function
  const signIn = async (provider: string, credentials?: any) => {
    if (provider === 'credentials' && credentials) {
      // Mock authentication
      const mockUser = {
        id: 'demo-user',
        email: credentials.email,
        name: credentials.email.split('@')[0]
      }
      
      localStorage.setItem('user', JSON.stringify(mockUser))
      user.value = mockUser
      status.value = 'authenticated'
      
      return { error: null }
    }
    
    return { error: 'Provider not supported' }
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
    signIn,
    signOut
  }
}
