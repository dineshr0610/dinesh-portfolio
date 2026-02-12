<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const router = useRouter()
const submitting = ref(false)

const form = reactive({
  title: '',
  short: '',
  long: '',
  techString: '',
  demo: '',
  repo: '',
  image: '',
  published: true,
  started_at: '',
  ended_at: null as string | null,
  ongoing: true
})

watch(() => form.ongoing, (val) => {
  if (val) {
    form.ended_at = null
  }
})

async function submit() {
  submitting.value = true
  try {
    const techArray = form.techString.split(',').map(t => t.trim()).filter(Boolean)
    
    await $fetch('/api/admin/projects/create', {
      method: 'POST',
      body: {
        ...form,
        tech: techArray
      }
    })
    router.push('/admin/projects')
  } catch (e: any) {
    alert(e.statusMessage || 'Failed to create project')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="max-w-2xl mx-auto">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">New Project</h1>
      <NuxtLink to="/admin/projects" class="text-sm text-slate-500 hover:underline">Cancel</NuxtLink>
    </div>

    <form @submit.prevent="submit" class="space-y-6 bg-white p-6 rounded-lg border shadow-sm">
      
      <!-- Title -->
      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1">Title</label>
        <input 
          v-model="form.title" 
          type="text" 
          required
          class="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
        placeholder="e.g. Portfolio Website"
        />
      </div>

      <!-- Dates -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Started Date</label>
          <input 
            v-model="form.started_at" 
            type="date" 
            required
            class="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        <div class="flex items-end gap-2 pb-2">
          <input type="checkbox" v-model="form.ongoing" id="ongoing" class="w-4 h-4 text-indigo-600 rounded" />
          <label for="ongoing" class="text-sm font-medium text-slate-700">Ongoing</label>
        </div>

        <div v-if="!form.ongoing">
          <label class="block text-sm font-medium text-slate-700 mb-1">Ended Date</label>
          <input 
            v-model="form.ended_at" 
            type="date" 
            required
            class="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
      </div>

      <!-- Short -->
      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1">Short Description (Card)</label>
        <textarea 
          v-model="form.short" 
          rows="2"
          required
          class="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
          placeholder="Brief summary for the card view..."
        ></textarea>
      </div>

      <!-- Long -->
      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1">Full Content (HTML allowed)</label>
        <textarea 
          v-model="form.long" 
          rows="6"
          required
          class="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm"
          placeholder="<p>Full project details...</p>"
        ></textarea>
        <p class="text-xs text-slate-400 mt-1">Accepts HTML tags.</p>
      </div>

      <!-- Tech -->
      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1">Tech Stack (comma separated)</label>
        <input 
          v-model="form.techString" 
          type="text" 
          class="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
          placeholder="Vue, Nuxt, Tailwind CSS"
        />
      </div>

      <!-- Links -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Image URL</label>
          <input v-model="form.image" type="text" class="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="/gallery/..." />
          <div v-if="form.image" class="mt-2 relative w-full h-32 bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
            <img :src="form.image" class="w-full h-full object-contain" />
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Demo URL</label>
          <input v-model="form.demo" type="url" class="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="https://..." />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Repo URL</label>
          <input v-model="form.repo" type="url" class="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="https://github.com/..." />
        </div>
      </div>

      <!-- Publish -->
      <div class="flex items-center gap-2">
        <input v-model="form.published" type="checkbox" id="pub" class="w-4 h-4 text-indigo-600 rounded" />
        <label for="pub" class="text-sm font-medium text-slate-700">Published (Visible to public)</label>
      </div>

      <div class="pt-4 border-t flex justify-end gap-3">
        <NuxtLink to="/admin/projects" class="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded">Cancel</NuxtLink>
        <button 
          type="submit" 
          :disabled="submitting"
          class="px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
        >
          {{ submitting ? 'Saving...' : 'Create Project' }}
        </button>
      </div>

    </form>
  </div>
</template>
