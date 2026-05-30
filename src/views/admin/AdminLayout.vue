<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()
const sidebarOpen = ref(false)

function logout() {
  auth.logout()
  router.push('/admin/login')
}

const navItems = [
  { to: '/admin/dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', label: 'Дашборд' },
  { to: '/admin/bookings', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', label: 'Заявки' },
  { to: '/admin/calendar', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', label: 'Календарь' },
  { to: '/admin/rooms', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4', label: 'Номера' },
]
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex">
    <!-- Sidebar overlay (mobile) -->
    <Transition name="fade">
      <div v-if="sidebarOpen" class="fixed inset-0 bg-black/40 z-40 lg:hidden" @click="sidebarOpen = false"></div>
    </Transition>

    <!-- Sidebar -->
    <aside
      class="fixed top-0 left-0 h-full w-64 bg-[#1a2535] text-white z-50 flex flex-col shadow-2xl transition-transform duration-300"
      :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'"
    >
      <!-- Brand -->
      <div class="p-6 border-b border-white/10">
        <RouterLink to="/" class="flex items-center gap-3">
          <div class="w-9 h-9 bg-[#C8973A] rounded-xl flex items-center justify-center">
            <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
            </svg>
          </div>
          <div>
            <span class="font-bold text-sm block leading-tight">Гостевой дом</span>
            <span class="text-[#C8973A] font-semibold text-base">Релакс</span>
          </div>
        </RouterLink>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 p-4 space-y-1">
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200"
          :class="route.path === item.to
            ? 'bg-[#C8973A] text-white shadow-lg'
            : 'text-gray-300 hover:bg-white/10 hover:text-white'"
          @click="sidebarOpen = false"
        >
          <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="item.icon"/>
          </svg>
          {{ item.label }}
        </RouterLink>
      </nav>

      <!-- User + Logout -->
      <div class="p-4 border-t border-white/10">
        <div class="flex items-center gap-3 px-2 mb-3">
          <div class="w-8 h-8 bg-[#C8973A] rounded-full flex items-center justify-center text-sm font-bold shrink-0">
            {{ auth.adminName?.charAt(0) || 'A' }}
          </div>
          <div class="min-w-0">
            <div class="font-medium text-sm truncate">{{ auth.adminName || 'Администратор' }}</div>
            <div class="text-xs text-gray-400">Управляющий</div>
          </div>
        </div>
        <button
          class="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
          @click="logout"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
          </svg>
          Выйти
        </button>
      </div>
    </aside>

    <!-- Main content -->
    <div class="flex-1 lg:ml-64 flex flex-col">
      <!-- Top bar -->
      <header class="bg-white border-b border-gray-200 px-4 py-4 flex items-center gap-4 sticky top-0 z-30 shadow-sm">
        <button class="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg" @click="sidebarOpen = true">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
        </button>
        <div class="flex-1">
          <h1 class="font-semibold text-gray-900 text-base">
            {{ navItems.find(i => i.to === route.path)?.label || 'Панель управления' }}
          </h1>
        </div>
        <RouterLink to="/" target="_blank" class="text-sm text-gray-500 hover:text-[#C8973A] transition-colors flex items-center gap-1.5">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
          Открыть сайт
        </RouterLink>
      </header>

      <!-- Page content -->
      <main class="flex-1 p-6">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
