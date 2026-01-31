// https://nuxt.com/docs/api/configuration/nuxt-config
import Aura from '@primeuix/themes/aura'
import tailwindcss from '@tailwindcss/vite'
import {MyPreset} from './app/themes/my_aura'

import { generateColorModeScript } from './app/composables/utils' 

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  modules: ['@primevue/nuxt-module', '@pinia/nuxt', 'pinia-plugin-persistedstate/nuxt', '@vueuse/nuxt'],
  // pinia:{
  //   storesDirs: ['@/stores/**'],
  // },
  primevue: {
    options: {
      ripple: true,
      theme: {
        preset: MyPreset,
        options: {
          darkModeSelector: '.dark',
          cssLayer: {
            name: 'primevue',
            order: 'theme, base, primevue'
          }
        }
      }
    }
  },
  vite: {
    plugins: [tailwindcss() as any]
  },
  // buildModules: [
  //   '@nuxtjs/pwa'
  // ],
  css: ['@/assets/css/main.css', 'material-symbols/outlined.css'],
  app: {
    head: {
      title: 'CrownVote',
      link: [
        {
          rel: 'preconnect',
          href: "https://fonts.googleapis.com",
        },
        {
          rel: 'preconnect',
          href: "https://fonts.gstatic.com",
        },
      ],
      script: [
        {
          innerHTML: generateColorModeScript(),
          type: 'text/javascript',
          tagPosition: 'head',
          id: 'NUXT_COLOR_MODE'
        },
      ],
      meta:[
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { charset: 'utf-8' },
        { name: 'description', content: 'Secure, fast, and transparent online voting for fair elections. Trust the future of democracy.' },
        { property: 'og:title', content: 'CrownVote: Your E-voting Plug' },
        { property: 'og:description', content: 'Secure, fast, and transparent online voting for fair elections. Trust the future of democracy.' },
        { property: 'og:image', content: 'https://crownvote.com/cv-flyer.jpg' },
        { property: 'og:url', content: 'https://crownvote.com' },
        { property: 'og:type', content: 'website' },
        { name: 'twitter:title', content: 'CrownVote: Your E-voting Plug' },
        { name: 'twitter:description', content: 'Secure, fast, and transparent online voting for fair elections. Trust the future of democracy.' },
        { name: 'twitter:image', content: 'https://crownvote.com/cv-flyer.jpg' },
        { name: 'twitter:card', content: 'summary_large_image' },
      ]
    }
  },
  runtimeConfig: {
    public: {
      api: ''
    }
  },
  ssr: true,
  routeRules: {
    '/dash/**': {ssr: false},
    '/auth/**': {ssr: false},
    '/events/**': {ssr: false},
    '/poll/**': {ssr: false},
    '/c/**': {ssr: false},
    '/manual-election/**': {ssr: false},
    // '/c/:code': {ssr: false},
    // '/': {ssr: true},
  }
  // now, redirect all unfound pages to 200.html for SPA handling
})