<script setup>
// Import Tailwind CSS directly using a relative path from project root.
// Using a relative import here avoids the Nuxt CSS loader alias issue.
import '~/assets/css/tailwind.css'
</script>

<style>
html, body {
  overflow-x: hidden;
}
</style>

<template>
  <div class="min-h-screen font-sans text-slate-900 bg-slate-50 selection:bg-indigo-100 selection:text-indigo-700">
    <div class="bg-noise"></div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
