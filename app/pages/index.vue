<!-- app/pages/index.vue -->
<template>
  <section class="py-16">
    <div class="container mx-auto px-4 lg:px-8">
      <!-- HERO -->
      <div class="grid md:grid-cols-2 gap-8 items-center">
        <div>
          <h1 class="text-4xl md:text-5xl font-extrabold leading-tight animate-appear">
            Hi — I’m Dinesh R
          </h1>
          <p class="mt-4 text-lg text-slate-600 max-w-2xl">
            M.Tech CSE • Frontend & Full-Stack developer • Building AI-enabled portfolio & music apps.
          </p>

          <div class="mt-6 flex flex-wrap gap-3">
            <NuxtLink to="/about" class="inline-flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-400">
              About Me
            </NuxtLink>

            <NuxtLink to="/ask" class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 text-white hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-indigo-400">
              Ask My AI
            </NuxtLink>

            <NuxtLink to="/contact" class="inline-flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-400">
              Contact
            </NuxtLink>

            <!-- Resume actions -->
            <NuxtLink to="/resume" class="inline-flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-400">
              View Resume
            </NuxtLink>

            <a
              href="/resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 text-white hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              Download Resume
            </a>
          </div>

          <!-- small highlights -->
          <div class="mt-8 flex flex-wrap gap-3">
            <span class="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 rounded text-sm">🌐 Web Dev</span>
            <span class="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 rounded text-sm">🧠 AI experiments</span>
            <span class="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 rounded text-sm">🎵 Music apps</span>
            <span class="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 rounded text-sm">🤝 Volunteer</span>
          </div>
        </div>

        <!-- small profile card -->
        <aside class="bg-white shadow rounded-lg p-5">
          <!-- Profile image inserted here -->
          <div class="flex justify-center">
            <!-- corrected to Vue's `class` attribute and added rounded-full -->
            <ProfileImage class="w-24 h-24 ring-2 ring-slate-100 rounded-full" alt="Dinesh R headshot" />
          </div>

          <h3 class="text-sm font-medium text-slate-700 mt-3">Quick Info</h3>
          <div class="mt-3 text-sm text-slate-600 space-y-2">
            <div><strong>Location:</strong> India</div>
            <div><strong>Education:</strong> SSN College — M.Tech (Integrated)</div>
            <div><strong>Looking for:</strong> Internships (Web / ML)</div>
            <div class="mt-2">
              <a href="mailto:dinesh2370049@ssn.edu.in" class="text-sm text-slate-900 underline">Email me</a>
            </div>
          </div>
        </aside>
      </div>

      <!-- TWO-COLUMN AREA -->
      <div class="mt-12 grid lg:grid-cols-3 gap-8">
        <!-- Featured projects (2) -->
        <div class="lg:col-span-2">
          <div class="flex items-center justify-between">
            <h2 class="text-2xl font-semibold">Featured Projects</h2>
            <NuxtLink to="/about" class="text-sm text-slate-600 hover:underline">See all projects →</NuxtLink>
          </div>

          <div class="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <article
              v-for="p in featured"
              :key="p.id"
              class="bg-white rounded-lg shadow overflow-hidden flex flex-col hover:shadow-lg transition-shadow"
            >
              <div class="relative h-40 bg-slate-100">
                <img v-if="p.image" :src="p.image" alt="" class="w-full h-full object-cover" loading="lazy" />
                <div v-else class="w-full h-full flex items-center justify-center text-slate-400">No image</div>
              </div>

              <div class="p-4 flex-1 flex flex-col">
                <h3 class="font-semibold text-lg">{{ p.title }}</h3>
                <p class="text-sm text-slate-600 mt-2 flex-1 line-clamp-3" v-html="p.short"></p>

                <div class="mt-4 flex items-center justify-between">
                  <div class="text-xs flex flex-wrap gap-2">
                    <span v-for="t in (p.tech || []).slice(0,3)" :key="t" class="px-2 py-1 bg-slate-100 rounded text-xs">{{ t }}</span>
                  </div>

                  <div class="flex items-center gap-2">
                    <a v-if="p.demo" :href="p.demo" target="_blank" class="text-sm underline">Demo</a>
                    <a v-if="p.repo" :href="p.repo" target="_blank" class="text-sm underline">Code</a>
                    <NuxtLink :to="`/about#project-${p.id}`" class="text-sm px-3 py-1 border rounded">Details</NuxtLink>
                  </div>
                </div>
              </div>
            </article>

            <!-- placeholder card if none -->
            <div v-if="featured.length === 0" class="col-span-full text-center text-slate-500 py-12 bg-white rounded shadow">
              No projects found — add items to public/data/projects.json
            </div>
          </div>
        </div>

        <!-- Sidebar: Latest update + gallery tiny -->
        <div>
          <div class="bg-white rounded-lg shadow p-4">
            <h4 class="font-semibold">Latest — Dinesh Now</h4>
            <div v-if="updateLoading" class="mt-4 text-sm text-slate-500">Loading…</div>
            <div v-else-if="latestUpdate" class="mt-3 text-sm text-slate-700">
              <div class="text-sm font-medium">{{ latestUpdate.title }}</div>
              <div class="text-xs text-slate-500">{{ formatDate(latestUpdate.date) }}</div>
              <p class="mt-2 line-clamp-4" v-html="latestUpdate.short || latestUpdate.body"></p>
              <div class="mt-3">
                <NuxtLink to="/updates" class="text-sm underline">Read all updates →</NuxtLink>
              </div>
            </div>
            <div v-else class="mt-4 text-sm text-slate-500">No updates yet — use admin to post.</div>
          </div>

          <div class="mt-4 bg-white rounded-lg shadow p-4">
            <h4 class="font-semibold">Gallery — Latest photos</h4>
            <div class="mt-3 grid grid-cols-3 gap-2">
              <a v-for="g in galleryThumbs" :key="g.id" :href="g.image || '#'" target="_blank" class="block">
                <img :src="g.image || '/gallery/placeholder.svg'" alt="" class="w-full h-20 object-cover rounded" loading="lazy" />
              </a>

              <div v-if="galleryThumbs.length === 0" class="col-span-3 text-center text-slate-500 py-4">
                No gallery images — add files to /public/gallery and items to /public/data/gallery.json
              </div>
            </div>
            <div class="mt-3">
              <NuxtLink to="/gallery" class="text-sm underline">Open gallery →</NuxtLink>
            </div>
          </div>
        </div>
      </div>

      <!-- CTA -->
      <div class="mt-12 text-center">
        <h3 class="text-xl font-semibold">Like what you see?</h3>
        <p class="mt-2 text-slate-600">I’m available for internships and small freelance projects.</p>
        <div class="mt-4">
          <NuxtLink to="/contact" class="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-slate-900 text-white focus:outline-none focus:ring-2 focus:ring-indigo-400">Get in touch</NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import ProfileImage from '~/components/ProfileImage.vue'

