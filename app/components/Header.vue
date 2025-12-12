<template>
  <header class="py-3 border-b bg-white/70 backdrop-blur-sm sticky top-0 z-50">
    <div class="container mx-auto flex items-center justify-between px-4 lg:px-8">
      <NuxtLink to="/" class="text-xl font-bold">Dinesh R</NuxtLink>

      <nav class="hidden md:flex items-center gap-6 text-sm" role="navigation" aria-label="Main nav">
        <NuxtLink to="/" class="hover:underline">Home</NuxtLink>
        <NuxtLink to="/about" class="hover:underline">About</NuxtLink>
        <NuxtLink to="/achievements" class="hover:underline">Achievements</NuxtLink>
        <NuxtLink to="/timeline" class="hover:underline">Timeline</NuxtLink>
        <NuxtLink to="/gallery" class="hover:underline">Gallery</NuxtLink>

        <!-- FORCE router navigation; button has type="button" to avoid submit -->
        <button type="button" @click.stop="goUpdates" class="hover:underline">Dinesh Now</button>

        <NuxtLink to="/contact" class="hover:underline">Contact</NuxtLink>
      </nav>

      <div class="hidden md:flex items-center gap-3 relative">
        <NuxtLink to="/contact" class="text-sm px-3 py-1 rounded bg-indigo-600 text-white hover:opacity-95">Hire</NuxtLink>

        <button type="button" ref="avatarBtn" @click="toggleMenu" :aria-expanded="menuOpen" aria-controls="profile-popover" aria-label="Open profile menu" class="flex items-center gap-2 p-1 rounded hover:bg-slate-100 focus:outline-none">
          <ProfileImage class="w-9 h-9 rounded-full ring-1 ring-slate-200" />
          <span class="hidden lg:inline text-sm">Dinesh</span>
        </button>

        <transition name="fade">
          <div v-if="menuOpen" id="profile-popover" ref="menu" :style="popoverStyle" class="fixed w-72 bg-white rounded-xl shadow-2xl ring-1 ring-black/5 p-4 z-[9999]" tabindex="-1" role="dialog">
            <div class="flex items-start gap-3">
              <ProfileImage class="w-14 h-14 rounded-full ring-2 ring-slate-100" />
              <div class="flex-1">
                <div class="flex items-center justify-between">
                  <div>
                    <div class="text-sm font-semibold">Dinesh R</div>
                    <div class="text-xs text-slate-500">Frontend • Full-Stack • AI</div>
                  </div>
                  <button type="button" @click="menuOpen = false" class="p-1 rounded hover:bg-slate-100" aria-label="Close">
                    ✕
                  </button>
                </div>

                <p class="mt-2 text-xs text-slate-600">I build responsive web apps and experiment with applied AI.</p>

                <div class="mt-3 flex gap-2">
                  <a ref="resumeLink" href="/resume.pdf" target="_blank" rel="noopener noreferrer" class="flex-1 inline-flex items-center justify-center px-3 py-2 rounded-md bg-slate-900 text-white text-sm">View Resume</a>
                  <NuxtLink to="/contact" @click.native="menuOpen = false" class="inline-flex items-center justify-center px-3 py-2 rounded-md border text-sm text-slate-700">Contact</NuxtLink>
                </div>
              </div>
            </div>
          </div>
        </transition>
      </div>

      <!-- Mobile buttons -->
      <button type="button" class="md:hidden p-2 rounded hover:bg-slate-100" @click="toggleMobile" :aria-expanded="mobileOpen" aria-label="Toggle navigation">
        <svg v-if="!mobileOpen" class="w-6 h-6" fill="none" stroke="currentColor"><path stroke-width="2" stroke-linecap="round" d="M4 8h16M4 16h16"/></svg>
        <svg v-else class="w-6 h-6" fill="none" stroke="currentColor"><path stroke-width="2" stroke-linecap="round" d="M6 18L18 6M6 6l12 12"/></svg>
      </button>
    </div>

    <transition name="slide">
      <div v-if="mobileOpen" class="md:hidden bg-white border-t pt-2 pb-4 px-4">
        <ul class="flex flex-col gap-2 text-sm">
          <NuxtLink @click="closeMobile" to="/" class="mobile-item">Home</NuxtLink>
          <NuxtLink @click="closeMobile" to="/about" class="mobile-item">About</NuxtLink>
          <NuxtLink @click="closeMobile" to="/achievements" class="mobile-item">Achievements</NuxtLink>
          <NuxtLink @click="closeMobile" to="/timeline" class="mobile-item">Timeline</NuxtLink>
          <NuxtLink @click="closeMobile" to="/gallery" class="mobile-item">Gallery</NuxtLink>

          <!-- Mobile navigation uses same router push -->
          <button type="button" @click="goUpdatesAndClose" class="mobile-item text-left">Dinesh Now</button>

          <NuxtLink @click="closeMobile" to="/contact" class="mobile-item">Contact</NuxtLink>

          <hr class="my-2" />

          <div class="flex items-center gap-3 px-1">
            <ProfileImage class="w-10 h-10 rounded-full ring-1 ring-slate-200" />
            <div>
              <div class="text-sm font-medium">Dinesh R</div>
              <div class="text-xs text-slate-500">Frontend • AI</div>
            </div>
            <a href="/resume.pdf" target="_blank" rel="noopener noreferrer" class="ml-auto text-xs underline">Resume</a>
          </div>
        </ul>
      </div>
    </transition>
  </header>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from '#imports'
