// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@nuxt/icon'
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
    layoutTransition: { name: 'layout', mode: 'out-in' },
    head: {
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Karla:wght@300;400;500;600;700&family=Playfair+Display+SC:wght@400;700&display=swap'
        }
      ]
    }
  }
})
