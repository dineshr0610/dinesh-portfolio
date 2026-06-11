<template>
  <!--
    ✅ FIX: section is w-full with NO margin/padding here.
    The layout's <main> no longer adds px-4 (see default.vue fix).
    HeroScene (absolute inset-0) now perfectly covers this section.
    The content container inside uses max-w-[1600px] mx-auto px-4 lg:px-8
    so text/cards still have readable margins — independent of the 3D canvas.
  -->
  <section class="relative w-full min-h-[100svh] bg-[#0b0f1a] overflow-hidden">

    <!-- Atmospheric radial gradients (behind 3D canvas) -->
    <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(67,56,202,0.22),transparent_55%),radial-gradient(ellipse_at_center,rgba(37,99,235,0.10),transparent_60%)] pointer-events-none z-0"></div>

    <!-- 3D HeroScene — fills section exactly -->
    <ClientOnly>
      <HeroScene />
    </ClientOnly>

    <!-- Atmospheric orbs -->
    <div class="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-900/15 rounded-full filter blur-3xl opacity-50 pointer-events-none z-0"></div>
    <div class="absolute top-20 left-0 w-[300px] h-[300px] bg-violet-900/10 rounded-full filter blur-3xl opacity-40 pointer-events-none z-0"></div>

    <!-- Content layer — sits above 3D canvas -->
    <div class="max-w-[1600px] mx-auto px-4 lg:px-8 relative z-10">

      <!-- ═══ HERO ═══ -->
      <div class="grid md:grid-cols-2 gap-8 md:gap-16 items-center mb-16 md:mb-24">

        <!-- Left: Text + CTA -->
        <div class="text-center md:text-left pt-24 md:pt-28 lg:pt-32">
          <div class="inline-flex items-center gap-2 px-4 py-1.5 bg-white/[0.04] backdrop-blur border border-white/[0.08] rounded-full text-xs font-bold tracking-wide uppercase text-indigo-300 mb-6 cursor-default">
            <span class="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
            Welcome to my portfolio
          </div>

          <h1 class="text-4xl md:text-6xl lg:text-7xl font-black leading-tight text-slate-100 mb-6 animate-appear tracking-tight">
            Hi, I'm <span class="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-violet-400">Dinesh R</span>
          </h1>

          <p class="text-lg md:text-xl text-slate-300 max-w-lg leading-relaxed mb-8 mx-auto md:mx-0 font-light">
            M.Tech CSE Student &amp; Frontend Developer.<br class="hidden md:block">
            Building functional, beautiful web apps &amp; exploring AI.
          </p>

          <div class="flex flex-wrap gap-3 justify-center md:justify-start">
            <NuxtLink
              to="/about"
              class="px-7 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 hover:-translate-y-0.5 transition-all shadow-lg shadow-indigo-900/40"
            >
              About Me
            </NuxtLink>
            <NuxtLink
              to="/ask"
              class="px-7 py-3 rounded-xl bg-white/[0.06] border border-white/[0.10] text-slate-300 font-semibold hover:bg-white/[0.10] hover:text-slate-100 transition-all group"
            >
              Ask My AI <span class="group-hover:translate-x-1 inline-block transition-transform">🤖</span>
            </NuxtLink>
            <a
              href="/Dinesh_Resume.pdf"
              target="_blank"
              class="px-7 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-400 font-semibold hover:text-slate-200 hover:bg-white/[0.08] transition-all"
            >
              Resume
            </a>
          </div>

          <!-- Quick Tags -->
          <div class="mt-8 flex flex-wrap gap-2 justify-center md:justify-start">
            <span class="px-3 py-1 bg-white/[0.04] border border-white/[0.06] rounded-lg text-sm font-medium text-slate-400">🌐 Web Dev</span>
            <span class="px-3 py-1 bg-white/[0.04] border border-white/[0.06] rounded-lg text-sm font-medium text-slate-400">🧠 Applied AI</span>
            <span class="px-3 py-1 bg-white/[0.04] border border-white/[0.06] rounded-lg text-sm font-medium text-slate-400">🎓 Student</span>
          </div>
        </div>

        <!-- Right: Chitti AI label + floating identity card -->
        <!--
          On desktop the 3D scene renders its neural dashboard in this right column.
          We overlay a minimal label so the viewer knows what they're seeing,
          plus a floating identity card (portrait + status) anchored to the bottom.
          On mobile the scene is centred and the card stacks below the text.
        -->
        <div class="relative flex flex-col items-center justify-end md:justify-center pt-16 md:pt-28 lg:pt-32 pb-10 min-h-[340px] md:min-h-0">

          <!-- Chitti AI title label — floats above the 3D scene area -->
          <div class="hidden md:flex flex-col items-center mb-4 self-center mt-auto">
            <div class="px-4 py-1.5 bg-indigo-600/[0.12] backdrop-blur-sm border border-indigo-500/25 rounded-full text-xs font-bold tracking-widest uppercase text-indigo-300 mb-2">
              ✦ CHITTI AI
            </div>
            <p class="text-[11px] text-slate-500 tracking-wider uppercase font-semibold">Holographic Neural Dashboard</p>
          </div>

          <!-- Floating identity card (portrait + status badge) -->
          <div class="relative z-10 w-48 h-60 sm:w-56 sm:h-72 md:w-60 md:h-[300px] animate-float">
            <!-- Glow -->
            <div class="absolute inset-0 bg-gradient-to-br from-indigo-600/15 to-violet-600/15 rounded-[24px] blur-2xl opacity-70 animate-pulse-slow"></div>

            <!-- Portrait card -->
            <div class="relative z-10 w-full h-full overflow-hidden rounded-[20px] border border-white/[0.10] shadow-[0_0_50px_rgba(99,102,241,0.10)] bg-black/25">
              <img
                src="/images/profile.jpeg"
                alt="Dinesh R"
                class="w-full h-full object-cover object-top block"
              />
              <div class="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/65 to-transparent"></div>
              <!-- Name overlay -->
              <div class="absolute bottom-3 left-0 right-0 text-center">
                <span class="text-xs font-bold text-slate-200 tracking-wide">Dinesh R</span>
              </div>
            </div>

            <!-- Status badge -->
            <div class="absolute -bottom-4 -left-4 md:-left-6 z-20 bg-[#0e1220]/95 backdrop-blur-md p-3 rounded-xl shadow-xl border border-white/[0.08] animate-bounce-slow flex items-center gap-2.5 pr-4">
              <div class="w-7 h-7 rounded-full bg-green-900/40 border border-green-500/30 flex items-center justify-center text-sm shadow-inner flex-shrink-0">⚡</div>
              <div>
                <div class="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Status</div>
                <div class="text-xs font-bold text-slate-100">Open to Work</div>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- ═══ CONTENT GRID ═══ -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">

        <!-- Featured Projects -->
        <div class="flex flex-col">
          <div class="flex items-center justify-between mb-4 px-1">
            <h2 class="text-lg font-bold text-slate-100 tracking-tight flex items-center gap-2">
              <span>🚀</span> Featured Work
            </h2>
            <NuxtLink to="/about" class="text-indigo-400 font-bold text-xs bg-indigo-500/[0.08] border border-indigo-500/20 px-3 py-1.5 rounded-full hover:bg-indigo-500/[0.14] transition-colors uppercase tracking-wide">
              View All
            </NuxtLink>
          </div>

          <div class="flex-1 space-y-3 flex flex-col">
            <template v-if="featured.length">
              <article
                v-for="p in featured"
                :key="p.id"
                class="bg-white/[0.03] rounded-xl border border-white/[0.06] hover:bg-white/[0.05] hover:border-indigo-500/20 transition-all duration-300 flex overflow-hidden min-h-[8rem] group"
              >
                <div class="relative w-28 md:w-36 flex-shrink-0 bg-black/20 overflow-hidden">
                  <img v-if="p.image" :src="p.image" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div v-else class="w-full h-full flex items-center justify-center text-slate-600 text-2xl">🖼️</div>
                </div>
                <div class="p-3 md:p-4 flex-1 flex flex-col justify-center min-w-0">
                  <div class="flex justify-between items-start gap-2 mb-1">
                    <h3 class="font-bold text-sm text-slate-100 group-hover:text-indigo-300 truncate transition-colors leading-tight">{{ p.title }}</h3>
                    <span class="text-[9px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider flex-shrink-0"
                      :class="p.ongoing ? 'bg-green-900/30 text-green-300' : 'bg-white/[0.05] text-slate-500'">
                      {{ p.ongoing ? 'Active' : 'Done' }}
                    </span>
                  </div>
                  <div class="text-[10px] text-slate-500 font-medium tracking-wide mb-2">{{ formatDuration(p) }}</div>
                  <p class="text-slate-400 text-xs mb-3 line-clamp-2 leading-relaxed" v-html="p.short"></p>
                  <div class="flex items-center justify-between mt-auto">
                    <div class="flex gap-1 overflow-hidden">
                      <span v-for="t in (p.tech || []).slice(0, 3)" :key="t" class="px-1.5 py-0.5 bg-white/[0.04] text-slate-500 text-[10px] rounded border border-white/[0.06] whitespace-nowrap">{{ t }}</span>
                    </div>
                    <NuxtLink :to="`/about#project-${p.id}`" class="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 group/link whitespace-nowrap bg-indigo-500/[0.06] px-2 py-1 rounded-md">
                      Details <span class="group-hover/link:translate-x-0.5 transition-transform">→</span>
                    </NuxtLink>
                  </div>
                </div>
              </article>
            </template>
            <div v-else class="flex-1 flex items-center justify-center py-10 text-center text-slate-500 bg-white/[0.02] rounded-2xl border border-white/[0.04] border-dashed">
              <p>No featured projects yet.</p>
            </div>
          </div>
        </div>

        <!-- Timeline & Achievements -->
        <div class="flex flex-col gap-6 lg:h-full">
          <!-- Timeline -->
          <div class="flex flex-col flex-1">
            <div class="flex items-center justify-between mb-4 px-1">
              <h2 class="text-lg font-bold text-slate-100 tracking-tight flex items-center gap-2">
                <span>⏳</span> Timeline
              </h2>
              <NuxtLink to="/timeline" class="text-indigo-400 font-bold text-xs bg-indigo-500/[0.08] border border-indigo-500/20 px-3 py-1.5 rounded-full hover:bg-indigo-500/[0.14] transition-colors uppercase tracking-wide">
                Full Story
              </NuxtLink>
            </div>
            <div class="bg-white/[0.03] rounded-2xl border border-white/[0.06] p-5 flex-1">
              <div class="relative pl-4 border-l border-white/[0.08] space-y-6 py-1">
                <div v-for="(item, index) in (timeline || []).slice(0, 3)" :key="item.id || index" class="relative">
                  <div class="absolute -left-[17px] top-1.5 w-2.5 h-2.5 rounded-full bg-indigo-500 ring-4 ring-[#0b0f1a]"></div>
                  <div class="text-[10px] font-bold text-indigo-400 mb-0.5 uppercase tracking-wider">{{ item.year }}</div>
                  <h4 class="font-bold text-slate-100 text-sm leading-snug mb-1">{{ item.title }}</h4>
                  <p class="text-slate-400 text-xs leading-relaxed line-clamp-2">{{ item.description }}</p>
                </div>
                <div v-if="!timeline?.length" class="text-slate-500 italic text-sm">No timeline entries yet.</div>
              </div>
            </div>
          </div>

          <!-- Achievements -->
          <div class="flex flex-col flex-1">
            <div class="flex items-center justify-between mb-4 px-1">
              <h2 class="text-lg font-bold text-slate-100 tracking-tight flex items-center gap-2">
                <span>🏆</span> Achievements
              </h2>
              <NuxtLink to="/achievements" class="text-indigo-400 font-bold text-xs bg-indigo-500/[0.08] border border-indigo-500/20 px-3 py-1.5 rounded-full hover:bg-indigo-500/[0.14] transition-colors uppercase tracking-wide">
                View All
              </NuxtLink>
            </div>
            <div class="bg-white/[0.03] rounded-2xl border border-white/[0.06] p-5 flex-1">
              <div class="space-y-3">
                <div v-for="ach in (achievements || []).slice(0, 3)" :key="ach.id" class="flex gap-3 p-3 rounded-xl hover:bg-white/[0.04] transition-colors items-start">
                  <div class="w-9 h-9 rounded-full bg-amber-900/30 border border-amber-500/20 flex items-center justify-center text-base flex-shrink-0">
                    {{ ach.icon || '🏆' }}
                  </div>
                  <div>
                    <h4 class="font-bold text-slate-100 text-sm leading-snug mb-0.5">{{ ach.title }}</h4>
                    <div class="text-[10px] text-slate-500 font-bold uppercase tracking-wide">{{ ach.year }} · {{ ach.type }}</div>
                  </div>
                </div>
                <div v-if="!achievements?.length" class="text-slate-500 italic text-sm">No achievements yet.</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Social Highlights -->
        <div class="flex flex-col lg:h-full">
          <div class="flex items-center justify-between mb-4 px-1">
            <h2 class="text-lg font-bold text-slate-100 tracking-tight flex items-center gap-2">
              <span>📱</span> Social Highlights
            </h2>
          </div>
          <div class="flex-1 w-full overflow-hidden">
            <SocialCarousel class="w-full lg:h-full" />
          </div>
        </div>

        <!-- Gallery & Dinesh Now -->
        <div class="flex flex-col gap-6 lg:h-full">
          <!-- Gallery -->
          <div class="flex flex-col flex-1">
            <div class="flex items-center justify-between mb-4 px-1">
              <h2 class="text-lg font-bold text-slate-100 tracking-tight flex items-center gap-2">
                <span>📸</span> Gallery
              </h2>
              <NuxtLink to="/gallery" class="text-indigo-400 font-bold text-xs bg-indigo-500/[0.08] border border-indigo-500/20 px-3 py-1.5 rounded-full hover:bg-indigo-500/[0.14] transition-colors uppercase tracking-wide">
                View All
              </NuxtLink>
            </div>
            <div class="bg-white/[0.03] rounded-2xl border border-white/[0.06] p-5 flex-1">
              <div class="grid grid-cols-2 gap-3">
                <template v-if="galleryThumbs.length">
                  <NuxtLink to="/gallery" v-for="g in galleryThumbs.slice(0, 4)" :key="g.id" class="aspect-square rounded-xl overflow-hidden relative group cursor-zoom-in border border-white/[0.06]">
                    <img :src="getThumb(g)" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div class="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <span class="text-white text-[10px] font-bold uppercase tracking-widest">View</span>
                    </div>
                  </NuxtLink>
                </template>
                <div v-else class="col-span-2 py-8 text-center text-slate-500 border border-dashed border-white/[0.06] rounded-xl">
                  Gallery is empty
                </div>
              </div>
            </div>
          </div>

          <!-- Dinesh Now -->
          <div class="flex flex-col flex-1">
            <div class="flex items-center justify-between mb-4 px-1">
              <h2 class="text-lg font-bold text-slate-100 tracking-tight flex items-center gap-2">
                <span>⚡</span> Dinesh Now
              </h2>
              <NuxtLink to="/updates" class="text-indigo-400 font-bold text-xs bg-indigo-500/[0.08] border border-indigo-500/20 px-3 py-1.5 rounded-full hover:bg-indigo-500/[0.14] transition-colors uppercase tracking-wide">
                History
              </NuxtLink>
            </div>
            <div class="bg-white/[0.03] p-5 rounded-2xl border border-white/[0.06] flex-1 flex flex-col">
              <div class="flex items-center gap-2 mb-4 flex-shrink-0">
                <span class="relative flex h-2.5 w-2.5">
                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                </span>
                <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Latest Status</span>
              </div>
              <div v-if="updateLoading" class="py-6 flex justify-center flex-1 items-center">
                <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500"></div>
              </div>
              <div v-else-if="latestUpdate" class="flex-1 flex flex-col min-h-0">
                <div class="text-xs text-slate-500 mb-2 font-bold">{{ formatDate(latestUpdate.date) }}</div>
                <h4 class="font-bold text-base text-slate-100 mb-2 leading-snug">{{ latestUpdate.title }}</h4>
                <p class="text-sm text-slate-400 line-clamp-3 mb-4 leading-relaxed flex-1" v-html="latestUpdate.short || latestUpdate.body"></p>
                <NuxtLink to="/updates" class="text-sm font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors mt-auto pt-3 border-t border-white/[0.06]">
                  Read Update <span>→</span>
                </NuxtLink>
              </div>
              <div v-else class="text-sm text-slate-500 italic flex-1 flex items-center justify-center">No recent updates.</div>
            </div>
          </div>
        </div>
      </div>

      <!-- ═══ CTA BAND ═══ -->
      <div class="mt-10 bg-gradient-to-br from-indigo-900/60 to-violet-900/50 rounded-3xl p-7 md:p-10 border border-indigo-500/20 relative overflow-hidden group mb-10">

        <div class="absolute top-0 right-0 w-64 h-64 bg-indigo-500/[0.06] rounded-full blur-3xl group-hover:bg-indigo-500/[0.10] transition-colors duration-700"></div>
        <div class="absolute bottom-0 left-0 w-48 h-48 bg-violet-500/[0.08] rounded-full blur-3xl"></div>
        <div class="relative z-10 grid md:grid-cols-2 gap-8 items-center">
          <div class="text-center md:text-left space-y-5">
            <div class="text-5xl inline-block animate-bounce-slow">👋</div>
            <div>
              <h3 class="font-bold text-3xl md:text-4xl mb-3 tracking-tight text-slate-100">Let's Work Together</h3>
              <p class="text-slate-300 text-lg leading-relaxed max-w-lg">
                I'm currently open for new opportunities. Whether you have a question or just want to say hi, I'll get back to you.
              </p>
            </div>
            <NuxtLink to="/contact" class="inline-flex items-center gap-2 bg-white text-indigo-900 px-7 py-3.5 rounded-xl font-bold text-base hover:bg-slate-100 hover:scale-[1.02] transition-all duration-200 shadow-lg">
              Get In Touch
            </NuxtLink>
          </div>
          <!-- AI Robot embed -->
          <div class="relative h-[360px] w-full flex items-center justify-center">
            <div class="w-full h-full relative rounded-2xl overflow-hidden border border-white/[0.08] bg-black/20 backdrop-blur-sm group/ai cursor-pointer">
              <iframe
                src="https://my.spline.design/r4xbot-fEl4xoWrcG2t3Lc325gb5IUS/"
                frameborder="0"
                width="100%"
                height="100%"
                class="w-full h-full pointer-events-none"
              ></iframe>
              <NuxtLink to="/ask" class="absolute inset-0 z-20" aria-label="Chat with Dinesh AI"></NuxtLink>
              <div class="absolute bottom-4 left-0 right-0 text-center pointer-events-none z-10">
                <span class="px-3 py-1 bg-black/50 backdrop-blur text-xs font-bold rounded-full border border-white/10 group-hover/ai:bg-indigo-600 group-hover/ai:border-indigo-400 transition-colors text-white">
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
import HeroScene from '~/components/three/scenes/HeroScene.vue'

