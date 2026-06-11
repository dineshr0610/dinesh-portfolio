<!-- layouts/default.vue -->

<template>
  <div class="min-h-screen bg-[#0b0f1a] text-ctext">
    <Header />
    <!-- ✅ FIX: Removed px-4 from <main>.
         The old px-4 was creating 16px gaps on both sides of every page,
         including the hero section. Each page now manages its own horizontal
         padding via its content container (index uses max-w-[1600px] mx-auto px-4 lg:px-8). -->
    <main>
      <slot />
    </main>
  </div>
  <AICharacter />
</template>

<script setup>
import Header from '~/components/Header.vue'
import AICharacter from '~/components/AICharacter.vue'
</script>