<template>
  <div ref="multiSelectRoot" class="space-y-3">
    <!-- Search Input -->
    <div class="relative">
      <input
        v-model="searchQuery"
        @input="searchIngredients"
        @focus="showSuggestions = true"
        type="text"
        class="input-field"
        placeholder="Search and select ingredients..."
        autocomplete="off"
      />
      
      <!-- Suggestions Dropdown -->
      <div
        v-if="showSuggestions && suggestions.length > 0"
        class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
      >
        <button
          v-for="ingredient in suggestions"
          :key="ingredient.id"
          type="button"
          @click="addIngredient(ingredient)"
          class="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 focus:outline-none focus:bg-gray-50"
          :disabled="isSelected(ingredient.id)"
        >
          <div class="flex justify-between items-center">
            <div>
              <div class="font-medium text-gray-900">{{ ingredient.name }}</div>
              <div class="text-sm text-gray-500">
                {{ ingredient.caloriesPerUnit }} cal per {{ ingredient.defaultUnit }}
              </div>
            </div>
            <div v-if="isSelected(ingredient.id)" class="text-green-600">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
            </div>
          </div>
        </button>
      </div>
    </div>
    
    <!-- Selected Ingredients -->
    <div v-if="selectedIngredients.length > 0" class="space-y-2">
      <div class="text-sm font-medium text-gray-700">Selected Ingredients:</div>
      <div class="flex flex-wrap gap-2">
        <div
          v-for="ingredient in selectedIngredients"
          :key="ingredient.id"
          class="inline-flex items-center space-x-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
        >
          <span>{{ ingredient.name }}</span>
          <button
            type="button"
            @click="removeIngredient(ingredient.id)"
            class="text-blue-600 hover:text-blue-800"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Ingredient } from '../../types'

interface Props {
  modelValue: string[]
}

interface Emits {
  (e: 'update:modelValue', value: string[]): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const multiSelectRef = useTemplateRef('multiSelectRoot')
const searchQuery = ref('')
const showSuggestions = ref(false)
const suggestions = ref<Ingredient[]>([])
const selectedIngredients = ref<Ingredient[]>([])

const searchIngredients = async () => {
  if (searchQuery.value.length < 2) {
    suggestions.value = []
    return
  }
  
  try {
    const { data } = await $fetch(`/api/ingredients/search?q=${encodeURIComponent(searchQuery.value)}`)
    suggestions.value = data || []
  } catch (error) {
    console.error('Error searching ingredients:', error)
    suggestions.value = []
  }
}

const isSelected = (ingredientId: string) => {
  return selectedIngredients.value.some(ing => ing.id === ingredientId)
}

const addIngredient = (ingredient: Ingredient) => {
  if (!isSelected(ingredient.id!)) {
    selectedIngredients.value.push(ingredient)
    updateModelValue()
  }
  searchQuery.value = ''
  suggestions.value = []
  showSuggestions.value = false
}

const removeIngredient = (ingredientId: string) => {
  selectedIngredients.value = selectedIngredients.value.filter(ing => ing.id !== ingredientId)
  updateModelValue()
}

const updateModelValue = () => {
  emit('update:modelValue', selectedIngredients.value.map(ing => ing.id!))
}

// Initialize from modelValue
onMounted(async () => {
  if (props.modelValue.length > 0) {
    try {
      // Fetch ingredient details for selected IDs
      const promises = props.modelValue.map(id => 
        $fetch(`/api/ingredients/${id}`).catch(() => null)
      )
      const results = await Promise.all(promises)
      
      selectedIngredients.value = results
        .filter(result => result?.data)
        .map(result => result.data)
    } catch (error) {
      console.error('Error loading selected ingredients:', error)
    }
  }
})

// Close suggestions when clicking outside
onClickOutside(multiSelectRef, () => {
  showSuggestions.value = false
})
</script>
