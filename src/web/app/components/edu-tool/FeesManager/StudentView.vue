<script setup lang="ts">
const props = defineProps<{
  student: Student
}>()

const studentx = ref(props.student)
function setStudent(s: Student) {
  studentx.value = s
}

const emits = defineEmits(['deleted'])
</script>

<template>
  <div class="space-y-7">
    <!-- Profile header -->
    <div class="flex items-center gap-4">
      <Avatar
        :label="`${studentx.firstName.charAt(0)}${student.lastName.charAt(0)}`"
        shape="circle"
        size="xlarge"
        class="bg-surface-100 text-surface-700 dark:bg-surface-800 dark:text-surface-200"
      />

      <div class="min-w-0">
        <h3
          class="truncate text-xl font-semibold text-surface-900 dark:text-surface-0"
        >
          {{ studentx.firstName }}
          <span v-if="studentx.middleName">
            {{ studentx.middleName }}
          </span>
          {{ studentx.lastName }}
        </h3>

        <div class="mt-1 flex items-center gap-2 text-sm text-surface-500">
          <span>
            {{ studentx.admissionNumber || 'No admission number' }}
          </span>

          <span>·</span>

          <span class="capitalize">
            {{ studentx.studentStatus }}
          </span>
        </div>
      </div>
    </div>

    <!-- Current placement -->
    <div
      class="rounded-xl border border-surface-200 bg-surface-50 p-5 dark:border-surface-700 dark:bg-surface-900"
    >
      <div class="mb-4 flex items-center justify-between">
        <div>
          <p
            class="text-xs font-semibold uppercase tracking-wider text-surface-500"
          >
            Current placement
          </p>

          <p class="mt-1 text-lg font-semibold text-surface-900 dark:text-surface-0">
            {{ studentx.class?.label || 'No class assigned' }}
          </p>
        </div>

        <div class="text-right">
          <p class="text-xs text-surface-500">
            Academic year
          </p>

          <p class="mt-1 font-medium text-surface-700 dark:text-surface-200">
            {{ studentx.class?.year || '—' }}
          </p>
        </div>
      </div>

      <div class="flex justify-between items-center gap-5">
        <div class="flex flex-wrap gap-2">
          <Tag
            v-if="studentx.residentialStatus"
            :value="studentx.residentialStatus"
            severity="secondary"
            class="capitalize"
          />
  
          <Tag
            :value="studentx.studentStatus"
            :severity="studentx.studentStatus === 'active' ? 'success' : 'secondary'"
            class="capitalize"
          />
        </div>
        <div class="flex gap-2">
          <EduToolFeesManagerStudentUpdate :student="studentx" @updated="(x) => setStudent(x)" />
          <EduToolFeesManagerStudentDelete :student="student" @deleted="$emit('deleted')" />
        </div>
      </div>
    </div>

    <!-- Student information -->
     <details>
      <summary class="mb-4 text-sm font-semibold text-surface-800 dark:text-surface-100 cursor-pointer">More Details</summary>
      <section>
        <h4
          class="mb-4 text-sm font-semibold text-surface-800 dark:text-surface-100"
        >
          Student Information
        </h4>
  
        <div
          class="grid grid-cols-1 divide-y divide-surface-200 border-y border-surface-200 dark:divide-surface-700 dark:border-surface-700 sm:grid-cols-2 sm:divide-x sm:divide-y-0"
        >
          <div class="space-y-5 py-4 sm:pr-6">
            <div>
              <p class="text-xs text-surface-500">
                Gender
              </p>
  
              <p class="mt-1 font-medium capitalize text-surface-800 dark:text-surface-100">
                {{ studentx.gender || '—' }}
              </p>
            </div>
  
            <div>
              <p class="text-xs text-surface-500">
                Phone
              </p>
  
              <p class="mt-1 font-medium text-surface-800 dark:text-surface-100">
                {{ studentx.phone || '—' }}
              </p>
            </div>
  
            <div>
              <p class="text-xs text-surface-500">
                Email
              </p>
  
              <p class="mt-1 break-all font-medium text-surface-800 dark:text-surface-100">
                {{ studentx.email || '—' }}
              </p>
            </div>
          </div>
  
          <div class="space-y-5 py-4 sm:pl-6">
            <div>
              <p class="text-xs text-surface-500">
                Student code
              </p>
  
              <p class="mt-1 font-medium text-surface-800 dark:text-surface-100">
                {{ studentx.studentCode || '—' }}
              </p>
            </div>
  
            <div>
              <p class="text-xs text-surface-500">
                Admission number
              </p>
  
              <p class="mt-1 font-medium text-surface-800 dark:text-surface-100">
                {{ studentx.admissionNumber || '—' }}
              </p>
            </div>
  
            <div>
              <p class="text-xs text-surface-500">
                Accommodation
              </p>
  
              <p class="mt-1 font-medium capitalize text-surface-800 dark:text-surface-100">
                {{ studentx.residentialStatus || '—' }}
              </p>
            </div>
          </div>
        </div>
      </section>
     </details>
  </div>
</template>