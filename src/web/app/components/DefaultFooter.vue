<script setup lang="ts">
const footerGroups = [
  {
    title: 'Platform',
    links: ['Marketplace', 'Developer API', 'Security Standards'],
  },
  {
    title: 'Company',
    links: ['Our Vision', 'Client Case Studies', 'Privacy Policy'],
  },
  {
    title: 'Support',
    links: ['Help Center', 'Contact Success', 'System Status'],
  },
]
</script>

<template>
  <footer class="mt-10 border-t border-slate-200 bg-slate-100 py-12 dark:border-slate-800 dark:bg-slate-900">
    <div class="mx-auto grid max-w-6xl gap-10 px-4 md:grid-cols-[1.2fr_2fr] md:px-8">
      <div>
        <div class="flex items-center gap-2">
          <i class="pi pi-graduation-cap text-xl" />
          <span class="text-xl font-black">
            ScholarSaas
          </span>
        </div>

        <p class="mt-6 max-w-xs text-sm leading-6 text-slate-500 dark:text-slate-400">
          Empowering institutions with the world's most flexible educational operating system.
        </p>

        <p class="mt-8 text-xs text-slate-400">
          © {{ new Date().getFullYear() }} ScholarSaas Inc.
        </p>
      </div>

      <div class="grid gap-8 sm:grid-cols-3">
        <div
          v-for="group in footerGroups"
          :key="group.title"
        >
          <h4 class="font-black">
            {{ group.title }}
          </h4>

          <ul class="mt-5 space-y-3 text-sm text-slate-500 dark:text-slate-400">
            <li
              v-for="link in group.links"
              :key="link"
            >
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
  </footer>
</template>

<style scoped></style>
