<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-900 dark:to-gray-800 px-4 transition-colors duration-200">
    <div class="max-w-md w-full text-center animate-fade-in">
      <!-- Icon -->
      <div class="mb-8">
        <div class="w-24 h-24 mx-auto bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
          <svg class="w-12 h-12 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            <line x1="4" y1="4" x2="20" y2="20" stroke-linecap="round" stroke-width="2" />
          </svg>
        </div>
      </div>

      <!-- Message -->
      <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">Profile Not Found</h1>
      <p class="text-gray-600 dark:text-gray-400 mb-8">
        This user profile doesn't exist or has been deleted.
      </p>

      <!-- Actions -->
      <div class="space-y-3">
        <NuxtLink
          to="/"
          class="block w-full bg-orange-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors"
        >
          Return to Home
        </NuxtLink>
        <NuxtLink
          to="/recipes"
          class="block w-full bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg font-medium border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          Browse Recipes
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'Profile Not Found - Quick Recipes'
})
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

