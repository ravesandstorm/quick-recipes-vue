<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header -->
    <div class="mb-8">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">My Recipes</h1>
          <p class="text-gray-600 dark:text-gray-400">Manage your created recipes and favorites</p>
        </div>
        <NuxtLink
          to="/recipes/create"
          class="mt-4 sm:mt-0 btn-primary inline-flex items-center"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Create Recipe
        </NuxtLink>
      </div>
    </div>

    <!-- Tabs -->
    <div class="mb-8">
      <div class="border-b border-gray-200 dark:border-gray-700">
        <nav class="-mb-px flex space-x-8">
          <button
            @click="activeTab = 'created'"
            :class="[
              'py-2 px-1 border-b-2 font-medium text-sm',
              activeTab === 'created'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-500'
            ]"
          >
            My Recipes ({{ createdRecipes.length }})
          </button>
          <button
            @click="activeTab = 'favorites'"
            :class="[
              'py-2 px-1 border-b-2 font-medium text-sm',
              activeTab === 'favorites'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-500'
            ]"
          >
            Favorites ({{ favoriteRecipes.length }})
          </button>
        </nav>
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

    <!-- Created Recipes Tab -->
    <div v-else-if="activeTab === 'created'">
      <div v-if="createdRecipes.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <RecipeCard
          v-for="recipe in createdRecipes"
          :key="recipe.id"
          :recipe="recipe"
          class="animate-fade-in"
        />
      </div>
      <div v-else class="text-center py-12">
        <div class="text-gray-500 dark:text-gray-400 mb-4">You haven't created any recipes yet</div>
        <NuxtLink to="/recipes/create" class="btn-primary">
          Create Your First Recipe
        </NuxtLink>
      </div>
    </div>

    <!-- Favorites Tab -->
    <div v-else-if="activeTab === 'favorites'">
      <div v-if="favoriteRecipes.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <RecipeCard
          v-for="recipe in favoriteRecipes"
          :key="recipe.id"
          :recipe="recipe"
          class="animate-fade-in"
        />
      </div>
      <div v-else class="text-center py-12">
        <div class="text-gray-500 dark:text-gray-400 mb-4">You haven't favorited any recipes yet</div>
        <NuxtLink to="/search" class="btn-primary">
          Discover Recipes
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Recipe } from '../../types'

definePageMeta({
  middleware: 'auth'
})

const { user } = useSimpleAuth()
const loading = ref(true)
const activeTab = ref('created')
const createdRecipes = ref<Recipe[]>([])
const favoriteRecipes = ref<Recipe[]>([])

const fetchRecipes = async () => {
  if (!user.value?.id) return
  
  try {
    loading.value = true
    
    // Fetch user's created recipes
    const { data: recipesData } = await $fetch(`/api/users/${user.value.id}/recipes`) as { success: boolean, data: Recipe[] }
    createdRecipes.value = recipesData || []
    
    // Fetch favorite recipes
    const { data: favoritesData } = await $fetch(`/api/users/${user.value.id}/favorites`) as { success: boolean, data: Recipe[] }
    favoriteRecipes.value = favoritesData || []
    
  } catch (error) {
    console.error('Error fetching recipes:', error)
  } finally {
    loading.value = false
  }
}

// Watch for user changes
watch(user, (newUser) => {
  if (newUser) {
    fetchRecipes()
  }
}, { immediate: true })

onMounted(() => {
  if (user.value) {
    fetchRecipes()
  }
})
</script>
