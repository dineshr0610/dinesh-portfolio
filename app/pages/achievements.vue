<script setup lang="ts">
interface Achievement {
  id: number | string
  title: string
  short: string
  long: string | null
  type: string
  achieved_at: string
  year: string | number
  image_url: string | null
  link_url: string | null
  tags: string[] | null
  media: {
    type: 'image' | 'video'
    src: string
    poster?: string
  } | null
}

const { data: achievements, pending, error } =
  await useFetch<Achievement[]>('/api/achievements')
</script>

<template>
  <section class="max-w-5xl mx-auto px-4 py-12">
    <h1 class="text-3xl font-bold mb-8">Achievements</h1>

    <div v-if="pending">Loading…</div>
    <div v-else-if="error">Failed to load achievements.</div>

    <div v-else class="space-y-8">
      <article
        v-for="item in achievements"
        :key="item.id"
        class="border rounded-lg p-6"
      >
        <!-- Media -->
        <div v-if="item.media" class="mb-4">
          <img
            v-if="item.media.type === 'image'"
            :src="item.media.src"
            class="rounded-md"
          />

          <video
            v-else-if="item.media.type === 'video'"
            controls
            class="rounded-md w-full"
            :poster="item.media.poster || undefined"
          >
            <source :src="item.media.src" />
          </video>
        </div>

        <!-- Title -->
        <h2 class="text-xl font-semibold">
          {{ item.title }}
        </h2>

        <!-- Meta -->
        <p class="text-sm text-gray-500 mb-2">
          {{ item.type }} • {{ item.year }}
        </p>

        <!-- Short -->
        <p class="mb-3">
          {{ item.short }}
        </p>

        <!-- Long -->
        <div
          v-if="item.long"
          class="prose max-w-none mb-3"
          v-html="item.long"
        />

        <!-- Tags -->
        <div v-if="item.tags?.length" class="flex gap-2 mb-3">
          <span
            v-for="tag in item.tags"
            :key="tag"
            class="text-xs px-2 py-1 bg-gray-100 rounded"
          >
            {{ tag }}
          </span>
        </div>

        <!-- Link -->
        <a
          v-if="item.link_url"
          :href="item.link_url"
          target="_blank"
          class="text-indigo-600 text-sm font-medium"
        >
          View Details →
        </a>
      </article>
    </div>
  </section>
</template>
