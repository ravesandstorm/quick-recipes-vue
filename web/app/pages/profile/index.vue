<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div v-if="user" class="space-y-8">
      <!-- Profile Header -->
      <div class="card">
        <div class="flex items-start space-x-6">
          <!-- Avatar -->
          <div class="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span class="text-white text-3xl font-bold">
              {{ user.name?.charAt(0).toUpperCase() }}
            </span>
          </div>
          
          <!-- Profile Info -->
          <div class="flex-1">
            <div class="flex justify-between items-start mb-4">
              <div>
                <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ user.name }}</h1>
                <p v-if="user.bio" class="text-gray-600">{{ user.bio }}</p>
              </div>
              
              <button
                @click="editMode = !editMode"
                class="btn-secondary"
              >
                {{ editMode ? 'Cancel' : 'Edit Profile' }}
              </button>
            </div>
            
            <!-- Stats -->
            <div class="grid grid-cols-3 gap-6">
              <div class="text-center">
                <div class="text-2xl font-bold text-blue-600">{{ stats.recipesCount }}</div>
                <div class="text-sm text-gray-600">Recipes</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-green-600">{{ stats.followersCount }}</div>
                <div class="text-sm text-gray-600">Followers</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-purple-600">{{ stats.followingCount }}</div>
                <div class="text-sm text-gray-600">Following</div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Edit Form -->
        <div v-if="editMode" class="mt-6 pt-6 border-t border-gray-200">
          <form @submit.prevent="updateProfile" class="space-y-4">
            <div>
              <label for="name" class="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                id="name"
                v-model="editForm.name"
                type="text"
                required
                class="input-field"
              />
            </div>
            
            <div>
              <label for="bio" class="block text-sm font-medium text-gray-700 mb-1">Bio</label>
              <textarea
                id="bio"
                v-model="editForm.bio"
                rows="3"
                class="input-field resize-none"
                placeholder="Tell us about yourself..."
              ></textarea>
            </div>
            
            <div class="flex justify-end space-x-4">
              <button
                type="button"
                @click="editMode = false"
                class="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="updating"
                class="btn-primary"
              >
                {{ updating ? 'Saving...' : 'Save Changes' }}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <!-- Tabs -->
      <div class="border-b border-gray-200">
        <nav class="-mb-px flex space-x-8">
          <button
            @click="activeTab = 'recipes'"
            class="py-2 px-1 border-b-2 font-medium text-sm transition-colors"
            :class="activeTab === 'recipes' 
              ? 'border-blue-500 text-blue-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
          >
            My Recipes ({{ stats.recipesCount }})
          </button>
          <button
            @click="activeTab = 'favorites'"
            class="py-2 px-1 border-b-2 font-medium text-sm transition-colors"
            :class="activeTab === 'favorites' 
              ? 'border-blue-500 text-blue-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
          >
            Favorites ({{ favoriteRecipes.length }})
          </button>
        </nav>
      </div>
      
      <!-- Tab Content -->
      <div>
        <!-- My Recipes Tab -->
        <div v-if="activeTab === 'recipes'">
          <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div v-for="i in 6" :key="i" class="recipe-card animate-pulse">
              <div class="h-48 bg-gray-200 rounded-t-xl"></div>
              <div class="p-6">
                <div class="h-4 bg-gray-200 rounded mb-2"></div>
                <div class="h-3 bg-gray-200 rounded mb-4 w-3/4"></div>
              </div>
            </div>
          </div>
          
          <div v-else-if="myRecipes.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <RecipeCard
              v-for="recipe in myRecipes"
              :key="recipe.id"
              :recipe="recipe"
            />
          </div>
          
          <div v-else class="text-center py-12">
            <div class="text-gray-500 mb-4">You haven't created any recipes yet</div>
            <NuxtLink to="/recipes/create" class="btn-primary">
              Create Your First Recipe
            </NuxtLink>
          </div>
        </div>
        
        <!-- Favorites Tab -->
        <div v-if="activeTab === 'favorites'">
          <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div v-for="i in 6" :key="i" class="recipe-card animate-pulse">
              <div class="h-48 bg-gray-200 rounded-t-xl"></div>
              <div class="p-6">
                <div class="h-4 bg-gray-200 rounded mb-2"></div>
                <div class="h-3 bg-gray-200 rounded mb-4 w-3/4"></div>
              </div>
            </div>
          </div>
          
          <div v-else-if="favoriteRecipes.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <RecipeCard
              v-for="recipe in favoriteRecipes"
              :key="recipe.id"
              :recipe="recipe"
            />
          </div>
          
          <div v-else class="text-center py-12">
            <div class="text-gray-500 mb-4">You haven't favorited any recipes yet</div>
            <NuxtLink to="/search" class="btn-primary">
              Discover Recipes
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Loading State -->
    <div v-else-if="pending" class="space-y-8">
      <div class="card animate-pulse">
        <div class="flex items-start space-x-6">
          <div class="w-24 h-24 bg-gray-200 rounded-full"></div>
          <div class="flex-1">
            <div class="h-8 bg-gray-200 rounded mb-2 w-1/3"></div>
            <div class="h-4 bg-gray-200 rounded mb-4 w-2/3"></div>
            <div class="grid grid-cols-3 gap-6">
              <div class="text-center">
                <div class="h-6 bg-gray-200 rounded mb-1"></div>
                <div class="h-3 bg-gray-200 rounded"></div>
              </div>
              <div class="text-center">
                <div class="h-6 bg-gray-200 rounded mb-1"></div>
                <div class="h-3 bg-gray-200 rounded"></div>
              </div>
              <div class="text-center">
                <div class="h-6 bg-gray-200 rounded mb-1"></div>
                <div class="h-3 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Error State -->
    <div v-else class="text-center py-12">
      <h1 class="text-2xl font-bold text-gray-900 mb-4">Profile Not Found</h1>
      <p class="text-gray-600 mb-6">Please sign in to view your profile.</p>
      <NuxtLink to="/auth/login" class="btn-primary">Sign In</NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
