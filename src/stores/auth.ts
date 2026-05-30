import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/api'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('admin_token'))
  const adminName = ref<string | null>(localStorage.getItem('admin_name'))
  const isLoggedIn = ref(!!token.value)

  async function login(username: string, password: string) {
    const { data } = await api.post('/auth/login', { username, password })
    token.value = data.token
    adminName.value = data.name
    isLoggedIn.value = true
    localStorage.setItem('admin_token', data.token)
    localStorage.setItem('admin_name', data.name)
  }

  function logout() {
    token.value = null
    adminName.value = null
    isLoggedIn.value = false
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_name')
  }

  return { token, adminName, isLoggedIn, login, logout }
})
