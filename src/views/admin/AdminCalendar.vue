<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  isSameDay, isToday, addMonths, subMonths, parseISO, isBefore, isAfter
} from 'date-fns'
import { ru } from 'date-fns/locale'
import api from '@/api'

interface CalendarBooking {
  id: string
  roomId: number
  roomName: string
  checkIn: string
  checkOut: string
  guestName: string
  status: 'pending' | 'confirmed'
}

interface Room { id: number; name: string; type: string }

const bookings = ref<CalendarBooking[]>([])
const rooms = ref<Room[]>([])
const currentMonth = ref(new Date())
const loading = ref(true)

onMounted(async () => {
  try {
    const [bRes, rRes] = await Promise.all([
      api.get('/bookings/calendar/data'),
      api.get('/rooms'),
    ])
    bookings.value = bRes.data
    rooms.value = rRes.data
  } finally {
    loading.value = false
  }
})

const monthDays = computed(() => {
  const start = startOfMonth(currentMonth.value)
  const end = endOfMonth(currentMonth.value)
  return eachDayOfInterval({ start, end })
})

const firstDayOfWeek = computed(() => {
  const d = startOfMonth(currentMonth.value).getDay()
  return d === 0 ? 6 : d - 1
})

const weekdays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

function getBookingsForDay(day: Date, roomId: number): CalendarBooking[] {
  return bookings.value.filter(b => {
    if (b.roomId !== roomId) return false
    const ci = parseISO(b.checkIn)
    const co = parseISO(b.checkOut)
    return !isBefore(day, ci) && isBefore(day, co)
  })
}

function getDayClass(day: Date, roomId: number): string {
  const bks = getBookingsForDay(day, roomId)
  if (bks.length === 0) return 'bg-green-100 hover:bg-green-200'
  const hasConfirmed = bks.some(b => b.status === 'confirmed')
  return hasConfirmed ? 'bg-red-200 hover:bg-red-300' : 'bg-yellow-100 hover:bg-yellow-200'
}

function getDayTitle(day: Date, roomId: number): string {
  const bks = getBookingsForDay(day, roomId)
  if (bks.length === 0) return 'Свободно'
  return bks.map(b => `${b.guestName} (${b.status === 'confirmed' ? 'подтверждено' : 'ожидает'})`).join(', ')
}

function prevMonth() { currentMonth.value = subMonths(currentMonth.value, 1) }
function nextMonth() { currentMonth.value = addMonths(currentMonth.value, 1) }

const selectedDay = ref<Date | null>(null)
const selectedRoomId = ref<number | null>(null)
const selectedDayBookings = computed(() => {
  if (!selectedDay.value || !selectedRoomId.value) return []
  return getBookingsForDay(selectedDay.value, selectedRoomId.value)
})

function selectDay(day: Date, roomId: number) {
  selectedDay.value = day
  selectedRoomId.value = roomId
}

const roomColors: Record<string, string> = {
  econom: 'text-amber-700 bg-amber-50',
  standard: 'text-teal-700 bg-teal-50',
  lux: 'text-purple-700 bg-purple-50',
}
</script>

