<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header -->
    <div class="mb-8">
      <div class="flex items-center space-x-4 mb-4">
        <button @click="$router.back()" class="p-2 hover:bg-gray-100 rounded-lg">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 class="text-2xl font-bold text-gray-900">
          {{ userProfile?.name }}'s Following
        </h1>
      </div>
      
      <!-- Navigation Tabs -->
      <div class="border-b border-gray-200">
        <nav class="-mb-px flex space-x-8">
          <NuxtLink
            :to="`/users/${userId}/followers`"
            class="py-2 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium text-sm"
          >
            Followers
          </NuxtLink>
          <NuxtLink
            :to="`/users/${userId}/following`"
            class="py-2 px-1 border-b-2 border-blue-500 text-blue-600 font-medium text-sm"
          >
            Following ({{ following.length }})
          </NuxtLink>
        </nav>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="space-y-4">
      <div v-for="i in 5" :key="i" class="flex items-center space-x-4 p-4 bg-white rounded-lg shadow-sm animate-pulse">
        <div class="w-12 h-12 bg-gray-200 rounded-full"></div>
        <div class="flex-1">
          <div class="h-4 bg-gray-200 rounded mb-2"></div>
          <div class="h-3 bg-gray-200 rounded w-3/4"></div>
        </div>
        <div class="w-20 h-8 bg-gray-200 rounded"></div>
      </div>
    </div>

    <!-- Following List -->
    <div v-else-if="following.length > 0" class="space-y-4">
      <div
        v-for="followedUser in following"
        :key="followedUser.id"
        class="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
      >
        <NuxtLink :to="`/users/${followedUser.id}`" class="flex items-center space-x-4 flex-1">
          <!-- Avatar -->
          <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span class="text-white font-bold">
              {{ followedUser.name?.charAt(0).toUpperCase() }}
            </span>
          </div>
          
          <!-- User Info -->
          <div class="flex-1">
            <h3 class="font-medium text-gray-900">{{ followedUser.name }}</h3>
            <p v-if="followedUser.bio" class="text-sm text-gray-600 truncate">{{ followedUser.bio }}</p>
            <div class="text-xs text-gray-500">
              {{ followedUser.recipesCount || 0 }} recipes
            </div>
          </div>
        </NuxtLink>

        <!-- Follow/Unfollow Button -->
        <button
          v-if="!isOwnProfile && currentUser && followedUser.id !== currentUser.id"
          @click="toggleFollow(followedUser)"
          :disabled="followedUser.followLoading"
          :class="[
            'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            followedUser.isFollowing
              ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          ]"
        >
          <span v-if="followedUser.followLoading">...</span>
          <span v-else>{{ followedUser.isFollowing ? 'Unfollow' : 'Follow' }}</span>
        </button>
        
        <!-- Unfollow Button for Own Profile -->
        <button
          v-else-if="isOwnProfile"
          @click="toggleFollow(followedUser)"
          :disabled="followedUser.followLoading"
          class="px-4 py-2 bg-gray-200 text-gray-700 hover:bg-gray-300 rounded-lg text-sm font-medium transition-colors"
        >
          <span v-if="followedUser.followLoading">...</span>
          <span v-else>Unfollow</span>
        </button>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12">
      <div class="text-gray-500 mb-4">
        {{ isOwnProfile ? 'You aren\'t following anyone yet' : `${userProfile?.name} isn't following anyone yet` }}
      </div>
      <NuxtLink to="/search" class="btn-primary">
        Discover Users
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { User } from '../../../../types'

const route = useRoute()
const { user: currentUser } = useSimpleAuth()

const userId = route.params.id as string

const loading = ref(true)
const userProfile = ref<User | null>(null)
const following = ref<(User & { isFollowing?: boolean, followLoading?: boolean, recipesCount?: number })[]>([])

const isOwnProfile = computed(() => {
  return currentUser.value?.id === userId
})

const fetchUserProfile = async () => {
  try {
    const { data } = await $fetch(`/api/users/${userId}`) as { success: boolean, data: User }
    userProfile.value = data
  } catch (error) {
    console.error('Error fetching user profile:', error)
  }
}

const fetchFollowing = async () => {
  try {
    loading.value = true
    const { data } = await $fetch(`/api/users/${userId}/following`) as { success: boolean, data: User[] }
    
    // Add follow status and recipe count for each followed user
    following.value = await Promise.all(
      (data || []).map(async (followedUser) => {
        // For own profile, all users in following list are being followed
        // For other profiles, check if current user is following each user
        let isFollowing = isOwnProfile.value
        if (!isOwnProfile.value && currentUser.value && followedUser.id !== currentUser.value.id) {
          try {
            const currentUserData = await $fetch(`/api/users/${currentUser.value.id}`) as { success: boolean, data: User }
            isFollowing = currentUserData.data.following?.includes(followedUser.id) || false
          } catch (error) {
            console.error('Error checking follow status:', error)
          }
        }

        return {
          ...followedUser,
          isFollowing,
          followLoading: false,
          recipesCount: followedUser.createdRecipes?.length || 0
        }
      })
    )
  } catch (error) {
    console.error('Error fetching following:', error)
  } finally {
    loading.value = false
  }
}

const toggleFollow = async (followedUser: User & { isFollowing?: boolean, followLoading?: boolean }) => {
  if (!currentUser.value || followedUser.id === currentUser.value.id) return

  try {
    followedUser.followLoading = true
    
    const { data } = await $fetch(`/api/users/${followedUser.id}/follow`, {
      method: 'POST',
      body: { userId: currentUser.value.id }
    }) as { success: boolean, data: { isFollowing: boolean } }

    followedUser.isFollowing = data.isFollowing

    // If this is own profile and we unfollowed, remove from list
    if (isOwnProfile.value && !data.isFollowing) {
      following.value = following.value.filter(user => user.id !== followedUser.id)
    }

  } catch (error) {
    console.error('Error toggling follow:', error)
  } finally {
    followedUser.followLoading = false
  }
}

onMounted(async () => {
  await fetchUserProfile()
  await fetchFollowing()
})
</script>
