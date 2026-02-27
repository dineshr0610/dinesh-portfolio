// nuxt.config.ts
import { defineNuxtConfig } from 'nuxt/config'
import { resolve } from 'path'

export default defineNuxtConfig({
  compatibilityDate: '2026-02-13',
  ssr: true,

  future: {
    compatibilityVersion: 4,
  },


  srcDir: 'app',

  app: {
    head: {
      title: 'Dinesh Portfolio',
      meta: [
        { name: 'description', content: 'Dinesh R — frontend & full-stack developer. Building AI-enabled portfolio & music apps.' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },

        // Open Graph
        { property: 'og:title', content: 'Dinesh R — Portfolio' },
        { property: 'og:description', content: 'Frontend & Full-Stack developer. Building AI-enabled portfolio & music apps.' },
        { property: 'og:type', content: 'website' },
        { property: 'og:image', content: '/public/images/profile.jpeg' },
        { property: 'og:url', content: 'https://your-domain.com' },
        { property: 'og:site_name', content: 'Dinesh Portfolio' },

        // Twitter
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'Dinesh R — Portfolio' },
        { name: 'twitter:description', content: 'Frontend & Full-Stack developer. Building AI-enabled portfolio & music apps.' },
        { name: 'twitter:image', content: '/public/images/profile.jpeg' },

        { name: 'author', content: 'Dinesh R' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        // Fonts
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Outfit:wght@500;600;700;800&display=swap' }
      ]
    }
  },

  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxt/content',
    '@nuxtjs/supabase'
  ],

  supabase: {
    redirect: false,
    key: process.env.SUPABASE_ANON_KEY
  },

  css: [
    '~/assets/css/tailwind.css'
  ],

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {}
    }
  },

  runtimeConfig: {
    // ==============================
    // 🔐 SERVER-ONLY CONFIG (SECURE)
    // ==============================
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY,

    // EmailJS (server templates)
    EMAILJS_SERVICE_ID: process.env.EMAILJS_SERVICE_ID || 'service_uqr7bau',
    EMAILJS_TEMPLATE_CONTACT: process.env.EMAILJS_TEMPLATE_CONTACT || process.env.EMAILJS_ADMIN_TEMPLATE_ID || 'template_ykdoosr',
    EMAILJS_TEMPLATE_AUTOREPLY: process.env.EMAILJS_TEMPLATE_AUTOREPLY || process.env.EMAILJS_USER_TEMPLATE_ID || 'template_7jt4rmf',
    EMAILJS_PUBLIC_KEY: process.env.EMAILJS_PUBLIC_KEY || 'KgxuGl9u3L8YeZd72',
    EMAILJS_PRIVATE_KEY: process.env.EMAILJS_PRIVATE_KEY,
    CONTACT_RECEIVER_EMAIL: process.env.CONTACT_RECEIVER_EMAIL || 'dinesh2370049@ssn.edu.in',

    // Backward-compatible aliases
    EMAILJS_ADMIN_TEMPLATE_ID: process.env.EMAILJS_ADMIN_TEMPLATE_ID || process.env.EMAILJS_TEMPLATE_CONTACT || 'template_ykdoosr',
    EMAILJS_USER_TEMPLATE_ID: process.env.EMAILJS_USER_TEMPLATE_ID || process.env.EMAILJS_TEMPLATE_AUTOREPLY || 'template_7jt4rmf',

    // ==============================
    // 🌐 CLIENT-ONLY CONFIG
    // (Contact page EmailJS)
    // ==============================
    public: {
      emailjsService: 'service_uqr7bau',
      emailjsPublic: 'KgxuGl9u3L8YeZd72',
      emailjsAdminTemplate: 'template_ykdoosr',
      emailjsUserTemplate: 'template_7jt4rmf',
      supabaseUrl: process.env.SUPABASE_URL
    }
  },

  vite: {
    resolve: {
      alias: {
        // assets alias removed as it is now in app/assets which is covered by ~
      }
    }
  }
})




