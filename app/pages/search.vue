<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Search Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-4">Search Recipes</h1>
      
      <!-- Main Search Bar -->
      <div class="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 mb-4">
        <div class="flex-1 relative">
          <input
            v-model="searchQuery"
            @keyup.enter="() => performSearch()"
            type="text"
            placeholder="Search for recipes..."
            class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
          />
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg class="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        <div class="flex space-x-2 sm:space-x-4">
          <button
            @click="() => performSearch()"
            class="btn-primary flex-1 sm:flex-none sm:px-8"
          >
            Search
          </button>
          <button
            @click="showAdvanced = !showAdvanced"
            class="btn-secondary flex-1 sm:flex-none"
          >
            Advanced
          </button>
        </div>
      </div>
      
      <!-- Advanced Filters -->
      <div v-if="showAdvanced" class="card animate-slide-up">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Advanced Filters</h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- Available Ingredients -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Available Ingredients</label>
            <IngredientMultiSelect v-model="filters.ingredients" />
          </div>
          
          <!-- Rating Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Minimum Rating</label>
            <select v-model="filters.minRating" class="input-field">
              <option value="">Any rating</option>
              <option value="4">4+ stars</option>
              <option value="4.5">4.5+ stars</option>
              <option value="5">5 stars only</option>
            </select>
          </div>
          
          <!-- Calorie Range -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Calorie Range</label>
            <div class="flex space-x-2">
              <input
                v-model.number="filters.minCalories"
                type="number"
                placeholder="Min"
                class="input-field"
              />
              <input
                v-model.number="filters.maxCalories"
                type="number"
                placeholder="Max"
                class="input-field"
              />
            </div>
          </div>
          
          <!-- Protein Range -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Protein Range (g)</label>
            <div class="flex space-x-2">
              <input
                v-model.number="filters.minProtein"
                type="number"
                placeholder="Min"
                class="input-field"
              />
              <input
                v-model.number="filters.maxProtein"
                type="number"
                placeholder="Max"
                class="input-field"
              />
            </div>
          </div>
          
          <!-- Carbs Range -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Carbs Range (g)</label>
            <div class="flex space-x-2">
              <input
                v-model.number="filters.minCarbs"
                type="number"
                placeholder="Min"
                class="input-field"
              />
              <input
                v-model.number="filters.maxCarbs"
                type="number"
                placeholder="Max"
                class="input-field"
              />
            </div>
          </div>
          
          <!-- Sort Options -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
            <select v-model="filters.sortBy" class="input-field">
              <option value="relevance">Relevance</option>
              <option value="rating">Rating</option>
              <option value="favoriteCount">Most Favorited</option>
              <option value="calories">Calories</option>
              <option value="protein">Protein</option>
              <option value="carbs">Carbs</option>
              <option value="createdAt">Newest</option>
            </select>
          </div>
        </div>
        
        <div class="flex justify-end space-x-4 mt-6">
          <button @click="clearFilters" class="btn-secondary">
            Clear Filters
          </button>
          <button @click="() => performSearch()" class="btn-primary">
            Apply Filters
          </button>
        </div>
      </div>
    </div>
    
    <!-- Search Results -->
    <div v-if="searchPerformed">
      <!-- Results Header -->
      <div class="flex justify-between items-center mb-6">
        <div>
          <h2 class="text-xl font-semibold text-gray-900">
            {{ loading ? 'Searching...' : `${totalResults} recipes found` }}
          </h2>
          <p v-if="searchQuery" class="text-gray-600">
            Results for "{{ searchQuery }}"
          </p>
        </div>
        
        <!-- Quick Sort -->
        <div class="flex items-center space-x-2">
          <span class="text-sm text-gray-600">Sort:</span>
          <select v-model="quickSort" @change="() => performSearch()" class="text-sm border border-gray-300 rounded px-2 py-1">
            <option value="relevance">Relevance</option>
            <option value="rating">Rating</option>
            <option value="favoriteCount">Popular</option>
            <option value="createdAt">Newest</option>
          </select>
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
      
      <!-- Results Grid -->
      <div v-else-if="recipes.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <RecipeCard
          v-for="recipe in recipes"
          :key="recipe.id"
          :recipe="recipe"
          class="animate-fade-in"
        />
      </div>
      
      <!-- No Results -->
      <div v-else class="text-center py-12">
        <div class="text-gray-500 mb-4">No recipes found matching your criteria</div>
        <button @click="clearFilters" class="btn-primary">
          Clear Filters
        </button>
      </div>
      
      <!-- Load More -->
      <div v-if="recipes.length > 0 && hasMore" class="text-center mt-8">
        <button
          @click="loadMoreRecipes"
          :disabled="loading"
          class="btn-primary"
        >
          {{ loading ? 'Loading...' : 'Load More' }}
        </button>
      </div>
    </div>
    
    <!-- Initial State -->
    <div v-else class="text-center py-12">
      <div class="text-gray-500 mb-4">Enter a search term or use filters to find recipes</div>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
        <button
          v-for="suggestion in searchSuggestions"
          :key="suggestion"
          @click="() => { searchQuery = suggestion; performSearch() }"
          class="card text-center hover:shadow-md transition-all duration-200 hover:scale-105"
        >
          <div class="text-sm font-medium text-gray-700">{{ suggestion }}</div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Recipe, SearchFilters } from '../../types'

