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
      title: 'ScholarSaaS',
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
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { charset: 'utf-8' },

        {
          name: 'description',
          content:
            'ScholarSaaS is a modular education management platform for modern schools. Manage fees, students, classes, assessments, communication, and school workflows from one smart EduSuite.',
        },

        {
          property: 'og:title',
          content: 'ScholarSaaS: Game Changer for Education',
        },
        {
          property: 'og:description',
          content:
            'The Modular EduSuite for Modern Schools. Choose the tools your school needs, integrate seamlessly, and scale your education operations with confidence.',
        },
        {
          property: 'og:image',
          content: 'https://scholarsaas.com/scholarsaas-flyer.png',
        },
        {
          property: 'og:url',
          content: 'https://scholarsaas.com',
        },
        {
          property: 'og:type',
          content: 'website',
        },

        {
          name: 'twitter:title',
          content: 'ScholarSaaS: Game Changer for Education',
        },
        {
          name: 'twitter:description',
          content:
            'The Modular EduSuite for Modern Schools. Manage school operations module by module — smart, secure, and built to scale.',
        },
        {
          name: 'twitter:image',
          content: 'https://scholarsaas.com/scholarsaas-flyer.png',
        },
        {
          name: 'twitter:card',
          content: 'summary_large_image',
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