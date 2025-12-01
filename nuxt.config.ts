// nuxt.config.ts
import { defineNuxtConfig } from 'nuxt/config'
import { resolve } from 'path'

export default defineNuxtConfig({
  ssr: true,
  app: {
    head: {
      title: 'Dinesh Portfolio',
      meta: [
        { name: 'description', content: 'Portfolio of Dinesh R' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' }
      ]
    }
  },

  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxt/content'
  ],

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {}
    }
  },

  // Vite alias for assets folder (fixes Windows resolution)
  vite: {
    resolve: {
      alias: {
        'assets': resolve(process.cwd(), 'assets')
      }
    }
  }
})
