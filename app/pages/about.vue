<!-- app/pages/about.vue -->
<template>
  <section class="py-12">
    <div class="container mx-auto px-4 lg:px-8">
      <!-- Hero / header -->
      <div class="grid md:grid-cols-3 gap-8 items-center">
        <div class="md:col-span-2">
          <h1 class="text-4xl font-extrabold">About — Dinesh R</h1>
          <p class="mt-3 text-slate-600 max-w-2xl">
            3rd Year CSE student • Web Developer & AI enthusiast.
            Building responsive web apps with Vue / Nuxt and exploring applied AI (RAG + embeddings).
          </p>

          <div class="mt-6 flex flex-wrap gap-3">
            <NuxtLink to="/" class="inline-flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-slate-50">
              ← Back to Home
            </NuxtLink>

            <!-- View / Download resume -->
            <a
  href="/resume.pdf"
  target="_blank"
  rel="noopener noreferrer"
  class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 text-white hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-indigo-400"
>
  View Resume (PDF)
</a>


            <a
              href="https://github.com/dineshr0610"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-slate-50"
            >
              GitHub
            </a>

            <a
              href="https://www.linkedin.com/in/dineshr0610"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-slate-50"
            >
              LinkedIn
            </a>
          </div>
        </div>

        <!-- Contact card -->
        <aside class="bg-white shadow rounded-lg p-5 text-center">
          <!-- Profile image inserted here -->
          <div class="flex justify-center">
            <!-- ProfileImage forwards classes, so your class works fine -->
            <ProfileImage class="w-36 h-36 mb-4 rounded-full ring-2 ring-slate-100" alt="Dinesh R headshot" />
          </div>

          <h3 class="font-semibold">Contact</h3>
          <p class="mt-2 text-sm text-slate-600">Email</p>
          <a class="block mt-1 text-slate-900 font-medium" href="mailto:dinesh2370049@ssn.edu.in">
            dinesh2370049@ssn.edu.in
          </a>

          <div class="mt-4">
            <p class="text-sm text-slate-600">Location</p>
            <p class="mt-1 text-sm">India</p>
          </div>

          <div class="mt-4">
            <p class="text-sm text-slate-600">Looking for</p>
            <p class="mt-1 text-sm">Internships in Web Development / ML & AI</p>
          </div>
        </aside>
      </div>

      <!-- Skills & summary -->
      <div class="mt-10 grid md:grid-cols-3 gap-8">
        <div class="md:col-span-2 bg-white rounded-lg shadow p-6">
          <h2 class="text-xl font-semibold">Summary</h2>
          <p class="mt-3 text-slate-700">
            M.Tech (Integrated) CSE student with practical experience in frontend engineering and full-stack projects.
            I focus on building responsive, accessible interfaces with Vue/Nuxt and experimenting with applied AI features like RAG and embeddings.
          </p>

          <div class="mt-6">
            <h3 class="font-medium">Technical Skills</h3>
            <div class="mt-3 flex flex-wrap gap-2">
              <span class="px-2 py-1 rounded bg-slate-100 text-sm">HTML</span>
              <span class="px-2 py-1 rounded bg-slate-100 text-sm">CSS</span>
              <span class="px-2 py-1 rounded bg-slate-100 text-sm">JavaScript</span>
              <span class="px-2 py-1 rounded bg-slate-100 text-sm">Vue / Nuxt</span>
              <span class="px-2 py-1 rounded bg-slate-100 text-sm">Tailwind</span>
              <span class="px-2 py-1 rounded bg-slate-100 text-sm">Bootstrap</span>
              <span class="px-2 py-1 rounded bg-slate-100 text-sm">Node.js / Express</span>
              <span class="px-2 py-1 rounded bg-slate-100 text-sm">MongoDB</span>
              <span class="px-2 py-1 rounded bg-slate-100 text-sm">Python / Flask (ML)</span>
              <span class="px-2 py-1 rounded bg-slate-100 text-sm">Git</span>
              <span class="px-2 py-1 rounded bg-slate-100 text-sm">Cloudinary</span>
            </div>
          </div>

          <div class="mt-6 grid sm:grid-cols-2 gap-4">
            <div>
              <h4 class="text-sm font-medium text-slate-600">Education</h4>
              <div class="mt-2">
                <strong>SSN College of Engineering</strong>
                <div class="text-sm text-slate-600">M.Tech (Integrated), Computer Science & Engineering — 2023–2028</div>
              </div>
            </div>

            <div>
              <h4 class="text-sm font-medium text-slate-600">Certifications</h4>
              <ul class="mt-2 text-sm text-slate-700 space-y-1">
                <li>Build Your Own Static Website — NxtWave</li>
                <li>Build Your Own Responsive Website — NxtWave</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Volunteering -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-semibold">Volunteering & Leadership</h3>

          <div class="mt-4 space-y-4 text-sm text-slate-700">
            <div>
              <strong>Talent Quest for India (TQI)</strong>
              <div class="text-slate-500">Student Volunteer — communication & soft-skill sessions</div>
            </div>

            <div>
              <strong>National Service Scheme (NSS)</strong>
              <div class="text-slate-500">Event Organizer — community & environmental activities</div>
            </div>

            <div>
              <strong>National Green Corps (NGC)</strong>
              <div class="text-slate-500">Chairman (former) — environmental initiatives</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Projects (kept intact) -->
      <div class="mt-12">
        <div class="flex items-center justify-between">
          <h2 class="text-2xl font-bold">Selected Projects</h2>
          <NuxtLink to="/projects" class="text-sm text-slate-600 hover:underline">See all projects →</NuxtLink>
        </div>

        <div v-if="projectsLoading" class="text-center py-8 text-slate-500">Loading projects…</div>
        <div v-else-if="projectsError" class="text-center py-8 text-red-600">Failed to load projects: {{ projectsError }}</div>

        <div v-else class="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <article
            v-for="p in featuredProjects"
            :key="p.id"
            class="bg-white rounded-lg shadow overflow-hidden flex flex-col"
          >
            <div class="relative h-40">
              <img
                v-if="p.image"
                :src="p.image"
                alt="Screenshot of {{ p.title }}"
                class="w-full h-full object-cover"
                loading="lazy"
                width="640"
                height="160"
              />
              <div v-else class="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400">
                No image
              </div>
            </div>

            <div class="p-4 flex-1 flex flex-col">
              <h3 class="font-semibold text-lg">{{ p.title }}</h3>
              <p class="text-sm text-slate-600 mt-2 flex-1" v-html="p.short"></p>

              <div class="mt-4 flex items-center justify-between">
                <div class="text-xs flex flex-wrap gap-2">
                  <span v-for="t in (p.tech || []).slice(0,4)" :key="t" class="px-2 py-1 bg-slate-100 rounded">{{ t }}</span>
                </div>

                <div class="flex items-center gap-2">
                  <a v-if="p.demo" :href="p.demo" target="_blank" rel="noopener noreferrer" class="text-sm underline">Demo</a>
                  <a v-if="p.repo" :href="p.repo" target="_blank" rel="noopener noreferrer" class="text-sm underline">Code</a>
                  <button @click="openProject(p)" class="text-sm px-3 py-1 border rounded">Details</button>
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>

      <!-- Project modal (improved accessibility & escape-to-close) -->
      <div
        v-if="activeProject"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="'project-title-' + (activeProject?.id || 'modal')"
        @keydown.esc.prevent="closeProject"
        tabindex="-1"
        ref="modalRoot"
      >
        <div class="bg-white max-w-3xl w-full rounded shadow-lg p-6 overflow-auto max-h-[90vh]" role="document">
          <div class="flex items-start justify-between gap-4">
            <div>
              <h2 :id="'project-title-' + (activeProject?.id || 'modal')" class="text-xl font-bold">{{ activeProject.title }}</h2>
              <p class="text-sm text-slate-500 mt-1">{{ activeProject.short }}</p>
            </div>

            <div class="flex items-center gap-3">
              <a v-if="activeProject.demo" :href="activeProject.demo" target="_blank" rel="noopener noreferrer" class="text-sm underline">Demo</a>
              <a v-if="activeProject.repo" :href="activeProject.repo" target="_blank" rel="noopener noreferrer" class="text-sm underline">Repo</a>
              <button @click="closeProject" class="text-slate-600" aria-label="Close project details">Close</button>
            </div>
          </div>

          <img
            v-if="activeProject.image"
            :src="activeProject.image"
            alt="Image for {{ activeProject.title }}"
            class="mt-4 w-full h-56 object-cover rounded"
            loading="lazy"
            width="1024"
            height="360"
          />
          <div class="mt-4 text-slate-700" v-html="activeProject.long"></div>

          <div class="mt-4 flex flex-wrap gap-2">
            <span v-for="t in activeProject.tech || []" :key="t" class="px-2 py-1 bg-slate-100 rounded text-xs">{{ t }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import ProfileImage from '~/components/ProfileImage.vue'

const resumePdf = '/resume.pdf'

const projects = ref([])
const projectsLoading = ref(true)
const projectsError = ref(null)
const activeProject = ref(null)
const modalRoot = ref(null)

async function loadProjects() {
  projectsLoading.value = true
  projectsError.value = null
  try {
    const res = await fetch('/data/projects.json', { cache: 'no-store' })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json()
    if (!Array.isArray(json)) throw new Error('projects.json is not an array')
    projects.value = json
  } catch (err) {
    projects.value = []
    projectsError.value = err.message || String(err)
    console.error('Failed to load projects.json', err)
  } finally {
    projectsLoading.value = false
  }
}

onMounted(() => loadProjects())

const featuredProjects = computed(() => {
  const order = ['p0', 'p1', 'p2']
  const map = new Map(projects.value.map(p => [p.id, p]))
  const picked = order.map(id => map.get(id)).filter(Boolean)
  const rest = projects.value.filter(p => !order.includes(p.id)).slice(0, 6 - picked.length)
  return picked.concat(rest)
})

function openProject(p) {
  // safety: only open if object looks valid
  if (!p || typeof p !== 'object') return
  activeProject.value = p
  // focus modal root for keyboard support
  nextTick(() => {
    if (modalRoot.value && typeof modalRoot.value.focus === 'function') {
      modalRoot.value.focus()
    }
  })
}

function closeProject() {
  activeProject.value = null
}

onMounted(() => {
  // ensure Escape closes modal from anywhere
  const keyHandler = (e) => {
    if (e.key === 'Escape' || e.key === 'Esc') closeProject()
  }
  window.addEventListener('keydown', keyHandler)
  onBeforeUnmount(() => window.removeEventListener('keydown', keyHandler))
})
</script>

<style scoped>
.container { max-width: 1100px; }
/* keep existing visual layout */
</style>
