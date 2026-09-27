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
      title: 'AdoNuxt',
      link: [
        {
          rel: 'preconnect',
          href: 'https://fonts.googleapis.com',
        },
        {
          rel: 'preconnect',
          href: 'https://fonts.gstatic.com',
        },
      ],
      script: [
        {
          innerHTML: generateColorModeScript(),
          type: 'text/javascript',
          tagPosition: 'head',
          id: 'NUXT_COLOR_MODE',
        },
      ],
      meta: [
        {
          name: 'viewport',
          content: 'width=device-width, initial-scale=1',
        },
        {
          charset: 'utf-8',
        },

        {
          name: 'description',
          content:
            'A modern full-stack application template built with AdonisJS, Nuxt, Vue, and PrimeVue. Start building scalable web applications with a clean, production-ready foundation.',
        },

        {
          name: 'keywords',
          content:
            'AdonisJS, Nuxt, Nuxt.js, Vue, PrimeVue, TypeScript, full-stack, web application, starter template, boilerplate',
        },

        {
          name: 'author',
          content: 'Agya Boat',
        },

        {
          property: 'og:type',
          content: 'website',
        },
        {
          property: 'og:title',
          content: 'AdoNuxt — AdonisJS + Nuxt + PrimeVue',
        },
        {
          property: 'og:description',
          content:
            'A modern full-stack template combining AdonisJS, Nuxt, Vue, TypeScript, and PrimeVue for building scalable web applications.',
        },
        {
          property: 'og:url',
          content: 'https://github.com/agyaboat/ado-nuxt',
        },
        {
          property: 'og:image',
          content: 'https://github.com/agyaboat/ado-nuxt/raw/main/og-image.png',
        },
        {
          property: 'og:site_name',
          content: 'AdoNuxt',
        },

        {
          name: 'twitter:card',
          content: 'summary_large_image',
        },
        {
          name: 'twitter:title',
          content: 'AdoNuxt — AdonisJS + Nuxt + PrimeVue',
        },
        {
          name: 'twitter:description',
          content:
            'A modern full-stack template for building scalable applications with AdonisJS, Nuxt, Vue, TypeScript, and PrimeVue.',
        },
        {
          name: 'twitter:image',
          content: 'https://github.com/agyaboat/ado-nuxt/raw/main/og-image.png',
        },
      ],
    },
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
    '/admin/**': {ssr: false},
    '/t/**': {ssr: false},
  }
  // now, redirect all unfound pages to 200.html for SPA handling
})