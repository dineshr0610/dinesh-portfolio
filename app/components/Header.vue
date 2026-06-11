<template>
<header
    class="py-3 border-b border-white/[0.06] bg-[#0b0f1a]/85 backdrop-blur-xl sticky top-0 z-50"
    @mouseleave="react('idle')"
  >
    <div class="container mx-auto flex items-center justify-between px-4 lg:px-8">
      <!-- Brand -->
      <NuxtLink to="/" class="text-xl font-bold font-display tracking-tight">Dinesh R</NuxtLink>

      <!-- Desktop nav -->
      <nav class="hidden md:flex items-center gap-6 text-sm">
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
          class="flex items-center gap-2 p-1 rounded hover:bg-slate-100"
        >
          <ProfileImage class="w-9 h-9 rounded-full ring-1 ring-slate-200" />
          <span class="hidden lg:inline text-sm">Dinesh</span>
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
              <ProfileImage class="w-14 h-14 rounded-full ring-2 ring-slate-100" />
          <div class="flex-1 text-slate-300">
                <div class="flex items-center justify-between">
                  <div>
                    <div class="text-sm font-semibold text-slate-100">Dinesh R</div>
                    <div class="text-xs text-slate-400">Frontend • Full-Stack • AI</div>
                  </div>
                  <button
                    @click="menuOpen = false"
                    class="rounded hover:bg-white/[0.06] hover:text-slate-100 transition-colors text-slate-300"
                  >✕</button>
                </div>

                <p class="mt-2 text-xs text-slate-400">
                  I build responsive web apps and experiment with applied AI.
                </p>

                <div class="mt-3 flex gap-2">
                  <a
                    ref="resumeLink"
                    href="/Dinesh_Resume.pdf"
                    target="_blank"
                    class="flex-1 bg-slate-900 text-white px-3 py-2 rounded text-sm"
                  >
                    View Resume
                  </a>
                  <NuxtLink
                    to="/contact"
                    class="px-3 py-2 border rounded text-sm"
                    @click.native="menuOpen = false"
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
        class="md:hidden p-2 rounded hover:bg-slate-100"
        @click="toggleMobile"
        :aria-expanded="mobileOpen"
      >
        <svg v-if="!mobileOpen" class="w-6 h-6" fill="none" stroke="currentColor">
          <path stroke-width="2" stroke-linecap="round" d="M4 8h16M4 16h16" />
        </svg>
        <svg v-else class="w-6 h-6" fill="none" stroke="currentColor">
          <path stroke-width="2" stroke-linecap="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- ✅ MOBILE MENU (RESTORED) -->
    <transition name="slide">
      <div v-if="mobileOpen" class="md:hidden bg-[#0b0f1a]/85 border-t border-white/[0.06] backdrop-blur-xl pt-2 pb-4 px-4">
        <ul class="flex flex-col gap-2 text-sm">

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

          <hr class="my-2" />

            <div class="flex items-center gap-3 px-1">
            <ProfileImage class="w-10 h-10 rounded-full ring-1 ring-white/[0.06]" />
            <div>
              <div class="text-sm font-medium">Dinesh R</div>
              <div class="text-xs text-slate-500">Frontend • AI</div>
              <a href="/Dinesh_Resume.pdf" target="_blank" class="ml-auto text-xs underline">
              Resume
            </a>
            </div>
        
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
  if (window.innerWidth < 768) return
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
  @apply px-4 py-2 rounded-full text-sm font-medium text-slate-300 hover:text-indigo-200 hover:bg-white/5 hover:border-white/10 transition-all duration-200 border border-transparent;
}

.nav-link.router-link-active {
  @apply text-indigo-200 bg-white/5 border-white/10 font-semibold;
}

.mobile-item {
  @apply block px-4 py-3 rounded-lg text-slate-300 hover:bg-white/5 hover:text-indigo-200 border border-transparent hover:border-white/10 transition-colors;
}

.mobile-item.router-link-active {
  @apply bg-white/5 text-indigo-200 border-white/10 font-semibold;
}

.fade-enter-active, .fade-leave-active { transition: opacity .12s, transform .12s ease-out; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: scale(0.95); }
.slide-enter-active { animation: slideDown .2s cubic-bezier(0.16, 1, 0.3, 1) forwards }
.slide-leave-active { animation: slideUp .15s ease-in forwards }
@keyframes slideDown { from { opacity:0; transform:translateY(-10px) } to { opacity:1; transform:translateY(0) } }
@keyframes slideUp { from { opacity:1; transform:translateY(0) } to { opacity:0; transform:translateY(-10px) } }

</style>
