<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import api from '@/api'

interface Booking {
  id: string
  guestName: string
  phone: string
  email: string
  roomId: number
  roomName: string
  checkIn: string
  checkOut: string
  adults: number
  children: number
  comment: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  createdAt: string
  totalDays: number
}

const bookings = ref<Booking[]>([])
const loading = ref(true)
const search = ref('')
const filterStatus = ref('')
const selectedBooking = ref<Booking | null>(null)
const showModal = ref(false)

const filtered = computed(() => {
  let list = bookings.value
  if (filterStatus.value) list = list.filter(b => b.status === filterStatus.value)
  if (search.value) {
    const s = search.value.toLowerCase()
    list = list.filter(b =>
      b.guestName.toLowerCase().includes(s) ||
      b.phone.includes(s) ||
      b.email?.toLowerCase().includes(s) ||
      b.roomName.toLowerCase().includes(s)
    )
  }
  return list
})

onMounted(load)

async function load() {
  try {
    const { data } = await api.get('/bookings')
    bookings.value = data
  } finally {
    loading.value = false
  }
}

async function updateStatus(id: string, status: string) {
  await api.patch(`/bookings/${id}/status`, { status })
  const b = bookings.value.find(b => b.id === id)
  if (b) b.status = status as Booking['status']
  if (selectedBooking.value?.id === id) selectedBooking.value.status = status as Booking['status']
}

async function deleteBooking(id: string) {
  if (!confirm('Удалить заявку?')) return
  await api.delete(`/bookings/${id}`)
  bookings.value = bookings.value.filter(b => b.id !== id)
  if (selectedBooking.value?.id === id) showModal.value = false
}

function openModal(b: Booking) {
  selectedBooking.value = b
  showModal.value = true
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
}

const statusMap = {
  pending: { label: 'Ожидает', cls: 'badge-pending' },
  confirmed: { label: 'Подтверждено', cls: 'badge-confirmed' },
  cancelled: { label: 'Отменено', cls: 'badge-booked' },
  completed: { label: 'Завершено', cls: 'badge bg-gray-100 text-gray-600' },
}

const statusOptions = [
  { value: '', label: 'Все статусы' },
  { value: 'pending', label: 'Ожидает' },
  { value: 'confirmed', label: 'Подтверждено' },
  { value: 'cancelled', label: 'Отменено' },
  { value: 'completed', label: 'Завершено' },
]
</script>