const projects = ref([])
const featured = ref([])
const gallery = ref([])
const galleryThumbs = computed(() => gallery.value.slice(0, 3))
const latestUpdate = ref(null)
const updateLoading = ref(true)

function formatDate(d) {
  if (!d) return ''
  try {
    const dt = new Date(d)
    if (isNaN(dt.getTime())) return d
    return dt.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
  } catch {
    return d
  }
}

async function loadProjects() {
  try {
    const res = await fetch('/data/projects.json', { cache: 'no-store' })
    if (!res.ok) throw new Error('No projects.json')
    const json = await res.json()
    if (Array.isArray(json)) {
      projects.value = json
      const fav = json.filter(p => p.featured).slice(0,2)
      if (fav.length > 0) featured.value = fav
      else featured.value = json.slice(0,2)
    } else {
      projects.value = []
      featured.value = []
    }
  } catch (e) {
    console.warn('loadProjects error', e)
    projects.value = []
    featured.value = []
  }
}

async function loadGallery() {
  try {
    const res = await fetch('/data/gallery.json', { cache: 'no-store' })
    if (!res.ok) throw new Error('No gallery.json')
    const json = await res.json()
    gallery.value = Array.isArray(json) ? json : []
  } catch (e) {
    console.warn('loadGallery error', e)
    gallery.value = []
  }
}

async function loadUpdates() {
  updateLoading.value = true
  try {
    const res = await fetch('/data/updates.json', { cache: 'no-store' })
    if (!res.ok) throw new Error('No updates.json')
    const json = await res.json()
    if (Array.isArray(json) && json.length > 0) {
      latestUpdate.value = json[0]
    } else latestUpdate.value = null
  } catch (e) {
    console.warn('loadUpdates error', e)
    latestUpdate.value = null
  } finally {
    updateLoading.value = false
  }
}

onMounted(() => {
  loadProjects()
  loadGallery()
  loadUpdates()
})
</script>

<style scoped>
.container { max-width: 1100px; }
.line-clamp-3 { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
.line-clamp-4 { display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden; }

/* subtle heading appear animation */
@keyframes appear {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-appear { animation: appear .6s ease both; }
</style>
