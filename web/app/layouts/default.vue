<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navigation Header -->
    <nav class="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo -->
          <div class="flex items-center">
            <NuxtLink to="/" class="flex items-center space-x-2">
              <div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span class="text-white font-bold text-sm">QR</span>
              </div>
              <span class="text-xl font-bold text-gray-900">Quick Recipes</span>
            </NuxtLink>
          </div>
          
          <!-- Search Bar -->
          <div class="flex-1 max-w-lg mx-8">
            <div class="relative">
              <input
                v-model="searchQuery"
                @keyup.enter="performSearch"
                type="text"
                placeholder="Search recipes..."
                class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <!-- Search Icon -->
                <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <button
                @click="performSearch"
                class="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <span class="text-blue-600 hover:text-blue-700 text-sm font-medium">Search</span>
              </button>
            </div>
          </div>
          
          <!-- User Menu -->
          <div class="flex items-center space-x-4">
            <!-- Create Recipe Button (only for logged in users) -->
            <NuxtLink
              v-if="user"
              to="/recipes/create"
              class="btn-primary"
            >
              Create Recipe
            </NuxtLink>
            
            <!-- User Profile Dropdown -->
            <div class="relative" ref="dropdownRef">
              <button
                @click="toggleDropdown"
                class="flex items-center space-x-2 text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg p-2"
              >
                <div v-if="user" class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span class="text-white text-sm font-medium">
                    {{ user.name?.charAt(0).toUpperCase() }}
                  </span>
                </div>
                <div v-else class="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <!-- User Icon -->
                  <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <!-- Dropdown Arrow -->
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              <!-- Dropdown Menu -->
              <div
                v-show="showDropdown"
                class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 animate-slide-up"
              >
                <template v-if="user">
                  <NuxtLink
                    to="/profile"
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    @click="closeDropdown"
                  >
                    View Profile
                  </NuxtLink>
                  <NuxtLink
                    to="/recipes/my-recipes"
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    @click="closeDropdown"
                  >
                    My Recipes
                  </NuxtLink>
                  <hr class="my-1 border-gray-200">
                  <button
                    @click="handleSignOut"
                    class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    Sign Out
                  </button>
                </template>
                <template v-else>
                  <NuxtLink
                    to="/auth/login"
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    @click="closeDropdown"
                  >
                    Sign In
                  </NuxtLink>
                  <NuxtLink
                    to="/auth/signup"
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    @click="closeDropdown"
                  >
                    Sign Up
                  </NuxtLink>
                </template>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
    
    <!-- Main Content -->
    <main>
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
const { user, signOut } = useSimpleAuth()
const searchQuery = ref('')
const showDropdown = ref(false)
const dropdownRef = ref<HTMLElement>()

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
}

const closeDropdown = () => {
  showDropdown.value = false
}

const handleSignOut = async () => {
  closeDropdown()
  await signOut()
  await navigateTo('/')
}

const performSearch = () => {
  if (searchQuery.value.trim()) {
    navigateTo(`/search?q=${encodeURIComponent(searchQuery.value.trim())}`)
  }
}

// Close dropdown when clicking outside
onClickOutside(dropdownRef, closeDropdown)
</script>
