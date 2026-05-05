import { ref } from 'vue'

export const useDarkMode = () => {
  const isDark = ref(false)

  const toggleDarkMode = () => {
    isDark.value = !isDark.value
    updateDarkMode()
  }

  const updateDarkMode = () => {
    if (process.client) {
      if (isDark.value) {
        document.documentElement.classList.add('dark')
        localStorage.setItem('theme', 'dark')
      } else {
        document.documentElement.classList.remove('dark')
        localStorage.setItem('theme', 'light')
      }
    }
  }

  const initDarkMode = () => {
    if (process.client) {
      // Check localStorage first
      const savedTheme = localStorage.getItem('theme')

      if (savedTheme) {
        isDark.value = savedTheme === 'dark'
      } else {
        // Check system preference
        isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
      }

      updateDarkMode()
    }
  }

  // Initialize immediately if on client
  if (process.client) {
    initDarkMode()
  }

  return {
    isDark,
    toggleDarkMode,
    initDarkMode
  }
}

