import type { AuthUser } from '../../types'

// Runs on the server during SSR — pre-populates shared auth state from the request cookie
// so every component already has the correct user on first render (no flash of "Sign In")
export default defineNuxtPlugin(async () => {
  const user = useState<AuthUser | null>('auth-user', () => null)
  const status = useState<string>('auth-status', () => 'loading')

  try {
    const headers = useRequestHeaders(['cookie'])
    const response = await $fetch('/api/auth/me', { headers }) as { success: boolean, data: AuthUser }
    user.value = response.data
    status.value = 'authenticated'
  } catch {
    user.value = null
    status.value = 'unauthenticated'
  }
})