import ProfileImage from '~/components/ProfileImage.vue'

const router = useRouter()
const mobileOpen = ref(false)
const menuOpen = ref(false)
const menu = ref<HTMLElement | null>(null)
const avatarBtn = ref<HTMLElement | null>(null)
const resumeLink = ref<HTMLAnchorElement | null>(null)
const popoverStyle = ref<Record<string,string>>({})

function computePopoverPosition() {
  const btn = avatarBtn.value
  if (!btn) return
  const rect = btn.getBoundingClientRect()
  const gap = 8
  const top = Math.max(rect.bottom + gap, 8)
  const right = Math.max(window.innerWidth - rect.right, 8)
  popoverStyle.value = { top: `${top}px`, right: `${right}px`, transform: 'translateZ(0)' }
}

function toggleMenu() {
  menuOpen.value = !menuOpen.value
  if (menuOpen.value) {
    computePopoverPosition()
    nextTick(() => resumeLink.value?.focus?.({ preventScroll: true }))
  }
}

function goUpdates(e?: Event) {
  if (e) e.stopPropagation()
  console.log('Header: navigating to /updates')
  router.push('/updates').catch(() => {})
}

function goUpdatesAndClose() {
  mobileOpen.value = false
  goUpdates()
}

function toggleMobile() { mobileOpen.value = !mobileOpen.value; if (mobileOpen.value) menuOpen.value = false }
function closeMobile() { mobileOpen.value = false }

function onDocClick(e: MouseEvent) {
  const t = e.target as Node
  if (!menuOpen.value) return
  if (menu.value && menu.value.contains(t)) return
  if (avatarBtn.value && avatarBtn.value.contains(t)) return
  menuOpen.value = false
}
function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') { menuOpen.value = false; mobileOpen.value = false }
}
function onWindowResizeOrScroll() { if (menuOpen.value) computePopoverPosition() }

onMounted(() => {
  document.addEventListener('click', onDocClick)
  document.addEventListener('keydown', onKey)
  window.addEventListener('resize', onWindowResizeOrScroll)
  window.addEventListener('scroll', onWindowResizeOrScroll, true)
})
onBeforeUnmount(() => {
  document.removeEventListener('click', onDocClick)
  document.removeEventListener('keydown', onKey)
  window.removeEventListener('resize', onWindowResizeOrScroll)
  window.removeEventListener('scroll', onWindowResizeOrScroll, true)
})
</script>

<style scoped>
.mobile-item { padding:.45rem .25rem; display:block; }
.fade-enter-active, .fade-leave-active { transition: opacity .12s ease }
.fade-enter-from, .fade-leave-to { opacity: 0 }
.slide-enter-active { animation: slideDown .18s ease forwards }
.slide-leave-active { animation: slideUp .16s ease forwards }
@keyframes slideDown { from { opacity: 0; transform: translateY(-6px) } to { opacity: 1; transform: translateY(0) } }
@keyframes slideUp { from { opacity: 1 } to { opacity: 0; transform: translateY(-6px) } }
</style>
