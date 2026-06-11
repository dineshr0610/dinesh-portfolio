<template>
<header
    class="py-3 border-b border-white/[0.06] bg-[#0b0f1a]/85 backdrop-blur-xl sticky top-0 z-50"
    @mouseleave="react('idle')"
  >
    <div class="container mx-auto flex items-center justify-between px-4 lg:px-8">
      <!-- Brand -->
      <NuxtLink to="/" class="text-xl font-bold font-display tracking-tight text-slate-100">Dinesh R</NuxtLink>

      <!-- Desktop nav -->
      <nav class="hidden md:flex items-center gap-1 text-sm">
        <NuxtLink to="/" class="nav-link">Home</NuxtLink>
        <NuxtLink to="/about" class="nav-link">About</NuxtLink>
        <NuxtLink to="/achievements" class="nav-link">Achievements</NuxtLink>
        <NuxtLink to="/timeline" class="nav-link">Timeline</NuxtLink>
        <NuxtLink to="/gallery" class="nav-link">Gallery</NuxtLink>

        <button
          type="button"
          @mouseenter="react('resume')"
          @click.stop="goUpdates"
          class="nav-link"
        >
          Dinesh Now
        </button>

        <NuxtLink
          to="/contact"
          class="nav-link"
          @mouseenter="react('contact')"
        >
          Contact
        </NuxtLink>
      </nav>

      <!-- Desktop actions -->
      <div class="hidden md:flex items-center gap-3 relative">
        <button
          ref="avatarBtn"
          @mouseenter="react('resume')"
          @click="toggleMenu"
          :aria-expanded="menuOpen"
          class="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors"
        >
          <ProfileImage class="w-9 h-9 rounded-full ring-1 ring-white/[0.10]" />
          <span class="hidden lg:inline text-sm text-slate-300">Dinesh</span>
        </button>

        <!-- Profile popover -->
        <transition name="fade">
          <div
            v-if="menuOpen"
            ref="menu"
            :style="popoverStyle"
            class="fixed w-72 bg-[#0b0f1a]/90 backdrop-blur-xl rounded-xl shadow-[0_30px_90px_rgba(0,0,0,0.55)] ring-1 ring-white/[0.06] p-4 z-[9999] border border-white/[0.06]"
          >
            <div class="flex items-start gap-3">
              <ProfileImage class="w-14 h-14 rounded-full ring-2 ring-white/[0.10]" />
              <div class="flex-1 text-slate-300">
                <div class="flex items-center justify-between">
                  <div>
                    <div class="text-sm font-semibold text-slate-100">Dinesh R</div>
                    <div class="text-xs text-slate-400">Frontend · Full-Stack · AI</div>
                  </div>
                  <button
                    @click="menuOpen = false"
                    class="p-1 rounded hover:bg-white/[0.06] hover:text-slate-100 transition-colors text-slate-400"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                  </button>
                </div>

                <p class="mt-2 text-xs text-slate-400 leading-relaxed">
                  I build responsive web apps and experiment with applied AI.
                </p>

                <div class="mt-3 flex gap-2">
                  <a
                    ref="resumeLink"
                    href="/Dinesh_Resume.pdf"
                    target="_blank"
                    class="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg text-sm font-medium text-center transition-colors"
                  >
                    View Resume
                  </a>
                  <NuxtLink
                    to="/contact"
                    class="px-3 py-2 border border-white/[0.10] rounded-lg text-sm text-slate-300 hover:bg-white/[0.06] hover:text-slate-100 transition-colors"
                    @click="menuOpen = false"
                  >
                    Contact
                  </NuxtLink>
                </div>
              </div>
            </div>
          </div>
        </transition>
      </div>

      <!-- Mobile hamburger -->
      <button
        type="button"
        class="md:hidden p-2 rounded-lg hover:bg-white/[0.06] text-slate-300 transition-colors"
        @click="toggleMobile"
        :aria-expanded="mobileOpen"
        aria-label="Toggle navigation"
      >
        <svg v-if="!mobileOpen" class="w-6 h-6" fill="none" stroke="currentColor">
          <path stroke-width="2" stroke-linecap="round" d="M4 8h16M4 16h16" />
        </svg>
        <svg v-else class="w-6 h-6" fill="none" stroke="currentColor">
          <path stroke-width="2" stroke-linecap="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Mobile Menu -->
    <transition name="slide">
      <div v-if="mobileOpen" class="md:hidden bg-[#0b0f1a]/95 border-t border-white/[0.06] backdrop-blur-xl pt-2 pb-4 px-4">
        <ul class="flex flex-col gap-1 text-sm">
          <NuxtLink @click="closeMobile" to="/" class="mobile-item">Home</NuxtLink>
          <NuxtLink @click="closeMobile" to="/about" class="mobile-item">About</NuxtLink>
          <NuxtLink @click="closeMobile" to="/achievements" class="mobile-item">Achievements</NuxtLink>
          <NuxtLink @click="closeMobile" to="/timeline" class="mobile-item">Timeline</NuxtLink>
          <NuxtLink @click="closeMobile" to="/gallery" class="mobile-item">Gallery</NuxtLink>

          <button
            type="button"
            class="mobile-item text-left"
            @click="goUpdatesAndClose"
          >
            Dinesh Now
          </button>

          <NuxtLink @click="closeMobile" to="/contact" class="mobile-item">Contact</NuxtLink>

          <div class="border-t border-white/[0.06] my-2"></div>

          <div class="flex items-center gap-3 px-3 py-2">
            <ProfileImage class="w-10 h-10 rounded-full ring-1 ring-white/[0.10]" />
            <div>
              <div class="text-sm font-medium text-slate-200">Dinesh R</div>
              <div class="text-xs text-slate-500">Frontend · AI</div>
            </div>
            <a href="/Dinesh_Resume.pdf" target="_blank" class="ml-auto text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
              Resume
            </a>
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
const popoverStyle = ref<Record<string, string>>({})

