<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const router = useRouter()
const loading = ref(false)

const form = ref({
  title: '',
  short: '',
  long: '',
  type: 'certificate',
  achieved_at: new Date().toISOString().split('T')[0],
  image_url: '',
  link_url: '',
  media_type: 'none',
  media_src: '',
  media_poster: '',
  tags_input: '',
  published: true
})

// Mock preview computed
const previewItem = computed(() => ({
    id: 'preview',
    title: form.value.title || 'Achievement Title',
    short: form.value.short || 'A brief summary of your accomplishment will appear here.',
    long: form.value.long,
    type: form.value.type,
    year: form.value.achieved_at ? new Date(form.value.achieved_at).getFullYear() : 'YYYY',
    image_url: form.value.image_url,
    link_url: form.value.link_url,
    tags: form.value.tags_input.split(',').map(t => t.trim()).filter(Boolean),
    media: form.value.media_type === 'none' ? null : {
        type: form.value.media_type,
        src: form.value.media_src,
        poster: form.value.media_poster
    }
}))

async function save() {
  if (!form.value.title || !form.value.short) return
  
  loading.value = true
  try {
    const payload = {
        ...form.value,
        tags: form.value.tags_input.split(',').map(t => t.trim()).filter(Boolean),
        media: form.value.media_type === 'none' ? null : {
            type: form.value.media_type,
            src: form.value.media_src,
            poster: form.value.media_poster
        }
    }

    await $fetch('/api/admin/achievements/create', {
        method: 'POST',
        body: payload
    })
    router.push('/admin/achievements')
  } catch (e) {
    alert('Failed to save achievement')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="max-w-6xl mx-auto p-6 h-[calc(100vh-100px)]">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold flex items-center gap-2">
        <NuxtLink to="/admin/achievements" class="text-gray-400 hover:text-gray-600 transition">&larr;</NuxtLink>
        New Achievement
      </h1>
      
      <button 
        @click="save" 
        :disabled="loading || !form.title"
        class="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ loading ? 'Saving...' : 'Create' }}
      </button>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
        <!-- Left: Form -->
        <div class="bg-white p-6 rounded-xl shadow-sm border overflow-y-auto">
            <div class="space-y-6">
                <!-- Main Info -->
                <div class="grid grid-cols-2 gap-4">
                     <div class="col-span-2">
                        <label class="block text-sm font-semibold text-gray-700 mb-1">Title</label>
                        <input v-model="form.title" placeholder="e.g. AWS Certified Solutions Architect" class="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition" />
                    </div>
                     <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-1">Type</label>
                        <select v-model="form.type" class="w-full border rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition capitalize">
                            <option value="certificate">Certificate</option>
                            <option value="award">Award</option>
                            <option value="hackathon">Hackathon</option>
                            <option value="competition">Competition</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-1">Date</label>
                        <input type="date" required v-model="form.achieved_at" class="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition" />
                    </div>
                </div>

                <!-- Descriptions -->
                <div>
                   <label class="block text-sm font-semibold text-gray-700 mb-1">Short Description (Card)</label>
                   <textarea v-model="form.short" rows="3" placeholder="Brief summary for the timeline/card view..." class="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition"></textarea>
                </div>

                <div>
                   <label class="block text-sm font-semibold text-gray-700 mb-1">Long Description (Markdown)</label>
                   <textarea v-model="form.long" rows="5" placeholder="Detailed story, what you learned, etc..." class="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition font-mono text-sm"></textarea>
                </div>

                <!-- Links & Assets -->
                 <div class="grid grid-cols-1 gap-4">
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-1">External Link</label>
                        <input v-model="form.link_url" placeholder="https://..." class="w-full border rounded-lg p-2.5 font-mono text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition" />
                    </div>
                     <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-1">Cover Image URL</label>
                        <input v-model="form.image_url" placeholder="https://..." class="w-full border rounded-lg p-2.5 font-mono text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition" />
                    </div>
                 </div>

                 <!-- Complex Media -->
                 <div class="border rounded-lg p-4 bg-gray-50">
                    <label class="block text-sm font-bold text-gray-900 mb-2">Attached Media (Video/Screenshot)</label>
                    <div class="grid grid-cols-3 gap-4 mb-2">
                        <select v-model="form.media_type" class="w-full border rounded-lg p-2 bg-white">
                            <option value="none">None</option>
                            <option value="image">Image</option>
                            <option value="video">Video</option>
                        </select>
                         <input v-if="form.media_type !== 'none'" v-model="form.media_src" placeholder="Source URL" class="col-span-2 w-full border rounded-lg p-2 font-mono text-xs" />
                    </div>
                    <input v-if="form.media_type === 'video'" v-model="form.media_poster" placeholder="Video Poster URL (optional)" class="w-full border rounded-lg p-2 font-mono text-xs mt-2" />
                 </div>

                 <!-- Meta -->
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-1">Tags</label>
                    <input v-model="form.tags_input" placeholder="winner, react, ai" class="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition" />
                    <p class="text-xs text-gray-500 mt-1">Comma separated</p>
                </div>

                 <div class="flex items-center">
                    <label class="inline-flex items-center cursor-pointer">
                        <input type="checkbox" v-model="form.published" class="sr-only peer">
                        <div class="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                        <span class="ms-3 text-sm font-medium text-gray-900">Publish immediately</span>
                    </label>
                </div>
            </div>
        </div>

        <!-- Right: Preview -->
        <div class="bg-gray-100 rounded-xl border border-dashed border-gray-300 flex flex-col items-center justify-center p-8 overflow-y-auto">
            <h3 class="text-gray-400 font-bold uppercase tracking-widest text-xs mb-4">Preview</h3>
            
            <!-- Card Preview (Mimics Public Design) -->
            <article class="w-full max-w-md bg-white border rounded-xl overflow-hidden shadow-sm">
                <!-- Media -->
                <div v-if="previewItem.media" class="border-b">
                     <img v-if="previewItem.media.type === 'image'" :src="previewItem.media.src" class="w-full h-48 object-cover" />
                     <video v-else :src="previewItem.media.src" controls class="w-full h-48 bg-black"></video>
                </div>
                <!-- Fallback Cover if no media but image_url exists -->
                <div v-else-if="previewItem.image_url" class="border-b">
                    <img :src="previewItem.image_url" class="w-full h-48 object-cover" />
                </div>

                <div class="p-5">
                    <h2 class="text-xl font-bold text-gray-900 mb-1 leading-snug">{{ previewItem.title }}</h2>
                    <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                        {{ previewItem.type }} • {{ previewItem.year }}
                    </p>

                    <p class="text-gray-600 text-sm leading-relaxed mb-4">
                        {{ previewItem.short }}
                    </p>

                    <div v-if="previewItem.tags.length" class="flex flex-wrap gap-2 mb-4">
                        <span v-for="tag in previewItem.tags" :key="tag" class="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-md font-medium">
                            {{ tag }}
                        </span>
                    </div>

                    <div v-if="previewItem.link_url" class="text-indigo-600 text-sm font-semibold flex items-center gap-1">
                        View Details &rarr;
                    </div>
                </div>
            </article>
        </div>
    </div>
  </section>
</template>
