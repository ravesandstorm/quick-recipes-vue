<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Create New Recipe</h1>
      <p class="text-gray-600">Share your culinary creation with the community</p>
    </div>
    
    <form @submit.prevent="submitRecipe" class="space-y-8">
      <!-- Basic Information -->
      <div class="card">
        <h2 class="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>
        
        <div class="space-y-6">
          <div>
            <label for="title" class="block text-sm font-medium text-gray-700 mb-2">Recipe Title</label>
            <input
              id="title"
              v-model="form.title"
              type="text"
              required
              class="input-field"
              placeholder="Enter recipe title"
            />
          </div>
          
          <div>
            <label for="description" class="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              id="description"
              v-model="form.description"
              rows="3"
              required
              class="input-field resize-none"
              placeholder="Describe your recipe"
            ></textarea>
          </div>
          
          <div>
            <label for="difficulty" class="block text-sm font-medium text-gray-700 mb-2">Difficulty Rating</label>
            <select
              id="difficulty"
              v-model="form.difficultyRating"
              class="input-field"
            >
              <option value="">Select difficulty</option>
              <option value="1">Easy (1)</option>
              <option value="2">Medium (2)</option>
              <option value="3">Medium-Hard (3)</option>
              <option value="4">Hard (4)</option>
              <option value="5">Expert (5)</option>
            </select>
          </div>
        </div>
      </div>
      
      <!-- Ingredients -->
      <div class="card">
        <h2 class="text-xl font-semibold text-gray-900 mb-6">Ingredients</h2>
        
        <div class="space-y-4">
          <div
            v-for="(ingredient, index) in form.ingredients"
            :key="index"
            class="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg"
          >
            <div class="flex-1">
              <IngredientSelector
                v-model="form.ingredients[index]"
                :placeholder="`Ingredient ${index + 1}`"
              />
            </div>
            <button
              type="button"
              @click="removeIngredient(index)"
              class="text-red-600 hover:text-red-700 p-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
          
          <button
            type="button"
            @click="addIngredient"
            class="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors"
          >
            + Add Ingredient
          </button>
        </div>
      </div>
      
      <!-- Instructions -->
      <div class="card">
        <h2 class="text-xl font-semibold text-gray-900 mb-6">Instructions</h2>
        
        <div class="space-y-4">
          <div
            v-for="(instruction, index) in form.instructions"
            :key="index"
            class="flex items-start space-x-4"
          >
            <div class="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium mt-1">
              {{ index + 1 }}
            </div>
            <div class="flex-1">
              <textarea
                v-model="form.instructions[index]"
                rows="2"
                class="input-field resize-none"
                :placeholder="`Step ${index + 1} instructions`"
                required
              ></textarea>
            </div>
            <button
              type="button"
              @click="removeInstruction(index)"
              class="text-red-600 hover:text-red-700 p-2 mt-1"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
          
          <button
            type="button"
            @click="addInstruction"
            class="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors"
          >
            + Add Step
          </button>
        </div>
      </div>
      
      <!-- Calculated Nutrition -->
      <div class="card bg-blue-50 border-blue-200">
        <h2 class="text-xl font-semibold text-gray-900 mb-6">Estimated Nutrition</h2>
        <div class="grid grid-cols-3 gap-6">
          <div class="text-center">
            <div class="text-2xl font-bold text-blue-600">{{ calculatedNutrition.calories }}</div>
            <div class="text-sm text-gray-600">Calories</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-green-600">{{ calculatedNutrition.protein }}g</div>
            <div class="text-sm text-gray-600">Protein</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-orange-600">{{ calculatedNutrition.carbs }}g</div>
            <div class="text-sm text-gray-600">Carbs</div>
          </div>
        </div>
      </div>
      
      <!-- Auto-save Status -->
      <div v-if="autoSaveStatus" class="text-sm text-gray-500 text-center">
        {{ autoSaveStatus }}
      </div>
      
      <!-- Submit Button -->
      <div class="flex justify-end space-x-4">
        <button
          type="button"
          @click="saveDraft"
          class="btn-secondary"
          :disabled="submitting"
        >
          Save Draft
        </button>
        <button
          type="submit"
          class="btn-primary"
          :disabled="submitting || !isFormValid"
        >
          <span v-if="submitting">Publishing...</span>
          <span v-else>Publish Recipe</span>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import type { RecipeFormData, RecipeIngredient } from '~/types'

definePageMeta({
  middleware: 'auth'
})

const form = reactive<RecipeFormData>({
  title: '',
  description: '',
  instructions: [''],
  ingredients: [],
  difficultyRating: undefined
})

const submitting = ref(false)
const autoSaveStatus = ref('')

const calculatedNutrition = computed(() => {
  let calories = 0
  let protein = 0
  let carbs = 0
  
  form.ingredients.forEach(ingredient => {
    if (ingredient.ingredient) {
      const multiplier = ingredient.quantity || 0
      calories += (ingredient.ingredient.caloriesPerUnit || 0) * multiplier
      protein += (ingredient.ingredient.proteinPerUnit || 0) * multiplier
      carbs += (ingredient.ingredient.carbsPerUnit || 0) * multiplier
    }
  })
  
  return {
    calories: Math.round(calories),
    protein: Math.round(protein * 10) / 10,
    carbs: Math.round(carbs * 10) / 10
  }
})

const isFormValid = computed(() => {
  return form.title.trim() && 
         form.description.trim() && 
         form.instructions.some(inst => inst.trim()) &&
         form.ingredients.length > 0
})

const addIngredient = () => {
  form.ingredients.push({
    ingredientId: '',
    quantity: 0,
    unit: ''
  })
}

const removeIngredient = (index: number) => {
  form.ingredients.splice(index, 1)
}

const addInstruction = () => {
  form.instructions.push('')
}

const removeInstruction = (index: number) => {
  if (form.instructions.length > 1) {
    form.instructions.splice(index, 1)
  }
}

const saveDraft = () => {
  localStorage.setItem('recipe-draft', JSON.stringify(form))
  autoSaveStatus.value = 'Draft saved locally'
  setTimeout(() => {
    autoSaveStatus.value = ''
  }, 2000)
}

const submitRecipe = async () => {
  if (!isFormValid.value) return
  
  submitting.value = true
  
  try {
    const { data } = await $fetch('/api/recipes', {
      method: 'POST',
      body: {
        ...form,
        ...calculatedNutrition.value
      }
    })
    
    // Clear draft
    localStorage.removeItem('recipe-draft')
    
    // Redirect to recipe page
    await navigateTo(`/recipes/${data.id}`)
  } catch (error) {
    console.error('Error creating recipe:', error)
    // Show error message
  } finally {
    submitting.value = false
  }
}

// Auto-save functionality
let autoSaveTimeout: NodeJS.Timeout
const autoSave = () => {
  clearTimeout(autoSaveTimeout)
  autoSaveTimeout = setTimeout(() => {
    saveDraft()
  }, 2000)
}

// Watch form changes for auto-save
watch(form, autoSave, { deep: true })

// Load draft on mount
onMounted(() => {
  const draft = localStorage.getItem('recipe-draft')
  if (draft) {
    try {
      const parsedDraft = JSON.parse(draft)
      Object.assign(form, parsedDraft)
    } catch (error) {
      console.error('Error loading draft:', error)
    }
  }
  
  // Add initial ingredient if none exist
  if (form.ingredients.length === 0) {
    addIngredient()
  }
})
</script>
