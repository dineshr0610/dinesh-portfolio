<template>
  <section class="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50 relative overflow-hidden">
    <!-- Decorative Background Blobs -->
    <div class="absolute top-0 left-0 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
    <div class="absolute top-0 right-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
    <div class="absolute -bottom-32 left-20 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

    <div class="w-full max-w-2xl z-10">
      <!-- Header -->
      <div class="text-center mb-10">
        <div class="inline-flex items-center justify-center bg-white p-3 rounded-2xl shadow-sm mb-4">
             <span class="text-3xl">🤖</span>
        </div>
        <h1 class="text-4xl font-black text-slate-900 tracking-tight mb-2">Ask Dinesh's AI</h1>
        <p class="text-slate-500 text-lg">
          I've been trained on his resume, projects, and achievements.
        </p>
      </div>

      <!-- Chat Interface -->
      <div class="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden transition-all duration-500" :class="{ 'ring-4 ring-indigo-50': loading }">
          
          <div class="p-8">
              <!-- Answer Area -->
              <Transition name="fade">
                  <div v-if="answer || loading || error" class="mb-8 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                      
                      <!-- Loading State -->
                      <div v-if="loading" class="flex items-center gap-3 text-indigo-600 font-medium animate-pulse">
                          <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Thinking...</span>
                      </div>

                      <!-- Error State -->
                      <div v-else-if="error" class="text-red-600 flex items-center gap-2">
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                          {{ error }}
                      </div>

                      <!-- Answer Content -->
                      <div v-else class="prose prose-indigo max-w-none prose-p:leading-relaxed prose-a:text-indigo-600">
                         <div v-html="renderedAnswer"></div>
                         
                         <!-- Related Items Visualization -->
                         <RelatedItems :items="related" />
                      </div>
                  </div>
              </Transition>

              <!-- Input Area -->
              <div class="relative">
                 <textarea
                    v-model="q"
                    :disabled="loading || needsEmail"
                    @keydown.enter.prevent="askQuestion"
                    rows="3"
                    class="w-full bg-slate-50 border-0 rounded-xl p-4 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all resize-none shadow-inner"
                    placeholder="Ask me anything... (e.g., 'What tech stack do you use?')"
                 ></textarea>

                 <div class="absolute bottom-3 right-3 flex gap-2">
                     <button 
                        @click="askQuestion" 
                        :disabled="!q.trim() || loading || needsEmail"
                        class="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-indigo-200"
                     >
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                     </button>
                 </div>
              </div>

               <!-- Fallback Email Input -->
              <Transition name="slide-up">
                  <div v-if="needsEmail" class="mt-6 bg-indigo-50 p-6 rounded-xl border border-indigo-100">
                      <p class="text-indigo-900 font-medium mb-3 flex items-center gap-2">
                          <span class="text-2xl">🤔</span>
                          I don't have enough info to answer that safely.
                      </p>
                      <p class="text-indigo-700 text-sm mb-4">
                          Leave your email, and Dinesh will answer you personally.
                      </p>
                      
                      <div class="flex gap-2">
                          <input 
                              v-model="email" 
                              type="email" 
                              placeholder="you@example.com"
                              class="flex-1 border-0 rounded-lg p-3 ring-1 ring-indigo-200 focus:ring-2 focus:ring-indigo-500"
                              @keydown.enter="submitEmail"
                          />
                          <button 
                              @click="submitEmail"
                              :disabled="loading"
                              class="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700 transition"
                          >
                              Notify Him
                          </button>
                      </div>
                  </div>
              </Transition>
          </div>
      </div>
      
      <div class="text-center mt-8 space-x-4">
        <button @click="clear" v-if="answer || needsEmail" class="text-slate-400 hover:text-slate-600 text-sm font-medium transition-colors">
            Start Over
        </button>
        <NuxtLink to="/" class="text-slate-400 hover:text-slate-600 text-sm font-medium transition-colors">
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

const q = ref('')
const email = ref('')
const answer = ref('')
const related = ref([]) // Store related visual items
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
    error.value = 'My brain is currently offline. Please try again later.'
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
      needsEmail.value = false
      email.value = ''
      q.value = ''
    }
  } catch (e) {
    error.value = 'Failed to send email.'
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
/* Animations */
@keyframes blob {
  0% { transform: translate(0px, 0px) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
  100% { transform: translate(0px, 0px) scale(1); }
}
.animate-blob {
  animation: blob 7s infinite;
}
.animation-delay-2000 {
  animation-delay: 2s;
}
.animation-delay-4000 {
  animation-delay: 4s;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active,
.slide-up-leave-active {
    transition: all 0.3s ease-out;
}
.slide-up-enter-from,
.slide-up-leave-to {
    opacity: 0;
    transform: translateY(10px);
}
</style>
