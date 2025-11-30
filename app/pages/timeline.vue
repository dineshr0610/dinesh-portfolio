<!-- app/pages/timeline.vue -->
<template>
  <section>
    <h2 class="text-2xl font-semibold">Timeline</h2>
    <p class="mt-2">Life / career timeline will appear here.</p>

    <ul class="mt-6 space-y-4">
      <li class="bg-white p-4 rounded shadow">
        <div class="flex justify-between">
          <strong>2025 — Started major portfolio project</strong>
          <span class="text-sm text-slate-500">Nov 2025</span>
        </div>
        <p class="mt-2 text-slate-700">Building a Nuxt + Tailwind portfolio with an AI assistant (RAG).</p>
      </li>

      <li class="bg-white p-4 rounded shadow">
        <div class="flex justify-between">
          <strong>2024 — Learned Vue & basic backend</strong>
          <span class="text-sm text-slate-500">Year</span>
        </div>
        <p class="mt-2 text-slate-700">Worked on small projects and practiced full-stack basics.</p>
      </li>
    </ul>
  </section>
</template>

<script setup>
// page-level logic will go here later (e.g., fetch timeline items)
</script>

<style scoped>
/* small visual nicety — optional */
section { min-height: 60vh; }
</style>
