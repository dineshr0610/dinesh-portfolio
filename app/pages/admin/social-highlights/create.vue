<script setup>
definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const router = useRouter()
const loading = ref(false)

const form = ref({
  platform: 'LinkedIn',
  title: '',
  embed_html: '',
  published: true
})

const platforms = ['LinkedIn', 'Twitter', 'YouTube', 'Instagram', 'Other']

async function submit() {
  loading.value = true
  try {
    await $fetch('/api/admin/social-highlights/create', {
      method: 'POST',
      body: form.value
    })
    router.push('/admin/social-highlights')
  } catch (e) {
    alert('Error creating highlight: ' + e.message)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="max-w-2xl mx-auto px-4 md:px-0">
    <div class="flex items-center gap-4 mb-6">
      <NuxtLink to="/admin/social-highlights" class="text-gray-500 hover:text-gray-900">
        ← Back
      </NuxtLink>
      <h1 class="text-2xl font-bold text-gray-900">Add Social Highlight</h1>
    </div>

    <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-4 md:p-6">
      <form @submit.prevent="submit" class="space-y-6">
        
        <!-- Platform -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Platform</label>
          <select v-model="form.platform" class="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500">
            <option v-for="p in platforms" :key="p" :value="p">{{ p }}</option>
          </select>
        </div>

        <!-- Title -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Title (Optional)</label>
          <input v-model="form.title" type="text" class="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500" placeholder="e.g. My Viral Post">
        </div>

        <!-- Embed HTML -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Embed HTML <span class="text-red-500">*</span></label>
          <p class="text-xs text-gray-500 mb-2">Paste the full <code>&lt;iframe&gt;</code> or embed code here.</p>
          <textarea v-model="form.embed_html" required rows="6" class="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 font-mono text-sm" placeholder="<iframe src='...'></iframe>"></textarea>
        </div>



        <!-- Published Toggle -->
        <div class="flex items-center gap-2">
          <input v-model="form.published" type="checkbox" id="published" class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4">
          <label for="published" class="text-sm font-medium text-gray-700">Published</label>
        </div>

        <!-- Actions -->
        <div class="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
          <NuxtLink to="/admin/social-highlights" class="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900">Cancel</NuxtLink>
          <button type="submit" :disabled="loading" class="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-50">
            {{ loading ? 'Saving...' : 'Create Highlight' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
