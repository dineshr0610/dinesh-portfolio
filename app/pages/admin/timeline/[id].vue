<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const route = useRoute()
const id = route.params.id as string

const { data } = await useFetch<any[]>('/api/admin/timeline')
const item = computed(() => data.value?.find(i => i.id === id))

const form = reactive({
  title: '',
  subtitle: '',
  description: '',
  date: '',
  image: '',
  tags: '',
  published: true
})

watchEffect(() => {
  if (!item.value) return
  Object.assign(form, {
    ...item.value,
    tags: item.value.tags?.join(', ') || ''
  })
})

async function save() {
  await $fetch('/api/admin/timeline/update', {
    method: 'PUT',
    body: {
      id,
      ...form,
      tags: form.tags.split(',').map(t => t.trim())
    }
  })

  navigateTo('/admin/timeline')
}
</script>

<template>
  <section v-if="item" class="max-w-2xl">
    <h1 class="text-2xl font-bold mb-6">Edit Timeline Entry</h1>

    <div class="space-y-4">
      <input v-model="form.title" class="input" />
      <input v-model="form.subtitle" class="input" />
      <input v-model="form.date" type="date" required class="input" />
      <input v-model="form.image" class="input" />

      <textarea
        v-model="form.description"
        rows="5"
        class="input"
      />

      <input v-model="form.tags" class="input" />

      <label class="flex items-center gap-2">
        <input type="checkbox" v-model="form.published" />
        Published
      </label>

      <button
        @click="save"
        class="px-4 py-2 bg-indigo-600 text-white rounded"
      >
        Update
      </button>
    </div>
  </section>

  <div v-else>Loading…</div>
</template>

<style scoped>
.input {
  width: 100%;
  border: 1px solid #ccc;
  padding: 8px;
  border-radius: 6px;
}
</style>
