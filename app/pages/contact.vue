<template>
  <section>
    <div class="max-w-2xl">
      <div class="flex items-center gap-4">
        <ProfileImage className="w-20 h-20 rounded-full" alt="Dinesh R headshot"/>
        <div>
          <h2 class="text-2xl font-semibold">Contact</h2>
          <p class="mt-2">Email: dinesh2370049@ssn.edu.in</p>
        </div>
      </div>

      <form @submit.prevent="send" class="mt-6">
        <input v-model="name" placeholder="Name" class="w-full border p-2 my-2" aria-label="Your name" />
        <input v-model="email" placeholder="Email" type="email" class="w-full border p-2 my-2" aria-label="Your email" />
        <textarea v-model="message" placeholder="Message" class="w-full border p-2 my-2" rows="6" aria-label="Message"></textarea>

        <div class="flex items-center gap-3">
          <button :disabled="sending" class="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-60">
            <span v-if="!sending">Send</span>
            <span v-else>Sending…</span>
          </button>

          <div v-if="status" :class="statusClass">{{ status }}</div>
        </div>
      </form>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import ProfileImage from '~/components/ProfileImage.vue'

const name = ref(''), email = ref(''), message = ref('')
const status = ref(''), sending = ref(false)

const statusClass = computed(() => {
  if (!status.value) return ''
  return status.value.includes('sent') ? 'text-green-600' : 'text-red-600'
})

function validate() {
  if (!name.value.trim()) { status.value = 'Please enter your name.'; return false }
  if (!email.value.trim() || !/^\S+@\S+\.\S+$/.test(email.value)) { status.value = 'Enter a valid email.'; return false }
  if (!message.value.trim()) { status.value = 'Message cannot be empty.'; return false }
  return true
}

async function send(){
  if (!validate()) return
  sending.value = true
  status.value = ''
  try {
    const res = await $fetch('/api/contact', { method: 'POST', body: { name: name.value, email: email.value, message: message.value } })
    // adapt to your API's response structure
    status.value = 'Message sent. Thank you!'
    name.value = email.value = message.value = ''
  } catch (err) {
    console.error('Contact send error', err)
    status.value = 'Failed to send message. Try again later.'
  } finally {
    sending.value = false
  }
}
</script>

<style scoped>
/* small spacing polish */
</style>
