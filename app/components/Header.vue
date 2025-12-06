<template>
  <header class="py-4 border-b bg-white/80 backdrop-blur-sm">
    <div class="container mx-auto flex items-center justify-between px-4 lg:px-8">
      <!-- Brand -->
      <NuxtLink to="/" class="text-xl font-bold">Dinesh R</NuxtLink>

      <!-- Desktop nav -->
      <nav class="hidden md:flex items-center gap-6 text-sm" aria-label="Main navigation">
        <NuxtLink to="/" class="hover:underline">Home</NuxtLink>
        <NuxtLink to="/about" class="hover:underline">About</NuxtLink>
        <NuxtLink to="/ask" class="hover:underline">Ask AI</NuxtLink>
        <NuxtLink to="/achievements" class="hover:underline">Achievements</NuxtLink>
        <NuxtLink to="/timeline" class="hover:underline">Timeline</NuxtLink>
        <NuxtLink to="/gallery" class="hover:underline">Gallery</NuxtLink>
        <NuxtLink to="/updates" class="hover:underline">Dinesh Now</NuxtLink>
        <NuxtLink to="/contact" class="hover:underline">Contact</NuxtLink>
      </nav>

      <!-- Right side: desktop avatar + CTA -->
      <div class="hidden md:flex items-center gap-3 relative">
        <NuxtLink to="/contact" class="text-sm px-3 py-1 rounded border hover:bg-slate-50">Hire</NuxtLink>

        <button
          @click="toggleDropdown"
          :aria-expanded="dropdownOpen"
          aria-haspopup="menu"
          class="flex items-center gap-2 p-1 rounded hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          ref="avatarBtn"
        >
          <div class="w-9 h-9">
            <ProfileImage class="w-9 h-9 rounded-full" alt="Dinesh R headshot" />
          </div>
          <span class="text-sm hidden lg:inline">Dinesh</span>
          <svg class="w-4 h-4 ml-1" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.292l3.71-4.06a.75.75 0 111.14.98l-4 4.375a.75.75 0 01-1.08 0l-4-4.375a.75.75 0 01.02-1.06z" clip-rule="evenodd" />
          </svg>
        </button>

        <!-- Avatar dropdown -->
        <transition name="fade">
          <div
            v-if="dropdownOpen"
            ref="dropdown"
            tabindex="-1"
            class="origin-top-right absolute right-0 mt-12 w-48 rounded-md shadow-lg bg-white ring-1 ring-black/5 z-50"
            role="menu"
            aria-label="User menu"
          >
            <div class="py-1">
              <a @click.prevent="navTo('/about')" class="block px-4 py-2 text-sm hover:bg-slate-50" role="menuitem">About</a>
              <a @click.prevent="navTo('/ask')" class="block px-4 py-2 text-sm hover:bg-slate-50" role="menuitem">Ask AI</a>
              <a @click.prevent="navTo('/resume')" class="block px-4 py-2 text-sm hover:bg-slate-50" role="menuitem">Resume</a>
              <a @click.prevent="navTo('/contact')" class="block px-4 py-2 text-sm hover:bg-slate-50" role="menuitem">Contact</a>
            </div>
          </div>
        </transition>
      </div>

      <!-- Mobile: hamburger -->
      <div class="md:hidden flex items-center gap-2">
        <button @click="toggleMobile" :aria-expanded="mobileOpen" aria-label="Toggle menu" class="p-2 rounded hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-300">
          <svg v-if="!mobileOpen" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16" />
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Mobile menu panel -->
    <transition name="slide-down">
      <div v-if="mobileOpen" class="md:hidden border-t bg-white">
        <div class="container mx-auto px-4 py-4">
          <ul class="flex flex-col gap-2">
            <li><NuxtLink @click.native="closeMobile" to="/" class="block px-2 py-2">Home</NuxtLink></li>
            <li><NuxtLink @click.native="closeMobile" to="/about" class="block px-2 py-2">About</NuxtLink></li>
            <li><NuxtLink @click.native="closeMobile" to="/ask" class="block px-2 py-2">Ask AI</NuxtLink></li>
            <li><NuxtLink @click.native="closeMobile" to="/achievements" class="block px-2 py-2">Achievements</NuxtLink></li>
            <li><NuxtLink @click.native="closeMobile" to="/timeline" class="block px-2 py-2">Timeline</NuxtLink></li>
            <li><NuxtLink @click.native="closeMobile" to="/gallery" class="block px-2 py-2">Gallery</NuxtLink></li>
            <li><NuxtLink @click.native="closeMobile" to="/updates" class="block px-2 py-2">Dinesh Now</NuxtLink></li>
            <li><NuxtLink @click.native="closeMobile" to="/contact" class="block px-2 py-2">Contact</NuxtLink></li>

            <li class="border-t mt-2 pt-2">
              <div class="flex items-center gap-3 px-2">
                <div class="w-10 h-10">
                  <ProfileImage class="w-10 h-10 rounded-full" alt="Dinesh R headshot" />
                </div>
                <div>
                  <div class="text-sm font-medium">Dinesh R</div>
                  <NuxtLink to="/contact" @click.native="closeMobile" class="text-xs text-slate-600 hover:underline">Contact</NuxtLink>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </transition>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRouter } from '#imports'
import ProfileImage from '~/components/ProfileImage.vue'

const mobileOpen = ref(false)
const dropdownOpen = ref(false)
const dropdown = ref<HTMLElement | null>(null)
const avatarBtn = ref<HTMLElement | null>(null)
const router = useRouter()

function toggleMobile() {
  mobileOpen.value = !mobileOpen.value
  // close dropdown if mobile opens
  if (mobileOpen.value) dropdownOpen.value = false
}

function closeMobile() {
  mobileOpen.value = false
}

function toggleDropdown() {
  dropdownOpen.value = !dropdownOpen.value
  if (dropdownOpen.value) {
    nextTick(() => dropdown.value?.focus())
  }
}

function navTo(path: string) {
  router.push(path)
  dropdownOpen.value = false
}

function onDocClick(e: MouseEvent) {
  const t = e.target as Node
  if (dropdown.value && dropdown.value.contains(t)) return
  if (avatarBtn.value && avatarBtn.value.contains(t)) return
  dropdownOpen.value = false
}

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    dropdownOpen.value = false
    mobileOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', onDocClick)
  document.addEventListener('keydown', onKey)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocClick)
  document.removeEventListener('keydown', onKey)
})
</script>

<style scoped>
/* simple transitions */
.fade-enter-active, .fade-leave-active { transition: opacity .12s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.slide-down-enter-active { animation: slideDownIn .18s ease forwards; }
.slide-down-leave-active { animation: slideDownOut .16s ease forwards; }
@keyframes slideDownIn { from { opacity: 0; transform: translateY(-6px) } to { opacity: 1; transform: translateY(0) } }
@keyframes slideDownOut { from { opacity: 1; transform: translateY(0) } to { opacity: 0; transform: translateY(-6px) } }

/* hide v-cloak usage if needed */
[v-cloak] { display:none; }
</style>
