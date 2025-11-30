<!-- components/Header.vue -->
<template>
  <header class="py-4 border-b bg-white/80 backdrop-blur-sm">
    <div class="container mx-auto flex items-center justify-between">
      <NuxtLink to="/" class="text-xl font-bold">Dinesh R</NuxtLink>

      <nav class="space-x-4 text-sm">
        <NuxtLink to="/" class="hover:underline">Home</NuxtLink>
        <NuxtLink to="/about" class="hover:underline">About</NuxtLink>
        
        <NuxtLink to="/ask" class="hover:underline">Ask AI</NuxtLink>
        <NuxtLink to="/achievements" class="hover:underline">Achievements</NuxtLink>
        <NuxtLink to="/timeline" class="hover:underline">Timeline</NuxtLink>
        <NuxtLink to="/gallery" class="hover:underline">Gallery</NuxtLink>
        <NuxtLink to="/updates" class="hover:underline">Dinesh Now</NuxtLink>
        <NuxtLink to="/contact" class="hover:underline">Contact</NuxtLink>
      </nav>
    </div>
  </header>
</template>

<script setup>
// no JS needed now
</script>
