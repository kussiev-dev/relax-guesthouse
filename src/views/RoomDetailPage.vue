<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import api from '@/api'

interface Room {
  id: number
  name: string
  type: string
  description: string
  shortDescription: string
  priceLabel: string
  priceMin: number
  priceMax: number
  area: number
  capacity: number
  floor: number
  amenities: string[]
  furniture: string[]
  images: string[]
  available: boolean
}

const route = useRoute()
const room = ref<Room | null>(null)
const loading = ref(true)

onMounted(async () => {
  try {
    const { data } = await api.get(`/rooms/${route.params.id}`)
    room.value = data
    document.title = `${data.name} — Гостевой дом Релакс`
  } finally {
    loading.value = false
  }
  window.addEventListener('keydown', onKey)
})

onUnmounted(() => window.removeEventListener('keydown', onKey))

const activeImage = ref(0)
const hasImages = computed(() => (room.value?.images?.length ?? 0) > 0)
const lightboxOpen = ref(false)
const lightboxIndex = ref(0)

function openLightbox(idx: number) {
  lightboxIndex.value = idx
  lightboxOpen.value = true
}

function closeLightbox() {
  lightboxOpen.value = false
}

function lightboxPrev() {
  const len = room.value?.images?.length ?? 0
  lightboxIndex.value = (lightboxIndex.value - 1 + len) % len
}

function lightboxNext() {
  const len = room.value?.images?.length ?? 0
  lightboxIndex.value = (lightboxIndex.value + 1) % len
}

function onKey(e: KeyboardEvent) {
  if (!lightboxOpen.value) return
  if (e.key === 'Escape') closeLightbox()
  if (e.key === 'ArrowLeft') lightboxPrev()
  if (e.key === 'ArrowRight') lightboxNext()
}

