<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
    <!-- Loading State -->
    <div v-if="loading" class="animate-pulse">
      <div class="card">
        <div class="flex items-start space-x-6">
          <div class="w-24 h-24 bg-gray-200 rounded-full"></div>
          <div class="flex-1">
            <div class="h-8 bg-gray-200 rounded mb-2"></div>
            <div class="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div class="flex space-x-8">
              <div class="h-4 bg-gray-200 rounded w-20"></div>
              <div class="h-4 bg-gray-200 rounded w-20"></div>
              <div class="h-4 bg-gray-200 rounded w-20"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- User Profile -->
    <div v-else-if="userProfile" class="space-y-8">
      <!-- Profile Header -->
      <div class="card">
        <div class="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-6">
          <!-- Avatar -->
          <div class="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
            <span class="text-white text-3xl font-bold">
              {{ userProfile.name?.charAt(0).toUpperCase() }}
            </span>
          </div>
          
          <!-- Profile Info -->
          <div class="flex-1 w-full">
            <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
              <div class="mb-4 sm:mb-0">
                <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">{{ userProfile.name }}</h1>
                <p v-if="userProfile.bio" class="text-gray-600 dark:text-gray-400">{{ userProfile.bio }}</p>
              </div>

              <!-- Edit Button (only show if own profile) -->
              <button
                v-if="isOwnProfile && !editMode"
                @click="editMode = true"
                class="px-6 py-2 rounded-lg font-medium transition-colors bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Edit Profile
              </button>

              <!-- Follow Button (only show if not own profile) -->
              <button
                v-else-if="!isOwnProfile && currentUser"
                @click="toggleFollow"
                :disabled="followLoading"
                :class="[
                  'px-6 py-2 rounded-lg font-medium transition-colors',
                  isFollowing
                    ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    : 'bg-violet-600 text-white hover:bg-violet-700'
                ]"
              >
                <span v-if="followLoading">...</span>
                <span v-else>{{ isFollowing ? 'Unfollow' : 'Follow' }}</span>
              </button>
            </div>

            <!-- Edit Form (only show if own profile and edit mode) -->
            <div v-if="isOwnProfile && editMode" class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <form @submit.prevent="updateProfile" class="space-y-4">
                <div>
                  <label for="name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                  <input
                    id="name"
                    v-model="editForm.name"
                    type="text"
                    required
                    class="input-field"
                  />
                </div>

                <div>
                  <label for="bio" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bio</label>
                  <textarea
                    id="bio"
                    v-model="editForm.bio"
                    rows="3"
                    class="input-field resize-none"
                    placeholder="Tell us about yourself..."
                  ></textarea>
                </div>

                <div class="flex justify-end space-x-4">
                  <button
                    type="button"
                    @click="cancelEdit"
                    class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    :disabled="updating"
                    class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {{ updating ? 'Saving...' : 'Save Changes' }}
                  </button>
                </div>
              </form>
            </div>

            <!-- Stats -->
            <div class="grid grid-cols-3 gap-4 sm:gap-8">
              <NuxtLink
                :to="`/users/${userProfile.id}/recipes`"
                class="text-center hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded-lg transition-colors"
              >
                <div class="text-2xl font-bold text-gray-900 dark:text-gray-100">{{ stats.recipesCount }}</div>
                <div class="text-sm text-gray-600 dark:text-gray-400">Recipes</div>
              </NuxtLink>

              <NuxtLink
                :to="`/users/${userProfile.id}/followers`"
                class="text-center hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded-lg transition-colors"
              >
                <div class="text-2xl font-bold text-gray-900 dark:text-gray-100">{{ stats.followersCount }}</div>
                <div class="text-sm text-gray-600 dark:text-gray-400">Followers</div>
              </NuxtLink>

              <NuxtLink
                :to="`/users/${userProfile.id}/following`"
                class="text-center hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded-lg transition-colors"
              >
                <div class="text-2xl font-bold text-gray-900 dark:text-gray-100">{{ stats.followingCount }}</div>
                <div class="text-sm text-gray-600 dark:text-gray-400">Following</div>
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>

      <!-- Recipes / Favorites Tabs -->
      <div class="card">
        <!-- Tab Navigation -->
        <div class="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav class="-mb-px flex space-x-8">
            <button
              @click="profileTab = 'recipes'"
              :class="[
                'py-2 px-1 border-b-2 font-medium text-sm',
                profileTab === 'recipes'
                  ? 'border-violet-500 text-violet-600 dark:text-violet-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-500'
              ]"
            >
              Recipes ({{ stats.recipesCount }})
            </button>
            <button
              @click="switchToFavorites"
              :class="[
                'py-2 px-1 border-b-2 font-medium text-sm',
                profileTab === 'favorites'
                  ? 'border-violet-500 text-violet-600 dark:text-violet-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-500'
              ]"
            >
              Favorites
            </button>
          </nav>
        </div>

        <!-- Recipes Tab -->
        <div v-if="profileTab === 'recipes'">
          <div v-if="recipesLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div v-for="i in 6" :key="i" class="recipe-card animate-pulse">
              <div class="h-48 bg-gray-200 dark:bg-gray-700 rounded-t-xl"></div>
              <div class="p-6">
                <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-3/4"></div>
              </div>
            </div>
          </div>
          <div v-else-if="userRecipes.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <RecipeCard
              v-for="recipe in userRecipes"
              :key="recipe.id"
              :recipe="recipe"
              class="animate-fade-in"
            />
          </div>
          <div v-else class="text-center py-12">
            <div class="text-gray-500 dark:text-gray-400">{{ userProfile.name }} hasn't created any recipes yet</div>
          </div>
        </div>

        <!-- Favorites Tab -->
        <div v-else-if="profileTab === 'favorites'">
          <div v-if="favoritesLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div v-for="i in 6" :key="i" class="recipe-card animate-pulse">
              <div class="h-48 bg-gray-200 dark:bg-gray-700 rounded-t-xl"></div>
              <div class="p-6">
                <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-3/4"></div>
              </div>
            </div>
          </div>
          <div v-else-if="userFavorites.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <RecipeCard
              v-for="recipe in userFavorites"
              :key="recipe.id"
              :recipe="recipe"
              :initialFavorited="true"
              class="animate-fade-in"
            />
          </div>
          <div v-else class="text-center py-12">
            <div class="text-gray-500 dark:text-gray-400">{{ userProfile.name }} hasn't favorited any recipes yet</div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Error State -->
    <div v-else class="text-center py-12">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">User Not Found</h1>
      <p class="text-gray-600 dark:text-gray-400 mb-6">The user you're looking for doesn't exist.</p>
      <NuxtLink to="/" class="btn-primary">Go Home</NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Recipe, User } from '../../../types'

