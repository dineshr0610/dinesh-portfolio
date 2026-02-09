<script setup lang="ts">
/* same interface as before */
interface Achievement {
  id: number | string
  title: string
  short: string
  long: string | null
  type: string
  achieved_at: string
  year: string | number
  image_url: string | null
  link_url: string | null
  tags: string[] | null
  media: {
    type: 'image' | 'video'
    src: string
    poster?: string
  } | null
}

const { data: achievements, pending, error } = await useFetch<Achievement[]>('/api/achievements')

const grouped = computed(() => {
    if (!achievements.value) return []
    const map: Record<number, Achievement[]> = {}
    
    for (const item of achievements.value) {
        const year = new Date(item.achieved_at).getFullYear()
        // If year is invalid (e.g. invalid date), put in 'Unknown' or current year? 
        // We'll trust required 'achieved_at' is valid or fallback to 0.
        const y = isNaN(year) ? 9999 : year
        if (!map[y]) map[y] = []
        map[y].push(item)
    }

    return Object.entries(map).sort((a, b) => Number(b[0]) - Number(a[0]))
})

function getTypeIcon(type: string) {
    switch(type) {
        case 'certificate': return '📜'
        case 'award': return '🏆'
        case 'hackathon': return '💻'
        case 'competition': return '🥇'
        default: return '📌'
    }
}
</script>

<template>
  <section class="min-h-screen py-16 px-4 bg-slate-50">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-16 animate-fade-in-up">
        <h1 class="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Achievements</h1>
        <p class="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
          Milestones, hackathon wins, and certifications gained along the way.
        </p>
      </div>

      <!-- Loading / Error -->
      <div v-if="pending" class="flex justify-center py-20">
         <div class="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-indigo-600"></div>
      </div>
      <div v-else-if="error" class="text-center py-12 text-red-600">Failed to load achievements.</div>

      <!-- Grid -->
      <!-- Grid -->
      <div v-else>
        <section v-for="[year, items] in grouped" :key="year" class="mb-16">
          <h2 class="text-3xl font-bold text-slate-800 mb-8 flex items-center gap-3">
             <span class="opacity-30">#</span> {{ year }}
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <article
                v-for="item in items"
                :key="item.id"
                class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group"
            >
                 <!-- Media / Cover -->
                 <div class="relative h-48 bg-slate-100 overflow-hidden">
                     <!-- Priority: Media > ImageUrl > Fallback Gradient -->
                     <template v-if="item.media">
                         <img v-if="item.media.type === 'image'" :src="item.media.src" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                         <video v-else :src="item.media.src" :poster="item.media.poster" class="w-full h-full object-cover bg-black" controls></video>
                     </template>
                     
                     <img v-else-if="item.image_url" :src="item.image_url" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                     
                     <div v-else class="w-full h-full bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center">
                        <span class="text-5xl opacity-20 filter grayscale">{{ getTypeIcon(item.type) }}</span>
                     </div>
                 </div>

                 <!-- Content -->
                 <div class="p-6 flex-1 flex flex-col">
                     <div class="flex items-center justify-between mb-3">
                         <span class="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                            {{ getTypeIcon(item.type) }} {{ item.type }}
                        </span>
                        <span class="text-xs font-medium text-slate-400">
                            {{ new Date(item.achieved_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) }}
                        </span>
                     </div>

                     <h2 class="text-xl font-bold text-slate-900 mb-2 leading-tight group-hover:text-indigo-600 transition-colors">
                         {{ item.title }}
                     </h2>

                     <p class="text-slate-600 text-sm leading-relaxed mb-4 line-clamp-3">
                         {{ item.short }}
                     </p>

                     <!-- Tags -->
                     <div v-if="item.tags?.length" class="mt-auto pt-4 border-t border-slate-50 flex flex-wrap gap-2">
                        <span v-for="tag in item.tags.slice(0,3)" :key="tag" class="text-xs px-2 py-1 bg-slate-100 text-slate-500 rounded font-medium">
                            #{{ tag }}
                        </span>
                        <span v-if="item.tags.length > 3" class="text-xs px-2 py-1 text-slate-400">
                            +{{ item.tags.length - 3 }}
                        </span>
                     </div>
                     
                     <!-- Link -->
                     <div v-if="item.link_url" class="mt-4">
                         <a :href="item.link_url" target="_blank" class="text-sm font-semibold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1 group/link">
                             View Details 
                             <span class="transition-transform group-hover/link:translate-x-1">&rarr;</span>
                         </a>
                     </div>
                 </div>
            </article>
          </div>
        </section>
      </div>
    </div>
  </section>
</template>

<style scoped>
@keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in-up {
    animation: fadeInUp 0.8s ease-out;
}
</style>
