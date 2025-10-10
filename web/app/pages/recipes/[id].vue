<template>
  <div v-if="recipe" class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Navigation Buttons -->
    <div class="fixed right-6 top-1/2 transform -translate-y-1/2 z-40 space-y-2">
      <button
        @click="scrollToSection('title')"
        class="w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors"
        title="Go to title"
      >
        <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
        </svg>
      </button>
      <button
        @click="scrollToSection('macros')"
        class="w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors"
        title="Go to nutrition"
      >
        📊
      </button>
      <button
        @click="scrollToSection('description')"
        class="w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors"
        title="Go to description"
      >
        📝
      </button>
      <button
        @click="scrollToSection('ingredients')"
        class="w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors"
        title="Go to ingredients"
      >
        🥕
      </button>
      <button
        @click="scrollToSection('instructions')"
        class="w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors"
        title="Go to instructions"
      >
        👨‍🍳
      </button>
      <button
        @click="scrollToSection('instructions')"
        class="w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors"
        title="Go to bottom"
      >
        <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </div>
    
    <!-- Title Section -->
    <section id="title" class="mb-8 animate-fade-in">
      <div class="flex justify-between items-start mb-4">
        <div class="flex-1">
          <h1 class="text-4xl font-bold text-gray-900 mb-2">{{ recipe.title }}</h1>
          <div class="flex items-center space-x-4 text-sm text-gray-600">
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
        
        <!-- Favorite Button -->
        <div class="flex items-center space-x-4">
          <button
            v-if="user"
            @click="toggleFavorite"
            class="flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all duration-200"
            :class="isFavorited ? 'bg-red-50 border-red-200 text-red-600' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
            <span>{{ recipe.favoriteCount }}</span>
          </button>
          
          <!-- Creator Info -->
          <NuxtLink
            v-if="recipe.creator"
            :to="`/profile/${recipe.creator.id}`"
            class="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span class="text-white text-sm font-medium">
                {{ recipe.creator.name?.charAt(0).toUpperCase() }}
              </span>
            </div>
            <span class="font-medium">{{ recipe.creator.name }}</span>
          </NuxtLink>
        </div>
      </div>
    </section>
    
    <!-- Nutrition Section -->
    <section id="macros" class="mb-8">
      <div class="card bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Nutrition Information</h2>
        <div class="grid grid-cols-3 gap-6">
          <div class="text-center">
            <div class="text-3xl font-bold text-blue-600 mb-1">{{ recipe.calories }}</div>
            <div class="text-sm text-gray-600">Calories</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-green-600 mb-1">{{ recipe.protein }}g</div>
            <div class="text-sm text-gray-600">Protein</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-orange-600 mb-1">{{ recipe.carbs }}g</div>
            <div class="text-sm text-gray-600">Carbs</div>
          </div>
        </div>
      </div>
    </section>
    
    <!-- Description Section -->
    <section id="description" class="mb-8">
      <div class="card">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Description</h2>
        <p class="text-gray-700 leading-relaxed">{{ recipe.description }}</p>
      </div>
    </section>
    
    <!-- Ingredients Section -->
    <section id="ingredients" class="mb-8">
      <div class="card">
        <h2 class="text-xl font-semibold text-gray-900 mb-6">Ingredients</h2>
        <div class="space-y-3">
          <div
            v-for="(ingredient, index) in recipe.ingredients"
            :key="index"
            class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
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
import type { Recipe } from '~/types'

const route = useRoute()
const recipeId = route.params.id as string

// Mock user for now
const user = ref(null)
const isFavorited = ref(false)

const { data: recipe, pending } = await useFetch<{success: boolean, data: Recipe}>(`/api/recipes/${recipeId}`)

const scrollToSection = (sectionId: string) => {
  const element = document.getElementById(sectionId)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

const toggleFavorite = async () => {
  if (!user.value || !recipe.value?.data) return
  
  try {
    isFavorited.value = !isFavorited.value
    await $fetch(`/api/recipes/${recipeId}/favorite`, {
      method: 'POST'
    })
    
    // Update favorite count
    if (recipe.value.data) {
      recipe.value.data.favoriteCount += isFavorited.value ? 1 : -1
    }
  } catch (error) {
    isFavorited.value = !isFavorited.value
    console.error('Error toggling favorite:', error)
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
  title: recipe.value?.data?.title ? `${recipe.value.data.title} - Quick Recipes` : 'Recipe - Quick Recipes'
})
</script>