<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-xl font-bold text-gray-900">Календарь занятости</h2>
        <p class="text-sm text-gray-500 mt-0.5">Кликните на день, чтобы увидеть заявки</p>
      </div>
      <div class="flex items-center gap-2">
        <button @click="prevMonth" class="p-2 rounded-xl hover:bg-gray-100 transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
        </button>
        <span class="font-semibold text-gray-900 min-w-36 text-center">
          {{ format(currentMonth, 'LLLL yyyy', { locale: ru }) }}
        </span>
        <button @click="nextMonth" class="p-2 rounded-xl hover:bg-gray-100 transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
        </button>
      </div>
    </div>

    <!-- Legend -->
    <div class="flex items-center gap-5 mb-5 text-sm">
      <div class="flex items-center gap-2"><div class="w-4 h-4 bg-green-100 rounded border border-green-200"></div> Свободно</div>
      <div class="flex items-center gap-2"><div class="w-4 h-4 bg-yellow-100 rounded border border-yellow-200"></div> Ожидает</div>
      <div class="flex items-center gap-2"><div class="w-4 h-4 bg-red-200 rounded border border-red-300"></div> Подтверждено</div>
    </div>

    <div v-if="loading" class="card p-10 text-center">
      <div class="w-8 h-8 border-4 border-[#C8973A] border-t-transparent rounded-full animate-spin mx-auto"></div>
    </div>

    <div v-else class="space-y-6">
      <div v-for="room in rooms" :key="room.id" class="card overflow-hidden">
        <!-- Room header -->
        <div class="px-5 py-3 border-b border-gray-100 flex items-center gap-3">
          <span :class="roomColors[room.type]" class="badge font-semibold">{{ room.name }}</span>
          <span class="text-sm text-gray-500">{{ room.type === 'econom' ? 'Эконом' : room.type === 'standard' ? 'Стандарт' : 'Люкс 2-комн.' }}</span>
        </div>

        <!-- Calendar grid -->
        <div class="p-4">
          <!-- Weekday headers -->
          <div class="grid grid-cols-7 mb-1">
            <div v-for="day in weekdays" :key="day" class="text-center text-xs text-gray-400 font-medium py-1">{{ day }}</div>
          </div>

          <!-- Days -->
          <div class="grid grid-cols-7 gap-0.5">
            <!-- Empty cells before first day -->
            <div v-for="i in firstDayOfWeek" :key="`empty-${i}`"></div>

            <!-- Day cells -->
            <button
              v-for="day in monthDays"
              :key="day.toISOString()"
              class="aspect-square flex items-center justify-center text-xs rounded-lg transition-all duration-150 relative"
              :class="[
                getDayClass(day, room.id),
                isToday(day) ? 'ring-2 ring-[#C8973A] ring-offset-1' : '',
                selectedDay && isSameDay(day, selectedDay) && selectedRoomId === room.id ? 'ring-2 ring-[#1B5E6B] ring-offset-1' : ''
              ]"
              :title="getDayTitle(day, room.id)"
              @click="selectDay(day, room.id)"
            >
              <span :class="isToday(day) ? 'font-bold text-[#C8973A]' : 'text-gray-700'">
                {{ day.getDate() }}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Day detail panel -->
    <Transition name="slide-up">
      <div v-if="selectedDay && selectedRoomId" class="fixed bottom-6 right-6 bg-white rounded-2xl shadow-2xl p-5 w-80 border border-gray-100 z-40">
        <div class="flex items-center justify-between mb-3">
          <div>
            <div class="font-bold text-gray-900">{{ format(selectedDay, 'd MMMM', { locale: ru }) }}</div>
            <div class="text-xs text-gray-500">{{ rooms.find(r => r.id === selectedRoomId)?.name }}</div>
          </div>
          <button @click="selectedDay = null" class="text-gray-400 hover:text-gray-600">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <div v-if="selectedDayBookings.length === 0" class="text-center py-4 text-gray-400 text-sm">
          <div class="text-2xl mb-2">✓</div>
          Номер свободен
        </div>

        <div v-else class="space-y-3">
          <div v-for="b in selectedDayBookings" :key="b.id" class="bg-gray-50 rounded-xl p-3">
            <div class="flex items-start justify-between">
              <div>
                <div class="font-semibold text-sm text-gray-900">{{ b.guestName }}</div>
                <div class="text-xs text-gray-500 mt-0.5">
                  {{ format(parseISO(b.checkIn), 'dd.MM') }} – {{ format(parseISO(b.checkOut), 'dd.MM') }}
                </div>
              </div>
              <span :class="b.status === 'confirmed' ? 'badge-confirmed' : 'badge-pending'">
                {{ b.status === 'confirmed' ? 'Подтверждено' : 'Ожидает' }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.slide-up-enter-active, .slide-up-leave-active { transition: all 0.25s ease; }
.slide-up-enter-from, .slide-up-leave-to { opacity: 0; transform: translateY(20px); }
</style>
