<template>
  <div
    v-if="visible"
    class="meteor"
    :style="style"
    aria-hidden="true"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

const visible = ref(false)
const startX = ref(0)
const startY = ref(0)
const duration = ref(800)

let timer: number | null = null

const spawnMeteor = () => {
  // Respect reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  startX.value = Math.random() * 40 - 20     // off-screen left
  startY.value = Math.random() * 30 - 20     // off-screen top
  duration.value = 4000 + Math.random() * 400

  visible.value = true

  setTimeout(() => {
    visible.value = false
  }, duration.value)
}

const schedule = () => {
  const delay = Math.random() * 4000 // 20–40s
  timer = window.setTimeout(() => {
    spawnMeteor()
    schedule()
  }, delay)
}

onMounted(() => {
  schedule()
})

onBeforeUnmount(() => {
  if (timer) clearTimeout(timer)
})

const style = computed(() => ({
  left: `${startX.value}vw`,
  top: `${startY.value}vh`,
  animationDuration: `${duration.value}ms`,
}))
</script>

<style scoped>
.meteor {
  position: fixed;
  width: 140px;
  height: 2px;
  background: linear-gradient(
    90deg,
    rgba(34, 197, 94, 0.8),
    rgba(34, 197, 94, 0)
  );
  opacity: 0.8;
  filter: blur(0.5px);
  transform: rotate(45deg);
  animation: meteor-fall linear forwards;
  pointer-events: none;
  z-index: 1;
}

@keyframes meteor-fall {
  from {
    transform: translate(0, 0) rotate(45deg);
    opacity: 0;
  }
  10% {
    opacity: 0.8;
  }
  to {
    transform: translate(120vw, 120vh) rotate(45deg);
    opacity: 0;
  }
}
</style>
