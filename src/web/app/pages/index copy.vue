<script setup lang="ts">
definePageMeta({
  name: 'home-x',
})

const stats = [
  {
    value: '1 tool',
    label: 'Start small',
  },
  {
    value: 'Full OS',
    label: 'Scale cleanly',
  },
  {
    value: 'Every role',
    label: 'Connected later',
  },
]

const starterTools = [
  {
    title: 'For Teachers',
    icon: 'pi pi-users',
    tools: ['Class Manager', 'Subject Manager', 'Attendance Manager'],
    description:
      'Manage learners, subjects, attendance, assessments, and class activity without waiting for full-school onboarding.',
  },
  {
    title: 'For Accountants',
    icon: 'pi pi-wallet',
    tools: ['Fees Manager', 'Invoices', 'Online Payments'],
    description:
      'Create fee schedules, track balances, collect payments online, and generate clean financial reports.',
  },
  {
    title: 'For Departments',
    icon: 'pi pi-sitemap',
    tools: ['Programme Manager', 'Resource Manager', 'Reports'],
    description:
      'Organize learners, courses, resources, and department-level records with structured workflows.',
  },
  {
    title: 'For Full Schools',
    icon: 'pi pi-building',
    tools: ['School OS', 'Role Access', 'Unified Records'],
    description:
      'Connect active tools into one institutional system with central administration, permissions, and analytics.',
  },
]

const modules = [
  {
    title: 'Academic Records',
    icon: 'pi pi-book',
    description:
      'Classes, subjects, programmes, attendance, assessments, academic periods, and learner progression.',
  },
  {
    title: 'Finance & Fees',
    icon: 'pi pi-building-columns',
    description:
      'Fee schedules, invoices, balances, online collections, discounts, and finance reports.',
  },
  {
    title: 'Communication',
    icon: 'pi pi-send',
    description:
      'Send notices to students, parents, staff, departments, and custom audience groups.',
  },
  {
    title: 'Security & Control',
    icon: 'pi pi-shield',
    description:
      'Role-based access, institution controls, audit trails, permissions, and data discipline.',
  },
]

const suites = [
  {
    title: 'Admin Portal',
    tag: 'Management',
    icon: 'pi pi-briefcase',
    description:
      'A leadership command center for academics, finance, communication, staff activity, reports, and institutional oversight.',
  },
  {
    title: 'Teacher Workspace',
    tag: 'Faculty',
    icon: 'pi pi-users',
    description:
      'Focused tools for attendance, class records, assessment entry, subjects, lesson tasks, and learner monitoring.',
  },
  {
    title: 'Student Hub',
    tag: 'Learners',
    icon: 'pi pi-graduation-cap',
    description:
      'A simple portal for academic updates, assignments, results, notices, learning resources, and personal records.',
  },
  {
    title: 'Parent Connect',
    tag: 'Engagement',
    icon: 'pi pi-heart',
    description:
      'A transparent channel for guardians to follow fees, performance, attendance, school updates, and learner progress.',
  },
]

const workflow = [
  {
    step: '01',
    title: 'Start where the pain is',
    description:
      'A teacher, accountant, department, or school can begin with one focused tool that solves an urgent workflow.',
  },
  {
    step: '02',
    title: 'Prove value quickly',
    description:
      'Use the tool independently, collect real data, reduce manual work, and build confidence from daily usage.',
  },
  {
    step: '03',
    title: 'Connect into School OS',
    description:
      'When the institution is ready, standalone workflows merge into a unified school operating system.',
  },
]

const roles = [
  {
    title: 'School Leaders',
    icon: 'pi pi-briefcase',
    description: 'Global visibility, approvals, analytics, institutional setup, and operational oversight.',
  },
  {
    title: 'Accounts Team',
    icon: 'pi pi-wallet',
    description: 'Fee schedules, invoices, collections, balances, reconciliation, and finance reports.',
  },
  {
    title: 'Teaching Staff',
    icon: 'pi pi-users',
    description: 'Attendance, subjects, assessments, class activity, learner progress, and records.',
  },
  {
    title: 'Students & Parents',
    icon: 'pi pi-id-card',
    description: 'Academic updates, finance visibility, notices, resources, and progress tracking.',
  },
]
</script>

