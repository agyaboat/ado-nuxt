<template>
  <ClientOnly>
    <div class="pointer-events-none fixed inset-0 -z-20 overflow-hidden bg-slate-50 dark:bg-slate-950">
      <!-- Soft academic ambience -->
      <div
        class="absolute inset-0
        bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.13),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(245,158,11,0.11),transparent_38%)]
        dark:bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.16),transparent_36%),radial-gradient(circle_at_bottom_right,rgba(245,158,11,0.12),transparent_38%)]"
      />

      <!-- Gentle page wash -->
      <div class="absolute inset-0 bg-white/70 dark:bg-slate-950/75" />

      <!-- Lightweight static grid texture -->
      <div
        class="absolute inset-0 opacity-[0.38] dark:opacity-[0.12]
        bg-[linear-gradient(rgba(15,23,42,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.08)_1px,transparent_1px)]
        dark:bg-[linear-gradient(rgba(255,255,255,0.28)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.28)_1px,transparent_1px)]
        bg-size-[42px_42px]"
      />

      <!-- Sparkling joints -->
      <div class="absolute inset-0 opacity-70 dark:opacity-45">
        <div class="scholar-sparkle-joints absolute inset-0" />
      </div>

      <!-- One animated glow -->
      <div
        class="absolute left-1/2 top-1/2 h-136 w-136 -translate-x-1/2 -translate-y-1/2 rounded-full
        bg-blue-500/10 blur-3xl dark:bg-blue-400/10 animate-scholar-glow"
      />

      <div
        class="absolute -bottom-48 -right-40 h-120 w-120 rounded-full
        bg-amber-400/12 blur-3xl dark:bg-amber-400/10"
      />

      <!-- Vignette -->
      <div
        class="absolute inset-0
        bg-[radial-gradient(circle_at_center,transparent_0%,rgba(248,250,252,0.35)_72%,rgba(248,250,252,0.95)_100%)]
        dark:bg-[radial-gradient(circle_at_center,transparent_0%,rgba(2,6,23,0.25)_70%,rgba(2,6,23,0.95)_100%)]"
      />

      <!-- <Meteor class="hidden lg:block dark:lg:block" /> -->
    </div>
  </ClientOnly>
</template>

<style scoped>
@keyframes scholar-glow {
  0%,
  100% {
    opacity: 0.35;
    transform: translate(-50%, -50%) scale(1);
  }

  50% {
    opacity: 0.65;
    transform: translate(-50%, -50%) scale(1.08);
  }
}

.animate-scholar-glow {
  animation: scholar-glow 10s ease-in-out infinite;
}

.scholar-sparkle-joints {
  background-image:
    radial-gradient(circle, rgba(37, 99, 235, 0.55) 0 1px, transparent 1.8px),
    radial-gradient(circle, rgba(245, 158, 11, 0.45) 0 1px, transparent 1.8px),
    radial-gradient(circle, rgba(20, 184, 166, 0.42) 0 1px, transparent 1.8px);

  background-size:
    84px 84px,
    126px 126px,
    168px 168px;

  background-position:
    0 0,
    42px 42px,
    84px 84px;

  animation: scholar-joint-sparkle 7s ease-in-out infinite;
  will-change: opacity, filter;
}

.dark .scholar-sparkle-joints {
  background-image:
    radial-gradient(circle, rgba(96, 165, 250, 0.75) 0 1px, transparent 2px),
    radial-gradient(circle, rgba(251, 191, 36, 0.62) 0 1px, transparent 2px),
    radial-gradient(circle, rgba(45, 212, 191, 0.55) 0 1px, transparent 2px);
}

@keyframes scholar-joint-sparkle {
  0%,
  100% {
    opacity: 0.25;
    filter: drop-shadow(0 0 0 transparent);
  }

  45% {
    opacity: 0.8;
    filter: drop-shadow(0 0 6px rgba(37, 99, 235, 0.28));
  }

  70% {
    opacity: 0.38;
  }
}

@media (prefers-reduced-motion: reduce) {
  .animate-scholar-glow,
  .scholar-sparkle-joints {
    animation: none;
  }
}
</style>