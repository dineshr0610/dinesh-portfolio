<template>
  <section class="min-h-screen py-12 md:py-20 bg-slate-50 relative overflow-hidden">
    <!-- Background Decor -->
    <div class="absolute top-0 right-0 w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-indigo-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
    <div class="absolute top-20 left-0 w-[250px] h-[250px] md:w-[400px] md:h-[400px] bg-purple-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

    <div class="container mx-auto px-4 lg:px-8 relative z-10">
      <!-- HERO -->
      <div class="grid md:grid-cols-2 gap-8 md:gap-12 items-center mb-10 md:mb-24">
        <div class="order-2 md:order-1 text-center md:text-left">
          <div class="inline-flex items-center gap-2 px-4 py-1.5 bg-white/80 backdrop-blur border border-indigo-100 rounded-full text-xs font-bold tracking-wide uppercase text-indigo-600 mb-6 shadow-sm hover:shadow transition-shadow cursor-default">
             <span class="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
             Welcome to my portfolio
          </div>
          <h1 class="text-4xl md:text-7xl font-black leading-tight text-slate-900 mb-6 animate-appear tracking-tight">
            Hi, I’m <span class="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">Dinesh R</span>
          </h1>
          <p class="text-lg md:text-xl text-slate-600 max-w-lg leading-relaxed mb-8 mx-auto md:mx-0 font-light">
            M.Tech CSE Student & Frontend Developer. <br class="hidden md:block">Building functional, beautiful web apps & exploring AI.
          </p>

          <div class="flex flex-wrap gap-4 justify-center md:justify-start">
            <NuxtLink to="/about" class="px-8 py-3.5 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-800 hover:-translate-y-1 transition-all shadow-lg hover:shadow-slate-900/30">
              About Me
            </NuxtLink>

            <NuxtLink to="/ask" class="px-8 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-medium hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition-all shadow-sm group">
              Ask My AI <span class="group-hover:translate-x-1 inline-block transition-transform">🤖</span>
            </NuxtLink>
            
            <a href="/Dinesh_Resume.pdf" target="_blank" class="px-8 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm">
               Resume
            </a>
          </div>

          <!-- Quick Tags -->
          <div class="mt-8 flex flex-wrap gap-3 opacity-80 justify-center md:justify-start">
            <span class="px-3 py-1 bg-white/60 backdrop-blur border border-slate-200 rounded-lg text-sm font-medium text-slate-600">🌐 Web Dev</span>
            <span class="px-3 py-1 bg-white/60 backdrop-blur border border-slate-200 rounded-lg text-sm font-medium text-slate-600">🧠 Applied AI</span>
            <span class="px-3 py-1 bg-white/60 backdrop-blur border border-slate-200 rounded-lg text-sm font-medium text-slate-600">🎓 Student</span>
          </div>
        </div>

        <!-- Hero Image -->
        <div class="relative flex justify-center md:justify-end order-1 md:order-2 mb-8 md:mb-0">
            <div class="relative z-10 w-64 h-64 md:w-96 md:h-96 group perspective-1000">
               <div class="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full blur-3xl opacity-20 animate-pulse group-hover:opacity-30 transition-opacity"></div>
               <!-- Image Container -->
               <div class="relative z-10 w-full h-full rounded-2xl md:rounded-[2rem] overflow-hidden shadow-2xl ring-4 ring-white transition-transform duration-500 transform group-hover:rotate-y-12 group-hover:rotate-x-6 preserve-3d">
                   <ProfileImage class="w-full h-full object-cover" alt="Dinesh R Pattern" />
               </div>
               
               <!-- Floating Badge -->
               <div class="absolute -bottom-4 -left-4 md:-left-8 z-20 bg-white/95 backdrop-blur-md p-4 rounded-xl shadow-xl border border-white/50 animate-bounce-slow flex items-center gap-3 pr-6">
                   <div class="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-xl shadow-inner">⚡</div>
                   <div>
                       <div class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Status</div>
                       <div class="text-sm font-bold text-slate-900">Open to Work</div>
                   </div>
               </div>
            </div>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        
        <!-- Row 1 Left: Featured Projects -->
        <div class="h-full flex flex-col">
           <div class="flex items-center justify-between mb-4 px-1">
              <h2 class="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                 <span class="text-2xl">🚀</span> Featured Work
              </h2>
              <NuxtLink to="/about" class="text-indigo-600 font-bold text-xs bg-indigo-50 px-3 py-1.5 rounded-full hover:bg-indigo-100 transition-colors uppercase tracking-wide">
                  View All
              </NuxtLink>
           </div>

           <!-- Fixed Height Container to match Carousel -->
           <div class="flex-1 space-y-3 flex flex-col">
              <template v-if="featured.length">
                  <article 
                    v-for="p in featured" 
                    :key="p.id"
                    class="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-indigo-100 transition-all duration-300 flex overflow-hidden min-h-[9rem] h-auto md:h-36 group relative"
                  >
                      <!-- Image Section -->
                      <div class="relative w-28 md:w-36 flex-shrink-0 bg-slate-100 overflow-hidden">
                          <img v-if="p.image" :src="p.image" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          <div v-else class="w-full h-full flex items-center justify-center text-slate-400 bg-slate-50">
                              <span class="text-2xl opacity-20">🖼️</span>
                          </div>
                      </div>

                      <!-- Content Section -->
                      <div class="p-3 md:p-4 flex-1 flex flex-col justify-center min-w-0 relative">
                          <div class="mb-1">
                             <div class="flex justify-between items-start gap-2">
                                 <h3 class="font-bold text-base text-slate-900 group-hover:text-indigo-600 truncate transition-colors leading-tight" title="p.title">{{ p.title }}</h3>
                                 <span class="text-[9px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider flex-shrink-0" 
                                    :class="p.ongoing ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'">
                                      {{ p.ongoing ? 'Active' : 'Done' }}
                                  </span>
                             </div>
                             <div class="text-[10px] text-slate-400 font-medium tracking-wide uppercase">{{ formatDuration(p) }}</div>
                          </div>

                          <p class="text-slate-600 text-xs mb-3 line-clamp-2 leading-relaxed" v-html="p.short"></p>
                          
                          <div class="mt-auto flex items-center justify-between">
                              <div class="flex gap-1 overflow-hidden">
                                  <span v-for="t in (p.tech || []).slice(0, 3)" :key="t" class="px-1.5 py-0.5 bg-slate-50 text-slate-600 text-[10px] rounded border border-slate-100 whitespace-nowrap">{{ t }}</span>
                              </div>
                              <NuxtLink :to="`/about#project-${p.id}`" class="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 group/link whitespace-nowrap bg-indigo-50 px-2 py-1 roundex-md">Details <span class="group-hover/link:translate-x-1 transition-transform">→</span></NuxtLink>
                          </div>
                      </div>
                  </article>
              </template>
              <div v-else class="h-full flex items-center justify-center py-12 text-center text-slate-400 bg-white rounded-2xl border-2 border-slate-100 border-dashed">
                  <p>No featured projects yet.</p>
              </div>
           </div>
        </div>

        <!-- Row 1 Right: Timeline & Achievements Stack -->
        <div class="flex flex-col gap-8 lg:h-full">
            <!-- Timeline -->
            <div class="flex flex-col min-h-0 lg:flex-1">
                <div class="flex items-center justify-between mb-4 px-1">
                  <h2 class="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                     <span class="text-2xl">⏳</span> Timeline
                  </h2>
                  <NuxtLink to="/about" class="text-indigo-600 font-bold text-xs bg-indigo-50 px-3 py-1.5 rounded-full hover:bg-indigo-100 transition-colors uppercase tracking-wide">
                      Full Story
                  </NuxtLink>
               </div>
               
               <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:flex-1 lg:overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent h-auto overflow-visible">
                   <div class="relative pl-4 border-l-2 border-slate-100 space-y-8 py-2">
                      <div v-for="(item, index) in (timeline || []).slice(0, 3)" :key="item.id || index" class="relative">
                          <div class="absolute -left-[21px] top-1.5 w-3 h-3 rounded-full bg-indigo-500 ring-4 ring-white"></div>
                          <div class="text-[10px] font-bold text-indigo-500 mb-0.5 uppercase tracking-wider">{{ item.year }}</div>
                          <h4 class="font-bold text-slate-900 text-base leading-tight mb-1">{{ item.title }}</h4>
                          <p class="text-slate-600 text-xs leading-relaxed line-clamp-2">{{ item.description }}</p>
                      </div>
                      <div v-if="!timeline?.length" class="text-slate-400 italic text-sm">No timeline entries yet.</div>
                   </div>
               </div>
            </div>

            <!-- Achievements -->
            <div class="flex flex-col min-h-0 lg:flex-1">
                <div class="flex items-center justify-between mb-4 px-1">
                  <h2 class="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                     <span class="text-2xl">🏆</span> Achievements
                  </h2>
                  <NuxtLink to="/achievements" class="text-indigo-600 font-bold text-xs bg-indigo-50 px-3 py-1.5 rounded-full hover:bg-indigo-100 transition-colors uppercase tracking-wide">
                      View All
                  </NuxtLink>
               </div>
               
               <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:flex-1 lg:overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent h-auto overflow-visible">
                   <div class="space-y-4">
                       <div v-for="ach in (achievements || []).slice(0, 3)" :key="ach.id" class="flex gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 items-start">
                           <div class="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center text-lg flex-shrink-0 border border-yellow-100">
                               {{ ach.icon || '🏆' }}
                           </div>
                           <div>
                               <h4 class="font-bold text-slate-900 text-sm leading-tight mb-0.5">{{ ach.title }}</h4>
                               <div class="text-[10px] text-slate-500 font-bold uppercase tracking-wide">{{ ach.year }} • {{ ach.type }}</div>
                           </div>
                       </div>
                       <div v-if="!achievements?.length" class="text-slate-400 italic text-sm">No achievements yet.</div>
                   </div>
               </div>
            </div>
        </div>

        <!-- Row 2 Left: Social Highlights -->
        <div class="flex flex-col lg:h-full">
           <div class="flex items-center justify-between mb-4 px-1">
              <h2 class="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                 <span class="text-2xl">📱</span> Social Highlights
              </h2>
           </div>
           <div class="lg:flex-1 w-full overflow-hidden">
               <SocialCarousel class="w-full lg:h-full" />
           </div>
        </div>

        <!-- Row 2 Right: Gallery & Dinesh Now Stack -->
        <div class="flex flex-col gap-8 lg:h-full">
            <!-- Gallery -->
            <div class="flex flex-col min-h-0 lg:flex-1">
                <div class="flex items-center justify-between mb-4 px-1">
                  <h2 class="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                     <span class="text-2xl">📸</span> Gallery
                  </h2>
                  <NuxtLink to="/gallery" class="text-indigo-600 font-bold text-xs bg-indigo-50 px-3 py-1.5 rounded-full hover:bg-indigo-100 transition-colors uppercase tracking-wide">
                      View All
                  </NuxtLink>
               </div>

               <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:flex-1 flex flex-col justify-center overflow-hidden h-auto">
                   <div class="grid grid-cols-2 gap-3 lg:h-full lg:overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
                       <template v-if="galleryThumbs.length">
                          <NuxtLink to="/gallery" v-for="g in galleryThumbs.slice(0, 4)" :key="g.id" class="aspect-square rounded-xl overflow-hidden relative group cursor-zoom-in shadow-sm hover:shadow-md transition-all">
                              <img :src="getThumb(g)" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                              <div class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                  <span class="text-white text-[10px] font-bold uppercase tracking-widest">View</span>
                              </div>
                          </NuxtLink>
                       </template>
                       <div v-else class="col-span-2 py-8 text-center text-slate-400 border border-dashed border-slate-100 rounded-xl">
                           Gallery is empty
                       </div>
                   </div>
               </div>
            </div>

            <!-- Dinesh Now -->
            <div class="flex flex-col min-h-0 lg:flex-1">
                <div class="flex items-center justify-between mb-4 px-1">
                  <h2 class="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                     <span class="text-2xl">⚡</span> Dinesh Now
                  </h2>
                  <NuxtLink to="/updates" class="text-indigo-600 font-bold text-xs bg-indigo-50 px-3 py-1.5 rounded-full hover:bg-indigo-100 transition-colors uppercase tracking-wide">
                      History
                  </NuxtLink>
               </div>

               <div class="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group lg:flex-1 flex flex-col h-auto">
                    <div class="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-green-50 to-transparent rounded-bl-full -mr-8 -mt-8 opacity-50 group-hover:scale-110 transition-transform"></div>
                    <div class="relative z-10 flex flex-col lg:h-full lg:overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 pr-1 h-auto overflow-visible">
                        <div class="flex items-center gap-2 mb-4 flex-shrink-0">
                            <span class="relative flex h-3 w-3">
                              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                              <span class="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                            </span>
                            <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Latest Status</span>
                        </div>
                        
                        <div v-if="updateLoading" class="py-6 flex justify-center flex-1 items-center"><div class="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div></div>
                        <div v-else-if="latestUpdate" class="flex-1 flex flex-col min-h-0">
                            <div class="text-xs text-slate-400 mb-2 font-bold">{{ formatDate(latestUpdate.date) }}</div>
                            <h4 class="font-bold text-lg text-slate-800 mb-2 leading-tight group-hover:text-indigo-600 transition-colors">{{ latestUpdate.title }}</h4>
                            <p class="text-sm text-slate-600 line-clamp-3 mb-4 leading-relaxed flex-1" v-html="latestUpdate.short || latestUpdate.body"></p>
                            <NuxtLink to="/updates" class="text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 group-hover:gap-2 transition-all mt-auto pt-4 flex-shrink-0">Read Update <span>→</span></NuxtLink>
                        </div>
                        <div v-else class="text-sm text-slate-500 italic flex-1 flex items-center justify-center">No recent updates.</div>
                    </div>
                </div>
            </div>
        </div>

      </div>

      <!-- Row 4: Contact (Full Width) -->
      <!-- Row 4: Contact (Full Width) -->
      <div class="mt-8 bg-gradient-to-br from-indigo-800 to-purple-900 rounded-3xl p-6 md:p-8 text-white shadow-2xl shadow-indigo-900/20 relative overflow-hidden group">
          <div class="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
          <div class="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-black/20"></div>
          <!-- Decor Circles -->
          <div class="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-colors duration-700"></div>
          <div class="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl"></div>

          <div class="relative z-10 grid md:grid-cols-2 gap-8 items-center">
              <!-- Left: Text Content -->
              <div class="text-center md:text-left space-y-6">
                  <div class="text-5xl animate-bounce-slow inline-block">👋</div>
                  <div>
                    <h3 class="font-bold text-3xl md:text-4xl mb-4 tracking-tight">Let's Work Together</h3>
                    <p class="text-indigo-100 text-lg leading-relaxed opacity-90 max-w-lg">I'm currently open for new opportunities. Whether you have a question or just want to say hi, I'll try my best to get back to you!</p>
                  </div>
                  <div class="pt-4">
                    <NuxtLink to="/contact" class="inline-flex items-center gap-2 bg-white text-indigo-900 px-8 py-4 rounded-xl font-bold text-base hover:bg-slate-50 hover:shadow-lg hover:scale-105 transition-all duration-300">
                        Get In Touch
                    </NuxtLink>
                  </div>
              </div>

              <!-- Right: AI Character Embed -->
              <div class="relative h-[400px] w-full flex items-center justify-center">
                  <div class="w-full h-full relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-black/20 backdrop-blur-sm group/ai cursor-pointer">
                      <iframe 
                        src="https://my.spline.design/r4xbot-fEl4xoWrcG2t3Lc325gb5IUS/" 
                        frameborder="0" 
                        width="100%" 
                        height="100%"
                        class="w-full h-full pointer-events-none"
                      ></iframe>
                      
                      <!-- Transparent Overlay for Click Hijacking -->
                      <NuxtLink to="/ask" class="absolute inset-0 z-20" aria-label="Chat with Dinesh AI"></NuxtLink>

                      <!-- Overlay Guide -->
                      <div class="absolute bottom-4 left-0 right-0 text-center pointer-events-none z-10">
                          <span class="px-3 py-1 bg-black/40 backdrop-blur text-xs font-bold rounded-full border border-white/20 group-hover/ai:bg-indigo-600 group-hover/ai:border-indigo-400 transition-colors">
                              🤖 Ask me anything about Dinesh!
                          </span>
                      </div>
                  </div>
              </div>
          </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import ProfileImage from '~/components/ProfileImage.vue'

