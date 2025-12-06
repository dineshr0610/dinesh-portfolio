<!-- app/pages/resume.vue -->
<template>
  <section class="py-12">
    <div class="container mx-auto px-4 lg:px-8">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-3xl font-bold">Resume</h1>
        <div class="flex items-center gap-3">
          <!-- download link uses the API endpoint - browser will download the returned text -->
          <a
            :href="downloadHref"
            class="inline-flex items-center gap-2 px-3 py-2 border rounded hover:bg-slate-50"
            download="resume.md"
          >
            Download .md
          </a>
          <NuxtLink to="/about" class="text-sm text-slate-600 hover:underline">← Back</NuxtLink>
        </div>
      </div>

      <!-- If parsed doc available from @nuxt/content -->
      <article v-if="doc" class="bg-white rounded-lg shadow p-6 prose max-w-none">
        <nuxt-content :document="doc" />
      </article>

      <!-- If we have raw markdown (fallback) -->
      <div v-else-if="raw" class="bg-white rounded-lg shadow p-6 text-sm">
        <p class="text-slate-600 mb-4">Rendered fallback (raw markdown):</p>
        <pre class="whitespace-pre-wrap bg-slate-50 p-4 rounded text-xs overflow-auto">{{ raw }}</pre>
      </div>

      <!-- Nothing found -->
      <div v-else class="bg-yellow-50 rounded-lg p-6 text-slate-700">
        <p>No resume found. Make sure <code>content/resume.md</code> exists in the project root.</p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'

const doc = ref(null)
const raw = ref(null)
const downloadHref = '/api/resume' // API returns JSON; but browser will still download text if used with download attr

// Try to use @nuxt/content's useContent first (if present)
try {
  // useContent might not be defined if @nuxt/content isn't available at runtime
  // eslint-disable-next-line no-undef
  if (typeof useContent === 'function') {
    const res = await useContent('resume').fetch()
    // normalize array vs object
    doc.value = Array.isArray(res) ? (res[0] || null) : (res || null)
  }
} catch (err) {
  // ignore - fallback to API
}

// If doc not loaded, fetch the raw via our server API
if (!doc.value) {
  try {
    const resp = await $fetch('/api/resume', { method: 'GET' })
    if (resp && resp.ok && typeof resp.data === 'string') {
      raw.value = resp.data
    }
  } catch (err) {
    console.warn('fetch /api/resume failed', err)
  }
}
</script>

<style scoped>
.container { max-width: 900px; }
</style>