// import { useAuth } from '#auth/client'
import type { Recipe, User } from '../../../types'

definePageMeta({
  middleware: 'auth'
})

// get authData from localStore (client-side only)
const authData = ref<{ id: string } | null>(null)

// Initialize auth data on client side
const initializeAuth = () => {
  if (process.client) {
    try {
      const localData = localStorage.getItem('user')
      authData.value = localData ? JSON.parse(localData) : null
    } catch (error) {
      console.error('Error reading user data from localStorage:', error)
      authData.value = null
    }
  }
}

const user = ref<User | null>(null)
const loading = ref(false)
const pending = ref(true)
const editMode = ref(false)
const updating = ref(false)
const activeTab = ref('recipes')

// load recipes from /api/users/:id/recipes
const myRecipes = await $fetch<Recipe[]>(`/api/users/${authData.value?.id}/recipes`) || []
// load recipes from /api/users/:id/favorites
const favoriteRecipes = await $fetch<Recipe[]>(`/api/users/${authData.value?.id}/favorites`) || []

const stats = ref({
  recipesCount: 0,
  followersCount: 0,
  followingCount: 0
})

const editForm = reactive({
  name: '',
  bio: ''
})

const fetchProfile = async () => {
  try {
    pending.value = true

    if (!authData.value?.id) {
      return
    }

    const { data } = await $fetch(`/api/users/${authData.value.id}`)
    user.value = data

    // Update edit form
    editForm.name = data.name || ''
    editForm.bio = data.bio || ''

    // Update stats
    stats.value = {
      recipesCount: data.createdRecipes?.length || 0,
      followersCount: data.followers?.length || 0,
      followingCount: data.following?.length || 0
    }

  } catch (error) {
    console.error('Error fetching profile:', error)
  } finally {
    pending.value = false
  }
}

const fetchRecipes = async () => {
  if (!user.value) return
  
  try {
    loading.value = true
    
    // Fetch user's recipes
    const { data: recipesData } = await $fetch(`/api/users/${user.value.id}/recipes`)
    myRecipes.value = recipesData || []
    
    // Fetch favorite recipes
    const { data: favoritesData } = await $fetch(`/api/users/${user.value.id}/favorites`)
    favoriteRecipes.value = favoritesData || []
    
  } catch (error) {
    console.error('Error fetching recipes:', error)
  } finally {
    loading.value = false
  }
}

const updateProfile = async () => {
  if (!user.value) return
  
  try {
    updating.value = true
    
    const { data } = await $fetch(`/api/users/${user.value.id}`, {
      method: 'PATCH',
      body: editForm
    })
    
    user.value = { ...user.value, ...data }
    editMode.value = false
    
  } catch (error) {
    console.error('Error updating profile:', error)
  } finally {
    updating.value = false
  }
}

// Watch for tab changes to load data
watch(activeTab, () => {
  if (activeTab.value === 'recipes' && myRecipes.value.length === 0) {
    fetchRecipes()
  }
})

onMounted(async () => {
  // Initialize auth data first
  initializeAuth()

  // Wait for auth data to be available
  await nextTick()

  if (authData.value) {
    await fetchProfile()
    if (user.value) {
      await fetchRecipes()
    }
  }
})
</script>