// Data Fetching
const { data: projects } = await useFetch('/api/projects')
// Renaming updateData -> updatesData to match existing computed property usage
const { data: updatesData, pending: updateLoading } = await useFetch('/api/public/updates')
const { data: galleryData } = await useFetch('/api/public/gallery')
const { data: timeline } = await useFetch('/api/public/timeline')
const { data: achievements } = await useFetch('/api/achievements')

const featured = computed(() => {
  return (projects.value || []).filter(p => !p.hidden).slice(0, 3) // Show top 3 horizontal cards
})

// Gallery
const gallery = computed(() => galleryData.value || [])
const galleryThumbs = computed(() => gallery.value.slice(0, 6)) // show up to 6 in grid

function getThumb(item) {
    return item.type === 'video' ? (item.poster || item.src) : item.src
}

// Updates - Computed
const latestUpdate = computed(() => {
  const list = updatesData.value || []
  if (Array.isArray(list) && list.length > 0) {
    const first = list[0]
    // The API might return 'date' or 'published_at', handle both
    const date = first.date || first.published_at || new Date().toISOString()
    return { ...first, date }
  }
  return null
})

function formatDate(d) {
  if (!d) return ''
  try { return new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) } 
  catch { return d }
}

function formatDuration(p) {
  if (p.ongoing) return `${p.started_at} – Present`
  return `${p.started_at} – ${p.ended_at}`
}
</script>

<style scoped>
@keyframes blob {
  0% { transform: translate(0px, 0px) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
  100% { transform: translate(0px, 0px) scale(1); }
}
.animate-blob { animation: blob 7s infinite; }
.animation-delay-2000 { animation-delay: 2s; }

@keyframes appear {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}
.animate-appear { animation: appear 0.8s ease-out; }

@keyframes bounceSlow {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-5px); }
}
.animate-bounce-slow { animation: bounceSlow 3s infinite ease-in-out; }
</style>
