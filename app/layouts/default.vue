<!-- layouts/default.vue -->

<template>
  <div class="min-h-screen bg-slate-50 text-slate-900">
    <Header />
    <main class="container mx-auto px-4 py-8">
      <slot />
    </main>
    <Footer />
  </div>
  <AICharacter />

</template>

<script setup>
import Header from '~/components/Header.vue'
import Footer from '~/components/Footer.vue'
import AICharacter from '~/components/AICharacter.vue'
</script>
