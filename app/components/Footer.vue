<template>
  <footer class="py-6 border-t mt-12 bg-white/80">
    <div class="container mx-auto text-center text-sm">
      © {{ year }} Dinesh R — Built with Nuxt & Tailwind
    </div>
  </footer>
</template>

<script setup>
const year = new Date().getFullYear()
</script>
