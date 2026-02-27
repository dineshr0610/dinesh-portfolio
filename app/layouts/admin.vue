<!-- app/layouts/admin.vue -->
<script setup>
import { ref } from 'vue'
import { Bars3Icon, XMarkIcon } from '@heroicons/vue/24/solid'

const isSidebarOpen = ref(false)
const route = useRoute()

// Close sidebar on route change (mobile)
watch(() => route.path, () => {
  isSidebarOpen.value = false
})

</script>

<template>
  <div class="min-h-screen flex bg-gray-50 relative">
    
    <!-- Mobile Header -->
    <div class="md:hidden fixed top-0 w-full bg-white border-b z-20 px-4 py-3 flex items-center justify-between shadow-sm">
      <span class="font-bold text-gray-900">Admin Panel</span>
      <button @click="isSidebarOpen = !isSidebarOpen" class="text-gray-600 hover:text-gray-900 p-1 rounded-md hover:bg-gray-100">
        <Bars3Icon v-if="!isSidebarOpen" class="h-6 w-6" />
        <XMarkIcon v-else class="h-6 w-6" />
      </button>
    </div>

    <!-- Mobile Overlay -->
    <div 
      v-if="isSidebarOpen" 
      @click="isSidebarOpen = false"
      class="fixed inset-0 bg-black/50 z-20 md:hidden backdrop-blur-sm transition-opacity"
    ></div>

    <!-- Sidebar -->
    <aside 
      class="w-64 bg-white border-r fixed h-full overflow-y-auto z-30 transition-transform duration-300 ease-in-out md:translate-x-0"
      :class="isSidebarOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full'"
    >
      <div class="p-6">
        <h2 class="text-2xl font-bold text-indigo-700 hidden md:block">Admin</h2>
        
        <nav class="mt-6 space-y-1">
          <div class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 mt-4">AI Controls</div>
          <NuxtLink to="/admin/ai/reindex" class="nav" active-class="active-nav">Reindex Brain 🧠</NuxtLink>
          
          <div class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 mt-6">Content</div>
          <NuxtLink to="/admin/ai-knowledge" class="nav" active-class="active-nav">AI Knowledge</NuxtLink>
          <NuxtLink to="/admin/questions" class="nav" active-class="active-nav">AI Questions</NuxtLink>
          <NuxtLink to="/admin/updates" class="nav" active-class="active-nav">Dinesh Now</NuxtLink>
          <NuxtLink to="/admin/social-highlights" class="nav" active-class="active-nav">Social Highlights</NuxtLink>
          <NuxtLink to="/admin/timeline" class="nav" active-class="active-nav">Timeline</NuxtLink>
          <NuxtLink to="/admin/achievements" class="nav" active-class="active-nav">Achievements</NuxtLink>
          <NuxtLink to="/admin/gallery" class="nav" active-class="active-nav">Gallery</NuxtLink>
          <NuxtLink to="/admin/projects" class="nav" active-class="active-nav">Projects</NuxtLink>
        </nav>
      </div>
    </aside>

    <!-- Main content -->
    <main class="flex-1 p-4 md:p-8 md:ml-64 mt-14 md:mt-0 transition-all duration-300">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.nav {
  display: flex;
  align-items: center;
  padding: 10px 14px;
  border-radius: 8px;
  color: #4b5563;
  margin-bottom: 2px;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  text-decoration: none;
}
.nav:hover {
  background: #f3f4f6;
  color: #111827;
}
.active-nav {
  background: #eef2ff;
  color: #4f46e5;
  font-weight: 600;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}
</style>

