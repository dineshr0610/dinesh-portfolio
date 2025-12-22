<!-- components/ProfileImage.vue -->
<script setup lang="ts">
import { computed, ref } from 'vue'
import { useAttrs } from 'vue'

const attrs = useAttrs()

const props = defineProps({
  src: { type: String, default: '/images/profile.webp' },
  fallback: { type: String, default: '/images/profile.jpg' },
  alt: { type: String, default: 'Dinesh R — profile photo' },
  width: { type: [Number, String], default: 192 },
  height: { type: [Number, String], default: 192 },
})

const errored = ref(false)

const srcWebp = computed(() => {
  if (!props.src) return ''
  if (props.src.endsWith('.webp')) return props.src
  return props.src.replace(/\.(jpe?g|png)$/i, '.webp')
})

function onError(e: Event) {
  errored.value = true
  const t = e.target as HTMLImageElement
  if (t) {
    t.src = props.fallback
    t.srcset = props.fallback
  }
}

/**
 * AI reactions for profile focus
 */
function react(type: 'resume' | 'idle') {
  window.dispatchEvent(
    new CustomEvent('ai:react', { detail: type })
  )
}
</script>

<template>
  <!-- Profile image wrapper -->
  <picture
    v-bind="attrs"
    class="inline-block"
    @mouseenter="react('resume')"
    @mouseleave="react('idle')"
  >
    <source v-if="srcWebp" :srcset="srcWebp" type="image/webp" />

    <img
      :src="errored ? props.fallback : props.src"
      :alt="props.alt"
      :width="props.width"
      :height="props.height"
      decoding="async"
      loading="lazy"
      :class="['object-cover', 'block', 'transition-transform', 'duration-300']"
      @error="onError"
    />
  </picture>
</template>

<style scoped>
/* subtle polish */
img {
  display: block;
}
</style>
