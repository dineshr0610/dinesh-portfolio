// nuxt.config.ts
import { defineNuxtConfig } from 'nuxt/config'
import { resolve } from 'path'

export default defineNuxtConfig({
  ssr: true,

  app: {
    head: {
      title: 'Dinesh Portfolio',
      meta: [
        // primary
        { name: 'description', content: 'Dinesh R — frontend & full-stack developer. Building AI-enabled portfolio & music apps.' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },

        // Open Graph
        { property: 'og:title', content: 'Dinesh R — Portfolio' },
        { property: 'og:description', content: 'Frontend & Full-Stack developer. Building AI-enabled portfolio & music apps.' },
        { property: 'og:type', content: 'website' },
        { property: 'og:image', content: '/images/og-image.png' },
        { property: 'og:url', content: 'https://your-domain.com' }, // replace with your live domain when deployed
        { property: 'og:site_name', content: 'Dinesh Portfolio' },

        // Twitter
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'Dinesh R — Portfolio' },
        { name: 'twitter:description', content: 'Frontend & Full-Stack developer. Building AI-enabled portfolio & music apps.' },
        { name: 'twitter:image', content: '/images/og-image.png' },

        // misc helpful meta
        { name: 'author', content: 'Dinesh R' }
      ],
      link: [
        // favicon (keep your favicon in public/)
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        // optional: preconnect to fonts (uncomment if you use Google Fonts)
        // { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        // { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }
      ]
    }
  },

  // keep modules you already use
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxt/content'
  ],

  // keep your global css - adjust to your current path if different
  css: [
    resolve(process.cwd(), 'assets/css/tailwind.css')

  ],

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {}
    }
  },

  runtimeConfig: {
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_KEY: process.env.SUPABASE_KEY,
    public: {
      emailjsPublic: 'KgxuGl9u3L8YeZd72',
      emailjsService: 'service_uqr7bau',
      emailjsAdminTemplate: 'template_ykdoosr',
      emailjsUserTemplate: 'template_7jt4rmf'
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
