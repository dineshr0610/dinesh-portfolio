<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

type AIReaction = 'idle' | 'project' | 'resume' | 'contact'
const reaction = ref<AIReaction>('idle')

const tiltX = ref(0)
const tiltY = ref(0)

function handleMouseMove(e: MouseEvent) {
  if (typeof window === 'undefined') return
  if (window.innerWidth < 768) return

  const cx = window.innerWidth / 2
  const cy = window.innerHeight / 2

  tiltX.value = Math.max(-8, Math.min(8, (e.clientY - cy) / 60))
  tiltY.value = Math.max(-8, Math.min(8, (e.clientX - cx) / 60))
}

function goToAsk() {
  router.push('/ask')
}

function handleReaction(e: Event) {
  reaction.value = (e as CustomEvent<AIReaction>).detail || 'idle'
}

onMounted(() => {
  if (typeof window === 'undefined') return

  window.addEventListener('mousemove', handleMouseMove)
  window.addEventListener('ai:react', handleReaction)
})

onUnmounted(() => {
  if (typeof window === 'undefined') return

  window.removeEventListener('mousemove', handleMouseMove)
  window.removeEventListener('ai:react', handleReaction)
})
</script>

<template>
  <div
    class="ai-character"
    :class="reaction"
    :style="{ '--rx': tiltX + 'deg', '--ry': tiltY + 'deg' }"
    @click="goToAsk"
  >
    <!-- LABEL ONLY -->
    <div class="front-label">🤖 Ask Chitti</div>

    
  </div>
</template>

<style scoped>
/* ================= BASE ================= */
.ai-character {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 50;
  cursor: pointer;
  transition: transform .2s ease;
}

.ai-character:hover {
  transform: scale(1.05);
}

/* ================= LABEL ================= */
.front-label {
  padding: .75rem 1.25rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: #fff;
  text-align: center;
  background: rgba(15,23,42,.9);
  backdrop-filter: blur(10px);
  border-radius: 999px;
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
  border: 1px solid rgba(255,255,255,0.1);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  animation: floatY 3s ease-in-out infinite;
}

@keyframes floatY {
  0% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
  100% { transform: translateY(0); }
}
</style>
