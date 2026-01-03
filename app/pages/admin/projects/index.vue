<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const projects = ref<any[]>([])
const loading = ref(true)

async function load() {
  loading.value = true
  try {
    projects.value = await $fetch('/api/admin/projects')
  } catch (e) {
    alert('Failed to load projects')
  } finally {
    loading.value = false
  }
}

async function deleteProject(id: string) {
  if (!confirm('Are you sure? This effectively unpublishes the project but keeps it in DB.')) return

  try {
    await $fetch('/api/admin/projects/delete', {
      method: 'POST',
      body: { id }
    })
    await load() // refresh
  } catch (e) {
    alert('Failed to delete')
  }
}

onMounted(load)
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">Projects</h1>
      <NuxtLink to="/admin/projects/create" class="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
        + New Project
      </NuxtLink>
    </div>

    <div v-if="loading" class="text-center py-12 text-slate-500">
      Loading projects...
    </div>

    <div v-else-if="projects.length === 0" class="text-center py-12 bg-white rounded-lg border shadow-sm">
      <p class="text-slate-500">No projects found. Create one!</p>
    </div>

    <div v-else class="bg-white rounded-lg border shadow-sm overflow-hidden">
      <table class="w-full text-left border-collapse">
        <thead class="bg-slate-50 border-b">
          <tr>
            <th class="p-4 font-semibold text-sm text-slate-600">Title</th>
            <th class="p-4 font-semibold text-sm text-slate-600">Status</th>
            <th class="p-4 font-semibold text-sm text-slate-600">Tech</th>
            <th class="p-4 font-semibold text-sm text-slate-600">Date</th>
            <th class="p-4 font-semibold text-sm text-slate-600 text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y">
          <tr v-for="p in projects" :key="p.id" class="hover:bg-slate-50">
            <td class="p-4">
              <div class="font-medium text-slate-900">{{ p.title }}</div>
              <div class="text-xs text-slate-500 truncate max-w-xs">{{ p.short }}</div>
            </td>
            <td class="p-4">
              <span 
                class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                :class="p.published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'"
              >
                {{ p.published ? 'Published' : 'Draft' }}
              </span>
            </td>
            <td class="p-4 text-sm text-slate-600">
              <div class="flex flex-wrap gap-1">
                <span v-for="t in (p.tech || []).slice(0,3)" :key="t" class="px-1.5 py-0.5 bg-slate-100 rounded text-xs">
                  {{ t }}
                </span>
                <span v-if="(p.tech || []).length > 3" class="text-xs text-slate-400">
                  +{{ p.tech.length - 3 }}
                </span>
              </div>
            </td>
            <td class="p-4 text-sm text-slate-600">
              {{ new Date(p.created_at).toLocaleDateString() }}
            </td>
            <td class="p-4 text-right space-x-2">
              <NuxtLink :to="`/admin/projects/${p.id}`" class="text-indigo-600 hover:text-indigo-800 text-sm font-medium">Edit</NuxtLink>
              <button @click="deleteProject(p.id)" class="text-red-600 hover:text-red-800 text-sm">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
