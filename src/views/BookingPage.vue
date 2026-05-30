<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import api from '@/api'

interface Room { id: number; name: string; priceMin: number; priceMax: number; capacity: number }

const route = useRoute()
const rooms = ref<Room[]>([])
const loading = ref(false)
const submitted = ref(false)
const error = ref('')

const form = ref({
  guestName: '',
  phone: '',
  email: '',
  roomId: route.query.room ? String(route.query.room) : '',
  checkIn: '',
  checkOut: '',
  adults: '2',
  children: '0',
  comment: '',
})

function applyPhoneMask(raw: string): string {
  let digits = raw.replace(/\D/g, '')
  if (digits.startsWith('8')) digits = '7' + digits.slice(1)
  if (digits.length > 0 && !digits.startsWith('7')) digits = '7' + digits
  digits = digits.slice(0, 11) // жёсткий лимит — 11 цифр

  let out = ''
  if (digits.length >= 1)  out = '+7'
  if (digits.length >= 2)  out += ' (' + digits.slice(1, 4)
  if (digits.length >= 5)  out += ') ' + digits.slice(4, 7)
  else if (digits.length >= 2) out += ')'
  if (digits.length >= 8)  out += '-' + digits.slice(7, 9)
  if (digits.length >= 10) out += '-' + digits.slice(9, 11)
  return out
}

function formatPhone(e: Event) {
  const input = e.target as HTMLInputElement
  const formatted = applyPhoneMask(input.value)
  form.value.phone = formatted
  requestAnimationFrame(() => input.setSelectionRange(formatted.length, formatted.length))
}

function onPhoneKeydown(e: KeyboardEvent) {
  const input = e.target as HTMLInputElement
  const digits = input.value.replace(/\D/g, '')
  // Блокируем любой ввод цифры если уже 11 цифр
  const isDigit = /^\d$/.test(e.key)
  const isAllowed = ['Backspace','Delete','ArrowLeft','ArrowRight','Tab','Home','End'].includes(e.key)
    || e.ctrlKey || e.metaKey
  if (isDigit && digits.length >= 11) e.preventDefault()
  if (!isDigit && !isAllowed) e.preventDefault()
}

function onPhoneFocus(e: Event) {
  const input = e.target as HTMLInputElement
  if (!form.value.phone) {
    form.value.phone = '+7 ('
    requestAnimationFrame(() => input.setSelectionRange(4, 4))
  }
}

function onPhoneBlur() {
  const digits = form.value.phone.replace(/\D/g, '')
  if (digits.length < 11) form.value.phone = ''
}

const today = computed(() => new Date().toISOString().slice(0, 10))
const nights = computed(() => {
  if (!form.value.checkIn || !form.value.checkOut) return 0
  return Math.max(0, Math.ceil((new Date(form.value.checkOut).getTime() - new Date(form.value.checkIn).getTime()) / 86400000))
})
const selectedRoom = computed(() => rooms.value.find(r => r.id === parseInt(form.value.roomId)))
const estimatedTotal = computed(() => {
  if (!selectedRoom.value || !nights.value) return null
  return `${(selectedRoom.value.priceMin * nights.value).toLocaleString('ru')}₽ – ${(selectedRoom.value.priceMax * nights.value).toLocaleString('ru')}₽`
})

onMounted(async () => {
  const { data } = await api.get('/rooms')
  rooms.value = data
})