const route = useRoute()
const router = useRouter()

const searchQuery = ref((route.query.q as string) || '')
const showAdvanced = ref(false)
const loading = ref(false)
const searchPerformed = ref(false)
const recipes = ref<Recipe[]>([])
const totalResults = ref(0)
const hasMore = ref(false)
const currentPage = ref(1)

const filters = reactive<SearchFilters>({
  query: '',
  ingredients: [],
  minRating: undefined,
  maxRating: undefined,
  minCalories: undefined,
  maxCalories: undefined,
  minProtein: undefined,
  maxProtein: undefined,
  minCarbs: undefined,
  maxCarbs: undefined,
  sortBy: 'favoriteCount',
  sortOrder: 'desc'
})

const quickSort = ref('favoriteCount')

const searchSuggestions = [
  'Pasta',
  'Chicken',
  'Vegetarian',
  'Dessert',
  'Quick meals',
  'Healthy',
  'Low carb',
  'High protein'
]

const performSearch = async (loadMore = false) => {
  if (!loadMore) {
    currentPage.value = 1
    recipes.value = []
  }
  
  loading.value = true
  searchPerformed.value = true
  
  try {
    const searchParams = {
      ...filters,
      query: searchQuery.value,
      sortBy: quickSort.value,
      limit: 12,
      skip: (currentPage.value - 1) * 12
    }
    
    const response = await $fetch('/api/recipes/search', {
      query: searchParams
    }) as { success: boolean, data: { recipes: Recipe[], total: number, page: number, totalPages: number } }

    if (loadMore) {
      recipes.value.push(...(response.data.recipes || []))
    } else {
      recipes.value = response.data.recipes || []
    }

    totalResults.value = response.data.total || 0
    hasMore.value = recipes.value.length < totalResults.value
    
    // Update URL
    if (!loadMore) {
      const query: any = {}
      if (searchQuery.value) query.q = searchQuery.value
      if (quickSort.value !== 'favoriteCount') query.sort = quickSort.value
      
      await router.replace({ query })
    }
    
  } catch (error) {
    console.error('Search error:', error)
  } finally {
    loading.value = false
  }
}

const loadMoreRecipes = () => {
  currentPage.value++
  performSearch(true)
}

const clearFilters = () => {
  searchQuery.value = ''
  Object.assign(filters, {
    query: '',
    ingredients: [],
    minRating: undefined,
    maxRating: undefined,
    minCalories: undefined,
    maxCalories: undefined,
    minProtein: undefined,
    maxProtein: undefined,
    minCarbs: undefined,
    maxCarbs: undefined,
    sortBy: 'favoriteCount',
    sortOrder: 'desc'
  })
  quickSort.value = 'favoriteCount'
  performSearch()
}

// Perform initial search if query exists
onMounted(() => {
  if (searchQuery.value || route.query.category) {
    if (route.query.category) {
      searchQuery.value = route.query.category as string
    }
    performSearch()
  }
})
</script>
