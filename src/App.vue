<script setup lang="ts">
import { RouterView } from 'vue-router'
import { isLoading } from '@/stores/loading'
</script>

<template>
  <Transition name="loader">
    <div v-if="isLoading" class="fixed inset-0 z-[200] bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4 pointer-events-none">
      <div class="w-14 h-14 rounded-full border-4 border-[#C8973A]/20 border-t-[#C8973A] animate-spin"></div>
      <span class="text-sm font-medium text-gray-500 tracking-wide">Загрузка...</span>
    </div>
  </Transition>

  <RouterView />
</template>

<style>
.loader-enter-active { transition: opacity 0.15s ease; }
.loader-leave-active { transition: opacity 0.25s ease; }
.loader-enter-from, .loader-leave-to { opacity: 0; }
</style>