const { data: projects } = await useFetch('/api/projects')
const { data: updatesData, pending: updateLoading } = await useFetch('/api/public/updates')
const { data: galleryData } = await useFetch('/api/public/gallery')
const { data: timeline } = await useFetch('/api/public/timeline')
const { data: achievements } = await useFetch('/api/achievements')

const featured = computed(() => (projects.value || []).filter(p => !p.hidden).slice(0, 3))
const gallery = computed(() => galleryData.value || [])
const galleryThumbs = computed(() => gallery.value.slice(0, 6))

function getThumb(item) {
  return item.type === 'video' ? (item.poster || item.src) : item.src
}

const latestUpdate = computed(() => {
  const list = updatesData.value || []
  if (Array.isArray(list) && list.length > 0) {
    const first = list[0]
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
@keyframes appear {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}
.animate-appear { animation: appear 0.8s ease-out; }

@keyframes bounceSlow {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-5px); }
}
.animate-bounce-slow { animation: bounceSlow 3s infinite ease-in-out; }

@keyframes pulseSlow {
  0%, 100% { opacity: 0.6; }
  50%       { opacity: 0.9; }
}
.animate-pulse-slow { animation: pulseSlow 4s ease-in-out infinite; }

/* ✅ NEW: smooth float for the portrait card */
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50%       { transform: translateY(-8px); }
}
.animate-float { animation: float 5s ease-in-out infinite; }
</style>