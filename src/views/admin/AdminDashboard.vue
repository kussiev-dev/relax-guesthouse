<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { RouterLink } from 'vue-router'
import api from '@/api'

interface Booking {
  id: string
  guestName: string
  phone: string
  roomName: string
  checkIn: string
  checkOut: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  createdAt: string
  totalDays: number
  adults: number
  children: number
}

const bookings = ref<Booking[]>([])
const loading = ref(true)

const stats = computed(() => ({
  total: bookings.value.length,
  pending: bookings.value.filter(b => b.status === 'pending').length,
  confirmed: bookings.value.filter(b => b.status === 'confirmed').length,
  cancelled: bookings.value.filter(b => b.status === 'cancelled').length,
}))

const visibleCount = ref(5)
const recent = computed(() => bookings.value.slice(0, visibleCount.value))
const remaining = computed(() => Math.min(5, bookings.value.length - visibleCount.value))
const hasMore = computed(() => visibleCount.value < bookings.value.length)

onMounted(async () => {
  try {
    const { data } = await api.get('/bookings')
    bookings.value = data
  } finally {
    loading.value = false
  }
})

async function updateStatus(id: string, status: string) {
  await api.patch(`/bookings/${id}/status`, { status })
  const b = bookings.value.find(b => b.id === id)
  if (b) b.status = status as Booking['status']
}

const statusMap = {
  pending: { label: 'Ожидает', cls: 'badge-pending' },
  confirmed: { label: 'Подтверждено', cls: 'badge-confirmed' },
  cancelled: { label: 'Отменено', cls: 'badge-booked' },
  completed: { label: 'Завершено', cls: 'badge bg-gray-100 text-gray-600' },
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })
}
</script>

<template>
  <div>
    <!-- Stats -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div class="card p-5">
        <div class="text-2xl font-bold text-gray-900">{{ stats.total }}</div>
        <div class="text-sm text-gray-500 mt-1">Всего заявок</div>
        <div class="mt-3 w-full bg-gray-100 rounded-full h-1.5">
          <div class="bg-[#1B5E6B] h-1.5 rounded-full" style="width: 100%"></div>
        </div>
      </div>
      <div class="card p-5">
        <div class="text-2xl font-bold text-yellow-600">{{ stats.pending }}</div>
        <div class="text-sm text-gray-500 mt-1">Ожидают ответа</div>
        <div class="mt-3 w-full bg-gray-100 rounded-full h-1.5">
          <div class="bg-yellow-400 h-1.5 rounded-full" :style="`width: ${stats.total ? (stats.pending/stats.total*100) : 0}%`"></div>
        </div>
      </div>
      <div class="card p-5">
        <div class="text-2xl font-bold text-blue-600">{{ stats.confirmed }}</div>
        <div class="text-sm text-gray-500 mt-1">Подтверждено</div>
        <div class="mt-3 w-full bg-gray-100 rounded-full h-1.5">
          <div class="bg-blue-400 h-1.5 rounded-full" :style="`width: ${stats.total ? (stats.confirmed/stats.total*100) : 0}%`"></div>
        </div>
      </div>
      <div class="card p-5">
        <div class="text-2xl font-bold text-red-500">{{ stats.cancelled }}</div>
        <div class="text-sm text-gray-500 mt-1">Отменено</div>
        <div class="mt-3 w-full bg-gray-100 rounded-full h-1.5">
          <div class="bg-red-400 h-1.5 rounded-full" :style="`width: ${stats.total ? (stats.cancelled/stats.total*100) : 0}%`"></div>
        </div>
      </div>
    </div>

    <!-- Recent bookings -->
    <div class="card overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <h2 class="font-bold text-gray-900">Последние заявки</h2>
          <span v-if="!loading" class="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
            {{ visibleCount }} из {{ bookings.length }}
          </span>
        </div>
        <RouterLink to="/admin/bookings" class="text-sm text-[#C8973A] hover:underline">Все заявки →</RouterLink>
      </div>

      <div v-if="loading" class="p-8 text-center">
        <div class="w-8 h-8 border-4 border-[#C8973A] border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>

      <div v-else-if="recent.length === 0" class="p-10 text-center text-gray-400">
        <svg class="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
        </svg>
        <p>Заявок пока нет</p>
      </div>

      <div v-else class="divide-y divide-gray-50">
        <div v-for="b in recent" :key="b.id" class="px-4 sm:px-6 py-4 hover:bg-gray-50 transition-colors">
          <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2 mb-1">
                <span class="font-semibold text-gray-900 text-sm">{{ b.guestName }}</span>
                <span :class="statusMap[b.status].cls">{{ statusMap[b.status].label }}</span>
              </div>
              <div class="text-xs text-gray-500">
                {{ b.roomName }} · {{ formatDate(b.checkIn) }} – {{ formatDate(b.checkOut) }} · {{ b.totalDays }} н.
              </div>
              <a :href="`tel:${b.phone}`" class="text-xs text-[#C8973A] mt-0.5 block">{{ b.phone }}</a>
            </div>
            <div v-if="b.status === 'pending'" class="flex gap-2 shrink-0">
              <button
                class="text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1.5 rounded-lg font-medium transition-colors"
                @click="updateStatus(b.id, 'confirmed')"
              >✓ Подтвердить</button>
              <button
                class="text-xs bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-lg font-medium transition-colors"
                @click="updateStatus(b.id, 'cancelled')"
              >✕</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Load more -->
      <div v-if="!loading && hasMore" class="px-6 py-3 border-t border-gray-100 bg-gray-50">
        <button
          class="w-full text-sm text-gray-600 hover:text-[#C8973A] font-medium transition-colors flex items-center justify-center gap-2 py-1"
          @click="visibleCount += 5"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
          </svg>
          Показать ещё {{ remaining }} из {{ bookings.length - visibleCount }} оставшихся
        </button>
      </div>
      <div v-else-if="!loading && bookings.length > 5" class="px-6 py-3 border-t border-gray-100 text-center text-xs text-gray-400">
        Показаны все {{ bookings.length }} заявок
      </div>
    </div>
  </div>
</template>