<template>
  <div>
    <!-- Filters -->
    <div class="card p-4 mb-5 flex flex-col sm:flex-row gap-3">
      <div class="flex-1 relative">
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
        <input v-model="search" type="text" placeholder="Поиск по имени, телефону..." class="input-field pl-10">
      </div>
      <select v-model="filterStatus" class="select-field sm:w-48">
        <option v-for="o in statusOptions" :key="o.value" :value="o.value">{{ o.label }}</option>
      </select>
    </div>

    <!-- Table -->
    <div class="card overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <h2 class="font-bold text-gray-900">Заявки на бронирование</h2>
        <span class="text-sm text-gray-500">{{ filtered.length }} записей</span>
      </div>

      <div v-if="loading" class="p-10 text-center">
        <div class="w-8 h-8 border-4 border-[#C8973A] border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>

      <div v-else-if="filtered.length === 0" class="p-10 text-center text-gray-400">
        <svg class="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        Заявок не найдено
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 border-b border-gray-100">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Гость</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Номер</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Даты</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Статус</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Заявка</th>
              <th class="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr
              v-for="b in filtered"
              :key="b.id"
              class="hover:bg-gray-50 cursor-pointer transition-colors"
              @click="openModal(b)"
            >
              <td class="px-6 py-4">
                <div class="font-medium text-gray-900">{{ b.guestName }}</div>
                <a :href="`tel:${b.phone}`" class="text-xs text-[#C8973A]" @click.stop>{{ b.phone }}</a>
              </td>
              <td class="px-4 py-4">
                <span class="text-gray-700">{{ b.roomName }}</span>
              </td>
              <td class="px-4 py-4">
                <div class="text-gray-700">{{ new Date(b.checkIn).toLocaleDateString('ru-RU', { day:'numeric', month:'short' }) }}</div>
                <div class="text-gray-400 text-xs">{{ new Date(b.checkOut).toLocaleDateString('ru-RU', { day:'numeric', month:'short' }) }} · {{ b.totalDays }} н.</div>
              </td>
              <td class="px-4 py-4">
                <span :class="statusMap[b.status].cls">{{ statusMap[b.status].label }}</span>
              </td>
              <td class="px-4 py-4 text-xs text-gray-400">
                {{ new Date(b.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }) }}
              </td>
              <td class="px-4 py-4" @click.stop>
                <div class="flex items-center gap-1">
                  <button v-if="b.status === 'pending'"
                    class="text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 px-2.5 py-1 rounded-lg font-medium"
                    @click="updateStatus(b.id, 'confirmed')">✓</button>
                  <button v-if="b.status === 'pending'"
                    class="text-xs bg-red-50 text-red-600 hover:bg-red-100 px-2.5 py-1 rounded-lg font-medium"
                    @click="updateStatus(b.id, 'cancelled')">✕</button>
                  <button
                    class="text-xs text-gray-400 hover:text-red-500 px-2 py-1 rounded-lg hover:bg-red-50"
                    @click="deleteBooking(b.id)">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal -->
    <Transition name="modal">
      <div v-if="showModal && selectedBooking" class="fixed inset-0 z-50 flex items-center justify-center p-4" @click.self="showModal = false">
        <div class="absolute inset-0 bg-black/50" @click="showModal = false"></div>
        <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
          <!-- Modal header -->
          <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-[#1B5E6B] to-[#134A56] text-white">
            <h3 class="font-bold">Заявка #{{ selectedBooking.id }}</h3>
            <button @click="showModal = false" class="text-white/70 hover:text-white">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>

          <!-- Modal body -->
          <div class="p-6 space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <div class="text-xs text-gray-500 mb-0.5">Имя гостя</div>
                <div class="font-semibold text-gray-900">{{ selectedBooking.guestName }}</div>
              </div>
              <div>
                <div class="text-xs text-gray-500 mb-0.5">Статус</div>
                <span :class="statusMap[selectedBooking.status].cls">{{ statusMap[selectedBooking.status].label }}</span>
              </div>
              <div>
                <div class="text-xs text-gray-500 mb-0.5">Телефон</div>
                <a :href="`tel:${selectedBooking.phone}`" class="text-[#C8973A] font-medium">{{ selectedBooking.phone }}</a>
              </div>
              <div v-if="selectedBooking.email">
                <div class="text-xs text-gray-500 mb-0.5">Email</div>
                <div class="text-gray-700 text-sm">{{ selectedBooking.email }}</div>
              </div>
              <div>
                <div class="text-xs text-gray-500 mb-0.5">Номер</div>
                <div class="font-medium text-gray-900">{{ selectedBooking.roomName }}</div>
              </div>
              <div>
                <div class="text-xs text-gray-500 mb-0.5">Гостей</div>
                <div class="text-gray-700">{{ selectedBooking.adults }} взр. + {{ selectedBooking.children }} дет.</div>
              </div>
              <div>
                <div class="text-xs text-gray-500 mb-0.5">Заезд</div>
                <div class="font-medium text-gray-900">{{ formatDate(selectedBooking.checkIn) }}</div>
              </div>
              <div>
                <div class="text-xs text-gray-500 mb-0.5">Выезд</div>
                <div class="font-medium text-gray-900">{{ formatDate(selectedBooking.checkOut) }} · {{ selectedBooking.totalDays }} н.</div>
              </div>
            </div>
            <div v-if="selectedBooking.comment">
              <div class="text-xs text-gray-500 mb-0.5">Комментарий</div>
              <div class="text-sm text-gray-700 bg-gray-50 rounded-xl p-3">{{ selectedBooking.comment }}</div>
            </div>
          </div>

          <!-- Modal actions -->
          <div class="px-6 pb-6 flex flex-wrap gap-2">
            <template v-if="selectedBooking.status === 'pending'">
              <button class="btn-secondary py-2 text-sm" @click="updateStatus(selectedBooking.id, 'confirmed')">
                ✓ Подтвердить
              </button>
              <button class="text-sm bg-red-100 text-red-600 hover:bg-red-200 px-4 py-2 rounded-xl font-medium transition-colors" @click="updateStatus(selectedBooking.id, 'cancelled')">
                ✕ Отменить
              </button>
            </template>
            <template v-if="selectedBooking.status === 'confirmed'">
              <button class="text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 px-4 py-2 rounded-xl font-medium transition-colors" @click="updateStatus(selectedBooking.id, 'completed')">
                Завершить
              </button>
            </template>
            <button
              class="ml-auto text-sm text-gray-400 hover:text-red-500 px-4 py-2 rounded-xl hover:bg-red-50 transition-colors"
              @click="deleteBooking(selectedBooking.id)"
            >Удалить</button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: all 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-from .relative, .modal-leave-to .relative { transform: scale(0.95); }
</style>
