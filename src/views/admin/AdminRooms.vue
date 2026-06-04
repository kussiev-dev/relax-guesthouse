<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '@/api'

interface Room {
  id: number
  name: string
  type: string
  description: string
  shortDescription: string
  priceMin: number
  priceMax: number
  area: number
  capacity: number
  amenities: string[]
  images: string[]
  available: boolean
  totalRooms: number
}

const rooms = ref<Room[]>([])
const loading = ref(true)
const saving = ref<number | null>(null)
const editingRoom = ref<Room | null>(null)
const editForm = ref<Partial<Room>>({})
const newAmenity = ref('')
const uploadingImages = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)

onMounted(async () => {
  try {
    const { data } = await api.get('/rooms')
    rooms.value = data
  } finally {
    loading.value = false
  }
})

async function toggleAvailability(room: Room) {
  saving.value = room.id
  try {
    await api.put(`/rooms/${room.id}`, { available: !room.available })
    room.available = !room.available
  } finally {
    saving.value = null
  }
}

function startEdit(room: Room) {
  editingRoom.value = room
  editForm.value = { ...room, amenities: [...room.amenities], images: [...(room.images || [])] }
}

function cancelEdit() {
  editingRoom.value = null
  editForm.value = {}
  newAmenity.value = ''
}

function addAmenity() {
  const am = newAmenity.value.trim()
  if (!am) return
  if (!editForm.value.amenities) editForm.value.amenities = []
  editForm.value.amenities.push(am)
  newAmenity.value = ''
}

function removeAmenity(idx: number) {
  editForm.value.amenities?.splice(idx, 1)
}

