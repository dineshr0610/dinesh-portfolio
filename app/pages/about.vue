<template>
  <section class="min-h-screen py-16 bg-slate-50">
    <div class="container mx-auto px-4 lg:px-8 max-w-6xl">
      <!-- Header Section -->
      <div class="grid md:grid-cols-3 gap-12 items-center mb-20 animate-fade-in-up">
        <div class="md:col-span-2 space-y-6">
          <div class="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold tracking-wide uppercase">
            About Me
          </div>
          <h1 class="text-4xl md:text-6xl font-black text-slate-900 leading-tight">
            Hello, I'm <span class="text-indigo-600">Dinesh R</span>.
          </h1>
          <p class="text-xl text-slate-600 leading-relaxed max-w-2xl">
            A 3rd Year CSE student, Web Developer, and AI enthusiast. I build responsive web apps with <span class="font-semibold text-slate-800">Vue/Nuxt</span> and explore applied AI with <span class="font-semibold text-slate-800">RAG & Embeddings</span>.
          </p>

          <div class="flex flex-wrap gap-4 pt-4">
            <NuxtLink to="/" class="inline-flex items-center gap-2 px-5 py-3 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all font-medium">
              ← Back to Home
            </NuxtLink>
            
            <a href="/resume.pdf" target="_blank" class="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-slate-900 text-white hover:bg-slate-800 hover:shadow-lg hover:-translate-y-0.5 transition-all font-medium">
              <span>View Resume (PDF)</span>
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
            </a>

            <!-- Socials -->
            <div class="flex items-center gap-2">
                <a href="https://github.com/dineshr0610" target="_blank" class="p-3 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-black hover:border-slate-400 transition-all" aria-label="GitHub">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.05-.015-2.055-3.33.72-4.035-1.605-4.035-1.605-.54-1.38-1.32-1.74-1.32-1.74-1.095-.75.09-.735.09-.735 1.2.075 1.83 1.23 1.83 1.23 1.08 1.83 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.545 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.285 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                </a>
                <a href="https://www.linkedin.com/in/dineshr0610" target="_blank" class="p-3 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-blue-600 hover:border-slate-400 transition-all" aria-label="LinkedIn">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </a>
            </div>
          </div>
        </div>

        <!-- Contact Card -->
        <aside class="bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-6 text-center border border-slate-100 relative overflow-hidden group">
          <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
          
          <div class="flex justify-center mb-6 relative">
             <div class="absolute inset-0 bg-indigo-100 rounded-full blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500"></div>
             <div class="relative z-10 w-32 h-32 rounded-full overflow-hidden shadow-lg ring-4 ring-white inset-0">
                 <ProfileImage class="w-full h-full object-cover" alt="Dinesh R headshot" />
             </div>
          </div>

          <h3 class="font-bold text-lg text-slate-900">Let's Connect</h3>
          <p class="mt-2 text-sm text-slate-500">Open for Internships & Projects</p>
          
          <div class="mt-6 space-y-4">
             <a href="mailto:dinesh2370049@ssn.edu.in" class="block bg-slate-50 hover:bg-slate-100 p-3 rounded-lg text-sm text-slate-700 font-medium transition-colors">
                 dinesh2370049@ssn.edu.in
             </a>
             <div class="grid grid-cols-2 gap-2 text-xs text-slate-500">
                <div class="bg-slate-50 p-2 rounded">📍 India</div>
                <div class="bg-slate-50 p-2 rounded">🌐 Remote Ready</div>
             </div>
          </div>
        </aside>
      </div>

      <!-- Skills Section -->
      <div class="grid md:grid-cols-3 gap-8 mb-20 animate-fade-in-up" style="animation-delay: 0.1s;">
          <div class="md:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
              <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
                 ⚡ Technical Arsenal
              </h2>
              <div class="flex flex-wrap gap-2">
                  <span v-for="skill in skills" :key="skill" class="px-3 py-1.5 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-200 transition-colors cursor-default">
                      {{ skill }}
                  </span>
              </div>
          </div>

          <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
               <h2 class="text-xl font-bold mb-4">🎓 Education</h2>
               <div>
                   <h3 class="font-semibold text-slate-900">SSN College of Engineering</h3>
                   <p class="text-sm text-indigo-600 font-medium mt-1">M.Tech (Integrated) CSE</p>
                   <p class="text-xs text-slate-500 mt-1">2023 — 2028</p>
               </div>
          </div>
      </div>

      <!-- Projects Section -->
      <div class="animate-fade-in-up" style="animation-delay: 0.2s;">
         <div class="flex items-center justify-between mb-8">
            <div>
              <h2 class="text-3xl font-bold text-slate-900">Selected Projects</h2>
              <p class="text-slate-500 mt-2">Some things I've built to solve problems.</p>
            </div>
         </div>

         <div v-if="projectsLoading" class="flex justify-center py-12">
            <div class="animate-spin rounded-full h-10 w-10 border-4 border-slate-200 border-t-indigo-600"></div>
         </div>
         
         <div v-else-if="projectsError" class="text-center py-12 text-red-600 bg-red-50 rounded-xl">
             Failed to load projects: {{ projectsError }}
         </div>

         <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <article 
                v-for="p in projects" 
                :key="p.id"
                class="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group overflow-hidden cursor-pointer"
                @click="openProject(p)"
            >
                <div class="relative h-48 bg-slate-100 overflow-hidden">
                    <img 
                      v-if="p.image" 
                      :src="p.image" 
                      class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div v-else class="w-full h-full flex items-center justify-center bg-slate-50 text-slate-300">
                        <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    </div>
                </div>

                <div class="p-6 flex-1 flex flex-col">
                    <div class="flex items-start justify-between mb-2">
                        <h3 class="font-bold text-xl text-slate-900 group-hover:text-indigo-600 transition-colors">{{ p.title }}</h3>
                        <span class="text-[10px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider" :class="p.ongoing ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'">
                            {{ p.ongoing ? 'ONGOING' : 'DONE' }}
                        </span>
                    </div>

                    <div class="text-xs text-slate-500 mb-3 font-medium">
                        {{ formatDuration(p) }}
                    </div>

                    <p class="text-slate-600 text-sm mb-4 line-clamp-3 leading-relaxed flex-1" v-html="p.short"></p>
                    
                    <div class="flex flex-wrap gap-2 mt-auto pt-4 border-t border-slate-50">
                        <span v-for="t in (p.tech || []).slice(0, 3)" :key="t" class="px-2 py-1 bg-slate-50 text-slate-600 text-xs font-medium rounded">
                            {{ t }}
                        </span>
                        <span v-if="(p.tech || []).length > 3" class="px-2 py-1 bg-slate-50 text-slate-400 text-xs rounded">+{{ p.tech.length - 3 }}</span>
                    </div>
                </div>
            </article>
         </div>
      </div>

      <!-- Project Modal -->
      <Transition name="modal">
        <div v-if="activeProject" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" @click.self="closeProject">
            <div class="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative animate-in zoom-in-95 duration-200">
                <!-- Close Button -->
                <button @click="closeProject" class="absolute top-4 right-4 p-2 rounded-full bg-white/80 hover:bg-slate-100 transition shadow-sm z-10">
                    <svg class="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>

                <div class="grid md:grid-cols-2">
                    <!-- Image Side -->
                    <div class="bg-black md:h-full min-h-[300px] relative flex items-center justify-center">
                        <img v-if="activeProject.image" :src="activeProject.image" class="w-full h-full object-contain max-h-[500px]" />
                        <div v-else class="text-white/30">No Image</div>
                    </div>

                    <!-- Content Side -->
                    <div class="p-8 md:p-10">
                        <div class="flex justify-between items-start mb-2">
                             <h2 class="text-3xl font-bold text-slate-900">{{ activeProject.title }}</h2>
                             <span class="text-xs px-2 py-1 rounded uppercase font-bold tracking-wider" :class="activeProject.ongoing ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'">
                                 {{ activeProject.ongoing ? 'ONGOING' : 'Completed' }}
                             </span>
                        </div>
                        
                        <p class="text-sm text-slate-500 font-medium mb-4">
                            {{ formatDuration(activeProject) }}
                        </p>

                        <div class="flex flex-wrap gap-2 mb-6">
                            <span v-for="t in activeProject.tech || []" :key="t" class="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wide rounded">
                                {{ t }}
                            </span>
                        </div>

                        <div class="prose prose-slate prose-sm max-w-none text-slate-600 mb-8" v-html="activeProject.long || activeProject.short"></div>

                        <div class="flex gap-4">
                            <a v-if="activeProject.demo" :href="activeProject.demo" target="_blank" class="flex-1 text-center bg-indigo-600 text-white px-4 py-3 rounded-lg font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200">
                                Launch Demo
                            </a>
                            <a v-if="activeProject.repo" :href="activeProject.repo" target="_blank" class="flex-1 text-center bg-white border border-slate-200 text-slate-700 px-4 py-3 rounded-lg font-bold hover:bg-slate-50 transition">
                                View Code
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </Transition>

    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import ProfileImage from '~/components/ProfileImage.vue'

