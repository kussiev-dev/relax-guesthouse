<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()
const username = ref('admin')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function login() {
  error.value = ''
  loading.value = true
  try {
    await auth.login(username.value, password.value)
    router.push('/admin/dashboard')
  } catch {
    error.value = 'Неверный логин или пароль'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-[#1B5E6B] to-[#0d3d47] flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <!-- Logo -->
      <div class="text-center mb-8">
        <div class="w-16 h-16 bg-[#C8973A] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
          <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
          </svg>
        </div>
        <h1 class="text-2xl font-bold text-white">Панель управления</h1>
        <p class="text-white/60 text-sm mt-1">Гостевой дом Релакс</p>
      </div>

      <!-- Card -->
      <div class="bg-white rounded-2xl p-8 shadow-2xl">
        <h2 class="text-xl font-bold text-gray-900 mb-6">Вход в систему</h2>
        <form @submit.prevent="login" class="space-y-5">
          <div>
            <label class="label">Логин</label>
            <input
              v-model="username"
              type="text"
              class="input-field"
              placeholder="admin"
              required
              autocomplete="username"
            >
          </div>
          <div>
            <label class="label">Пароль</label>
            <input
              v-model="password"
              type="password"
              class="input-field"
              placeholder="••••••••"
              required
              autocomplete="current-password"
            >
          </div>

          <div v-if="error" class="bg-red-50 text-red-600 text-sm p-3 rounded-xl border border-red-200">
            {{ error }}
          </div>

          <button type="submit" class="btn-primary w-full justify-center py-3.5 text-base" :disabled="loading">
            <svg v-if="loading" class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
            {{ loading ? 'Входим...' : 'Войти' }}
          </button>
        </form>

      </div>

      <div class="text-center mt-6">
        <RouterLink to="/" class="text-white/60 hover:text-white text-sm transition-colors">
          ← Вернуться на сайт
        </RouterLink>
      </div>
    </div>
  </div>
</template>
