<template>
  <div v-if="recipe" class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200">
    <!-- Success Message -->
    <div
      v-if="showSuccessMessage"
      class="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in"
    >
      {{ successMessage }}
    </div>

    <!-- Navigation Buttons -->
    <div class="fixed right-6 top-1/2 transform -translate-y-1/2 z-40 space-y-2">
      <button
        @click="scrollToSection('title')"
        class="w-10 h-10 bg-white dark:bg-gray-800 shadow-lg rounded-full flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        title="Go to title"
      >
        <svg class="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
        </svg>
      </button>
      <button
        @click="scrollToSection('macros')"
        class="w-10 h-10 bg-white dark:bg-gray-800 shadow-lg rounded-full flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        title="Go to nutrition"
      >
        📊
      </button>
      <button
        @click="scrollToSection('description')"
        class="w-10 h-10 bg-white dark:bg-gray-800 shadow-lg rounded-full flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        title="Go to description"
      >
        📝
      </button>
      <button
        @click="scrollToSection('ingredients')"
        class="w-10 h-10 bg-white dark:bg-gray-800 shadow-lg rounded-full flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        title="Go to ingredients"
      >
        🥕
      </button>
      <button
        @click="scrollToSection('instructions')"
        class="w-10 h-10 bg-white dark:bg-gray-800 shadow-lg rounded-full flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        title="Go to instructions"
      >
        👨‍🍳
      </button>
      <button
        @click="scrollToSection('instructions')"
        class="w-10 h-10 bg-white dark:bg-gray-800 shadow-lg rounded-full flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        title="Go to bottom"
      >
        <svg class="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </div>
    
    <!-- Title Section -->
    <section id="title" class="mb-8 animate-fade-in">
      <div class="flex justify-between items-start mb-4">
        <div class="flex-1">
          <h1 class="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">{{ recipe.title }}</h1>
          <div class="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
            <div class="flex items-center space-x-1">
              <svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              <span>{{ recipe.rating || 'Not rated' }}</span>
            </div>
            <div v-if="recipe.difficultyRating" class="flex items-center space-x-1">
              <span>🎯</span>
              <span>{{ getDifficultyText(recipe.difficultyRating) }}</span>
            </div>
            <div class="flex items-center space-x-1">
              <span>📅</span>
              <span>{{ formatDate(recipe.createdAt) }}</span>
            </div>
          </div>
        </div>
        
        <!-- Rating and Favorite Actions -->
        <div class="flex items-center space-x-4">
          <!-- Rating Section -->
          <div v-if="user" class="flex items-center space-x-2 bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
            <span class="text-sm text-gray-600 dark:text-gray-400 font-medium">Your Rating:</span>
            <div class="flex items-center space-x-1">
              <button
                v-for="star in 5"
                :key="star"
                @click="submitRating(star)"
                :disabled="ratingLoading"
                class="w-6 h-6 transition-all duration-200 hover:scale-110 disabled:opacity-50"
                :class="star <= (userRating || 0) ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-300'"
                :title="`Rate ${star} star${star > 1 ? 's' : ''}`"
              >
                <svg class="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </button>
            </div>
            <span v-if="userRating" class="text-sm text-gray-500 dark:text-gray-400">
              ({{ userRating }}/5)
            </span>
          </div>

          <!-- Login prompt for rating -->
          <div v-else class="flex items-center space-x-2 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
            <span class="text-sm text-gray-500 dark:text-gray-400">
              <NuxtLink to="/auth/login" class="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
                Sign in
              </NuxtLink>
              to rate this recipe
            </span>
          </div>

          <!-- Favorite Button -->
          <button
            v-if="user"
            @click="toggleFavorite"
            :disabled="favoriteLoading"
            class="flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all duration-200 disabled:opacity-50"
            :class="isFavorited ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400' : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
            <span>{{ favoriteLoading ? '...' : (recipe?.favoriteCount || 0) }}</span>
          </button>

          <!-- Login prompt for favorites -->
          <div v-else class="flex items-center space-x-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <svg class="w-5 h-5 text-gray-400 dark:text-gray-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
            <span class="text-sm text-gray-500 dark:text-gray-400">{{ recipe?.favoriteCount || 0 }}</span>
          </div>
          
          <!-- Creator Info -->
          <NuxtLink
            v-if="recipe.createdBy"
            :to="`/users/${recipe.createdByID}`"
            class="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
          >
            <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span class="text-white text-sm font-medium">
                {{ recipe.createdBy?.charAt(0).toUpperCase() }}
              </span>
            </div>
            <span class="font-medium">{{ recipe.createdBy }}</span>
          </NuxtLink>
        </div>
      </div>
    </section>
    
    <!-- Nutrition Section -->
    <section id="macros" class="mb-8">
      <div class="card bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 border-blue-200 dark:border-blue-800">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Nutrition Information</h2>
        <div class="grid grid-cols-3 gap-6">
          <div class="text-center">
            <div class="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">{{ recipe.calories }}</div>
            <div class="text-sm text-gray-600 dark:text-gray-400">Calories</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">{{ recipe.protein }}g</div>
            <div class="text-sm text-gray-600 dark:text-gray-400">Protein</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-1">{{ recipe.carbs }}g</div>
            <div class="text-sm text-gray-600 dark:text-gray-400">Carbs</div>
          </div>
        </div>
      </div>
    </section>
    
    <!-- Description Section -->
    <section id="description" class="mb-8">
      <div class="card">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Description</h2>
        <p class="text-gray-700 dark:text-gray-300 leading-relaxed">{{ recipe.description }}</p>
      </div>
    </section>

    <!-- Ingredients Section -->
    <section id="ingredients" class="mb-8">
      <div class="card">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Ingredients</h2>
        <div class="space-y-3">
          <div
            v-for="(ingredient, index) in recipe.ingredients"
            :key="index"
            class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
          >
            <div class="flex items-center space-x-3">
              <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span class="text-green-600 text-sm font-medium">{{ index + 1 }}</span>
              </div>
              <div>
                <div class="font-medium text-gray-900">{{ ingredient.ingredient?.name || 'Unknown ingredient' }}</div>
                <div class="text-sm text-gray-600">{{ ingredient.quantity }} {{ ingredient.unit }}</div>
              </div>
            </div>
            <div class="text-sm text-gray-500">
              {{ Math.round((ingredient.ingredient?.caloriesPerUnit || 0) * ingredient.quantity) }} cal
            </div>
          </div>
        </div>
      </div>
    </section>
    
    <!-- Instructions Section -->
    <section id="instructions" class="mb-8">
      <div class="card">
        <h2 class="text-xl font-semibold text-gray-900 mb-6">Instructions</h2>
        <div class="space-y-6">
          <div
            v-for="(instruction, index) in recipe.instructions"
            :key="index"
            class="flex items-start space-x-4"
          >
            <div class="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
              {{ index + 1 }}
            </div>
            <div class="flex-1">
              <p class="text-gray-700 leading-relaxed">{{ instruction }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
  
  <!-- Loading State -->
  <div v-else-if="pending" class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="animate-pulse space-y-8">
      <div class="h-8 bg-gray-200 rounded w-3/4"></div>
      <div class="card">
        <div class="h-4 bg-gray-200 rounded mb-4"></div>
        <div class="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    </div>
  </div>
  
  <!-- Error State -->
  <div v-else class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
    <h1 class="text-2xl font-bold text-gray-900 mb-4">Recipe Not Found</h1>
    <p class="text-gray-600 mb-6">The recipe you're looking for doesn't exist or has been removed.</p>
    <NuxtLink to="/" class="btn-primary">Back to Home</NuxtLink>
  </div>
</template>

<script setup lang="ts">
import type { Recipe } from '../../../types'

const route = useRoute()
const recipeId = route.params.id as string

// Get user authentication
const user = ref<{ id: string } | null>(null)
const isFavorited = ref(false)
const userRating = ref<number | null>(null)
const favoriteLoading = ref(false)
const ratingLoading = ref(false)
const showSuccessMessage = ref(false)
const successMessage = ref('')

// Initialize user data and check favorites/ratings
onMounted(async () => {
  try {
    const localData = localStorage.getItem('user')
    user.value = localData ? JSON.parse(localData) : null

    // Check if user has favorited this recipe and get their rating
    if (user.value && recipe.value) {
      await checkUserInteractions()
    }
  } catch (error) {
    console.error('Error reading user data from localStorage:', error)
    user.value = null
  }
})

const checkUserInteractions = async () => {
  if (!user.value) return

  try {
    // Check if recipe is favorited (auth handled by server middleware via cookies)
    const { data: userFavorites } = await $fetch<{success: boolean, data: string[]}>(`/api/users/me/favorites`)
    isFavorited.value = userFavorites.includes(recipeId)

    // Get user's rating for this recipe (auth handled by server middleware via cookies)
    try {
      const { data: ratingData } = await $fetch<{success: boolean, data: {rating: number}}>(`/api/recipes/${recipeId}/user-rating`)
      userRating.value = ratingData.rating
    } catch (error) {
      // User hasn't rated this recipe yet
      userRating.value = null
    }
  } catch (error) {
    console.error('Error checking user interactions:', error)
  }
}

const { data: recipeResponse, pending } = await useFetch<{success: boolean, data: Recipe}>(`/api/recipes/${recipeId}`)

// Extract the actual recipe data
const recipe = computed(() => recipeResponse.value?.data)

const scrollToSection = (sectionId: string) => {
  const element = document.getElementById(sectionId)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

const toggleFavorite = async () => {
  if (!user.value || !recipe.value) {
    console.log('Cannot toggle favorite: user or recipe not available')
    return
  }

  try {
    favoriteLoading.value = true
    console.log('Toggling favorite for recipe:', recipeId)

    // Auth handled by server middleware via cookies
    const response = await $fetch<{success: boolean, data: {isFavorited: boolean, favoriteCount: number}}>(`/api/recipes/${recipeId}/favorite`, {
      method: 'POST'
    })

    console.log('Favorite toggle response:', response)

    isFavorited.value = response.data.isFavorited
    // Update the recipe's favorite count
    if (recipe.value) {
      recipe.value.favoriteCount = response.data.favoriteCount
    }

    // Show success message
    showSuccessMessage.value = true
    successMessage.value = response.data.isFavorited ? 'Added to favorites!' : 'Removed from favorites!'
    setTimeout(() => {
      showSuccessMessage.value = false
    }, 3000)
  } catch (error: any) {
    console.error('Error toggling favorite:', error)
    console.error('Error details:', error?.data || error?.message)

    // Show error message
    showSuccessMessage.value = true
    successMessage.value = 'Failed to update favorite. Please try again.'
    setTimeout(() => {
      showSuccessMessage.value = false
    }, 3000)
  } finally {
    favoriteLoading.value = false
  }
}

const submitRating = async (rating: number) => {
  if (!user.value || !recipe.value || ratingLoading.value) {
    console.log('Cannot submit rating: user or recipe not available')
    return
  }

  try {
    ratingLoading.value = true

    // If clicking the same rating, remove it
    if (userRating.value === rating) {
      console.log('Removing rating for recipe:', recipeId)

      const response = await $fetch<{success: boolean, data: {userRating: number | null, averageRating: number, totalRatings: number}}>(`/api/recipes/${recipeId}/rating`, {
        method: 'DELETE',
        credentials: 'include'
      })

      console.log('Rating removal response:', response)

      userRating.value = null
      if (recipe.value) {
        recipe.value.rating = response.data.averageRating
      }

      showSuccessMessage.value = true
      successMessage.value = 'Rating removed!'
      setTimeout(() => {
        showSuccessMessage.value = false
      }, 3000)
    } else {
      // Submit new rating
      console.log('Submitting rating:', rating, 'for recipe:', recipeId)

      const response = await $fetch<{success: boolean, data: {userRating: number, averageRating: number, totalRatings: number}}>(`/api/recipes/${recipeId}/rating`, {
        method: 'POST',
        credentials: 'include',
        body: {
          rating: rating
        }
      })

      console.log('Rating response:', response)

      userRating.value = response.data.userRating
      // Update the recipe's average rating
      if (recipe.value) {
        recipe.value.rating = response.data.averageRating
      }

      // Show success message
      showSuccessMessage.value = true
      successMessage.value = `Rated ${rating} star${rating > 1 ? 's' : ''}!`
      setTimeout(() => {
        showSuccessMessage.value = false
      }, 3000)
    }
  } catch (error: any) {
    console.error('Error submitting rating:', error)
    console.error('Error details:', error?.data || error?.message)

    // Show error message
    showSuccessMessage.value = true
    successMessage.value = 'Failed to submit rating. Please try again.'
    setTimeout(() => {
      showSuccessMessage.value = false
    }, 3000)
  } finally {
    ratingLoading.value = false
  }
}

const getDifficultyText = (rating: number) => {
  if (rating <= 2) return 'Easy'
  if (rating <= 4) return 'Medium'
  return 'Hard'
}

const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Set page title
useHead({
  title: recipe.value?.title ? `${recipe.value.title} - Quick Recipes` : 'Recipe - Quick Recipes'
})
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