async function submit() {
  error.value = ''
  if (!form.value.guestName || !form.value.phone || !form.value.roomId || !form.value.checkIn || !form.value.checkOut) {
    error.value = 'Пожалуйста, заполните все обязательные поля'
    return
  }
  const roomName = rooms.value.find(r => r.id === parseInt(form.value.roomId))?.name || ''
  loading.value = true
  try {
    await api.post('/bookings', { ...form.value, roomName })
    submitted.value = true
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } catch (e: unknown) {
    const err = e as { response?: { data?: { error?: string } } }
    error.value = err.response?.data?.error || 'Ошибка при отправке. Попробуйте позже.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <AppHeader />

    <div class="pt-20 flex-1">
      <!-- Page header -->
      <div class="bg-gradient-to-br from-[#1B5E6B] to-[#134A56] text-white">
        <div class="page-container py-12">
          <div class="flex items-center gap-2 text-white/60 text-sm mb-3">
            <RouterLink to="/" class="hover:text-white">Главная</RouterLink>
            <span>/</span>
            <span>Бронирование</span>
          </div>
          <h1 class="text-4xl font-bold">Забронировать номер</h1>
          <p class="text-white/70 mt-2">Оставьте заявку — подтвердим в течение часа</p>
        </div>
      </div>

      <div class="page-container py-12">
        <!-- Success state -->
        <div v-if="submitted" class="max-w-lg mx-auto text-center py-12">
          <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg class="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
          </div>
          <h2 class="text-2xl font-bold text-gray-900 mb-3">Заявка отправлена!</h2>
          <p class="text-gray-500 mb-6">Спасибо! Мы получили вашу заявку и свяжемся с вами в ближайшее время для подтверждения бронирования.</p>
          <div class="card p-5 text-left mb-6 bg-[#F5F0E8] border-0">
            <p class="text-sm text-gray-600"><strong>Имя:</strong> {{ form.guestName }}</p>
            <p class="text-sm text-gray-600 mt-1"><strong>Телефон:</strong> {{ form.phone }}</p>
            <p class="text-sm text-gray-600 mt-1"><strong>Заезд:</strong> {{ form.checkIn }}</p>
            <p class="text-sm text-gray-600 mt-1"><strong>Выезд:</strong> {{ form.checkOut }}</p>
          </div>
          <div class="flex gap-3 justify-center">
            <RouterLink to="/" class="btn-outline">На главную</RouterLink>
            <a href="tel:+79186723781" class="btn-primary">Позвонить</a>
          </div>
        </div>

        <!-- Form -->
        <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <form class="lg:col-span-2 card p-8 space-y-6" @submit.prevent="submit">
            <h2 class="text-xl font-bold text-gray-900 mb-2">Данные для бронирования</h2>

            <!-- Guest info -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="label">Ваше имя <span class="text-red-500">*</span></label>
                <input v-model="form.guestName" type="text" class="input-field" placeholder="Иван Иванов" required>
              </div>
              <div>
                <label class="label">Телефон <span class="text-red-500">*</span></label>
                <input
                  :value="form.phone"
                  type="tel"
                  class="input-field"
                  placeholder="+7 (999) 999-99-99"
                  autocomplete="tel"
                  required
                  @input="formatPhone"
                  @keydown="onPhoneKeydown"
                  @focus="onPhoneFocus"
                  @blur="onPhoneBlur"
                >
              </div>
            </div>

            <div>
              <label class="label">Email</label>
              <input v-model="form.email" type="email" class="input-field" placeholder="your@email.com">
            </div>

            <!-- Room selection -->
            <div>
              <label class="label">Выберите номер <span class="text-red-500">*</span></label>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label
                  v-for="room in rooms"
                  :key="room.id"
                  class="relative cursor-pointer"
                >
                  <input v-model="form.roomId" type="radio" :value="String(room.id)" class="sr-only peer">
                  <div class="p-4 rounded-xl border-2 transition-all duration-200 peer-checked:border-[#C8973A] peer-checked:bg-amber-50 border-gray-200 hover:border-gray-300">
                    <div class="font-semibold text-gray-900 text-sm">{{ room.name }}</div>
                    <div class="text-xs text-[#C8973A] font-medium mt-0.5">от {{ room.priceMin.toLocaleString('ru') }}₽</div>
                    <div class="text-xs text-gray-500 mt-0.5">до {{ room.capacity }} чел.</div>
                  </div>
                  <div v-if="form.roomId === String(room.id)" class="absolute top-2 right-2 w-5 h-5 bg-[#C8973A] rounded-full flex items-center justify-center">
                    <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                  </div>
                </label>
              </div>
            </div>

            <!-- Dates -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="label">Дата заезда <span class="text-red-500">*</span></label>
                <input v-model="form.checkIn" type="date" class="input-field" :min="today" required>
              </div>
              <div>
                <label class="label">Дата выезда <span class="text-red-500">*</span></label>
                <input v-model="form.checkOut" type="date" class="input-field" :min="form.checkIn || today" required>
              </div>
            </div>

            <!-- Guests -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="label">Взрослых</label>
                <select v-model="form.adults" class="select-field">
                  <option v-for="n in 6" :key="n" :value="String(n)">{{ n }}</option>
                </select>
              </div>
              <div>
                <label class="label">Детей</label>
                <select v-model="form.children" class="select-field">
                  <option v-for="n in 5" :key="n-1" :value="String(n-1)">{{ n - 1 }}</option>
                </select>
              </div>
            </div>

            <!-- Comment -->
            <div>
              <label class="label">Пожелания / комментарий</label>
              <textarea v-model="form.comment" class="input-field resize-none" rows="3" placeholder="Ранний заезд, детская кроватка, аллергия..."></textarea>
            </div>

            <!-- Error -->
            <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 text-sm p-4 rounded-xl">
              {{ error }}
            </div>

            <button type="submit" class="btn-primary w-full justify-center text-base py-4" :disabled="loading">
              <svg v-if="loading" class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              <span v-if="!loading">Отправить заявку на бронирование</span>
              <span v-else>Отправляем...</span>
            </button>

            <p class="text-xs text-gray-400 text-center">
              Нажимая кнопку, вы соглашаетесь на обработку персональных данных и с вами свяжутся для подтверждения
            </p>
          </form>

          <!-- Sidebar -->
          <div class="space-y-5">
            <!-- Summary -->
            <div class="card p-6" v-if="selectedRoom || nights > 0">
              <h3 class="font-bold text-gray-900 mb-4">Предварительный расчёт</h3>
              <div class="space-y-3 text-sm">
                <div class="flex justify-between" v-if="selectedRoom">
                  <span class="text-gray-500">Номер</span>
                  <span class="font-medium">{{ selectedRoom.name }}</span>
                </div>
                <div class="flex justify-between" v-if="nights > 0">
                  <span class="text-gray-500">Ночей</span>
                  <span class="font-medium">{{ nights }}</span>
                </div>
                <div class="flex justify-between" v-if="estimatedTotal">
                  <span class="text-gray-500">Примерная стоимость</span>
                  <span class="font-bold text-[#C8973A]">{{ estimatedTotal }}</span>
                </div>
              </div>
              <p class="text-xs text-gray-400 mt-3">* Точная стоимость уточняется при подтверждении</p>
            </div>

            <!-- Contacts -->
            <div class="card p-5 bg-[#F5F0E8] border-0">
              <h3 class="font-semibold text-gray-900 mb-3">Предпочитаете позвонить?</h3>
              <a href="tel:+79186723781" class="flex items-center gap-2.5 text-[#1B5E6B] font-semibold mb-2">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
                +7 (918) 672-37-81
              </a>
              <a href="tel:+79186397266" class="flex items-center gap-2.5 text-[#1B5E6B] font-medium mb-3">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
                +7 (918) 639-72-66 (Манана)
              </a>
              <a href="https://t.me/manana013" target="_blank" class="flex items-center gap-2.5 text-[#1B5E6B] font-medium">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248l-2.018 9.509c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.881.712z"/></svg>
                Telegram: @manana013
              </a>
            </div>

            <!-- Policies -->
            <div class="card p-5">
              <h3 class="font-semibold text-gray-900 mb-3">Правила заезда</h3>
              <ul class="space-y-2 text-xs text-gray-600">
                <li class="flex items-start gap-2"><span class="text-[#C8973A] font-bold shrink-0">→</span> Заезд с 13:00</li>
                <li class="flex items-start gap-2"><span class="text-[#C8973A] font-bold shrink-0">→</span> Выезд до 12:00</li>
                <li class="flex items-start gap-2"><span class="text-[#C8973A] font-bold shrink-0">→</span> Требуется предоплата</li>
                <li class="flex items-start gap-2"><span class="text-[#C8973A] font-bold shrink-0">→</span> Дети до 3 лет — бесплатно</li>
                <li class="flex items-start gap-2"><span class="text-[#C8973A] font-bold shrink-0">→</span> Животные не принимаются</li>
                <li class="flex items-start gap-2"><span class="text-[#C8973A] font-bold shrink-0">→</span> Курение вне номеров</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>

    <AppFooter />
  </div>
</template>
