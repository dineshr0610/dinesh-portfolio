<template>
  <div v-if="items?.length" class="mt-8">
    <div class="flex items-center gap-2 mb-4">
      <span class="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
      <h3 class="text-xs font-bold text-slate-500 uppercase tracking-widest font-display">
        Visual Proof
      </h3>
    </div>

    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <component
        v-for="item in items"
        :key="`${item.type}-${item.id}`"
        :is="resolveComponent(item.type)"
        :item="item"
        @preview-gallery="openGalleryPreview"
      />
    </div>

    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="activeGalleryItem"
          class="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 md:p-8"
          @click.self="closeGalleryPreview"
        >
          <button
            class="absolute top-6 right-6 text-white/70 hover:text-white transition"
            aria-label="Close preview"
            @click="closeGalleryPreview"
          >
            <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div class="w-full max-w-4xl">
            <div class="rounded-xl overflow-hidden bg-black border border-white/10">
              <img
                v-if="activeGalleryItem.mediaType !== 'video'"
                :src="activeGalleryItem.mediaSrc || activeGalleryItem.image || ''"
                :alt="activeGalleryItem.title"
                class="w-full max-h-[72vh] object-contain"
              />
              <video
                v-else
                :src="activeGalleryItem.mediaSrc || ''"
                :poster="activeGalleryItem.poster || activeGalleryItem.image || ''"
                controls
                autoplay
                class="w-full max-h-[72vh]"
              />
            </div>

            <div class="mt-4 text-center text-white">
              <h4 class="text-xl font-semibold">{{ activeGalleryItem.title }}</h4>
              <p v-if="activeGalleryItem.short" class="text-white/75 mt-2">{{ activeGalleryItem.short }}</p>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import AchievementProofCard from '~/components/ai/cards/AchievementProofCard.vue'
import GalleryProofCard from '~/components/ai/cards/GalleryProofCard.vue'
import ProjectProofCard from '~/components/ai/cards/ProjectProofCard.vue'
import TimelineProofCard from '~/components/ai/cards/TimelineProofCard.vue'
import UpdateProofCard from '~/components/ai/cards/UpdateProofCard.vue'

type RelatedType = 'project' | 'achievement' | 'timeline' | 'gallery' | 'update'

type RelatedItem = {
  id: string | number
  type: RelatedType
  title: string
  image: string | null
  short?: string | null
  date?: string | null
  tech?: string[] | null
  demo?: string | null
  repo?: string | null
  linkUrl?: string | null
  route?: string | null
  mediaType?: 'image' | 'video' | 'audio' | null
  mediaSrc?: string | null
  poster?: string | null
}

const props = defineProps<{
  items: RelatedItem[]
}>()

const activeGalleryItem = ref<RelatedItem | null>(null)

function resolveComponent(type: RelatedType) {
  switch (type) {
    case 'project':
      return ProjectProofCard
    case 'timeline':
      return TimelineProofCard
    case 'gallery':
      return GalleryProofCard
    case 'achievement':
      return AchievementProofCard
    case 'update':
      return UpdateProofCard
    default:
      return ProjectProofCard
  }
}

function openGalleryPreview(item: RelatedItem) {
  activeGalleryItem.value = item
  document.body.style.overflow = 'hidden'
}

function closeGalleryPreview() {
  activeGalleryItem.value = null
  document.body.style.overflow = ''
}

watch(
  () => props.items,
  () => {
    if (!activeGalleryItem.value) return
    const exists = props.items?.some((item) => item.id === activeGalleryItem.value?.id && item.type === 'gallery')
    if (!exists) closeGalleryPreview()
  }
)

onBeforeUnmount(() => {
  document.body.style.overflow = ''
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
