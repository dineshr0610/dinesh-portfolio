<template>
  <footer
    class="py-6 border-t mt-12 bg-white/80"
    @mouseenter="react('contact')"
    @mouseleave="react('idle')"
  >
    <div class="container mx-auto text-center text-sm">
      © {{ year }} Dinesh R — Built with Nuxt & Tailwind
    </div>
  </footer>
</template>

<script setup lang="ts">
const year = new Date().getFullYear()

function react(type: 'contact' | 'idle') {
  window.dispatchEvent(
    new CustomEvent('ai:react', { detail: type })
  )
}
</script>