async function uploadImages(event: Event) {
  const input = event.target as HTMLInputElement
  if (!input.files?.length || !editingRoom.value) return

  uploadingImages.value = true
  try {
    const formData = new FormData()
    for (const file of input.files) {
      formData.append('images', file)
    }
    const { data } = await api.post(`/rooms/${editingRoom.value.id}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    editForm.value.images = data.images
    const idx = rooms.value.findIndex(r => r.id === editingRoom.value!.id)
    if (idx !== -1) rooms.value[idx].images = data.images
  } finally {
    uploadingImages.value = false
    input.value = ''
  }
}

async function removeImage(url: string) {
  if (!editingRoom.value) return
  const { data } = await api.delete(`/rooms/${editingRoom.value.id}/images`, { data: { url } })
  editForm.value.images = data.images
  const idx = rooms.value.findIndex(r => r.id === editingRoom.value!.id)
  if (idx !== -1) rooms.value[idx].images = data.images
}

async function saveRoom() {
  if (!editingRoom.value) return
  saving.value = editingRoom.value.id
  try {
    const payload = {
      ...editForm.value,
      priceLabel: `от ${(editForm.value.priceMin ?? 0).toLocaleString('ru')} ₽/ночь`,
    }
    await api.put(`/rooms/${editingRoom.value.id}`, payload)
    const idx = rooms.value.findIndex(r => r.id === editingRoom.value!.id)
    if (idx !== -1) rooms.value[idx] = { ...rooms.value[idx], ...payload } as Room
    cancelEdit()
  } finally {
    saving.value = null
  }
}

const roomColors: Record<string, string> = {
  econom: 'from-amber-50 to-orange-100',
  standard: 'from-teal-50 to-cyan-100',
  lux: 'from-purple-50 to-indigo-100',
}
const roomIcons: Record<string, string> = { econom: '🛏️', standard: '🏠', lux: '👑' }
</script>

<template>
  <div>
    <div class="mb-6">
      <h2 class="text-xl font-bold text-gray-900">Управление номерами</h2>
      <p class="text-sm text-gray-500 mt-1">Отмечайте доступность и редактируйте информацию о номерах</p>
    </div>

    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div v-for="i in 3" :key="i" class="card p-6 animate-pulse">
        <div class="h-5 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div class="h-3 bg-gray-200 rounded w-full mb-2"></div>
        <div class="h-3 bg-gray-200 rounded w-3/4"></div>
      </div>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div v-for="room in rooms" :key="room.id" class="card overflow-hidden">
        <!-- Room image/header -->
        <div class="h-28 bg-gradient-to-br relative" :class="roomColors[room.type]">
          <img
            v-if="room.images?.[0]"
            :src="room.images[0]"
            class="absolute inset-0 w-full h-full object-cover"
          />
          <div v-else class="absolute inset-0 flex items-center justify-center">
            <span class="text-5xl opacity-30">{{ roomIcons[room.type] }}</span>
          </div>
          <div class="absolute top-3 left-3">
            <span class="badge bg-white/90 text-gray-700 font-semibold shadow-sm">{{ room.name }}</span>
          </div>
          <!-- Toggle availability -->
          <div class="absolute top-3 right-3">
            <button
              class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none cursor-pointer"
              :class="room.available ? 'bg-green-500' : 'bg-gray-300'"
              :disabled="saving === room.id"
              @click="toggleAvailability(room)"
              :title="room.available ? 'Нажмите, чтобы закрыть' : 'Нажмите, чтобы открыть'"
            >
              <span
                class="inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200"
                :class="room.available ? 'translate-x-6' : 'translate-x-1'"
              ></span>
            </button>
          </div>
        </div>

        <!-- Info -->
        <div class="p-5">
          <div class="flex items-center justify-between mb-3">
            <span :class="room.available ? 'badge-available' : 'badge-booked'">
              {{ room.available ? 'Открыт для бронирования' : 'Закрыт' }}
            </span>
            <span class="text-sm text-gray-500">{{ room.totalRooms }} ном.</span>
          </div>

          <div class="space-y-2 text-sm mb-4">
            <div class="flex justify-between">
              <span class="text-gray-500">Цена</span>
              <span class="font-medium">{{ room.priceMin.toLocaleString('ru') }}–{{ room.priceMax.toLocaleString('ru') }} ₽</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Площадь</span>
              <span class="font-medium">{{ room.area }} м²</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Вместимость</span>
              <span class="font-medium">до {{ room.capacity }} чел.</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Фото</span>
              <span class="font-medium">{{ (room.images || []).length }} шт.</span>
            </div>
          </div>

          <div class="flex flex-wrap gap-1.5 mb-4">
            <span v-for="am in room.amenities.slice(0, 4)" :key="am"
              class="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{{ am }}</span>
            <span v-if="room.amenities.length > 4" class="text-xs text-gray-400">+{{ room.amenities.length - 4 }}</span>
          </div>

          <button class="btn-outline w-full justify-center py-2 text-sm" @click="startEdit(room)">
            ✏️ Редактировать
          </button>
        </div>
      </div>
    </div>

    <!-- Edit Modal -->
    <Transition name="modal">
      <div v-if="editingRoom" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50"></div>
        <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
          <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
            <h3 class="font-bold text-gray-900">Редактировать: {{ editingRoom.name }}</h3>
            <button @click="cancelEdit" class="text-gray-400 hover:text-gray-600 cursor-pointer">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>

          <form class="p-4 sm:p-6 space-y-4" @submit.prevent="saveRoom">
            <!-- Name -->
            <div>
              <label class="label">Название номера</label>
              <input v-model="editForm.name" type="text" class="input-field" placeholder="Эконом, Стандарт, Люкс...">
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label class="label">Мин. цена (₽)</label>
                <input v-model.number="editForm.priceMin" type="number" class="input-field" min="0">
              </div>
              <div>
                <label class="label">Макс. цена (₽)</label>
                <input v-model.number="editForm.priceMax" type="number" class="input-field" min="0">
              </div>
              <div>
                <label class="label">Площадь (м²)</label>
                <input v-model.number="editForm.area" type="number" class="input-field" min="1">
              </div>
              <div>
                <label class="label">Вместимость</label>
                <input v-model.number="editForm.capacity" type="number" class="input-field" min="1" max="10">
              </div>
              <div>
                <label class="label">Кол-во номеров</label>
                <input v-model.number="editForm.totalRooms" type="number" class="input-field" min="1">
              </div>
              <div class="flex items-center gap-2 pt-6">
                <input v-model="editForm.available" type="checkbox" id="avail" class="w-4 h-4 accent-[#C8973A]">
                <label for="avail" class="text-sm font-medium text-gray-700">Доступен для бронирования</label>
              </div>
            </div>

            <div>
              <label class="label">Краткое описание <span class="text-gray-400 font-normal">(карточка на главной)</span></label>
              <input v-model="editForm.shortDescription" type="text" class="input-field" placeholder="Бюджетный номер с кондиционером...">
            </div>

            <div>
              <label class="label">Полное описание</label>
              <textarea v-model="editForm.description" class="input-field resize-none" rows="3"></textarea>
            </div>

            <div>
              <label class="label">Удобства</label>
              <div class="flex flex-wrap gap-2 mb-2">
                <span
                  v-for="(am, idx) in editForm.amenities"
                  :key="idx"
                  class="flex items-center gap-1 text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full"
                >
                  {{ am }}
                  <button type="button" @click="removeAmenity(idx)" class="text-gray-400 hover:text-red-500 ml-0.5">×</button>
                </span>
              </div>
              <div class="flex gap-2">
                <input v-model="newAmenity" type="text" class="input-field flex-1 text-sm py-2" placeholder="Добавить удобство..." @keydown.enter.prevent="addAmenity">
                <button type="button" class="btn-outline py-2 px-3 text-sm" @click="addAmenity">+</button>
              </div>
            </div>

            <!-- Photos -->
            <div>
              <label class="label">Фотографии</label>
              <div v-if="editForm.images?.length" class="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
                <div
                  v-for="img in editForm.images"
                  :key="img"
                  class="relative group aspect-square rounded-lg overflow-hidden bg-gray-100"
                >
                  <img :src="img" class="w-full h-full object-cover">
                  <button
                    type="button"
                    class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xl"
                    @click="removeImage(img)"
                    title="Удалить фото"
                  >
                    ×
                  </button>
                </div>
              </div>
              <div v-else class="text-sm text-gray-400 mb-3">Фотографий пока нет</div>

              <input
                ref="fileInputRef"
                type="file"
                accept="image/*"
                multiple
                class="hidden"
                @change="uploadImages"
              >
              <button
                type="button"
                class="btn-outline py-2 px-4 text-sm w-full justify-center"
                :disabled="uploadingImages"
                @click="fileInputRef?.click()"
              >
                <svg v-if="uploadingImages" class="w-4 h-4 animate-spin mr-1" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                {{ uploadingImages ? 'Загружаем...' : '+ Добавить фото' }}
              </button>
            </div>

            <div class="flex gap-3 pt-2">
              <button type="button" class="btn-ghost flex-1 justify-center" @click="cancelEdit">Отмена</button>
              <button type="submit" class="btn-primary flex-1 justify-center" :disabled="saving === editingRoom?.id">
                <svg v-if="saving" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                {{ saving ? 'Сохраняем...' : 'Сохранить' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: all 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
