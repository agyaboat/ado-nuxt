<script setup lang="ts">
definePageMeta({
  name: 'home',
})
const dashboardPath = '/dash'

const students = [
  {
    name: 'FREMPONG SAMUEL KWABENA',
    admissionNumber: 'FMD48',
    className: 'BASIC 2',
    outstanding: 'GH₵780.00',
  },
  {
    name: 'OFORI ALFRED',
    admissionNumber: 'FMD50',
    className: 'BASIC 2',
    outstanding: 'GH₵780.00',
  },
]

const feeBreakdown = [
  {
    label: 'Fees billed',
    value: 'GH₵42,800',
  },
  {
    label: 'Collected',
    value: 'GH₵31,460',
  },
  {
    label: 'Outstanding',
    value: 'GH₵11,340',
  },
]

const feesFeatures = [
  'Bring your existing fee records on board with ease',
  'See what every student owes',
  'Track payments and outstanding balances',
  'Find student records instantly',
  'Keep fee records organized',
  "Understand your school's collection position",
]

const classFeatures = [
  'Manage grades and assessments',
  'Generate student reports',
  'Keep academic records organized',
]

const tutoriaFeatures = [
  'Curriculum based tutorials',
  'Well structured learning content',
  'Built for accelerated learning',
]
</script>

<template>
  <main class="overflow-hidden">
    <!-- ========================================================= -->
    <!-- HERO                                                       -->
    <!-- ========================================================= -->

    <section class="relative">
      <div class="mx-auto max-w-7xl px-6 pb-24 pt-16 lg:px-8 lg:pb-32 lg:pt-24">
        <div class="grid items-center gap-16 lg:grid-cols-[0.95fr_1.05fr] lg:gap-20">
          <!-- HERO COPY -->
          <div
            v-animateonscroll="{
              enterClass:
                'animate-enter fade-in-0 slide-in-from-l-4 animate-duration-1000 animate-ease-out',
            }"
            class="max-w-2xl lg:pl-8"
          >
            <div
              class="mb-7 inline-flex items-center gap-2 rounded-full border border-surface-200 bg-surface-0 px-3.5 py-1.5 text-sm text-surface-600 dark:border-surface-800 dark:bg-surface-950 dark:text-surface-300"
            >
              <span class="h-1.5 w-1.5 rounded-full bg-primary-500" />
              Academic management
            </div>

            <h1
              class="max-w-2xl text-5xl font-semibold leading-[1.02] tracking-[-0.04em] text-surface-950 dark:text-surface-0 sm:text-6xl lg:text-7xl"
            >
              Academic management.
              <span class="text-primary-600 dark:text-primary-400">
                Made easy. Free.
              </span>
            </h1>

            <p
              class="mt-7 max-w-xl text-lg leading-8 text-surface-600 dark:text-surface-400 lg:text-xl"
            >
              Essential tools for schools to manage academics and everyday
              operations with less complexity.
            </p>

            <div class="mt-9 flex flex-wrap items-center gap-4">
              <Button
                label="Start using ScholarSaaS"
                icon="pi pi-arrow-right"
                icon-pos="right"
                size="large"
                as="router-link"
                :to="dashboardPath"
              />

              <span class="text-sm text-surface-500 dark:text-surface-400">
                Free forever
              </span>
            </div>

            <div class="mt-5 flex items-center gap-2 text-sm text-surface-500">
              <i class="pi pi-check text-primary-500" />
              <span>Pay only when you need advanced features.</span>
            </div>
          </div>
<!-- HERO ACADEMIC MANAGEMENT IMAGE -->
<div
  v-animateonscroll="{
    enterClass:
      'animate-enter fade-in-0 slide-in-from-r-8 zoom-in-95 animate-duration-1000 animate-ease-out',
  }"
  class="relative"
>
  <div
    class="overflow-hidden rounded-[2rem] border border-surface-200 bg-surface-50 p-3 shadow-[0_24px_70px_-30px_rgba(0,0,0,0.22)] dark:border-surface-800 dark:bg-surface-900"
  >
    <div
      class="overflow-hidden rounded-[1.5rem] border border-surface-200 dark:border-surface-800"
    >
      <img
        src="/academic.png"
        alt="ScholarSaaS academic management"
        class="block h-auto w-full object-cover"
      />
    </div>
  </div>
