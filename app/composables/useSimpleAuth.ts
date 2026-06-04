import type { AuthUser } from '../../types'

export const useSimpleAuth = () => {
  // useState ensures shared state across all component instances (SSR-safe)
  const user = useState<AuthUser | null>('auth-user', () => null)
  const status = useState<string>('auth-status', () => 'loading')

  const checkAuth = async () => {
    try {
      status.value = 'loading'
      const response = await $fetch('/api/auth/me') as { success: boolean, data: AuthUser }
      user.value = response.data
      status.value = 'authenticated'
    } catch {
      user.value = null
      status.value = 'unauthenticated'
    }
  }

  const signOut = async () => {
    try {
      await $fetch('/api/auth/logout', { method: 'POST' })
    } catch {
      // ignore errors, still clear local state
    } finally {
      user.value = null
      status.value = 'unauthenticated'
    }
  }

  // Only register onMounted when called inside a component context
  if (getCurrentInstance()) {
    onMounted(() => {
      if (status.value === 'loading') {
        checkAuth()
      }
    })
  }

  return {
    user: readonly(user),
    status: readonly(status),
    signOut,
    checkAuth
  }
}
