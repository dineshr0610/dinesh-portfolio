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
      <input v-model="form.date" type="date" class="input" />
      <input v-model="form.image" placeholder="Image URL" class="input" />

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
