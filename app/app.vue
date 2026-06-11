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
<div class="min-h-screen font-sans bg-cbase text-ctext selection:bg-indigo-500 selection:text-white">
    <div class="bg-noise"></div>
    <NuxtLayout>
      <NuxtPage />
      <GlobalToast />
    </NuxtLayout>
  </div>
</template>
