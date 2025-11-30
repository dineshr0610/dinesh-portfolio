<!-- app/pages/gallery.vue -->
<template>
  <section class="prose mx-auto py-8">
    <h1 class="text-2xl font-semibold">Gallery</h1>
    <p class="mt-2">Event photos and snapshots will appear here.</p>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
      <!-- sample placeholders -->
      <div class="bg-white rounded shadow p-4 flex items-center justify-center h-40">Image 1</div>
      <div class="bg-white rounded shadow p-4 flex items-center justify-center h-40">Image 2</div>
      <div class="bg-white rounded shadow p-4 flex items-center justify-center h-40">Image 3</div>
    </div>
  </section>
</template>

<script setup>
// optional: any page-specific logic goes here
</script>

<style scoped>
/* tiny safe styles if you want */
</style>
