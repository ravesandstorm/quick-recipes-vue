// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@vueuse/nuxt'
  ],

  tailwindcss: {
    config: {
      darkMode: 'class'
    }
  },

  runtimeConfig: {
    // Private keys (only available on server-side)
    authSecret: process.env.NUXT_AUTH_SECRET,
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
    mongodbUri: process.env.MONGODB_URI,
    // Public keys (exposed to client-side)
    public: {
      authUrl: process.env.NUXT_AUTH_URL,
      googleClientId: process.env.GOOGLE_CLIENT_ID
    }
  },

  // Make dashboard accessible without authentication
  ssr: true,

  devServer: {
    port: 3001,
    host: '0.0.0.0',
  },

  css: ['~/assets/main.css'],

  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
    layoutTransition: { name: 'layout', mode: 'out-in' }
  }
})