<template>
  <main class="relative overflow-hidden">
    <!-- Hero -->
    <section class="mx-auto grid max-w-7xl items-center gap-12 px-4 pb-16 pt-10 md:grid-cols-2 md:px-6 lg:pb-24 lg:pt-20">
      <div class="max-w-2xl">
        <Tag
          value="Modular education operating system"
          severity="info"
          class="mb-5"
        />

        <h1 class="text-4xl font-black tracking-tight text-slate-950 dark:text-white sm:text-5xl lg:text-6xl">
          Start with one school problem. Grow into a complete School OS.
        </h1>

        <p class="mt-6 max-w-xl text-base leading-8 text-slate-600 dark:text-slate-300 sm:text-lg">
          ScholarSaaS helps teachers, accountants, departments, and full institutions solve demanding
          school workflows today — then connect everything into one unified operating system when ready.
        </p>

        <div class="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button
            label="Start With One Tool"
            icon="pi pi-arrow-right"
            icon-pos="right"
            size="large"
            @click="navigateTo({ name: 'dash' })"
          />

          <Button
            label="Explore School OS"
            icon="pi pi-desktop"
            severity="secondary"
            outlined
            size="large"
          />
        </div>

        <div class="mt-10 grid max-w-xl grid-cols-3 divide-x divide-slate-200 rounded-2xl border border-slate-200 bg-white/70 p-4 shadow-sm backdrop-blur dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900/60">
          <div
            v-for="stat in stats"
            :key="stat.label"
            class="px-3 first:pl-0 last:pr-0"
          >
            <p class="text-xl font-black text-slate-950 dark:text-white">
              {{ stat.value }}
            </p>

            <p class="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
              {{ stat.label }}
            </p>
          </div>
        </div>
      </div>

      <!-- Product Preview -->
      <div class="relative mx-auto w-full max-w-xl">
        <div class="absolute -inset-6 rounded-4xl bg-blue-500/10 blur-3xl dark:bg-blue-400/10" />

        <Card class="relative overflow-hidden border border-slate-200/70 shadow-2xl dark:border-slate-800">
          <template #content>
            <div class="space-y-4">
              <div class="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
                <div>
                  <p class="text-sm font-bold text-slate-950 dark:text-white">
                    ScholarSaaS Workspace
                  </p>
                  <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Standalone tools. Unified future.
                  </p>
                </div>

                <Tag
                  value="Modular"
                  severity="success"
                />
              </div>

              <div class="grid gap-3 sm:grid-cols-2">
                <div class="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                  <div class="flex items-center justify-between">
                    <p class="text-xs text-slate-500 dark:text-slate-400">
                      Teacher started
                    </p>
                    <i class="pi pi-check-circle text-green-500" />
                  </div>
                  <p class="mt-2 text-xl font-black text-slate-950 dark:text-white">
                    Attendance
                  </p>
                  <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    No full-school setup required.
                  </p>
                </div>

                <div class="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                  <div class="flex items-center justify-between">
                    <p class="text-xs text-slate-500 dark:text-slate-400">
                      Accountant started
                    </p>
                    <i class="pi pi-check-circle text-green-500" />
                  </div>
                  <p class="mt-2 text-xl font-black text-slate-950 dark:text-white">
                    Fees
                  </p>
                  <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Track and collect online.
                  </p>
                </div>
              </div>

              <div class="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                <div class="mb-4 flex items-center justify-between">
                  <div>
                    <p class="text-sm font-bold text-slate-900 dark:text-slate-100">
                      Path to full School OS
                    </p>
                    <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Individual workflows connect into one institution layer.
                    </p>
                  </div>

                  <i class="pi pi-sitemap text-blue-500" />
                </div>

                <div class="space-y-3">
                  <div class="flex items-center gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-900">
                    <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-400/10 dark:text-blue-300">
                      <i class="pi pi-users" />
                    </div>
                    <div>
                      <p class="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        Class Manager
                      </p>
                      <p class="text-xs text-slate-500 dark:text-slate-400">
                        Learners, attendance, subjects
                      </p>
                    </div>
                  </div>

                  <div class="flex items-center gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-900">
                    <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-400/10 dark:text-blue-300">
                      <i class="pi pi-wallet" />
                    </div>
                    <div>
                      <p class="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        Fees Manager
                      </p>
                      <p class="text-xs text-slate-500 dark:text-slate-400">
                        Invoices, balances, payments
                      </p>
                    </div>
                  </div>

                  <div class="flex items-center gap-3 rounded-xl bg-slate-950 p-3 text-white dark:bg-white dark:text-slate-950">
                    <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500 text-white">
                      <i class="pi pi-building" />
                    </div>
                    <div>
                      <p class="text-sm font-semibold">
                        Unified School OS
                      </p>
                      <p class="text-xs opacity-70">
                        Central control, roles, analytics, records
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </Card>
      </div>
    </section>

    <!-- Trust Strip -->
    <section class="border-y border-slate-200 bg-white/60 py-5 backdrop-blur dark:border-slate-800 dark:bg-slate-950/40">
      <div class="mx-auto flex max-w-7xl flex-col gap-3 px-4 text-center md:flex-row md:items-center md:justify-between md:px-6 md:text-left">
        <p class="text-sm font-semibold text-slate-700 dark:text-slate-200">
          ScholarSaaS does not force adoption from the top. It allows value to rise from where the pain is.
        </p>

        <div class="flex flex-wrap justify-center gap-2 md:justify-end">
          <Tag value="Teacher-first" severity="secondary" />
          <Tag value="Accountant-ready" severity="secondary" />
          <Tag value="Department-friendly" severity="secondary" />
          <Tag value="School OS" severity="secondary" />
        </div>
      </div>
    </section>

    <!-- Start Small Section -->
    <section class="mx-auto max-w-7xl px-4 py-16 md:px-6 lg:py-24">
      <div class="mx-auto max-w-3xl text-center">
        <p class="text-sm font-bold uppercase tracking-[0.25em] text-blue-600 dark:text-blue-400">
          Start Small. Scale Cleanly.
        </p>

        <h2 class="mt-3 text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl">
          You don’t need the whole school to onboard before solving real problems.
        </h2>

        <p class="mt-5 leading-8 text-slate-600 dark:text-slate-300">
          A teacher can manage attendance and subjects. An accountant can manage fees and online payments.
          A department can organize records and reports. When the institution is ready, everything connects
          into a complete school operating system.
        </p>
      </div>

      <div class="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        <Card
          v-for="item in starterTools"
          :key="item.title"
          class="transition duration-300 hover:-translate-y-1 hover:shadow-xl"
        >
          <template #content>
            <div class="flex h-full flex-col">
              <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-400/10 dark:text-blue-300">
                <i :class="item.icon" />
              </div>

              <h3 class="mt-6 font-black text-slate-950 dark:text-white">
                {{ item.title }}
              </h3>

              <p class="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                {{ item.description }}
              </p>

              <div class="mt-5 flex flex-wrap gap-2">
                <Tag
                  v-for="tool in item.tools"
                  :key="tool"
                  :value="tool"
                  severity="secondary"
                />
              </div>
            </div>
          </template>
        </Card>
      </div>
    </section>

    <!-- Workflow -->
    <section class="bg-slate-100/70 py-16 dark:bg-slate-900/50 lg:py-24">
      <div class="mx-auto max-w-7xl px-4 md:px-6">
        <div class="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <p class="text-sm font-bold uppercase tracking-[0.25em] text-blue-600 dark:text-blue-400">
              Adoption Flow
            </p>

            <h2 class="mt-3 text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl">
              Built for bottom-up adoption, not forced migration.
            </h2>

            <p class="mt-4 max-w-xl leading-7 text-slate-600 dark:text-slate-300">
              Most school systems fail because they require the entire institution to change at once.
              ScholarSaaS works differently: start where the need is strongest, then scale with confidence.
            </p>
          </div>

          <div class="space-y-4">
            <div
              v-for="item in workflow"
              :key="item.step"
              class="rounded-3xl border border-slate-200 bg-white/75 p-6 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/60"
            >
              <div class="flex gap-5">
                <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-sm font-black text-white">
                  {{ item.step }}
                </div>

                <div>
                  <h3 class="font-black text-slate-950 dark:text-white">
                    {{ item.title }}
                  </h3>

                  <p class="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                    {{ item.description }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Modules -->
    <section class="mx-auto max-w-7xl px-4 py-16 md:px-6 lg:py-24">
      <div class="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
        <div>
          <p class="text-sm font-bold uppercase tracking-[0.25em] text-blue-600 dark:text-blue-400">
            Platform Modules
          </p>

          <h2 class="mt-3 text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl">
            Activate only what your institution needs.
          </h2>

          <p class="mt-4 max-w-xl leading-7 text-slate-600 dark:text-slate-300">
            ScholarSaaS is not a rigid all-or-nothing system. Use one module today,
            then expand into academics, finance, communication, records, and security.
          </p>
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <Card
            v-for="module in modules"
            :key="module.title"
            class="transition duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            <template #content>
              <div class="flex gap-4">
                <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-400/10 dark:text-blue-300">
                  <i :class="module.icon" />
                </div>

                <div>
                  <h3 class="font-bold text-slate-950 dark:text-white">
                    {{ module.title }}
                  </h3>

                  <p class="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                    {{ module.description }}
                  </p>
                </div>
              </div>
            </template>
          </Card>
        </div>
      </div>
    </section>

    <!-- Suite -->
    <section class="bg-slate-100/70 py-16 dark:bg-slate-900/50 lg:py-24">
      <div class="mx-auto max-w-7xl px-4 md:px-6">
        <div class="mx-auto max-w-2xl text-center">
          <p class="text-sm font-bold uppercase tracking-[0.25em] text-blue-600 dark:text-blue-400">
            Product Suite
          </p>

          <h2 class="mt-3 text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl">
            One platform. Every stakeholder.
          </h2>

          <p class="mt-4 leading-7 text-slate-600 dark:text-slate-300">
            Every role gets a focused workspace while leadership keeps visibility across the entire institution.
          </p>
        </div>

        <div class="mt-10 grid gap-5 lg:grid-cols-2">
          <Card
            v-for="item in suites"
            :key="item.title"
            class="overflow-hidden transition duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            <template #content>
              <div class="flex gap-4">
                <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                  <i :class="item.icon" />
                </div>

                <div>
                  <div class="flex flex-wrap items-center gap-2">
                    <h3 class="font-black text-slate-950 dark:text-white">
                      {{ item.title }}
                    </h3>

                    <Tag
                      :value="item.tag"
                      severity="secondary"
                    />
                  </div>

                  <p class="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                    {{ item.description }}
                  </p>
                </div>
              </div>
            </template>
          </Card>
        </div>
      </div>
    </section>

    <!-- Roles -->
    <section class="mx-auto max-w-7xl px-4 py-16 md:px-6 lg:py-24">
      <div class="rounded-4xl border border-slate-200 bg-white/70 p-6 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/50 md:p-10">
        <div class="mx-auto max-w-2xl text-center">
          <p class="text-sm font-bold uppercase tracking-[0.25em] text-blue-600 dark:text-blue-400">
            Role Based Access
          </p>

          <h2 class="mt-3 text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl">
            Dedicated workflows for every team.
          </h2>

          <p class="mt-4 leading-7 text-slate-600 dark:text-slate-300">
            Every user enters a workspace shaped around their responsibilities, not a crowded dashboard.
          </p>
        </div>

        <div class="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div
            v-for="role in roles"
            :key="role.title"
            class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950"
          >
            <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white">
              <i :class="role.icon" />
            </div>

            <h3 class="mt-6 font-black text-slate-950 dark:text-white">
              {{ role.title }}
            </h3>

            <p class="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
              {{ role.description }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="mx-auto max-w-7xl px-4 pb-16 md:px-6 lg:pb-24">
      <div class="relative overflow-hidden rounded-4xl bg-slate-950 px-6 py-14 text-center text-white shadow-2xl dark:bg-white dark:text-slate-950 md:px-10">
        <div class="absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 rounded-full bg-blue-500/20 blur-3xl dark:bg-blue-400/20" />

        <div class="relative mx-auto max-w-2xl">
          <p class="text-sm font-bold uppercase tracking-[0.25em] text-blue-300 dark:text-blue-600">
            Start where the pain is
          </p>

          <h2 class="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
            Use one tool today. Grow into the full School OS tomorrow.
          </h2>

          <p class="mx-auto mt-4 max-w-xl text-sm leading-7 text-white/70 dark:text-slate-600">
            ScholarSaaS gives schools and education teams the freedom to begin small,
            prove value fast, and scale into a connected institutional system.
          </p>

          <div class="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button
              label="Start With One Tool"
              icon="pi pi-arrow-right"
              icon-pos="right"
              size="large"
              @click="navigateTo({ name: 'dash' })"
            />

            <Button
              label="Explore School OS"
              icon="pi pi-sitemap"
              severity="secondary"
              outlined
              size="large"
            />
          </div>
        </div>
      </div>
    </section>
  </main>
</template>