const skills = [
    'HTML', 'CSS', 'JavaScript', 'Vue.js', 'Nuxt 3', 'TailwindCSS', 
    'Node.js', 'Express', 'MongoDB', 'Python', 'Flask', 'Git', 
    'RAG', 'Embeddings', 'OpenAI API'
]

const projects = ref([])
const projectsLoading = ref(true)
const projectsError = ref(null)
const activeProject = ref(null)

// Fetch projects
onMounted(async () => {
  try {
    projects.value = await $fetch('/api/projects')
  } catch (err) {
    projectsError.value = 'Could not load projects.'
    console.error(err)
  } finally {
    projectsLoading.value = false
  }
})

function formatDuration(p) {
  if (p.ongoing) return `${p.started_at} – Present`
  return `${p.started_at} – ${p.ended_at}`
}

// Modal Logic
const openProject = (p) => {
    activeProject.value = p
    document.body.style.overflow = 'hidden' // prevent body scroll
}
const closeProject = () => {
    activeProject.value = null
    document.body.style.overflow = ''
}

// Close on Escape
onMounted(() => {
    const handler = (e) => { if(e.key === 'Escape') closeProject() }
    window.addEventListener('keydown', handler)
    onBeforeUnmount(() => window.removeEventListener('keydown', handler))
})
</script>

<style scoped>
/* Fade In Up */
@keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in-up {
    animation: fadeInUp 0.8s ease-out backwards;
}

/* Modal Transition */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
