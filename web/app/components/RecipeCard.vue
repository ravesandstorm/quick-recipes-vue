<template>
  <div class="recipe-card group" @click="goToRecipe">
    <!-- Recipe Image Placeholder -->
    <div class="h-48 bg-gradient-to-br from-gray-200 to-gray-300 rounded-t-xl flex items-center justify-center relative overflow-hidden">
      <!-- Placeholder for recipe image -->
      <div class="text-6xl opacity-50">🍽️</div>
      
      <!-- Favorite Button -->
      <button
        v-if="user"
        @click.stop="toggleFavorite"
        class="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-all duration-200"
        :class="{ 'text-red-500': isFavorited, 'text-gray-400': !isFavorited }"
      >
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
      </button>
      
      <!-- Difficulty Badge -->
      <div v-if="recipe.difficultyRating" class="absolute top-3 left-3 px-2 py-1 bg-white/80 backdrop-blur-sm rounded-full text-xs font-medium">
        {{ getDifficultyText(recipe.difficultyRating) }}
      </div>
    </div>
    
    <!-- Recipe Info -->
    <div class="p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
        {{ recipe.title }}
      </h3>
      
      <p class="text-gray-600 text-sm mb-4 line-clamp-2">
        {{ recipe.description }}
      </p>
      
      <!-- Recipe Stats -->
      <div class="flex items-center justify-between text-sm text-gray-500 mb-4">
        <div class="flex items-center space-x-4">
          <div class="flex items-center space-x-1">
            <span>🔥</span>
            <span>{{ recipe.calories }} cal</span>
          </div>
          <div class="flex items-center space-x-1">
            <span>💪</span>
            <span>{{ recipe.protein }}g</span>
          </div>
          <div class="flex items-center space-x-1">
            <span>🌾</span>
            <span>{{ recipe.carbs }}g</span>
          </div>
        </div>
        
        <div class="flex items-center space-x-1">
          <svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          <span>{{ recipe.rating || 'N/A' }}</span>
        </div>
      </div>
      
      <!-- Creator Info -->
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <div class="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
            <span class="text-white text-xs font-medium">
              {{ getCreatorInitial() }}
            </span>
          </div>
          <span class="text-sm text-gray-600">{{ recipe.createdBy || 'Anonymous' }}</span>
        </div>
        
        <div class="flex items-center space-x-1 text-sm text-gray-500">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
          <span>{{ recipe.favoriteCount || 0 }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Recipe } from '~/types'

interface Props {
  recipe: Recipe & { createdBy?: string }
}

const props = defineProps<Props>()

// Mock user for now - will be replaced with actual auth
const user = ref(null) // This should come from auth
const isFavorited = ref(false)

const goToRecipe = () => {
  navigateTo(`/recipes/${props.recipe.id}`)
}

const toggleFavorite = async () => {
  if (!user.value) return
  
  try {
    isFavorited.value = !isFavorited.value
    // API call to toggle favorite
    await $fetch(`/api/recipes/${props.recipe.id}/favorite`, {
      method: 'POST'
    })
  } catch (error) {
    // Revert on error
    isFavorited.value = !isFavorited.value
    console.error('Error toggling favorite:', error)
  }
}

const getDifficultyText = (rating: number) => {
  if (rating <= 2) return 'Easy'
  if (rating <= 4) return 'Medium'
  return 'Hard'
}

const getCreatorInitial = () => {
  const name = props.recipe.createdBy || 'Anonymous'
  return name.charAt(0).toUpperCase()
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