const route = useRoute()
const { user: currentUser } = useSimpleAuth()

const userId = route.params.id as string

const loading = ref(true)
const recipesLoading = ref(true)
const favoritesLoading = ref(false)
const followLoading = ref(false)
const editMode = ref(false)
const updating = ref(false)
const userProfile = ref<User | null>(null)
const userRecipes = ref<Recipe[]>([])
const userFavorites = ref<Recipe[]>([])
const isFollowing = ref(false)
const profileTab = ref<'recipes' | 'favorites'>('recipes')

const stats = ref({
  recipesCount: 0,
  followersCount: 0,
  followingCount: 0
})

const editForm = reactive({
  name: '',
  bio: ''
})

const isOwnProfile = computed(() => {
  return currentUser.value?.id === userId
})

const fetchUserProfile = async () => {
  try {
    loading.value = true
    const { data } = await $fetch(`/api/users/${userId}`) as { success: boolean, data: User }
    userProfile.value = data

    // Update edit form if own profile
    if (isOwnProfile.value) {
      editForm.name = data.name || ''
      editForm.bio = data.bio || ''
    }

    // Update stats
    stats.value = {
      recipesCount: data.createdRecipes?.length || 0,
      followersCount: data.followers?.length || 0,
      followingCount: data.following?.length || 0
    }

    // Check if current user is following this user
    if (currentUser.value && !isOwnProfile.value) {
      isFollowing.value = data.followers?.includes(currentUser.value.id) || false
    }

  } catch (error: any) {
    console.error('Error fetching user profile:', error)
    if (error?.statusCode === 404) {
      // User not found, redirect to not found page
      await navigateTo('/profile-not-found')
    }
  } finally {
    loading.value = false
  }
}

const fetchUserRecipes = async () => {
  try {
    recipesLoading.value = true
    const { data } = await $fetch(`/api/users/${userId}/recipes`) as { success: boolean, data: Recipe[] }
    userRecipes.value = data || []
  } catch (error) {
    console.error('Error fetching user recipes:', error)
  } finally {
    recipesLoading.value = false
  }
}

const toggleFollow = async () => {
  if (!currentUser.value || isOwnProfile.value) return

  try {
    followLoading.value = true

    const { data } = await $fetch(`/api/users/${userId}/follow`, {
      method: 'POST',
      body: { userId: currentUser.value.id }
    }) as { success: boolean, data: { isFollowing: boolean, followersCount: number } }

    isFollowing.value = data.isFollowing
    stats.value.followersCount = data.followersCount

  } catch (error) {
    console.error('Error toggling follow:', error)
  } finally {
    followLoading.value = false
  }
}

const updateProfile = async () => {
  if (!userProfile.value) return

  try {
    updating.value = true

    const { data } = await $fetch(`/api/users/${userId}`, {
      method: 'PATCH',
      body: editForm
    }) as { success: boolean, data: User }

    userProfile.value = { ...userProfile.value, ...data }
    editMode.value = false

  } catch (error) {
    console.error('Error updating profile:', error)
  } finally {
    updating.value = false
  }
}

const fetchUserFavorites = async () => {
  try {
    favoritesLoading.value = true
    const { data } = await $fetch(`/api/users/${userId}/favorites`) as { success: boolean, data: Recipe[] }
    userFavorites.value = data || []
  } catch (error) {
    console.error('Error fetching user favorites:', error)
  } finally {
    favoritesLoading.value = false
  }
}

const switchToFavorites = () => {
  profileTab.value = 'favorites'
  if (userFavorites.value.length === 0 && !favoritesLoading.value) {
    fetchUserFavorites()
  }
}

const cancelEdit = () => {
  if (userProfile.value) {
    editForm.name = userProfile.value.name || ''
    editForm.bio = userProfile.value.bio || ''
  }
  editMode.value = false
}

onMounted(async () => {
  await fetchUserProfile()
  await fetchUserRecipes()
})
</script>
