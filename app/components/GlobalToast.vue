<script setup lang="ts">
const { toast } = useToast()
</script>

<template>
  <div v-if="toast" class="fixed bottom-6 right-6 z-[9999] max-w-xs pointer-events-none">
    <div
      :class="[
        'px-4 py-3 rounded-md shadow-lg text-white transition-all',
        toast.type === 'success' && 'bg-green-600',
        toast.type === 'error' && 'bg-red-600',
        toast.type === 'info' && 'bg-slate-600'
      ]"
    >
      {{ toast.text }}
    </div>
  </div>
</template>
