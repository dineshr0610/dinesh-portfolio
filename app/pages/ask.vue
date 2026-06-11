<template>
  <section class="min-h-screen flex flex-col items-center justify-center p-4 bg-[#0b0f1a] relative overflow-hidden">

    <!-- Subtle dark atmospheric orbs — not the light blobs -->
    <div class="absolute top-0 left-1/4 w-96 h-96 bg-indigo-900/20 rounded-full filter blur-3xl pointer-events-none"></div>
    <div class="absolute bottom-0 right-1/4 w-80 h-80 bg-violet-900/15 rounded-full filter blur-3xl pointer-events-none"></div>

    <div class="w-full max-w-2xl z-10">
      <!-- Header -->
      <div class="text-center mb-10 animate-fade-in-up">
        <div class="inline-flex items-center justify-center bg-white/[0.04] border border-white/[0.06] p-3 rounded-2xl mb-4">
          <span class="text-3xl">🤖</span>
        </div>
        <h1 class="text-4xl font-black text-slate-100 tracking-tight mb-2">Ask Dinesh's AI</h1>
        <p class="text-slate-400 text-lg">
          Trained on his resume, projects, and achievements.
        </p>
      </div>

      <!-- Chat Interface -->
      <div
        class="bg-white/[0.03] backdrop-blur-xl rounded-3xl border border-white/[0.06] overflow-hidden transition-all duration-500 animate-fade-in-up"
        :class="{ 'ring-1 ring-indigo-500/20': loading }"
        style="animation-delay:0.1s"
      >
        <div class="p-6 md:p-8">
          <!-- Answer Area -->
          <Transition name="fade">
            <div v-if="answer || loading || error" class="mb-6 p-5 bg-white/[0.03] rounded-2xl border border-white/[0.06]">

              <!-- Loading -->
              <div v-if="loading" class="flex items-center gap-3 text-indigo-400 font-medium animate-pulse">
                <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Thinking…</span>
              </div>

              <!-- Error -->
              <div v-else-if="error" class="text-red-400 flex items-center gap-2 text-sm">
                <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                {{ error }}
              </div>

              <!-- Answer -->
              <div v-else class="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-a:text-indigo-400 text-slate-300">
                <div v-html="renderedAnswer"></div>
                <RelatedItems :items="related" />
              </div>
            </div>
          </Transition>

          <!-- Input -->
          <div class="relative">
            <textarea
              v-model="q"
              :disabled="loading || needsEmail"
              @keydown.enter.prevent="askQuestion"
              rows="3"
              class="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl p-4 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/40 focus:outline-none transition-all resize-none"
              placeholder="Ask me anything… (e.g. 'What tech stack do you use?')"
            ></textarea>

            <div class="absolute bottom-3 right-3">
              <button
                @click="askQuestion"
                :disabled="!q.trim() || loading || needsEmail"
                class="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
              </button>
            </div>
          </div>

          <!-- Email Fallback -->
          <Transition name="slide-up">
            <div v-if="needsEmail" class="mt-5 bg-indigo-500/[0.08] p-5 rounded-xl border border-indigo-500/20">
              <p class="text-slate-200 font-medium mb-2 flex items-center gap-2">
                <span class="text-xl">🤔</span>
                I don't have enough info to answer that safely.
              </p>
              <p class="text-slate-400 text-sm mb-4">
                Leave your email, and Dinesh will answer you personally.
              </p>

              <div class="flex gap-2">
                <input
                  v-model="email"
                  type="email"
                  placeholder="you@example.com"
                  class="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500/50 focus:outline-none transition-all"
                  @keydown.enter="submitEmail"
                />
                <button
                  @click="submitEmail"
                  :disabled="loading"
                  class="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition disabled:opacity-50"
                >
                  Notify
                </button>
              </div>
            </div>
          </Transition>
        </div>
      </div>

      <div class="text-center mt-6 flex justify-center gap-6">
        <button @click="clear" v-if="answer || needsEmail" class="text-slate-500 hover:text-slate-300 text-sm font-medium transition-colors">
          Start Over
        </button>
        <NuxtLink to="/" class="text-slate-500 hover:text-slate-300 text-sm font-medium transition-colors">
          Back to Home
        </NuxtLink>
      </div>

    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { marked } from 'marked'
import RelatedItems from '~/components/ai/RelatedItems.vue'

const { show } = useToast()

const q = ref('')
const email = ref('')
const answer = ref('')
const related = ref([])
const loading = ref(false)
const error = ref('')
const needsEmail = ref(false)

const renderedAnswer = computed(() => answer.value ? marked.parse(answer.value) : '')

async function askQuestion() {
  if (!q.value.trim() || loading.value) return

  loading.value = true
  error.value = ''
  answer.value = ''
  related.value = []
  needsEmail.value = false

  try {
    const res: any = await $fetch('/api/ask', {
      method: 'POST',
      body: { question: q.value }
    })

    if (res.type === 'need_email') {
      needsEmail.value = true
      answer.value = res.message
      return
    }

    if (res.type === 'answer') {
      answer.value = res.message
      related.value = res.related || []
    }
  } catch (e) {
    const msg = 'My brain is currently offline. Please try again later.'
    error.value = msg
    show('error', msg)
  } finally {
    loading.value = false
  }
}

async function submitEmail() {
  if (!email.value.trim()) return

  loading.value = true
  error.value = ''

  try {
    const res: any = await $fetch('/api/ask', {
      method: 'POST',
      body: {
        question: q.value,
        email: email.value,
        intent: 'submit_email'
      }
    })

    if (res.type === 'fallback_saved') {
      answer.value = "Thanks! I've sent your question to Dinesh. He'll get back to you soon."
      show('success', 'Question shared with Dinesh successfully.')
      needsEmail.value = false
      email.value = ''
      q.value = ''
    }
  } catch (e) {
    const msg = 'Failed to send email.'
    error.value = msg
    show('error', msg)
  } finally {
    loading.value = false
  }
}

function clear() {
  q.value = ''
  email.value = ''
  answer.value = ''
  related.value = []
  error.value = ''
  needsEmail.value = false
}
</script>

<style scoped>
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}
.animate-fade-in-up {
  animation: fadeInUp 0.6s ease-out both;
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.4s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.slide-up-enter-active, .slide-up-leave-active { transition: all 0.3s ease-out; }
.slide-up-enter-from, .slide-up-leave-to { opacity: 0; transform: translateY(8px); }
</style>