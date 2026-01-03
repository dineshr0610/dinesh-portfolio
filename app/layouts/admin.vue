<!-- app/layouts/admin.vue -->
<script setup>
definePageMeta({
  middleware: 'admin'
})
</script>

<template>
  <div class="min-h-screen flex bg-gray-50">
    <!-- Sidebar -->
    <aside class="w-64 bg-white border-r p-5 fixed h-full overflow-y-auto">
      <h2 class="text-xl font-bold mb-6 text-indigo-700">Admin Panel</h2>

      <nav class="space-y-2 text-sm">
        <NuxtLink to="/admin" class="nav" active-class="active-nav">Dashboard</NuxtLink>
        <div class="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-4 mb-2">Content</div>
        <NuxtLink to="/admin/questions" class="nav" active-class="active-nav">AI Questions</NuxtLink>
        <NuxtLink to="/admin/updates" class="nav" active-class="active-nav">Dinesh Now</NuxtLink>
        <NuxtLink to="/admin/timeline" class="nav" active-class="active-nav">Timeline</NuxtLink>
        <NuxtLink to="/admin/achievements" class="nav" active-class="active-nav">Achievements</NuxtLink>
        <NuxtLink to="/admin/gallery" class="nav" active-class="active-nav">Gallery</NuxtLink>
        <NuxtLink to="/admin/projects" class="nav" active-class="active-nav">Projects</NuxtLink>
      </nav>
    </aside>

    <!-- Main content -->
    <main class="flex-1 p-8 ml-64">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.nav {
  display: block;
  padding: 8px 12px;
  border-radius: 6px;
  color: #4b5563;
  transition: all 0.2s;
  text-decoration: none;
}
.nav:hover {
  background: #f3f4f6;
  color: #111827;
}
.active-nav {
  background: #eef2ff;
  color: #4f46e5;
  font-weight: 500;
}
</style>
