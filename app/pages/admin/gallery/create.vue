<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const form = ref({
  title: '',
  description: '',
  type: 'image',
  src: '',
  poster: '',
  tags: '',
  published: false
})

async function save() {
  await $fetch('/api/admin/gallery/create', {
    method: 'POST',
    body: {
      ...form.value,
      tags: form.value.tags.split(',').map(t => t.trim())
    }
  })
  navigateTo('/admin/gallery')
}
</script>

<template>
  <section class="max-w-2xl">
    <h1 class="text-2xl font-bold mb-4">New Gallery Item</h1>

    <input v-model="form.title" placeholder="Title" class="w-full border p-2 rounded mb-3" />
    <textarea v-model="form.description" placeholder="Description" class="w-full border p-2 rounded mb-3" />

    <select v-model="form.type" class="w-full border p-2 rounded mb-3">
      <option value="image">Image</option>
      <option value="video">Video</option>
    </select>

    <input v-model="form.src" placeholder="Media URL (Cloudinary/CDN)" class="w-full border p-2 rounded mb-3" />
    <input v-model="form.poster" placeholder="Poster URL (optional)" class="w-full border p-2 rounded mb-3" />
    <input v-model="form.tags" placeholder="Tags (comma separated)" class="w-full border p-2 rounded mb-3" />

    <label class="flex gap-2 items-center">
      <input type="checkbox" v-model="form.published" />
      Publish immediately
    </label>

    <button @click="save" class="px-4 py-2 bg-indigo-600 text-white rounded mt-4">Save</button>
  </section>
</template>


