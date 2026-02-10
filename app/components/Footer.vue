<template>
  <footer
    class="mt-20 border-t bg-white/80 backdrop-blur-sm"
    @mouseenter="react('contact')"
    @mouseleave="react('idle')"
  >
    <div class="container mx-auto px-4 py-12">
      <div class="grid md:grid-cols-3 gap-8 mb-8">
        
        <!-- Brand -->
        <div class="text-center md:text-left space-y-4">
          <div>
            <h3 class="font-bold text-xl text-slate-900">Dinesh R</h3>
            <p class="text-slate-500 text-sm mt-1">Full-Stack Developer • AI & Web Enthusiast</p>
          </div>
          <p class="text-xs text-slate-400 max-w-xs mx-auto md:mx-0">
            Building digital experiences with modern web technologies and artificial intelligence.
          </p>
        </div>

        <!-- Quick Links -->
        <div class="flex flex-col items-center justify-center space-y-3 text-sm font-medium text-slate-600">
          <div class="flex gap-6">
            <NuxtLink to="/" class="hover:text-indigo-600 transition-colors">Home</NuxtLink>
            <NuxtLink to="/about" class="hover:text-indigo-600 transition-colors">About</NuxtLink>
            <NuxtLink to="/projects" class="hover:text-indigo-600 transition-colors">Projects</NuxtLink>
          </div>
          <div class="flex gap-6">
            <NuxtLink to="/gallery" class="hover:text-indigo-600 transition-colors">Gallery</NuxtLink>
            <NuxtLink to="/contact" class="hover:text-indigo-600 transition-colors">Contact</NuxtLink>
          </div>
        </div>

        <!-- Social -->
        <div class="flex flex-col items-center md:items-end justify-center space-y-4">
          <div class="flex gap-4">
            <a href="https://github.com/dineshr0610" target="_blank" aria-label="GitHub" class="p-2 bg-slate-100 rounded-full text-slate-600 hover:bg-slate-900 hover:text-white transition-all transform hover:-translate-y-1">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.05-.015-2.055-3.33.72-4.035-1.605-4.035-1.605-.54-1.38-1.32-1.74-1.32-1.74-1.095-.75.09-.735.09-.735 1.2.075 1.83 1.23 1.83 1.23 1.08 1.83 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.545 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.285 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
            </a>
            <a href="https://www.linkedin.com/in/dineshr0610" target="_blank" aria-label="LinkedIn" class="p-2 bg-slate-100 rounded-full text-slate-600 hover:bg-blue-600 hover:text-white transition-all transform hover:-translate-y-1">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            </a>
            <a href="mailto:dinesh2370049@ssn.edu.in" aria-label="Email" class="p-2 bg-slate-100 rounded-full text-slate-600 hover:bg-red-500 hover:text-white transition-all transform hover:-translate-y-1">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
            </a>
          </div>
        </div>
      </div>

      <!-- Bottom Line -->
      <div class="border-t border-slate-100 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-slate-400 gap-4">
        <div>© {{ year }} Dinesh R. All rights reserved.</div>
        <div class="flex items-center gap-1">
          <span>Built with</span>
          <span class="font-semibold text-slate-500">Nuxt 3</span>
          <span>&</span>
          <span class="font-semibold text-slate-500">Tailwind CSS</span>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const year = new Date().getFullYear()

function react(type: 'contact' | 'idle') {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('ai:react', { detail: type })
    )
  }
}
</script>

<style scoped>
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
footer {
  animation: fadeInUp 0.8s ease-out backwards;
}
</style>
