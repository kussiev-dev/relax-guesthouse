<script setup lang="ts">
import { RouterLink } from 'vue-router'
const year = new Date().getFullYear()
</script>

<template>
  <footer class="bg-[#1a1a1a] text-gray-300">
    <div class="page-container py-14">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-10">
        <!-- Brand -->
        <div>
          <div class="flex items-center gap-2.5 mb-4">
            <div class="w-9 h-9 bg-[#C8973A] rounded-xl flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
              </svg>
            </div>
            <div>
              <span class="font-bold text-lg text-white block leading-tight">Гостевой дом Релакс</span>
              <span class="text-xs text-gray-500">Джемете, Анапа</span>
            </div>
          </div>
          <p class="text-sm text-gray-400 leading-relaxed">
            Уютный гостевой дом в 5 минутах от моря. 18 номеров разных категорий для комфортного семейного отдыха.
          </p>
        </div>

        <!-- Navigation -->
        <div>
          <h4 class="text-white font-semibold mb-4">Навигация</h4>
          <ul class="space-y-2">
            <li><RouterLink to="/" class="text-sm text-gray-400 hover:text-[#C8973A] transition-colors">Главная</RouterLink></li>
            <li><RouterLink to="/rooms" class="text-sm text-gray-400 hover:text-[#C8973A] transition-colors">Номера</RouterLink></li>
            <li><RouterLink to="/booking" class="text-sm text-gray-400 hover:text-[#C8973A] transition-colors">Бронирование</RouterLink></li>
            <li><RouterLink to="/contacts" class="text-sm text-gray-400 hover:text-[#C8973A] transition-colors">Контакты</RouterLink></li>
          </ul>
        </div>

        <!-- Contacts -->
        <div>
          <h4 class="text-white font-semibold mb-4">Контакты</h4>
          <ul class="space-y-3">
            <li class="flex items-start gap-2.5">
              <svg class="w-4 h-4 text-[#C8973A] mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              <span class="text-sm text-gray-400">Анапа, Джемете, Пионерский проспект 127/а</span>
            </li>
            <li class="flex items-center gap-2.5">
              <svg class="w-4 h-4 text-[#C8973A] shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
              </svg>
              <a href="tel:+79186723781" class="text-sm text-gray-400 hover:text-[#C8973A] transition-colors">+7 (918) 672-37-81</a>
            </li>
            <li class="flex items-center gap-2.5">
              <svg class="w-4 h-4 text-[#C8973A] shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
              </svg>
              <a href="tel:+79186397266" class="text-sm text-gray-400 hover:text-[#C8973A] transition-colors">+7 (918) 639-72-66 (Манана)</a>
            </li>
            <li class="flex items-center gap-2.5">
              <svg class="w-4 h-4 text-[#C8973A] shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
              </svg>
              <a href="mailto:mananarelax@gmail.com" class="text-sm text-gray-400 hover:text-[#C8973A] transition-colors">mananarelax@gmail.com</a>
            </li>
          </ul>
        </div>
      </div>

      <div class="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
        <p class="text-sm text-gray-500">© {{ year }} Гостевой дом Релакс. Все права защищены.</p>
        <div class="flex items-center gap-2 text-sm text-gray-500">
          <svg class="w-4 h-4 text-[#C8973A]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
          </svg>
          Джемете, Анапа
        </div>
      </div>
    </div>
  </footer>
</template>
