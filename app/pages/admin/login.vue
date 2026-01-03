<script setup lang="ts">
import { ref } from 'vue'
import { createClient } from '@supabase/supabase-js'

definePageMeta({
  layout: false // optional: keeps login clean
})

const supabase = useSupabaseClient()

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

async function login() {
  error.value = ''
  loading.value = true

  try {
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.value.trim(),
      password: password.value
    })

    if (authError) {
      error.value = authError.message
      return
    }

    // ✅ Successful login → go to admin dashboard
    await navigateTo('/admin')
  } catch (e) {
    error.value = 'Login failed. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="w-full max-w-md bg-white rounded-lg shadow p-6">
      <h1 class="text-2xl font-semibold mb-2 text-center">
        Admin Login
      </h1>

      <p class="text-sm text-gray-500 text-center mb-6">
        Restricted access
      </p>

      <form @submit.prevent="login" class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-1">Email</label>
          <input
            v-model="email"
            type="email"
            required
            class="w-full border rounded px-3 py-2"
            placeholder="admin@email.com"
          />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Password</label>
          <input
            v-model="password"
            type="password"
            required
            class="w-full border rounded px-3 py-2"
            placeholder="••••••••"
          />
        </div>

        <div v-if="error" class="text-red-600 text-sm">
          {{ error }}
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 disabled:opacity-60"
        >
          {{ loading ? 'Signing in…' : 'Sign In' }}
        </button>
      </form>
    </div>
  </div>
</template>
