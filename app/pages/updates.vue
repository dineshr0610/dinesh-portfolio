<!-- app/pages/updates.vue -->
<template>
  <section class="prose mx-auto py-8">
    <h1>Dinesh Now</h1>
    <p class="text-slate-600">This feed will show your daily / weekly updates. Admin can post updates from the dashboard.</p>

    <div class="mt-6 space-y-4">
      <!-- Example static card until DB is wired -->
      <article class="p-4 bg-white shadow rounded">
        <div class="flex items-start gap-4">
          <div class="flex-1">
            <div class="flex items-baseline justify-between">
              <h3 class="font-semibold">Today I learned Nuxt middleware</h3>
              <time class="text-sm text-slate-500">28 Nov 2025</time>
            </div>
            <p class="mt-2 text-slate-700">Explored route guards and authentication logic. Will wire dynamic updates soon.</p>
            <div class="mt-3 text-sm text-slate-500">Tags: <span class="mx-1">#frontend</span> <span class="mx-1">#learning</span></div>
          </div>
        </div>
      </article>

      <!-- placeholder for more cards -->
      <div class="text-center text-slate-500">No more updates yet — admin editor coming soon.</div>
    </div>
  </section>
</template>

<script setup>
// No logic yet — this is a placeholder page for Day 2.
// Later we'll fetch real updates from Supabase or /api/updates.
</script>

<style scoped>
/* small spacing tweak if needed */
</style>
