<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const form = reactive({
  title: '',
  subtitle: '',
  description: '',
  date: '',
  image: '',
  tags: '',
  published: true
})

async function save() {
  await $fetch('/api/admin/timeline/create', {
    method: 'POST',
    body: {
      ...form,
      tags: form.tags.split(',').map(t => t.trim())
    }
  })

  navigateTo('/admin/timeline')
}
</script>

<template>
  <section class="max-w-2xl">
    <h1 class="text-2xl font-bold mb-6">Add Timeline Entry</h1>

    <div class="space-y-4">
      <input v-model="form.title" placeholder="Title" class="input" />
      <input v-model="form.subtitle" placeholder="Subtitle" class="input" />
      <input v-model="form.date" type="date" required class="input" />
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
        <input v-model="form.image" placeholder="Image URL (https://...)" class="input" />
        <div v-if="form.image" class="mt-2 relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
          <img :src="form.image" class="w-full h-full object-contain" />
        </div>
      </div>

      <textarea
        v-model="form.description"
        rows="5"
        placeholder="Description"
        class="input"
      />

      <input
        v-model="form.tags"
        placeholder="Tags (comma separated)"
        class="input"
      />

      <label class="flex items-center gap-2">
        <input type="checkbox" v-model="form.published" />
        Published
      </label>

      <button
        @click="save"
        class="px-4 py-2 bg-indigo-600 text-white rounded"
      >
        Save
      </button>
    </div>
  </section>
</template>

<style scoped>
.input {
  width: 100%;
  border: 1px solid #ccc;
  padding: 8px;
  border-radius: 6px;
}
</style>
