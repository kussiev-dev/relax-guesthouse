<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import api from '@/api'

interface Room {
  id: number
  name: string
  type: string
  shortDescription: string
  description: string
  priceLabel: string
  priceMin: number
  area: number
  capacity: number
  amenities: string[]
  images: string[]
  available: boolean
}

const rooms = ref<Room[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    const { data } = await api.get('/rooms')
    rooms.value = data
  } finally {
    loading.value = false
  }
})

const roomColors: Record<string, string> = {
  econom: 'from-amber-50 to-orange-100',
  standard: 'from-teal-50 to-cyan-100',
  lux: 'from-purple-50 to-indigo-100',
}

const roomIcons: Record<string, string> = {
  econom: '🛏️',
  standard: '🏠',
  lux: '👑',
}
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <AppHeader />

    <!-- Page header -->
    <div class="pt-20 bg-gradient-to-br from-[#1B5E6B] to-[#134A56] text-white">
      <div class="page-container py-14">
        <div class="flex items-center gap-2 text-white/60 text-sm mb-3">
          <RouterLink to="/" class="hover:text-white transition-colors">Главная</RouterLink>
          <span>/</span>
          <span>Номера</span>
        </div>
        <h1 class="text-4xl md:text-5xl font-bold mb-3">Наши номера</h1>
        <p class="text-white/70 text-lg max-w-xl">18 номеров трёх категорий — выберите подходящий для вашего отдыха</p>
      </div>
    </div>

    <main class="flex-1 py-14">
      <div class="page-container">
        <!-- Loading -->
        <div v-if="loading" class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div v-for="i in 3" :key="i" class="card animate-pulse">
            <div class="h-52 bg-gray-200"></div>
            <div class="p-5 space-y-3">
              <div class="h-4 bg-gray-200 rounded w-1/2"></div>
              <div class="h-3 bg-gray-200 rounded w-full"></div>
              <div class="h-3 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        </div>

        <!-- Rooms grid -->
        <div v-else class="space-y-6">
          <div
            v-for="room in rooms"
            :key="room.id"
            class="card group"
          >
            <div class="flex flex-col md:flex-row">
              <!-- Image -->
              <div
                class="md:w-72 shrink-0 h-52 md:h-auto relative overflow-hidden bg-gradient-to-br"
                :class="roomColors[room.type]"
              >
                <div class="absolute inset-0 flex items-center justify-center">
                  <span class="text-7xl opacity-30">{{ roomIcons[room.type] }}</span>
                </div>
                <div class="absolute top-3 left-3">
                  <span class="badge bg-white/90 text-gray-700 shadow-sm font-semibold">{{ room.name }}</span>
                </div>
                <div class="absolute bottom-3 left-3">
                  <span :class="room.available ? 'badge-available' : 'badge-booked'">
                    {{ room.available ? '✓ Доступен' : 'Занят' }}
                  </span>
                </div>
              </div>

              <!-- Info -->
              <div class="flex-1 p-6 flex flex-col">
                <div class="flex items-start justify-between mb-3">
                  <div>
                    <h2 class="text-xl font-bold text-gray-900">{{ room.name }}</h2>
                    <p class="text-sm text-gray-500 mt-0.5">{{ room.type === 'econom' ? 'Эконом-класс' : room.type === 'standard' ? 'Стандарт' : 'Люкс' }}</p>
                  </div>
                  <div class="text-right">
                    <span class="text-2xl font-bold text-[#C8973A]">от {{ room.priceMin.toLocaleString('ru') }} ₽/ночь</span>
                  </div>
                </div>

                <p class="text-gray-600 text-sm mb-4 leading-relaxed flex-1">{{ room.description }}</p>

                <!-- Stats -->
                <div class="flex flex-wrap gap-5 text-sm text-gray-600 mb-4">
                  <span class="flex items-center gap-1.5">
                    <svg class="w-4 h-4 text-[#C8973A]" fill="currentColor" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
                    {{ room.area }} м²
                  </span>
                  <span class="flex items-center gap-1.5">
                    <svg class="w-4 h-4 text-[#C8973A]" fill="currentColor" viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
                    до {{ room.capacity }} чел.
                  </span>
                </div>

                <!-- Amenities -->
                <div class="flex flex-wrap gap-2 mb-5">
                  <span
                    v-for="am in room.amenities"
                    :key="am"
                    class="text-xs bg-[#F5F0E8] text-gray-700 px-3 py-1 rounded-full"
                  >{{ am }}</span>
                </div>

                <!-- Actions -->
                <div class="flex flex-wrap gap-3">
                  <RouterLink :to="`/rooms/${room.id}`" class="btn-outline py-2 text-sm">
                    Подробнее
                  </RouterLink>
                  <RouterLink :to="`/booking?room=${room.id}`" class="btn-primary py-2 text-sm">
                    Забронировать
                  </RouterLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <AppFooter />
  </div>
</template>
