<template>
  <div class="space-y-3" ref="inputField">
    <!-- Ingredient Search -->
    <div class="relative">
      <input
        v-model="searchQuery"
        @input="searchIngredients"
        @focus="showSuggestions = true"
        type="text"
        class="input-field"
        :placeholder="placeholder"
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
          @click="selectIngredient(ingredient)"
          class="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 focus:outline-none focus:bg-gray-50"
        >
          <div class="font-medium text-gray-900">{{ ingredient.name }}</div>
          <div class="text-sm text-gray-500">
            {{ ingredient.caloriesPerUnit }} cal per {{ ingredient.defaultUnit }}
          </div>
        </button>
      </div>
    </div>
    
    <!-- Selected Ingredient Details -->
    <div v-if="selectedIngredient" class="grid grid-cols-2 gap-3">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
        <input
          v-model.number="quantity"
          type="number"
          step="0.1"
          min="0"
          class="input-field"
          placeholder="0"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Unit</label>
        <select v-model="unit" class="input-field">
          <option :value="selectedIngredient.defaultUnit">{{ selectedIngredient.defaultUnit }}</option>
          <option v-if="selectedIngredient.defaultUnit !== 'grams'" value="grams">grams</option>
          <option v-if="selectedIngredient.defaultUnit !== 'ml'" value="ml">ml</option>
          <option v-if="selectedIngredient.defaultUnit !== 'pieces'" value="pieces">pieces</option>
          <option value="cups">cups</option>
          <option value="tbsp">tablespoons</option>
          <option value="tsp">teaspoons</option>
        </select>
      </div>
    </div>
    
    <!-- Nutrition Preview -->
    <div v-if="selectedIngredient && quantity > 0" class="bg-gray-50 p-3 rounded-lg">
      <div class="text-sm text-gray-600 mb-1">Nutrition for {{ quantity }} {{ unit }}:</div>
      <div class="flex space-x-4 text-sm">
        <span>🔥 {{ Math.round(nutritionPreview.calories) }} cal</span>
        <span>💪 {{ nutritionPreview.protein.toFixed(1) }}g protein</span>
        <span>🌾 {{ nutritionPreview.carbs.toFixed(1) }}g carbs</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { RecipeIngredient, Ingredient } from '../../types'
import { onClickOutside } from '#imports'

interface Props {
  modelValue: RecipeIngredient
  placeholder?: string
}

interface Emits {
  (e: 'update:modelValue', value: RecipeIngredient): void
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Search for an ingredient...'
})

const emit = defineEmits<Emits>()

const inputFieldRef = useTemplateRef('inputField')
const searchQuery = ref('')
const showSuggestions = ref(false)
const suggestions = ref<Ingredient[]>([])
const selectedIngredient = ref<Ingredient | null>(null)
const quantity = ref(0)
const unit = ref('')

const nutritionPreview = computed(() => {
  if (!selectedIngredient.value || !quantity.value) {
    return { calories: 0, protein: 0, carbs: 0 }
  }
  
  const multiplier = quantity.value
  return {
    calories: (selectedIngredient.value.caloriesPerUnit || 0) * multiplier,
    protein: (selectedIngredient.value.proteinPerUnit || 0) * multiplier,
    carbs: (selectedIngredient.value.carbsPerUnit || 0) * multiplier
  }
})

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

const selectIngredient = (ingredient: Ingredient) => {
  selectedIngredient.value = ingredient
  searchQuery.value = ingredient.name
  unit.value = ingredient.defaultUnit
  showSuggestions.value = false
  
  updateModelValue()
}

const updateModelValue = () => {
  if (!selectedIngredient.value) return
  
  emit('update:modelValue', {
    ingredientId: selectedIngredient.value.id || '',
    quantity: quantity.value,
    unit: unit.value,
    ingredient: selectedIngredient.value
  })
}

// Watch for changes to update parent
watch([quantity, unit], updateModelValue)

// Initialize from modelValue
onMounted(() => {
  if (props.modelValue.ingredient) {
    selectedIngredient.value = props.modelValue.ingredient
    searchQuery.value = props.modelValue.ingredient.name
    quantity.value = props.modelValue.quantity
    unit.value = props.modelValue.unit
  }
})

// Close suggestions when clicking outside
onClickOutside(inputFieldRef, () => {
  showSuggestions.value = false
})
</script>
