<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

const route = useRoute()
const isScrolled = ref(false)
const mobileOpen = ref(false)

function onScroll() { isScrolled.value = window.scrollY > 50 }
onMounted(() => window.addEventListener('scroll', onScroll))
onUnmounted(() => window.removeEventListener('scroll', onScroll))

const navLinks = [
  { to: '/', label: 'Главная' },
  { to: '/rooms', label: 'Номера' },
  { to: '/booking', label: 'Бронирование' },
  { to: '/contacts', label: 'Контакты' },
]
</script>

<template>
  <header
    class="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
    :class="isScrolled ? 'bg-white/95 backdrop-blur-md shadow-md' : 'bg-transparent'"
  >
    <div class="page-container">
      <div class="flex items-center justify-between h-16 md:h-20">
        <!-- Logo -->
        <RouterLink to="/" class="flex items-center gap-2.5 group">
          <div class="w-9 h-9 bg-[#C8973A] rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
            <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
            </svg>
          </div>
          <div>
            <span class="font-bold text-lg leading-tight block" :class="isScrolled ? 'text-gray-900' : 'text-white'">Релакс</span>
            <span class="text-xs leading-none" :class="isScrolled ? 'text-gray-400' : 'text-white/70'">Джемете, Анапа</span>
          </div>
        </RouterLink>

        <!-- Desktop nav -->
        <nav class="hidden md:flex items-center gap-1">
          <RouterLink
            v-for="link in navLinks"
            :key="link.to"
            :to="link.to"
            class="px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200"
            :class="[
              route.path === link.to
                ? 'bg-[#C8973A] text-white shadow-md'
                : isScrolled
                  ? 'text-gray-700 hover:text-[#C8973A] hover:bg-amber-50'
                  : 'text-white/90 hover:text-white hover:bg-white/20'
            ]"
          >{{ link.label }}</RouterLink>
        </nav>

        <!-- Phone CTA -->
        <a
          href="tel:+79186723781"
          class="hidden md:flex items-center gap-2 btn-primary py-2 text-sm"
        >
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
          </svg>
          +7 (918) 672-37-81
        </a>

        <!-- Mobile burger -->
        <button
          class="md:hidden p-2 rounded-lg transition-colors"
          :class="isScrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-white hover:bg-white/20'"
          @click="mobileOpen = !mobileOpen"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path v-if="!mobileOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
            <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Mobile menu -->
    <Transition name="slide-down">
      <div v-if="mobileOpen" class="md:hidden bg-white border-t border-gray-100 shadow-xl">
        <nav class="page-container py-4 flex flex-col gap-1">
          <RouterLink
            v-for="link in navLinks"
            :key="link.to"
            :to="link.to"
            class="px-4 py-3 rounded-xl font-medium text-sm transition-colors"
            :class="route.path === link.to ? 'bg-[#C8973A] text-white' : 'text-gray-700 hover:bg-gray-50'"
            @click="mobileOpen = false"
          >{{ link.label }}</RouterLink>
          <a href="tel:+79186723781" class="mt-2 btn-primary justify-center">
            +7 (918) 672-37-81
          </a>
        </nav>
      </div>
    </Transition>
  </header>
</template>

<style scoped>
.slide-down-enter-active, .slide-down-leave-active { transition: all 0.2s ease; }
.slide-down-enter-from, .slide-down-leave-to { opacity: 0; transform: translateY(-10px); }
</style>
