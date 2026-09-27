```vue
<script setup lang="ts">
// ============================================================
// FOOTER CONFIGURATION
// Replace the sample data below with your application's data.
// ============================================================

const footerGroups = [
  // ----------------------------------------------------------
  // PLATFORM / PRODUCT LINKS
  // Add links to your main product features or services.
  // Example: Features, Pricing, Documentation, API
  // ----------------------------------------------------------
  {
    title: 'Product',
    links: [
      'Features',
      'Pricing',
      'Documentation',
    ],
  },

  // ----------------------------------------------------------
  // COMPANY LINKS
  // Add links related to your company or organization.
  // Example: About, Careers, Privacy Policy, Terms
  // ----------------------------------------------------------
  {
    title: 'Company',
    links: [
      'About',
      'Privacy Policy',
      'Terms of Service',
    ],
  },

  // ----------------------------------------------------------
  // SUPPORT LINKS
  // Add links where users can get help or contact you.
  // Example: Help Center, Contact, Status
  // ----------------------------------------------------------
  {
    title: 'Support',
    links: [
      'Help Center',
      'Contact',
      'System Status',
    ],
  },
]

// ============================================================
// APPLICATION INFORMATION
// Replace these values with your application's information.
// ============================================================

const appName = 'AdoNuxt'

const appDescription =
  'A modern full-stack application template built with AdonisJS, Nuxt, Vue, TypeScript, and PrimeVue.'

// ============================================================
// SOCIAL LINKS
// Add your application's social media links here.
// Remove any item you do not need.
// ============================================================

const socialLinks = [
  { label: 'GitHub', icon: 'pi pi-github', href: '#' },
  { label: 'X', icon: 'pi pi-twitter', href: '#' },
  { label: 'LinkedIn', icon: 'pi pi-linkedin', href: '#' },
]
</script>

<template>
  <footer
  class="mt-16 border-t border-slate-200 bg-slate-100 shadow-[0_-8px_30px_rgba(15,23,42,0.04)] dark:border-slate-700/60 dark:bg-slate-900 dark:shadow-[0_-8px_30px_rgba(0,0,0,0.18)]"
>
    <div class="mx-auto max-w-6xl px-4 py-12 md:px-8">

      <!-- =====================================================
           MAIN FOOTER CONTENT
           ===================================================== -->
      <div class="grid gap-10 md:grid-cols-[1.2fr_2fr]">

        <!-- ===================================================
             BRAND / APPLICATION INFORMATION

             Replace the icon, name and description below.
             =================================================== -->
        <div>
          <div class="flex items-center gap-2">
            <!-- Replace this icon with your application logo -->
            <i class="pi pi-box text-xl" />

            <span class="text-xl font-black tracking-tight">
              {{ appName }}
            </span>
          </div>

          <p
            class="mt-5 max-w-sm text-sm leading-6 text-slate-500 dark:text-slate-400"
          >
            {{ appDescription }}
          </p>

          <!-- =================================================
               SOCIAL LINKS
               Uncomment and configure the links above if needed.
               ================================================= -->
          <div
            v-if="socialLinks.length"
            class="mt-6 flex items-center gap-3"
          >
            <a
              v-for="social in socialLinks"
              :key="social.label"
              :href="social.href"
              :aria-label="social.label"
              target="_blank"
              rel="noopener noreferrer"
              class="text-slate-400 transition hover:text-slate-950 dark:hover:text-white"
            >
              <i :class="social.icon" />
            </a>
          </div>
        </div>

        <!-- ===================================================
             FOOTER LINK GROUPS

             Add, remove or rename groups in footerGroups above.
             =================================================== -->
        <div class="grid gap-8 sm:grid-cols-3">
          <div
            v-for="group in footerGroups"
            :key="group.title"
          >
            <h4 class="text-sm font-bold">
              {{ group.title }}
            </h4>

            <ul
              class="mt-5 space-y-3 text-sm text-slate-500 dark:text-slate-400"
            >
              <li
                v-for="link in group.links"
                :key="link"
              >
                <!-- Replace href="#" with the appropriate route -->
                <a
                  href="#"
                  class="transition hover:text-slate-950 dark:hover:text-white"
                >
                  {{ link }}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- =====================================================
           FOOTER BOTTOM BAR

           Add copyright, legal links, version information, etc.
           ===================================================== -->
      <div
        class="mt-12 flex flex-col gap-3 border-t border-slate-200 pt-6 text-xs text-slate-400 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between"
      >
        <!-- Update the application/company name above -->
        <p>
          © {{ new Date().getFullYear() }} {{ appName }}. All rights reserved.
        </p>

        <!-- Optional: add additional footer information here -->
        <p>
          Built with AdonisJS & Nuxt.
        </p>
      </div>
    </div>
  </footer>
</template>

<style scoped></style>
```
