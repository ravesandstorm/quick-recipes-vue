<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
    <!-- Navigation Header -->
    <nav class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 transition-colors duration-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo -->
          <div class="flex items-center">
            <NuxtLink to="/" class="flex items-center space-x-2">
              <div
                class="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span class="text-white font-bold text-sm">QR</span>
              </div>
              <span class="text-xl font-bold text-gray-900 dark:text-gray-100">Quick Recipes</span>
            </NuxtLink>
          </div>
          
          <!-- Search Bar - Hidden on mobile -->
          <div class="hidden md:flex flex-1 max-w-lg mx-8">
            <div class="relative w-full">
              <input
                v-model="searchQuery"
                @keyup.enter="performSearch"
                type="text"
                placeholder="Search recipes..."
                class="w-full pl-10 pr-20 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 dark:placeholder-gray-500"
              />
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <!-- Search Icon -->
                <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <button
                @click="goToAdvancedSearch"
                class="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <span class="text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 text-sm font-medium">Advanced</span>
              </button>
            </div>
          
          </div>

          <!-- Mobile Search Button -->
          <button
            @click="goToAdvancedSearch"
            class="md:hidden p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400"
            title="Search"
          >
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          
          <!-- User Menu -->
          <div class="flex items-center space-x-4">
            <!-- Dark Mode Toggle -->
            <DarkModeToggle />

            <!-- Navigation Links (only for logged in users) -->
            <div v-if="user" class="hidden sm:flex items-center space-x-4">
              <NuxtLink
                to="/my-recipes"
                class="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 text-sm font-medium transition-colors"
              >
                My Recipes
              </NuxtLink>
              <NuxtLink
                to="/recipes/create"
                class="btn-primary text-sm"
              >
                Create Recipe
              </NuxtLink>
            </div>
            
            <!-- User Profile Dropdown -->
            <div class="relative" ref="dropdownRef">
              <button
                @click="toggleDropdown"
                class="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg p-2"
              >
                <div v-if="user" class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span class="text-white text-sm font-medium">
                    {{ user.name?.charAt(0).toUpperCase() }}
                  </span>
                </div>
                <div v-else class="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <!-- User Icon -->
                  <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
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
                class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50 animate-slide-up"
              >
                <template v-if="user">
                  <NuxtLink
                    :to="`/users/${user.id}`"
                    class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    @click="closeDropdown"
                  >
                    My Profile
                  </NuxtLink>
                  <NuxtLink
                    to="/my-recipes"
                    class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    @click="closeDropdown"
                  >
                    My Recipes
                  </NuxtLink>
                  <NuxtLink
                    to="/recipes/create"
                    class="sm:hidden block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    @click="closeDropdown"
                  >
                    Create Recipe
                  </NuxtLink>
                  <hr class="my-1 border-gray-200 dark:border-gray-700">
                  <button
                    @click="handleSignOut"
                    class="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    Sign Out
                  </button>
                </template>
                <template v-else>
                  <NuxtLink
                    to="/auth/login"
                    class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    @click="closeDropdown"
                  >
                    Sign In
                  </NuxtLink>
                  <NuxtLink
                    to="/auth/signup"
                    class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
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
const { initDarkMode } = useDarkMode()
const searchQuery = ref('')
const showDropdown = ref(false)
const dropdownRef = ref<HTMLElement>()

// Initialize dark mode on mount
onMounted(() => {
  initDarkMode()
})

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
  } else {
    navigateTo('/search')
  }
}

const goToAdvancedSearch = () => {
  navigateTo('/search')
}

// Close dropdown when clicking outside
onClickOutside(dropdownRef, closeDropdown)
</script>
