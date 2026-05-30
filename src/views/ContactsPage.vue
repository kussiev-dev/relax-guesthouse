<script setup lang="ts">
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <AppHeader />

    <div class="pt-20">
      <!-- Header -->
      <div class="bg-gradient-to-br from-[#1B5E6B] to-[#134A56] text-white">
        <div class="page-container py-14">
          <div class="flex items-center gap-2 text-white/60 text-sm mb-3">
            <RouterLink to="/" class="hover:text-white">Главная</RouterLink>
            <span>/</span>
            <span>Контакты</span>
          </div>
          <h1 class="text-4xl md:text-5xl font-bold">Контакты</h1>
          <p class="text-white/70 text-lg mt-2">Мы всегда на связи</p>
        </div>
      </div>

      <div class="page-container py-14">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <!-- Contact cards -->
          <div class="space-y-5">
            <div class="card p-6">
              <h2 class="font-bold text-gray-900 text-lg mb-5">Как с нами связаться</h2>
              <div class="space-y-5">
                <div class="flex items-start gap-4">
                  <div class="w-11 h-11 bg-[#1B5E6B]/10 rounded-xl flex items-center justify-center shrink-0">
                    <svg class="w-5 h-5 text-[#1B5E6B]" fill="currentColor" viewBox="0 0 24 24"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
                  </div>
                  <div>
                    <div class="font-semibold text-gray-900 mb-1">Телефоны</div>
                    <a href="tel:+79186723781" class="block text-[#C8973A] hover:underline font-medium">+7 (918) 672-37-81</a>
                    <a href="tel:+79186397266" class="block text-[#C8973A] hover:underline mt-0.5">+7 (918) 639-72-66 (Манана)</a>
                  </div>
                </div>

                <div class="flex items-start gap-4">
                  <div class="w-11 h-11 bg-[#C8973A]/10 rounded-xl flex items-center justify-center shrink-0">
                    <svg class="w-5 h-5 text-[#C8973A]" fill="currentColor" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
                  </div>
                  <div>
                    <div class="font-semibold text-gray-900 mb-1">Email</div>
                    <a href="mailto:mananarelax@gmail.com" class="text-[#C8973A] hover:underline">mananarelax@gmail.com</a>
                  </div>
                </div>

                <div class="flex items-start gap-4">
                  <div class="w-11 h-11 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                    <svg class="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248l-2.018 9.509c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.881.712z"/></svg>
                  </div>
                  <div>
                    <div class="font-semibold text-gray-900 mb-1">Telegram</div>
                    <a href="https://t.me/manana013" target="_blank" class="text-[#C8973A] hover:underline">@manana013</a>
                  </div>
                </div>

                <div class="flex items-start gap-4">
                  <div class="w-11 h-11 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
                    <svg class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                  </div>
                  <div>
                    <div class="font-semibold text-gray-900 mb-1">Адрес</div>
                    <p class="text-gray-600 text-sm">г. Анапа, Джемете<br>Пионерский проспект, 127/а</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Hours -->
            <div class="card p-6 bg-[#F5F0E8] border-0">
              <h3 class="font-semibold text-gray-900 mb-4">Время работы</h3>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-600">Заезд</span>
                  <span class="font-medium">с 13:00</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Выезд</span>
                  <span class="font-medium">до 12:00</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Ресепшн</span>
                  <span class="font-medium">9:00 – 22:00</span>
                </div>
              </div>
            </div>

            <RouterLink to="/booking" class="btn-primary w-full justify-center text-base py-4 block text-center">
              Забронировать номер
            </RouterLink>
          </div>

          <!-- Map placeholder + surroundings -->
          <div class="space-y-5">
            <div class="card p-8 text-center h-64 flex flex-col items-center justify-center bg-gradient-to-br from-[#1B5E6B]/5 to-[#C8973A]/5">
              <div class="text-6xl mb-4">🗺️</div>
              <h3 class="font-bold text-gray-900 mb-2">Пионерский проспект, 127/а</h3>
              <p class="text-gray-500 text-sm mb-4">Джемете, Анапа, Краснодарский край</p>
              <a
                href="https://yandex.ru/maps/?text=Анапа+Джемете+Пионерский+проспект+127"
                target="_blank"
                class="btn-secondary py-2 text-sm"
              >
                Открыть в Яндекс.Картах
              </a>
            </div>

            <div class="card p-6">
              <h3 class="font-semibold text-gray-900 mb-4">Что рядом с нами</h3>
              <div class="space-y-3">
                <div v-for="place in [
                  { icon: '🏖️', name: 'Пляж', distance: '5–7 минут пешком' },
                  { icon: '🛒', name: 'Магнит / Пятёрочка', distance: 'Вплотную' },
                  { icon: '🎪', name: 'Центр развлечений', distance: '1 минута' },
                  { icon: '💧', name: 'Аквапарк', distance: '10 минут' },
                  { icon: '🛍️', name: 'Рынок', distance: '1 минута' },
                  { icon: '💇', name: 'Салон красоты', distance: 'На территории' },
                ]" :key="place.name" class="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <span class="flex items-center gap-2.5 text-sm text-gray-700">
                    <span class="text-lg">{{ place.icon }}</span>
                    {{ place.name }}
                  </span>
                  <span class="text-xs text-[#C8973A] font-medium">{{ place.distance }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <AppFooter />
  </div>
</template>