const roomColors: Record<string, string> = {
  econom: 'from-amber-50 to-orange-100',
  standard: 'from-teal-50 to-cyan-100',
  lux: 'from-purple-50 to-indigo-100',
}
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <AppHeader />

    <div class="pt-20">
      <!-- Loading -->
      <div v-if="loading" class="page-container py-20 text-center">
        <div class="w-12 h-12 border-4 border-[#C8973A] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-gray-500">Загрузка...</p>
      </div>

      <template v-else-if="room">
        <!-- Hero Image -->
        <div
          class="h-72 desk:h-[28rem] relative overflow-hidden bg-gradient-to-br"
          :class="[roomColors[room.type], hasImages ? 'cursor-zoom-in' : '']"
          @click="hasImages && openLightbox(activeImage)"
        >
          <img
            v-if="hasImages"
            :src="room!.images[activeImage]"
            class="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
          />
          <div v-else class="absolute inset-0 flex items-center justify-center">
            <svg class="w-48 h-48 opacity-10" fill="currentColor" viewBox="0 0 24 24">
              <path d="M7 13c1.66 0 3-1.34 3-3S8.66 7 7 7s-3 1.34-3 3 1.34 3 3 3zm12-6h-8v7H3V5H1v15h2v-3h18v3h2v-9c0-2.21-1.79-4-4-4z"/>
            </svg>
          </div>
          <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none"></div>

          <div class="absolute bottom-0 left-0 right-0 page-container pb-6" @click.stop>
            <!-- Thumbnails strip -->
            <div v-if="(room!.images?.length ?? 0) > 1" class="flex gap-2 overflow-x-auto mb-4 scrollbar-none">
              <button
                v-for="(img, idx) in room!.images"
                :key="idx"
                class="shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all"
                :class="activeImage === idx ? 'border-white opacity-100' : 'border-white/30 opacity-60 hover:opacity-90'"
                @click="activeImage = idx"
              >
                <img :src="img" class="w-full h-full object-cover">
              </button>
            </div>

            <div class="flex items-center gap-2 text-white/70 text-sm mb-2">
              <RouterLink to="/" class="hover:text-white">Главная</RouterLink>
              <span>/</span>
              <RouterLink to="/rooms" class="hover:text-white">Номера</RouterLink>
              <span>/</span>
              <span>{{ room.name }}</span>
            </div>
            <div class="flex items-end justify-between">
              <h1 class="text-3xl desk:text-4xl font-bold text-white">{{ room.name }}</h1>
              <span :class="room.available ? 'badge-available' : 'badge-booked'">
                {{ room.available ? '✓ Доступен' : 'Занят' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Content -->
        <div class="page-container py-10">
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- Main info -->
            <div class="lg:col-span-2 space-y-8">
              <!-- Description -->
              <div class="card p-6">
                <h2 class="font-bold text-gray-900 text-lg mb-3">Описание</h2>
                <p class="text-gray-600 leading-relaxed">{{ room.description }}</p>
                <div class="grid grid-cols-3 gap-4 mt-5 pt-5 border-t border-gray-100">
                  <div class="text-center">
                    <div class="text-2xl font-bold text-[#C8973A]">{{ room.area }}</div>
                    <div class="text-xs text-gray-500 mt-0.5">кв. метров</div>
                  </div>
                  <div class="text-center">
                    <div class="text-2xl font-bold text-[#C8973A]">{{ room.capacity }}</div>
                    <div class="text-xs text-gray-500 mt-0.5">гостей макс.</div>
                  </div>
                  <div class="text-center">
                    <div class="text-2xl font-bold text-[#C8973A]">{{ room.floor }}</div>
                    <div class="text-xs text-gray-500 mt-0.5">этаж</div>
                  </div>
                </div>
              </div>

              <!-- Amenities -->
              <div class="card p-6">
                <h2 class="font-bold text-gray-900 text-lg mb-4">Удобства и оснащение</h2>
                <div class="grid grid-cols-2 gap-2">
                  <div v-for="am in room.amenities" :key="am" class="flex items-center gap-2 text-sm text-gray-700 py-1.5">
                    <svg class="w-4 h-4 text-green-500 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                    {{ am }}
                  </div>
                </div>
              </div>

              <!-- Furniture -->
              <div class="card p-6">
                <h2 class="font-bold text-gray-900 text-lg mb-4">Мебель и интерьер</h2>
                <div class="flex flex-wrap gap-2">
                  <span v-for="item in room.furniture" :key="item"
                    class="text-sm bg-[#F5F0E8] text-gray-700 px-3 py-1.5 rounded-lg">
                    {{ item }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Sidebar / Booking CTA -->
            <div class="space-y-5">
              <div class="card p-6 desk:sticky desk:top-24">
                <div class="text-center mb-5 pb-5 border-b border-gray-100">
                  <div class="text-sm text-gray-500 mb-1">Стоимость</div>
                  <div class="text-3xl font-bold text-[#C8973A]">{{ room.priceMin.toLocaleString('ru') }}₽</div>
                  <div class="text-sm text-gray-400">до {{ room.priceMax.toLocaleString('ru') }}₽ / ночь</div>
                </div>

                <div class="space-y-3 mb-5">
                  <div class="flex justify-between text-sm">
                    <span class="text-gray-500">Площадь</span>
                    <span class="font-medium">{{ room.area }} м²</span>
                  </div>
                  <div class="flex justify-between text-sm">
                    <span class="text-gray-500">Вместимость</span>
                    <span class="font-medium">до {{ room.capacity }} чел.</span>
                  </div>
                  <div class="flex justify-between text-sm">
                    <span class="text-gray-500">Этаж</span>
                    <span class="font-medium">{{ room.floor }}-й</span>
                  </div>
                  <div class="flex justify-between text-sm">
                    <span class="text-gray-500">Категория</span>
                    <span class="font-medium">{{ room.type === 'econom' ? 'Эконом' : room.type === 'standard' ? 'Стандарт' : 'Люкс' }}</span>
                  </div>
                </div>

                <RouterLink v-if="room.available" :to="`/booking?room=${room.id}`" class="btn-primary w-full justify-center text-base py-3.5">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                  Забронировать этот номер
                </RouterLink>
                <div v-else class="bg-gray-100 rounded-xl p-4 text-center">
                  <svg class="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                  <p class="text-sm font-semibold text-gray-600">Номер временно недоступен</p>
                  <p class="text-xs text-gray-400 mt-1">Позвоните нам, мы поможем подобрать альтернативу</p>
                  <a href="tel:+79186723781" class="btn-secondary w-full justify-center mt-3 py-2.5 text-sm">Позвонить</a>
                </div>

                <div class="mt-4 text-center">
                  <a href="tel:+79186723781" class="text-sm text-[#C8973A] hover:underline flex items-center justify-center gap-1.5">
                    <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
                    Или позвоните нам
                  </a>
                </div>
              </div>

              <!-- Info -->
              <div class="card p-5 bg-[#F5F0E8] border-0">
                <h3 class="font-semibold text-gray-900 text-sm mb-3">ℹ️ Важно знать</h3>
                <ul class="space-y-2 text-xs text-gray-600">
                  <li>• Требуется предоплата при бронировании</li>
                  <li>• Дети до 3 лет — бесплатно</li>
                  <li>• С животными не принимаем</li>
                  <li>• Курение только на улице</li>
                  <li>• Заезд с 13:00, выезд до 12:00</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </template>

      <div v-else class="page-container py-20 text-center">
        <p class="text-gray-500">Номер не найден</p>
        <RouterLink to="/rooms" class="btn-primary mt-4 inline-flex">← Все номера</RouterLink>
      </div>
    </div>

    <AppFooter />

    <!-- Lightbox -->
    <Teleport to="body">
      <Transition name="lightbox">
        <div
          v-if="lightboxOpen"
          class="fixed inset-0 z-[100] bg-black/95 flex flex-col"
          @click.self="closeLightbox"
        >
          <!-- Top bar -->
          <div class="flex items-center justify-between px-6 py-4 shrink-0">
            <span class="text-white/60 text-sm">{{ lightboxIndex + 1 }} / {{ room?.images?.length }}</span>
            <button class="text-white/70 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors" @click="closeLightbox">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <!-- Main image -->
          <div class="flex-1 flex items-center justify-center relative px-16 min-h-0">
            <button
              v-if="(room?.images?.length ?? 0) > 1"
              class="absolute left-4 text-white/70 hover:text-white p-3 rounded-full hover:bg-white/10 transition-colors"
              @click="lightboxPrev"
            >
              <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
              </svg>
            </button>

            <img
              :src="room!.images[lightboxIndex]"
              class="max-h-full max-w-full object-contain select-none"
              @click.stop
            />

            <button
              v-if="(room?.images?.length ?? 0) > 1"
              class="absolute right-4 text-white/70 hover:text-white p-3 rounded-full hover:bg-white/10 transition-colors"
              @click="lightboxNext"
            >
              <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </button>
          </div>

          <!-- Thumbnails -->
          <div v-if="(room?.images?.length ?? 0) > 1" class="shrink-0 flex gap-2 overflow-x-auto px-6 py-4 justify-center">
            <button
              v-for="(img, idx) in room!.images"
              :key="idx"
              class="shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all"
              :class="lightboxIndex === idx ? 'border-white opacity-100' : 'border-white/20 opacity-40 hover:opacity-70'"
              @click="lightboxIndex = idx"
            >
              <img :src="img" class="w-full h-full object-cover">
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.lightbox-enter-active, .lightbox-leave-active { transition: opacity 0.2s ease; }
.lightbox-enter-from, .lightbox-leave-to { opacity: 0; }
</style>
