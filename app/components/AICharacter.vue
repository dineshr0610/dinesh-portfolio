<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

type AIReaction = 'idle' | 'project' | 'resume' | 'contact'
const reaction = ref<AIReaction>('idle')

const tiltX = ref(0)
const tiltY = ref(0)

function handleMouseMove(e: MouseEvent) {
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
  window.addEventListener('mousemove', handleMouseMove)
  window.addEventListener('ai:react', handleReaction)
})

onUnmounted(() => {
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
    <!-- LABEL -->
    <div class="front-label">🤖 Ask Dinesh AI</div>

    <!-- Spline -->
    <iframe
      src="https://my.spline.design/happyrobotbutton-6NwXPiHF8H76GkDjBrESj5TQ/"
      frameborder="0"
    />
  </div>
</template>

<style scoped>
/* ================= BASE ================= */
.ai-character {
  position: fixed;
  bottom: 1.4rem;
  right: 1.4rem;
  width: 220px;
  aspect-ratio: 1 / 1.18;
  z-index: 50;
  cursor: pointer;

  transform: perspective(700px) rotateX(var(--rx)) rotateY(var(--ry));
  transition: transform .18s ease, filter .25s ease;
}

.ai-character iframe {
  width: 100%;
  height: 100%;
  border-radius: 18px;
  pointer-events: none;
  position: relative;
  z-index: 1;
}

/* ================= LABEL ================= */
.front-label {
  position: absolute;
  bottom: 20px;
  left: 60%;
  transform: translateX(-60%);
  z-index: 20;

  white-space: nowrap;
  padding: .45rem .95rem;
  min-width: 135px;
  font-size: .78rem;
  color: #fff;
  text-align: center;

  background: rgba(15,23,42,.6);
  backdrop-filter: blur(10px);
  border-radius: 999px;
  box-shadow: 0 10px 25px rgba(0,0,0,.35);

  animation: floatY 2.6s ease-in-out infinite;
}

@keyframes floatY {
  0% { transform: translate(-50%, 0); }
  50% { transform: translate(-50%, -6px); }
  100% { transform: translate(-50%, 0); }
}

/* ================= TABLET ================= */
@media (max-width: 1024px) {
  .ai-character { width: 180px; }
  .front-label { bottom: 18px; font-size: .74rem; 
  left: 50%;
  transform: translateX(-50%);}
}

/* ================= MOBILE ================= */
@media (max-width: 640px) {
  .ai-character {
    width: 155px;
    bottom: .85rem;
    right: .85rem;
  }

  .ai-character iframe { transform: scale(.78); }

  .front-label {
    bottom: 32px;   /* 🔥 THIS NOW WORKS */
    font-size: .66rem;
    min-width: 80px;
    left: 45%;
    transform: translateX(-45%);
  }
}

/* ================= VERY SMALL ================= */
@media (max-width: 420px) {
  .ai-character { width: 135px; }

  .ai-character iframe { transform: scale(.72); }

  .front-label {
    bottom: 50px;   /* 🔥 MOVE UP HERE */
    font-size: .62rem;
    min-width: 105px;
    
  }
}
</style>