</div>
        </div>
      </div>
    </section>

    <!-- ========================================================= -->
    <!-- POSITIONING                                               -->
    <!-- ========================================================= -->

    <section
      class="border-y border-surface-200 bg-surface-50 dark:border-surface-800 dark:bg-surface-950"
    >
      <div class="mx-auto max-w-5xl px-6 py-20 text-center lg:px-8 lg:py-24">
        <div
          v-animateonscroll="{
            enterClass:
              'animate-enter fade-in-0 slide-in-from-b-4 animate-duration-1000 animate-ease-out',
          }"
        >
          <p
            class="text-3xl font-medium leading-tight tracking-[-0.025em] text-surface-900 dark:text-surface-0 sm:text-4xl lg:text-5xl"
          >
            The essential tools your school needs.
            <span class="text-primary-600 dark:text-primary-400">
              Without the unnecessary complexity.
            </span>
          </p>

          <p
            class="mx-auto mt-6 max-w-2xl text-base leading-7 text-surface-600 dark:text-surface-400"
          >
            Start with the tools that are free. Grow into advanced capabilities
            when your school is ready.
          </p>
        </div>
      </div>
    </section>

    <!-- ========================================================= -->
    <!-- FEES MANAGER                                              -->
    <!-- ========================================================= -->

    <section>
      <div class="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
        <!-- SECTION INTRO -->
        <div
          v-animateonscroll="{
            enterClass:
              'animate-enter fade-in-0 slide-in-from-b-6 animate-duration-800 animate-ease-out',
          }"
          class="max-w-2xl"
        >
          <div
            class="mb-4 text-sm font-semibold uppercase tracking-[0.14em] text-primary-600 dark:text-primary-400"
          >
            Currently featured
          </div>

          <h2
            class="text-4xl font-semibold tracking-[-0.035em] text-surface-950 dark:text-surface-0 sm:text-5xl"
          >
            Fees Manager
          </h2>

          <p
            class="mt-5 text-lg leading-8 text-surface-600 dark:text-surface-400"
          >
            Manage school fees with ease. Know what has been paid, what is
            outstanding, and where your school stands.
          </p>
        </div>

        <!-- PRODUCT + BENEFITS -->
        <div class="mt-16 grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
          <!-- PRODUCT UI -->
          <div
            v-animateonscroll="{
              enterClass:
                'animate-enter fade-in-0 slide-in-from-l-8 animate-duration-900 animate-ease-out',
            }"
          >
            <div
              class="rounded-[2rem] border border-surface-200 bg-surface-50 p-3 shadow-sm dark:border-surface-800 dark:bg-surface-900"
            >
              <div
                class="select-none overflow-hidden rounded-[1.5rem] border border-surface-200 bg-surface-0 dark:border-surface-800 dark:bg-surface-950"
              >
                <div
                  class="border-b border-surface-200 px-6 py-5 dark:border-surface-800"
                >
                  <div class="flex items-center justify-between">
                    <div>
                      <div class="text-xs text-surface-500">
                        Student Payment Position
                      </div>

                      <div
                        class="mt-1 text-xl font-semibold text-surface-900 dark:text-surface-0"
                      >
                        Search student
                      </div>
                    </div>

                    <div
                      class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-950/40 dark:text-primary-400"
                    >
                      <i class="pi pi-search" />
                    </div>
                  </div>
                </div>

                <div class="space-y-3 p-6">
                  <div
                    v-for="student in students"
                    :key="`fees-${student.admissionNumber}`"
                    class="rounded-xl border border-surface-200 p-4 dark:border-surface-800"
                  >
                    <div class="flex items-center justify-between gap-5">
                      <div class="min-w-0">
                        <div
                          class="truncate text-sm font-semibold text-surface-900 dark:text-surface-0"
                        >
                          {{ student.name }}
                        </div>

                        <div class="mt-1 text-sm text-surface-500">
                          {{ student.admissionNumber }}

                          <span class="mx-1">·</span>

                          {{ student.className }}
                        </div>
                      </div>

                      <div class="shrink-0 text-right">
                        <div class="text-xs text-surface-500">
                          Outstanding
                        </div>

                        <div class="mt-1 font-semibold text-red-500">
                          {{ student.outstanding }}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="grid grid-cols-3 gap-3 pt-2">
                    <div
                      v-for="item in feeBreakdown"
                      :key="`breakdown-${item.label}`"
                      class="rounded-xl bg-surface-50 p-4 dark:bg-surface-900"
                    >
                      <div class="text-xs text-surface-500">
                        {{ item.label }}
                      </div>

                      <div
                        class="mt-1 text-sm font-semibold text-surface-900 dark:text-surface-0"
                      >
                        {{ item.value }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- BENEFITS -->
          <div
            v-animateonscroll="{
              enterClass:
                'animate-enter fade-in-0 slide-in-from-r-8 animate-duration-900 animate-ease-out',
            }"
          >
            <div class="space-y-5">
              <div
                v-for="feature in feesFeatures"
                :key="feature"
                class="flex items-start gap-4"
              >
                <div
                  class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-600 dark:bg-primary-950/40 dark:text-primary-400"
                >
                  <i class="pi pi-check text-xs" />
                </div>

                <span
                  class="pt-0.5 text-base leading-6 text-surface-700 dark:text-surface-300"
                >
                  {{ feature }}
                </span>
              </div>
            </div>

            <div class="mt-10 flex flex-wrap items-center gap-4">
              <Button
                label="Start using now"
                icon="pi pi-arrow-right"
                icon-pos="right"
                as="router-link"
                :to="dashboardPath"
              />

              <span class="text-sm text-surface-500">
                Free to use
              </span>
            </div>
          </div>
        </div>

        <!-- FEES MANAGER IN PRACTICE -->
        <div
          v-animateonscroll="{
            enterClass:
              'animate-enter fade-in-0 slide-in-from-b-8 animate-duration-1000 animate-ease-out',
          }"
          class="mt-20"
        >
          <div
            class="group overflow-hidden rounded-[2rem] border border-surface-200 bg-surface-100 shadow-[0_24px_70px_-35px_rgba(0,0,0,0.25)] dark:border-surface-800 dark:bg-surface-900"
          >
            <img
              src="/fees_manager.png"
              alt="A school administrator using ScholarSaaS Fees Manager"
              class="block h-auto w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.01]"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- ========================================================= -->
    <!-- CLASS MANAGER                                             -->
    <!-- ========================================================= -->

    <section
      class="border-y border-surface-200 bg-surface-50 dark:border-surface-800 dark:bg-surface-950"
    >
      <div class="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
        <div class="grid items-center gap-16 lg:grid-cols-2">
          <!-- COPY -->
          <div
            v-animateonscroll="{
              enterClass:
                'animate-enter fade-in-0 slide-in-from-l-8 animate-duration-900 animate-ease-out',
            }"
          >
            <div
              class="mb-4 text-sm font-semibold uppercase tracking-[0.14em] text-surface-500"
            >
              Upcoming
            </div>

            <h2
              class="text-4xl font-semibold tracking-[-0.035em] text-surface-950 dark:text-surface-0 sm:text-5xl"
            >
              Class Manager
            </h2>

            <p
              class="mt-5 max-w-xl text-lg leading-8 text-surface-600 dark:text-surface-400"
            >
              Manage grades, assessments, and report generation from one simple
              workspace.
            </p>

            <div class="mt-8 space-y-4">
              <div
                v-for="feature in classFeatures"
                :key="feature"
                class="flex items-center gap-3 text-surface-700 dark:text-surface-300"
              >
                <i class="pi pi-check text-primary-500" />

                <span>{{ feature }}</span>
              </div>
            </div>

            <div class="mt-9">
              <span
                class="inline-flex rounded-full border border-surface-200 bg-surface-0 px-4 py-2 text-sm font-medium text-surface-600 dark:border-surface-800 dark:bg-surface-900 dark:text-surface-300"
              >
                Coming soon
              </span>
            </div>
          </div>

          <!-- PREVIEW -->
          <div
            v-animateonscroll="{
              enterClass:
                'animate-enter fade-in-0 slide-in-from-r-8 zoom-in-95 animate-duration-1000 animate-ease-out',
            }"
          >
            <div
              class="rounded-[2rem] border border-surface-200 bg-surface-0 p-4 shadow-sm dark:border-surface-800 dark:bg-surface-900"
            >
              <div
                class="rounded-[1.5rem] border border-surface-200 p-6 dark:border-surface-800"
              >
                <div class="flex items-center justify-between">
                  <div>
                    <div class="text-xs text-surface-500">
                      Academic workspace
                    </div>

                    <div
                      class="mt-1 text-xl font-semibold text-surface-900 dark:text-surface-0"
                    >
                      Class Manager
                    </div>
                  </div>

                  <i class="pi pi-book text-xl text-primary-500" />
                </div>

                <div class="mt-8 grid grid-cols-3 gap-3">
                  <div
                    v-for="item in ['Grades', 'Assessments', 'Reports']"
                    :key="item"
                    class="rounded-2xl bg-surface-50 p-5 dark:bg-surface-950"
                  >
                    <div
                      class="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-0 text-surface-500 dark:bg-surface-900"
                    >
                      <i
                        :class="{
                          'pi pi-chart-bar': item === 'Grades',
                          'pi pi-file-edit': item === 'Assessments',
                          'pi pi-file': item === 'Reports',
                        }"
                      />
                    </div>

                    <div
                      class="mt-5 text-sm font-medium text-surface-800 dark:text-surface-200"
                    >
                      {{ item }}
                    </div>
                  </div>
                </div>

                <div
                  class="mt-4 rounded-2xl border border-dashed border-surface-300 p-5 dark:border-surface-700"
                >
                  <div class="text-xs text-surface-500">
                    Advanced features and analytics
                  </div>

                  <div class="mt-2 text-sm text-surface-400">
                    Available when your school needs more.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ========================================================= -->
    <!-- TUTORIA                                                    -->
    <!-- ========================================================= -->

    <section class="bg-surface-900 text-surface-0 dark:bg-surface-950">
      <div class="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
        <div class="grid items-center gap-16 lg:grid-cols-[0.9fr_1.1fr]">
          <!-- COPY -->
          <div
            v-animateonscroll="{
              enterClass:
                'animate-enter fade-in-0 slide-in-from-l-8 animate-duration-900 animate-ease-out',
            }"
          >
            <div
              class="mb-4 text-sm font-semibold uppercase tracking-[0.14em] text-primary-400"
            >
              Rolling out
            </div>

            <h2
              class="text-4xl font-semibold tracking-[-0.035em] sm:text-5xl"
            >
              Tutoria
            </h2>

            <p
              class="mt-5 max-w-xl text-lg leading-8 text-surface-300"
            >
              A free portal for accessing well structured and curriculum based
              tutorials for accelerated learning.
            </p>

            <div class="mt-8 space-y-4">
              <div
                v-for="feature in tutoriaFeatures"
                :key="feature"
                class="flex items-center gap-3 text-surface-300"
              >
                <i class="pi pi-check text-primary-400" />

                <span>{{ feature }}</span>
              </div>
            </div>

            <p class="mt-9 text-lg font-medium text-surface-100">
              You can't miss this.
            </p>
          </div>

          <!-- TUTORIA IMAGE -->
          <div
            v-animateonscroll="{
              enterClass:
                'animate-enter fade-in-0 slide-in-from-r-8 zoom-in-95 animate-duration-1000 animate-ease-out',
            }"
          >
            <div
              class="overflow-hidden rounded-[2rem] border border-surface-700 bg-surface-800 shadow-sm dark:border-surface-800"
            >
              <img
                src="/tutoria.png"
                alt="Teacher explaining a science lesson to students"
                class="block h-auto w-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ========================================================= -->
    <!-- FINAL CTA                                                  -->
    <!-- ========================================================= -->

    <section>
      <div class="mx-auto max-w-4xl px-6 py-28 text-center lg:px-8 lg:py-36">
        <div
          v-animateonscroll="{
            enterClass:
              'animate-enter fade-in-0 slide-in-from-b-6 animate-duration-1000 animate-ease-out',
          }"
        >
          <div
            class="text-sm font-semibold uppercase tracking-[0.14em] text-primary-600 dark:text-primary-400"
          >
            ScholarSaaS
          </div>

          <h2
            class="mt-5 text-4xl font-semibold tracking-[-0.04em] text-surface-950 dark:text-surface-0 sm:text-5xl lg:text-6xl"
          >
            Academic management.
            <br />
            Made easy.
          </h2>

          <p
            class="mx-auto mt-6 max-w-xl text-lg leading-8 text-surface-600 dark:text-surface-400"
          >
            Start with the essentials. Use them free. Upgrade only when your
            school needs more.
          </p>

          <div class="mt-9">
            <Button
              label="Start using ScholarSaaS"
              icon="pi pi-arrow-right"
              icon-pos="right"
              size="large"
              as="router-link"
              :to="dashboardPath"
            />
          </div>
        </div>
      </div>
    </section>
  </main>
</template>