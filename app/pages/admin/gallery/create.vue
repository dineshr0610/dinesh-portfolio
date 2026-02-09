<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const router = useRouter()
const loading = ref(false)

const form = ref({
  title: '',
  description: '',
  type: 'image',
  src: '',
  poster: '',
  tags: '',
  published: true,
  published_at: new Date().toISOString().split('T')[0]
})

// Quick validation
const isValid = computed(() => {
    return form.value.title && form.value.src
})

async function save() {
  if (!isValid.value) return
  
  loading.value = true
  try {
    await $fetch('/api/admin/gallery/create', {
        method: 'POST',
        body: {
        ...form.value,
        tags: form.value.tags.split(',').map(t => t.trim()).filter(Boolean)
        }
    })
    router.push('/admin/gallery')
  } catch (e) {
    alert('Failed to save item')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="max-w-6xl mx-auto p-6 h-[calc(100vh-100px)]">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold flex items-center gap-2">
        <NuxtLink to="/admin/gallery" class="text-gray-400 hover:text-gray-600 transition">&larr;</NuxtLink>
        New Gallery Media
      </h1>
      
      <button 
        @click="save" 
        :disabled="loading || !isValid"
        class="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ loading ? 'Saving...' : 'Create Item' }}
      </button>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
        <!-- Left: Form -->
        <div class="bg-white p-6 rounded-xl shadow-sm border overflow-y-auto">
            <div class="space-y-5">
                <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-1">Title</label>
                    <input v-model="form.title" placeholder="e.g. Neon City" class="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition" />
                </div>

                <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                    <textarea v-model="form.description" rows="3" placeholder="Short story behind this media..." class="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition"></textarea>
                </div>

                 <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-1">Type</label>
                        <select v-model="form.type" class="w-full border rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition">
                            <option value="image">Image</option>
                            <option value="video">Video</option>
                        </select>
                    </div>
                    <div>
                         <label class="block text-sm font-semibold text-gray-700 mb-1">Status</label>
                         <div class="flex items-center h-[42px]">
                            <label class="inline-flex items-center cursor-pointer">
                                <input type="checkbox" v-model="form.published" class="sr-only peer">
                                <div class="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                <span class="ms-3 text-sm font-medium text-gray-900">{{ form.published ? 'Published' : 'Draft' }}</span>
                            </label>
                         </div>
                    </div>
                </div>
                
                <div>
                     <label class="block text-sm font-semibold text-gray-700 mb-1">Published Date</label>
                     <input type="date" v-model="form.published_at" :required="form.published" class="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition" />
                </div>

                <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-1">
                        Media URL 
                        <span class="text-xs font-normal text-gray-500 ml-1">(Cloudinary / Unsplash / S3)</span>
                    </label>
                    <input v-model="form.src" placeholder="https://..." class="w-full border rounded-lg p-2.5 font-mono text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition" />
                </div>

                <div v-if="form.type === 'video'">
                    <label class="block text-sm font-semibold text-gray-700 mb-1">Poster URL (Cover Image)</label>
                    <input v-model="form.poster" placeholder="https://..." class="w-full border rounded-lg p-2.5 font-mono text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition" />
                </div>

                <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-1">Tags</label>
                    <input v-model="form.tags" placeholder="cyberpunk, neon, 3d render" class="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition" />
                    <p class="text-xs text-gray-500 mt-1">Separate with commas</p>
                </div>
            </div>
        </div>

        <!-- Right: Preview -->
        <div class="bg-gray-100 rounded-xl border border-dashed border-gray-300 flex items-center justify-center relative overflow-hidden group">
            <div v-if="!form.src" class="text-center p-6">
                <div class="text-4xl mb-2 text-gray-300">🖼️</div>
                <p class="text-gray-400 font-medium">Preview will appear here</p>
            </div>

            <div v-else class="relative w-full h-full p-4 flex items-center justify-center">
                <!-- Image Preview -->
                <img 
                    v-if="form.type === 'image'" 
                    :src="form.src" 
                    class="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                    alt="Preview"
                />

                <!-- Video Preview -->
                <video 
                    v-if="form.type === 'video'" 
                    :src="form.src"
                    :poster="form.poster" 
                    controls
                    class="max-w-full max-h-full rounded-lg shadow-lg bg-black"
                ></video>
            </div>
        </div>
    </div>
  </section>
</template>
