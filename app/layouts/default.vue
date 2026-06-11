<!-- layouts/default.vue -->

<template>
  <div class="min-h-screen bg-[#0b0f1a] text-ctext">
    <Header />
    <main class="container mx-auto px-4 py-8">
      <slot />
    </main>
  </div>
  <AICharacter />
</template>

<script setup>
import Header from '~/components/Header.vue'
import AICharacter from '~/components/AICharacter.vue'
</script>

