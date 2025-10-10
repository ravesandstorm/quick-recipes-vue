// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@vueuse/nuxt'
  ],

  runtimeConfig: {
    // Private keys (only available on server-side)
    authSecret: process.env.NUXT_AUTH_SECRET,
    googleClientId: process.env.GOOGLE_CLIENT_ID,
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
    mongodbUri: process.env.MONGODB_URI,
    // Public keys (exposed to client-side)
    public: {
      authUrl: process.env.NUXT_AUTH_URL
    }
  },

  // Make dashboard accessible without authentication
  ssr: true,

  css: ['~/assets/main.css']
})
