<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const route = useRoute()
const form = ref<any>(null)

onMounted(async () => {
  const all = await $fetch('/api/admin/gallery') as any[]
  form.value = all.find((i: any) => i.id === route.params.id)
})

async function save() {
  await $fetch('/api/admin/gallery/update', {
    method: 'PUT',
    body: {
      ...form.value,
      tags: form.value.tags ?? []
    }
  })
  navigateTo('/admin/gallery')
}
</script>

<template>
  <section v-if="form" class="max-w-2xl">
    <h1 class="text-2xl font-bold mb-4">Edit Gallery Item</h1>

    <input v-model="form.title" class="input" />
    <textarea v-model="form.description" class="input" />
    <select v-model="form.type" class="input">
      <option value="image">Image</option>
      <option value="video">Video</option>
    </select>

    <input v-model="form.src" class="input" />
    <input v-model="form.poster" class="input" />

    <label class="flex gap-2 items-center">
      <input type="checkbox" v-model="form.published" />
      Published
    </label>

    <button @click="save" class="btn-primary mt-4">Update</button>
  </section>
</template>