function react(type: 'resume' | 'contact' | 'idle') {
  if (typeof window === 'undefined' || window.innerWidth < 768) return
  window.dispatchEvent(new CustomEvent('ai:react', { detail: type }))
}

function computePopoverPosition() {
  const rect = avatarBtn.value?.getBoundingClientRect()
  if (!rect) return
  popoverStyle.value = {
    top: `${rect.bottom + 8}px`,
    right: `${window.innerWidth - rect.right}px`
  }
}

function toggleMenu() {
  menuOpen.value = !menuOpen.value
  if (menuOpen.value) {
    computePopoverPosition()
    nextTick(() => resumeLink.value?.focus())
  }
}

function toggleMobile() {
  mobileOpen.value = !mobileOpen.value
  if (mobileOpen.value) menuOpen.value = false
}

function closeMobile() {
  mobileOpen.value = false
}

function goUpdates() {
  router.push('/updates')
}

function goUpdatesAndClose() {
  closeMobile()
  goUpdates()
}

function onDocClick(e: MouseEvent) {
  if (!menuOpen.value) return
  if (menu.value?.contains(e.target as Node)) return
  if (avatarBtn.value?.contains(e.target as Node)) return
  menuOpen.value = false
}

onMounted(() => {
  document.addEventListener('click', onDocClick)
})
onBeforeUnmount(() => {
  document.removeEventListener('click', onDocClick)
})
</script>

<style scoped>
.nav-link {
  @apply px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-slate-100 hover:bg-white/[0.05] transition-all duration-150 border border-transparent;
}

.nav-link.router-link-active,
.nav-link.router-link-exact-active {
  @apply text-indigo-300 bg-indigo-500/[0.08] border-indigo-500/20 font-semibold;
}

.mobile-item {
  @apply block px-3 py-2.5 rounded-lg text-slate-400 hover:bg-white/[0.05] hover:text-slate-100 transition-colors;
}

.mobile-item.router-link-active,
.mobile-item.router-link-exact-active {
  @apply bg-indigo-500/[0.08] text-indigo-300 font-semibold;
}

.fade-enter-active, .fade-leave-active { transition: opacity .12s, transform .12s ease-out; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: scale(0.95) translateY(-4px); }
.slide-enter-active { animation: slideDown .2s cubic-bezier(0.16, 1, 0.3, 1) forwards }
.slide-leave-active { animation: slideUp .15s ease-in forwards }
@keyframes slideDown { from { opacity:0; transform:translateY(-10px) } to { opacity:1; transform:translateY(0) } }
@keyframes slideUp { from { opacity:1; transform:translateY(0) } to { opacity:0; transform:translateY(-10px) } }
</style>