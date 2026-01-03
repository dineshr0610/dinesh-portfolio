<script setup>
definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})
</script>

<template>
  <section>
    <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Welcome back, Admin</h1>
        <p class="text-gray-500 mt-2">Manage your content and portfolio from one place.</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      
      <NuxtLink to="/admin/questions" class="card group">
        <div class="flex items-center justify-between mb-2">
            <span class="text-2xl">📨</span>
            <span class="text-gray-400 group-hover:text-indigo-500 transition">→</span>
        </div>
        <h3 class="text-lg font-bold text-gray-900">AI Questions</h3>
        <p class="text-sm text-gray-500 mt-1">Manage incoming questions and train your AI.</p>
      </NuxtLink>

      <NuxtLink to="/admin/updates" class="card group">
         <div class="flex items-center justify-between mb-2">
            <span class="text-2xl">📝</span>
            <span class="text-gray-400 group-hover:text-indigo-500 transition">→</span>
        </div>
        <h3 class="text-lg font-bold text-gray-900">Dinesh Now</h3>
        <p class="text-sm text-gray-500 mt-1">Post updates about what you are working on.</p>
      </NuxtLink>

      <NuxtLink to="/admin/timeline" class="card group">
         <div class="flex items-center justify-between mb-2">
            <span class="text-2xl">🕒</span>
            <span class="text-gray-400 group-hover:text-indigo-500 transition">→</span>
        </div>
        <h3 class="text-lg font-bold text-gray-900">Timeline</h3>
        <p class="text-sm text-gray-500 mt-1">Update your career journey and milestones.</p>
      </NuxtLink>

      <NuxtLink to="/admin/achievements" class="card group">
         <div class="flex items-center justify-between mb-2">
            <span class="text-2xl">🏆</span>
            <span class="text-gray-400 group-hover:text-indigo-500 transition">→</span>
        </div>
        <h3 class="text-lg font-bold text-gray-900">Achievements</h3>
        <p class="text-sm text-gray-500 mt-1">Showcase your awards and certificates.</p>
      </NuxtLink>

      <NuxtLink to="/admin/gallery" class="card group">
         <div class="flex items-center justify-between mb-2">
            <span class="text-2xl">🖼</span>
            <span class="text-gray-400 group-hover:text-indigo-500 transition">→</span>
        </div>
        <h3 class="text-lg font-bold text-gray-900">Gallery</h3>
        <p class="text-sm text-gray-500 mt-1">Manage photos and featured images.</p>
      </NuxtLink>

      <NuxtLink to="/admin/projects" class="card group">
         <div class="flex items-center justify-between mb-2">
            <span class="text-2xl">🚀</span>
            <span class="text-gray-400 group-hover:text-indigo-500 transition">→</span>
        </div>
        <h3 class="text-lg font-bold text-gray-900">Projects</h3>
        <p class="text-sm text-gray-500 mt-1">Manage portfolio cases and experiments.</p>
      </NuxtLink>

    </div>
  </section>
</template>

<style scoped>
.card {
  display: block;
  padding: 24px;
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  transition: all 0.2s;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}
.card:hover {
  background: white;
  border-color: #6366f1;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.1);
  transform: translateY(-2px);
}
</style>
