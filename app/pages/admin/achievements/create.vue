<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const form = reactive({
  title: '',
  short: '',
  long: '',
  type: 'certificate',
  achieved_at: '',
  image_url: '',
  link_url: '',
  media_type: 'none',
  media_src: '',
  media_poster: '',
  tags_input: '', // Comma separated string for input
  published: true
})

async function save() {
  // Transform data for API
  const payload = {
    title: form.title,
    short: form.short,
    long: form.long,
    type: form.type,
    achieved_at: form.achieved_at,
    image_url: form.image_url,
    link_url: form.link_url,
    published: form.published,
    
    // Process tags
    tags: form.tags_input.split(',').map(t => t.trim()).filter(t => t),

    // Process media
    media: form.media_type === 'none' ? null : {
      type: form.media_type,
      src: form.media_src,
      poster: form.media_poster
    }
  }

  await $fetch('/api/admin/achievements/create', {
    method: 'POST',
    body: payload
  })
  navigateTo('/admin/achievements')
}
</script>

<template>
  <section class="p-6 max-w-3xl">
    <h1 class="text-2xl font-bold mb-4">New Achievement</h1>

    <div class="space-y-4">
      <!-- Core Info -->
      <div class="grid grid-cols-2 gap-4">
        <div class="col-span-2">
          <label class="block text-sm font-bold mb-1">Title</label>
          <input v-model="form.title" class="input" placeholder="Achievement Title" />
        </div>

        <div>
           <label class="block text-sm font-bold mb-1">Type</label>
           <select v-model="form.type" class="input">
            <option value="certificate">Certificate</option>
            <option value="award">Award</option>
            <option value="hackathon">Hackathon</option>
            <option value="competition">Competition</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-bold mb-1">Date</label>
          <input v-model="form.achieved_at" type="date" class="input" />
        </div>
      </div>

      <!-- Content -->
      <div>
        <label class="block text-sm font-bold mb-1">Short Description *</label>
        <textarea v-model="form.short" class="input h-20" placeholder="Brief summary (card view)" required />
      </div>

      <div>
        <label class="block text-sm font-bold mb-1">Long Description</label>
        <textarea v-model="form.long" class="input h-32" placeholder="Detailed description (markdown allowed)" />
      </div>

      <!-- Links & Assets -->
      <div class="grid grid-cols-2 gap-4">
         <div>
          <label class="block text-sm font-bold mb-1">Image URL (Cover)</label>
          <input v-model="form.image_url" class="input" placeholder="https://..." />
        </div>
        <div>
          <label class="block text-sm font-bold mb-1">External Link</label>
          <input v-model="form.link_url" class="input" placeholder="https://..." />
        </div>
      </div>

      <!-- Media Config -->
      <div class="border p-4 rounded bg-gray-50">
        <h3 class="font-bold mb-2">Media Attachment</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm mb-1">Type</label>
             <select v-model="form.media_type" class="input">
              <option value="none">None</option>
              <option value="image">Image</option>
              <option value="video">Video</option>
            </select>
          </div>
          <div v-if="form.media_type !== 'none'" class="col-span-2 space-y-2">
            <input v-model="form.media_src" class="input" placeholder="Source URL" />
            <input v-model="form.media_poster" class="input" placeholder="Poster URL (optional)" />
          </div>
        </div>
      </div>

      <!-- Meta -->
      <div>
        <label class="block text-sm font-bold mb-1">Tags</label>
        <input v-model="form.tags_input" class="input" placeholder="hackathon, winner, ai (comma separated)" />
      </div>

      <label class="flex gap-2 items-center cursor-pointer">
        <input type="checkbox" v-model="form.published" class="w-4 h-4" />
        <span class="font-medium">Published</span>
      </label>

      <button
        @click="save"
        class="px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 font-medium"
      >
        Create Achievement
      </button>
    </div>
  </section>
</template>

<style scoped>
.input {
  width: 100%;
  border: 1px solid #ddd;
  padding: 8px 12px;
  border-radius: 6px;
  transition: border-color 0.2s;
}
.input:focus {
  border-color: #4f46e5;
  outline: none;
}
</style>
