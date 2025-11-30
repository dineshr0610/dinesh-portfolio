<template>
  <section class="prose lg:prose-xl">
    <h1>Achievements</h1>
    <p>Certifications, awards and hackathons will be listed here.</p>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
      <div class="p-4 bg-white rounded shadow">
        <h3 class="font-semibold">Certificate Name</h3>
        <p class="text-sm text-slate-600">Issuer • 2024</p>
        <p class="mt-2">Short description of the certification or award.</p>
      </div>

      <div class="p-4 bg-white rounded shadow">
        <h3 class="font-semibold">Hackathon Winner</h3>
        <p class="text-sm text-slate-600">Event • 2023</p>
        <p class="mt-2">Short description of the hackathon achievement.</p>
      </div>

      <div class="p-4 bg-white rounded shadow">
        <h3 class="font-semibold">Another Recognition</h3>
        <p class="text-sm text-slate-600">Issuer • 2022</p>
        <p class="mt-2">Short description of the recognition.</p>
      </div>
    </div>
  </section>
</template>

<script setup>
// no script needed yet; placeholder to avoid SFC errors
</script>

<style scoped>
/* small visual tweak */
section { padding-top: 0.25rem; }
</style>
