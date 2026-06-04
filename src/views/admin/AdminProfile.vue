<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import api from '@/api'

const auth = useAuthStore()

const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const saving = ref(false)
const error = ref('')
const success = ref(false)

async function changePassword() {
  error.value = ''
  success.value = false

  if (!currentPassword.value || !newPassword.value || !confirmPassword.value) {
    error.value = 'Заполните все поля'
    return
  }
  if (newPassword.value !== confirmPassword.value) {
    error.value = 'Новые пароли не совпадают'
    return
  }
  if (newPassword.value.length < 6) {
    error.value = 'Пароль должен быть не менее 6 символов'
    return
  }

  saving.value = true
  try {
    await api.post('/auth/change-password', {
      currentPassword: currentPassword.value,
      newPassword: newPassword.value,
    })
    success.value = true
    currentPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
    setTimeout(() => success.value = false, 4000)
  } catch (e: any) {
    error.value = e?.response?.data?.error || 'Ошибка при смене пароля'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="max-w-lg">
    <div class="mb-6">
      <h2 class="text-xl font-bold text-gray-900">Личный кабинет</h2>
      <p class="text-sm text-gray-500 mt-1">Управление учётной записью администратора</p>
    </div>

    <!-- Profile card -->
    <div class="card p-6 mb-5">
      <div class="flex items-center gap-4">
        <div class="w-14 h-14 bg-[#C8973A] rounded-2xl flex items-center justify-center text-white text-2xl font-bold shrink-0">
          {{ auth.adminName?.charAt(0) ?? 'A' }}
        </div>
        <div>
          <div class="font-bold text-gray-900 text-lg">{{ auth.adminName || 'Администратор' }}</div>
          <div class="text-sm text-gray-400">Управляющий · Гостевой дом Релакс</div>
        </div>
      </div>
    </div>

    <!-- Change password -->
    <div class="card p-6">
      <h3 class="font-semibold text-gray-900 mb-4">Смена пароля</h3>

      <div class="space-y-4">
        <div>
          <label class="label">Текущий пароль</label>
          <input
            v-model="currentPassword"
            type="password"
            class="input-field"
            placeholder="Введите текущий пароль"
            @keydown.enter="changePassword"
          >
        </div>
        <div>
          <label class="label">Новый пароль</label>
          <input
            v-model="newPassword"
            type="password"
            class="input-field"
            placeholder="Минимум 6 символов"
            @keydown.enter="changePassword"
          >
        </div>
        <div>
          <label class="label">Повторите новый пароль</label>
          <input
            v-model="confirmPassword"
            type="password"
            class="input-field"
            placeholder="Повторите новый пароль"
            @keydown.enter="changePassword"
          >
        </div>

        <div v-if="error" class="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">
          {{ error }}
        </div>
        <div v-if="success" class="bg-green-50 text-green-700 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
          Пароль успешно изменён
        </div>

        <button
          class="btn-primary w-full justify-center"
          :disabled="saving"
          @click="changePassword"
        >
          <svg v-if="saving" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          {{ saving ? 'Сохраняем...' : 'Сменить пароль' }}
        </button>
      </div>
    </div>
  </div>
</template>
