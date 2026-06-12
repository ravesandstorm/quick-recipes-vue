<template>
  <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header -->
    <div class="mb-8">
      <div class="flex items-center space-x-4 mb-4">
        <button @click="$router.back()" class="p-2 hover:bg-gray-100 rounded-lg">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 class="text-2xl font-bold text-gray-900">
          {{ userProfile?.name }}'s Recipes
        </h1>
      </div>
      
      <!-- User Info -->
      <div v-if="userProfile" class="flex items-center space-x-4 mb-6">
        <div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
          <span class="text-white text-xl font-bold">
            {{ userProfile.name?.charAt(0).toUpperCase() }}
          </span>
        </div>
        <div>
          <h2 class="text-lg font-semibold text-gray-900">{{ userProfile.name }}</h2>
          <p v-if="userProfile.bio" class="text-gray-600">{{ userProfile.bio }}</p>
          <div class="text-sm text-gray-500">
            {{ recipes.length }} {{ recipes.length === 1 ? 'recipe' : 'recipes' }}
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="i in 6" :key="i" class="recipe-card animate-pulse">
        <div class="h-48 bg-gray-200 rounded-t-xl"></div>
        <div class="p-6">
          <div class="h-4 bg-gray-200 rounded mb-2"></div>
          <div class="h-3 bg-gray-200 rounded mb-4 w-3/4"></div>
          <div class="flex justify-between">
            <div class="h-3 bg-gray-200 rounded w-16"></div>
            <div class="h-3 bg-gray-200 rounded w-20"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recipes Grid -->
    <div v-else-if="recipes.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <RecipeCard
        v-for="recipe in recipes"
        :key="recipe.id"
        :recipe="recipe"
        class="animate-fade-in"
      />
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12">
      <div class="text-gray-500 mb-4">
        {{ isOwnProfile ? 'You haven\'t created any recipes yet' : `${userProfile?.name} hasn't created any recipes yet` }}
      </div>
      <NuxtLink 
        v-if="isOwnProfile" 
        to="/recipes/create" 
        class="btn-primary"
      >
        Create Your First Recipe
      </NuxtLink>
      <NuxtLink 
        v-else 
        to="/search" 
        class="btn-primary"
      >
        Discover Recipes
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { User, RecipeResponse } from '../../../../types'

const route = useRoute()
const { user: currentUser } = useSimpleAuth()

const userId = route.params.id as string

const loading = ref(true)
const userProfile = ref<User | null>(null)
const recipes = ref<RecipeResponse[]>([])

const isOwnProfile = computed(() => {
  return currentUser.value?.id === userId
})

const fetchUserProfile = async () => {
  try {
    const { data } = await $fetch(`/api/users/${userId}`) as { success: boolean, data: User }
    userProfile.value = data
  } catch (error) {
    console.error('Error fetching user profile:', error)
  }
}

const fetchUserRecipes = async () => {
  try {
    loading.value = true
    const { data } = await $fetch(`/api/users/${userId}/recipes`) as { success: boolean, data: RecipeResponse[] }
    recipes.value = data || []
  } catch (error) {
    console.error('Error fetching user recipes:', error)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await fetchUserProfile()
  await fetchUserRecipes()
})
</script>
