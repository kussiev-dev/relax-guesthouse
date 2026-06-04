<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { RouterLink } from 'vue-router'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import api from '@/api'

interface Room {
  id: number
  name: string
  shortDescription: string
  priceLabel: string
  priceMin: number
  area: number
  capacity: number
  amenities: string[]
  images: string[]
  type: string
  totalRooms: number
}

interface Content {
  hero: { badge: string; title: string; titleHighlight: string; subtitle: string; description: string }
  features: { icon: string; title: string; desc: string }[]
  reviews: { name: string; date: string; text: string; rating: number }[]
  cta: { title: string; description: string }
  contacts: { phone: string; address: string }
}

const rooms = ref<Room[]>([])
const content = ref<Content | null>(null)

const totalRooms = computed(() => rooms.value.reduce((sum, r) => sum + (r.totalRooms || 0), 0))

onMounted(async () => {
  try {
    const [roomsRes, contentRes] = await Promise.all([
      api.get('/rooms'),
      api.get('/settings/homepage'),
    ])
    rooms.value = roomsRes.data
    content.value = contentRes.data
  } catch {}
})
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <AppHeader />

    <!-- Hero -->
    <section class="relative min-h-screen flex items-center justify-center overflow-hidden">
      <template v-if="content?.hero.bgImage">
        <img :src="content.hero.bgImage" class="absolute inset-0 w-full h-full object-cover">
        <div class="absolute inset-0 bg-black/45"></div>
        <!-- Затемнение по центру — там где контент -->
        <div class="absolute inset-0" style="background: radial-gradient(ellipse 65% 55% at 50% 52%, rgba(0,0,0,0.55) 0%, transparent 100%)"></div>
        <!-- Затемнение по краям экрана -->
        <div class="absolute inset-0" style="background: radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.4) 100%)"></div>
      </template>
      <template v-else>
        <div class="absolute inset-0 bg-gradient-to-br from-[#1B5E6B] via-[#1d6a7a] to-[#0d3d47]"></div>
        <div class="absolute inset-0 overflow-hidden">
          <div class="absolute -top-20 -right-20 w-96 h-96 bg-[#C8973A]/20 rounded-full blur-3xl"></div>
          <div class="absolute bottom-0 -left-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
          <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/5 rounded-full blur-3xl"></div>
        </div>
      </template>
      <div
        class="relative z-10 page-container text-center text-white py-32"
        :style="content?.hero.bgImage ? 'text-shadow: 0 2px 12px rgba(0,0,0,0.85)' : ''"
      >
        <div class="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
          <span class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
          {{ content?.hero.badge ?? 'Принимаем бронирования' }}
        </div>
        <h1 class="text-5xl desk:text-7xl font-bold mb-6 leading-tight">
          {{ content?.hero.title ?? 'Гостевой дом' }}<br>
          <span class="text-[#E8B860]">{{ content?.hero.titleHighlight ?? 'Релакс' }}</span>
        </h1>
        <p class="text-xl desk:text-2xl text-white/90 mb-4 max-w-2xl mx-auto">
          {{ content?.hero.subtitle ?? 'Ваш уютный отдых в Джемете, Анапа' }}
        </p>
        <p class="text-white/80 mb-10 max-w-xl mx-auto"
        >
          {{ totalRooms > 0 ? totalRooms : '' }}{{ totalRooms > 0 ? ' номеров · ' : '' }}{{ content?.hero.description ?? '5 мин. до моря · Парковка · Wi-Fi · Мангал' }}
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <template v-for="btn in (content?.hero.buttons ?? [])" :key="btn.label">
            <RouterLink
              v-if="btn.action === 'page'"
              :to="btn.target"
              :class="btn.style === 'filled' ? 'btn-primary text-base px-8 py-4' : 'btn-outline border-white text-white hover:bg-white hover:text-[#1B5E6B] text-base px-8 py-4'"
            >
              <svg v-if="btn.showIcon" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
              {{ btn.label }}
            </RouterLink>
            <a
              v-else
              :href="`tel:${content?.contacts.phone ?? ''}`"
              :class="btn.style === 'filled' ? 'btn-primary text-base px-8 py-4' : 'btn-outline border-white text-white hover:bg-white hover:text-[#1B5E6B] text-base px-8 py-4'"
            >
              <svg v-if="btn.showIcon" class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
              {{ btn.label }}
            </a>
          </template>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-3 gap-6 mt-16 max-w-lg mx-auto">
          <div class="text-center">
            <div class="text-3xl font-bold text-[#E8B860]">{{ totalRooms || '—' }}</div>
            <div class="text-sm text-white/60 mt-1">номеров</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-[#E8B860]">5★</div>
            <div class="text-sm text-white/60 mt-1">рейтинг</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-[#E8B860]">5 мин</div>
            <div class="text-sm text-white/60 mt-1">до моря</div>
          </div>
        </div>
      </div>

      <!-- Scroll indicator -->
      <div class="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50 animate-bounce">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
        </svg>
      </div>
    </section>

    <!-- Features -->
    <section class="py-20 bg-white">
      <div class="page-container">
        <div class="text-center mb-12">
          <h2 class="section-title">Почему выбирают нас</h2>
          <p class="section-subtitle">Всё для вашего комфортного отдыха</p>
        </div>
        <div class="grid grid-cols-2 desk:grid-cols-4 gap-5">
          <div
            v-for="feat in (content?.features ?? [])"
            :key="feat.title"
            class="text-center p-6 rounded-2xl bg-[#F5F0E8] hover:bg-[#C8973A]/10 transition-colors duration-200 group"
          >
            <div class="text-4xl mb-3 group-hover:scale-110 transition-transform duration-200">{{ feat.icon }}</div>
            <h3 class="font-semibold text-gray-900 text-sm">{{ feat.title }}</h3>
            <p class="text-xs text-gray-500 mt-1">{{ feat.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Rooms preview -->
    <section class="py-20 bg-[#FAFAF7]">
      <div class="page-container">
        <div class="flex flex-col desk:flex-row desk:items-end justify-between gap-4 mb-12">
          <div>
            <h2 class="section-title">Наши номера</h2>
            <p class="text-gray-500 mt-2">Выберите подходящий вариант для вашего отдыха</p>
          </div>
          <RouterLink to="/rooms" class="btn-outline shrink-0">
            Все номера →
          </RouterLink>
        </div>

        <div class="grid grid-cols-1 desk:grid-cols-3 gap-6">
          <RouterLink
            v-for="room in rooms"
            :key="room.id"
            :to="`/rooms/${room.id}`"
            class="card group cursor-pointer"
          >
            <!-- Room image -->
            <div class="relative h-52 overflow-hidden"
              :class="{
                'bg-gradient-to-br from-amber-100 to-amber-200': room.type === 'econom',
                'bg-gradient-to-br from-teal-100 to-teal-200': room.type === 'standard',
                'bg-gradient-to-br from-purple-100 to-purple-200': room.type === 'lux',
              }"
            >
              <img
                v-if="room.images?.[0]"
                :src="room.images[0]"
                class="absolute inset-0 w-full h-full object-cover"
              />
              <div v-else class="absolute inset-0 flex items-center justify-center">
                <svg class="w-20 h-20 opacity-20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M7 13c1.66 0 3-1.34 3-3S8.66 7 7 7s-3 1.34-3 3 1.34 3 3 3zm12-6h-8v7H3V5H1v15h2v-3h18v3h2v-9c0-2.21-1.79-4-4-4z"/>
                </svg>
              </div>
              <div class="absolute top-3 left-3">
                <span class="badge bg-white/90 text-gray-700 font-semibold shadow-sm">{{ room.name }}</span>
              </div>
              <div class="absolute top-3 right-3">
                <span class="badge bg-[#C8973A] text-white">от {{ room.priceMin.toLocaleString('ru') }} ₽</span>
              </div>
              <div class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
            </div>
            <div class="p-5">
              <p class="text-gray-600 text-sm mb-4 line-clamp-2">{{ room.shortDescription }}</p>
              <div class="flex items-center gap-4 text-xs text-gray-500 mb-4">
                <span class="flex items-center gap-1">
                  <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
                  {{ room.area }} м²
                </span>
                <span class="flex items-center gap-1">
                  <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
                  до {{ room.capacity }} чел.
                </span>
              </div>
              <div class="flex flex-wrap gap-1.5 mb-4">
                <span v-for="am in room.amenities.slice(0, 3)" :key="am"
                  class="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{{ am }}</span>
                <span v-if="room.amenities.length > 3" class="text-xs text-gray-400">+{{ room.amenities.length - 3 }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="font-bold text-[#C8973A] text-lg">от {{ room.priceMin.toLocaleString('ru') }} ₽/ночь</span>
                <span class="text-[#C8973A] text-sm font-medium group-hover:translate-x-1 transition-transform inline-block">Подробнее →</span>
              </div>
            </div>
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- CTA Banner -->
    <section class="py-16 desk:py-28 relative overflow-hidden" :class="content?.cta.bgImage ? '' : 'bg-gradient-to-r from-[#1B5E6B] to-[#C8973A]'">
      <template v-if="content?.cta.bgImage">
        <img :src="content.cta.bgImage" class="absolute inset-0 w-full h-full object-cover">
        <div class="absolute inset-0 bg-black/60"></div>
      </template>
      <div class="relative page-container text-center text-white">
        <h2 class="text-3xl desk:text-4xl font-bold mb-4">{{ content?.cta.title ?? 'Готовы к отдыху?' }}</h2>
        <p class="text-white/80 text-lg mb-8 max-w-xl mx-auto">
          {{ content?.cta.description ?? 'Оставьте заявку — мы свяжемся с вами в течение часа и подтвердим бронирование' }}
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <template v-for="btn in (content?.cta.buttons ?? [])" :key="btn.label">
            <RouterLink
              v-if="btn.action === 'page'"
              :to="btn.target"
              :class="btn.style === 'filled'
                ? 'bg-white text-[#1B5E6B] font-semibold px-8 py-4 rounded-xl hover:bg-gray-100 transition-colors inline-flex items-center gap-2 justify-center'
                : 'border-2 border-white text-white hover:bg-white hover:text-[#1B5E6B] font-semibold px-8 py-4 rounded-xl transition-colors inline-flex items-center gap-2 justify-center'"
            >
              <svg v-if="btn.showIcon" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
              {{ btn.label }}
            </RouterLink>
            <a
              v-else
              :href="`tel:${content?.contacts.phone ?? ''}`"
              :class="btn.style === 'filled'
                ? 'bg-white text-[#1B5E6B] font-semibold px-8 py-4 rounded-xl hover:bg-gray-100 transition-colors inline-flex items-center gap-2 justify-center'
                : 'border-2 border-white text-white hover:bg-white hover:text-[#1B5E6B] font-semibold px-8 py-4 rounded-xl transition-colors inline-flex items-center gap-2 justify-center'"
            >
              <svg v-if="btn.showIcon" class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
              {{ btn.label }}
            </a>
          </template>
        </div>
      </div>
    </section>

    <!-- Reviews -->
    <section class="py-20 bg-white">
      <div class="page-container">
        <div class="text-center mb-12">
          <h2 class="section-title">Отзывы гостей</h2>
          <p class="section-subtitle">Что говорят те, кто уже отдохнул у нас</p>
        </div>
        <div class="grid grid-cols-1 desk:grid-cols-3 gap-6">
          <div v-for="review in (content?.reviews ?? [])" :key="review.name" class="card p-6">
            <div class="flex items-center gap-1 mb-3">
              <svg v-for="i in review.rating" :key="i" class="w-4 h-4 text-[#C8973A]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
              </svg>
            </div>
            <p class="text-gray-600 text-sm leading-relaxed mb-4">"{{ review.text }}"</p>
            <div class="flex items-center justify-between">
              <span class="font-semibold text-gray-900 text-sm">{{ review.name }}</span>
              <span class="text-xs text-gray-400">{{ review.date }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Location -->
    <section class="py-16 bg-[#FAFAF7]">
      <div class="page-container">
        <div class="grid grid-cols-1 desk:grid-cols-2 gap-10 items-center">
          <div>
            <h2 class="section-title mb-4">{{ content?.location.title ?? 'Как нас найти' }}</h2>
            <p class="text-gray-500 mb-6">{{ content?.location.description ?? 'Мы находимся в самом центре Джемете — всё рядом!' }}</p>
            <ul class="space-y-3">
              <li v-for="(item, i) in (content?.location.items ?? [])" :key="i" class="flex items-center gap-3 text-gray-700">
                <span class="w-8 h-8 bg-[#F5F0E8] rounded-lg flex items-center justify-center text-base shrink-0">{{ item.icon }}</span>
                {{ item.text }}
              </li>
            </ul>
            <div class="mt-6 p-4 bg-[#F5F0E8] rounded-xl">
              <p class="text-sm font-semibold text-gray-900">📍 Адрес:</p>
              <p class="text-sm text-gray-600 mt-1">{{ content?.contacts.address ?? 'г. Анапа, Джемете, Пионерский проспект, 127/а' }}</p>
            </div>
          </div>
          <div class="rounded-2xl overflow-hidden shadow-lg h-64 desk:h-80 bg-[#C8973A]/10 flex items-center justify-center">
            <div class="text-center p-8">
              <div class="text-5xl mb-4">📍</div>
              <p class="font-semibold text-gray-900">Пионерский проспект 127/а</p>
              <p class="text-gray-500 text-sm mt-1">Джемете, Анапа</p>
              <a
                :href="content?.location.mapUrl ?? 'https://yandex.ru/maps/?text=Анапа+Джемете+Пионерский+проспект+127'"
                target="_blank"
                class="inline-block mt-4 btn-primary py-2 text-sm"
              >
                Открыть на карте
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>

    <AppFooter />
  </div>
</template>
