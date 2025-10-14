<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div class="text-center">
        <h2 class="mt-6 text-3xl font-extrabold text-gray-900 animate-fade-in">
          Create your account
        </h2>
        <p class="mt-2 text-sm text-gray-600">
          Or
          <NuxtLink to="/auth/login" class="font-medium text-green-600 hover:text-green-500 transition-colors">
            sign in to your existing account
          </NuxtLink>
        </p>
      </div>
      
      <div class="card animate-slide-up">
        <!-- Google OAuth Button -->
        <button
          @click="signUpWithGoogle"
          :disabled="loading"
          class="w-full flex justify-center items-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <!-- Google Icon placeholder -->
          <svg class="w-5 h-5 mr-3" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>
        
        <div class="mt-6">
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300" />
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-white text-gray-500">Or continue with email</span>
            </div>
          </div>
        </div>
        
        <!-- Email/Password Form -->
        <form @submit.prevent="signUpWithCredentials" class="mt-6 space-y-6">
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700">Full name</label>
            <input
              id="name"
              v-model="form.name"
              type="text"
              required
              class="input-field mt-1"
              placeholder="Enter your full name"
            />
          </div>
          
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">Email address</label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              required
              class="input-field mt-1"
              placeholder="Enter your email"
            />
          </div>
          
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              required
              minlength="6"
              class="input-field mt-1"
              placeholder="Enter your password (min 6 characters)"
            />
          </div>
          
          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700">Confirm password</label>
            <input
              id="confirmPassword"
              v-model="form.confirmPassword"
              type="password"
              required
              class="input-field mt-1"
              placeholder="Confirm your password"
            />
          </div>
          
          <div v-if="error" class="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
            {{ error }}
          </div>
          
          <div v-if="success" class="text-green-600 text-sm bg-green-50 p-3 rounded-lg">
            {{ success }}
          </div>
          
          <button
            type="submit"
            :disabled="loading"
            class="btn-primary w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="loading" class="inline-flex items-center">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating account...
            </span>
            <span v-else>Create account</span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Error } from '../../../types'

const runtimeConfig = useRuntimeConfig()
const googleClientId = runtimeConfig.public.googleClientId

definePageMeta({
  auth: false,
  layout: false
})

// Add Google Sign-In script
useHead({
  script: [
    {
      src: 'https://accounts.google.com/gsi/client',
      async: true,
      defer: true
    }
  ]
})

// Extend window interface for Google Sign-In
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void
          prompt: () => void
        }
      }
    }
  }
}

const form = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const loading = ref(false)
const error = ref('')
const success = ref('')

const signUpWithGoogle = async () => {
  loading.value = true
  error.value = ''

  try {
    // Google OAuth with client ID/secret
    if (typeof window !== 'undefined' && window.google) {
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: handleGoogleResponse
      })

      window.google.accounts.id.prompt()
    } else {
      error.value = 'Google Sign-In not available. Please use email/password.'
    }

    /* Alternative: Firebase Auth (commented out)
    import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth'

    const auth = getAuth()
    const provider = new GoogleAuthProvider()

    const result = await signInWithPopup(auth, provider)
    const user = result.user

    // Send Firebase user data to your backend
    await $fetch('/api/auth/firebase', {
      method: 'POST',
      body: {
        uid: user.uid,
        email: user.email,
        name: user.displayName,
        avatar: user.photoURL
      }
    })

    await navigateTo('/')
    */
  } catch (err) {
    error.value = 'Failed to sign up with Google'
    console.error('Google sign up error:', err)
  } finally {
    loading.value = false
  }
}

const handleGoogleResponse = async (response: any) => {
  try {
    await $fetch('/api/auth/google', {
      method: 'POST',
      body: {
        credential: response.credential
      }
    })

    // Redirect to dashboard
    await navigateTo('/')
  } catch (err) {
    error.value = 'Failed to sign up with Google'
    console.error('Google OAuth error:', err)
  }
}

const signUpWithCredentials = async () => {
  loading.value = true
  error.value = ''
  success.value = ''

  // Validation
  if (form.password !== form.confirmPassword) {
    error.value = 'Passwords do not match'
    loading.value = false
    return
  }

  if (form.password.length < 6) {
    error.value = 'Password must be at least 6 characters long'
    loading.value = false
    return
  }

  try {
    await $fetch('/api/auth/signup', {
      method: 'POST',
      body: {
        name: form.name,
        email: form.email,
        password: form.password
      }
    })

    // Authentication is now handled via HTTP-only cookies
    success.value = 'Account created successfully! Redirecting to dashboard...'

    // Wait a moment then redirect to dashboard
    setTimeout(async () => {
      await navigateTo('/')
    }, 2000)

  } catch (err: unknown) {
    error.value = (err as Error)?.statusMessage || 'Failed to create account'
    console.error('Signup error:', (err as Error)?.statusMessage)
  } finally {
    loading.value = false
  }
}
</script>
