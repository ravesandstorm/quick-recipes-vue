<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Hero Section -->
    <div class="text-center mb-12 animate-fade-in">
      <h1 class="text-4xl md:text-6xl font-bold text-gray-900 dark:text-gray-100 mb-4">
        Discover Amazing
        <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
          Recipes
        </span>
      </h1>
      <p class="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8">
        Find, create, and share delicious recipes with our community of food lovers
      </p>

      <!-- Quick Search -->
      <div class="max-w-2xl mx-auto">
        <div class="flex space-x-4">
          <div class="flex-1 relative">
            <input
              v-model="quickSearchQuery"
              @keyup.enter="performQuickSearch"
              type="text"
              placeholder="Search for recipes..."
              class="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg placeholder-gray-400 dark:placeholder-gray-500"
            />
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          <button
            @click="performQuickSearch"
            class="btn-primary px-8"
          >
            Search
          </button>
          <button
            @click="goToAdvancedSearch"
            class="btn-secondary px-6"
          >
            Advanced
          </button>
        </div>
      </div>
    </div>

    <!-- Quick Stats -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
      <div class="card text-center animate-slide-up">
        <div class="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">{{ stats.totalRecipes }}</div>
        <div class="text-gray-600 dark:text-gray-400">Total Recipes</div>
      </div>
      <div class="card text-center animate-slide-up" style="animation-delay: 0.1s">
        <div class="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">{{ stats.totalUsers }}</div>
        <div class="text-gray-600 dark:text-gray-400">Active Cooks</div>
      </div>
      <div class="card text-center animate-slide-up" style="animation-delay: 0.2s">
        <div class="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">{{ stats.totalIngredients }}</div>
        <div class="text-gray-600 dark:text-gray-400">Ingredients</div>
      </div>
    </div>

    <!-- Featured Recipes -->
    <div class="mb-12">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-3xl font-bold text-gray-900 dark:text-gray-100">Featured Recipes</h2>
        <NuxtLink to="/search" class="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
          View All →
        </NuxtLink>
      </div>

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

      <div v-else-if="recipes.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <RecipeCard
          v-for="recipe in recipes"
          :key="recipe.id"
          :recipe="recipe"
          class="animate-fade-in"
        />
      </div>

      <div v-else class="text-center py-12">
        <div class="text-gray-500 mb-4">No recipes found</div>
        <NuxtLink
          v-if="user"
          to="/recipes/create"
          class="btn-primary"
        >
          Create the First Recipe
        </NuxtLink>
        <NuxtLink
          v-else
          to="/auth/signup"
          class="btn-primary"
        >
          Join to Create Recipes
        </NuxtLink>
      </div>
    </div>

    <!-- Popular Categories -->
    <div class="mb-12">
      <h2 class="text-3xl font-bold text-gray-900 mb-6">Popular Categories</h2>
      <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <button
          v-for="category in categories"
          :key="category.name"
          @click="searchByCategory(category.name)"
          class="card text-center hover:shadow-md transition-all duration-200 hover:scale-105"
        >
          <div class="text-2xl mb-2">{{ category.icon }}</div>
          <div class="text-sm font-medium text-gray-700">{{ category.name }}</div>
        </button>
      </div>
    </div>

    <!-- Call to Action -->
    <div v-if="!user" class="card bg-gradient-to-r from-blue-500 to-purple-600 text-white text-center">
      <h3 class="text-2xl font-bold mb-4">Ready to Start Cooking?</h3>
      <p class="text-blue-100 mb-6">Join our community and start sharing your favorite recipes</p>
      <div class="space-x-4">
        <NuxtLink to="/auth/signup" class="btn-primary bg-white text-blue-600 hover:bg-gray-100">
          Sign Up Free
        </NuxtLink>
        <NuxtLink to="/auth/login" class="btn-secondary border-white text-white hover:bg-white hover:text-blue-600">
          Sign In
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Recipe {
  id: string
  title: string
  description: string
  calories: number
  protein: number
  carbs: number
  rating?: number
  difficultyRating?: number
  favoriteCount: number
  createdBy?: string
  createdAt: Date
}

const { user } = useSimpleAuth()

const loading = ref(true)
const recipes = ref<Recipe[]>([])
const quickSearchQuery = ref('')
const stats = ref({
  totalRecipes: 0,
  totalUsers: 0,
  totalIngredients: 0
})

const categories = [
  { name: 'Breakfast', icon: '🍳' },
  { name: 'Lunch', icon: '🥗' },
  { name: 'Dinner', icon: '🍽️' },
  { name: 'Dessert', icon: '🍰' },
  { name: 'Snacks', icon: '🍿' },
  { name: 'Drinks', icon: '🥤' }
]

const searchByCategory = (category: string) => {
  navigateTo(`/search?category=${encodeURIComponent(category)}`)
}

const performQuickSearch = () => {
  if (quickSearchQuery.value.trim()) {
    navigateTo(`/search?q=${encodeURIComponent(quickSearchQuery.value.trim())}`)
  } else {
    navigateTo('/search')
  }
}

const goToAdvancedSearch = () => {
  navigateTo('/search')
}

// Fetch featured recipes and stats
const fetchData = async () => {
  try {
    loading.value = true

    // Fetch featured recipes
    const recipesResponse = await $fetch('/api/recipes/featured') as any
    recipes.value = recipesResponse?.data || []

    // Fetch stats
    try {
      const statsResponse = await $fetch('/api/stats') as any
      if (statsResponse?.data) {
        stats.value = statsResponse.data
      }
    } catch (statsError) {
      console.error('Error fetching stats:', statsError)
      // Use default stats if API fails
      stats.value = {
        totalRecipes: 1247,
        totalUsers: 3892,
        totalIngredients: 456
      }
    }

  } catch (error) {
    console.error('Error fetching dashboard data:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>