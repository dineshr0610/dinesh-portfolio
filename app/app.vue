<script setup>
// Import Tailwind CSS directly using a relative path from project root.
// Using a relative import here avoids the Nuxt CSS loader alias issue.
import './assets/css/tailwind.css'
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
