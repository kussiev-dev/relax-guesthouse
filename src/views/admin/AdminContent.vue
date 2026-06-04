<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '@/api'

interface Btn { label: string; style: 'filled' | 'outline'; action: 'page' | 'phone'; target: string; showIcon: boolean }
interface Feature { icon: string; title: string; desc: string }
interface Review { name: string; date: string; text: string; rating: number }
interface LocationItem { icon: string; text: string }

interface Homepage {
  hero: { badge: string; title: string; titleHighlight: string; subtitle: string; description: string; buttons: Btn[]; bgImage?: string }
  features: Feature[]
  cta: { title: string; description: string; buttons: Btn[]; bgImage?: string }
  reviews: Review[]
  location: { title: string; description: string; items: LocationItem[]; mapUrl: string }
  contacts: { phone: string; address: string }
}

interface SiteSettings {
  header: { phone: string; phoneDisplay: string }
  footer: {
    description: string
    phones: { number: string; display: string; label: string }[]
    email: string
    address: string
  }
}

type Tab = 'hero' | 'features' | 'cta' | 'reviews' | 'location' | 'header' | 'footer'

const tab = ref<Tab>('hero')
const homepage = ref<Homepage | null>(null)
const site = ref<SiteSettings | null>(null)
const loading = ref(true)
const saving = ref(false)
const saved = ref(false)
const uploadingImage = ref<string | null>(null)

onMounted(async () => {
  try {
    const [hp, st] = await Promise.all([api.get('/settings/homepage'), api.get('/settings/site')])
    const data: Homepage = hp.data
    if (!data.hero.buttons) data.hero.buttons = [
      { label: 'Забронировать', style: 'filled', action: 'page', target: '/booking', showIcon: true },
      { label: 'Смотреть номера', style: 'outline', action: 'page', target: '/rooms', showIcon: false },
    ]
    data.hero.buttons.forEach(b => { if (b.showIcon === undefined) b.showIcon = false })
    if (!data.cta.buttons) data.cta.buttons = [
      { label: 'Забронировать онлайн', style: 'filled', action: 'page', target: '/booking', showIcon: true },
      { label: 'Позвонить', style: 'outline', action: 'phone', target: '', showIcon: true },
    ]
    data.cta.buttons.forEach(b => { if (b.showIcon === undefined) b.showIcon = false })
    if (!data.location) data.location = { title: 'Как нас найти', description: 'Мы находимся в самом центре Джемете — всё рядом!', items: [], mapUrl: '' }
    homepage.value = data
    site.value = st.data
  } finally {
    loading.value = false
  }
})

async function save() {
  saving.value = true
  try {
    await Promise.all([
      api.put('/settings/homepage', homepage.value),
      api.put('/settings/site', site.value),
    ])
    saved.value = true
    setTimeout(() => saved.value = false, 2500)
  } finally {
    saving.value = false
  }
}

const pageOptions = [
  { label: 'Главная', value: '/' },
  { label: 'Номера', value: '/rooms' },
  { label: 'Бронирование', value: '/booking' },
  { label: 'Контакты', value: '/contacts' },
]

async function uploadBgImage(section: 'hero' | 'cta', event: Event) {
  const input = event.target as HTMLInputElement
  if (!input.files?.[0] || !homepage.value) return
  uploadingImage.value = section
  try {
    const formData = new FormData()
    formData.append('image', input.files[0])
    const { data } = await api.post('/settings/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
    homepage.value[section].bgImage = data.url
  } finally {
    uploadingImage.value = null
    input.value = ''
  }
}

function clearBgImage(section: 'hero' | 'cta') {
  if (homepage.value) homepage.value[section].bgImage = undefined
}

function addBtn(list: Btn[]) {
  list.push({ label: 'Кнопка', style: 'filled', action: 'page', target: '/booking', showIcon: false })
}
function removeBtn(list: Btn[], i: number) { list.splice(i, 1) }

function addFeature() { homepage.value!.features.push({ icon: '⭐', title: '', desc: '' }) }
function removeFeature(i: number) { homepage.value!.features.splice(i, 1) }

function addReview() { homepage.value!.reviews.push({ name: '', date: '', text: '', rating: 5 }) }
function removeReview(i: number) { homepage.value!.reviews.splice(i, 1) }

function addLocationItem() { homepage.value!.location.items.push({ icon: '📍', text: '' }) }
function removeLocationItem(i: number) { homepage.value!.location.items.splice(i, 1) }

function addPhone() { site.value!.footer.phones.push({ number: '', display: '', label: '' }) }
function removePhone(i: number) { site.value!.footer.phones.splice(i, 1) }

const tabs = [
  { key: 'hero',     label: 'Герой' },
  { key: 'features', label: 'Преимущества' },
  { key: 'cta',      label: 'Баннер' },
  { key: 'reviews',  label: 'Отзывы' },
  { key: 'location', label: 'Как нас найти' },
  { key: 'header',   label: 'Шапка' },
  { key: 'footer',   label: 'Подвал' },
] as const
</script>

<template>
  <div>
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h2 class="text-xl font-bold text-gray-900">Контент главной страницы</h2>
        <p class="text-sm text-gray-500 mt-1">Редактируйте тексты, блоки и контакты сайта</p>
      </div>
      <button
        class="btn-primary px-6 py-2.5 text-sm flex items-center gap-2 cursor-pointer"
        :disabled="saving || loading"
        @click="save"
      >
        <svg v-if="saving" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
        <svg v-else-if="saved" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
        </svg>
        {{ saved ? 'Сохранено!' : saving ? 'Сохраняем...' : 'Сохранить' }}
      </button>
    </div>

    <div v-if="loading" class="card p-10 text-center">
      <div class="w-8 h-8 border-4 border-[#C8973A] border-t-transparent rounded-full animate-spin mx-auto"></div>
    </div>

    <template v-else-if="homepage && site">
      <!-- Tabs -->
      <div class="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl flex-wrap">
        <button
          v-for="t in tabs" :key="t.key"
          class="px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer"
          :class="tab === t.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
          @click="tab = t.key"
        >{{ t.label }}</button>
      </div>

      <!-- ───── ГЕРОЙ ───── -->
      <div v-if="tab === 'hero'" class="space-y-4">
        <div class="card p-6 space-y-4">
          <div>
            <label class="label">Бейдж (маленькая плашка)</label>
            <input v-model="homepage.hero.badge" type="text" class="input-field">
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="label">Заголовок</label>
              <input v-model="homepage.hero.title" type="text" class="input-field">
            </div>
            <div>
              <label class="label">Акцентное слово (золотое)</label>
              <input v-model="homepage.hero.titleHighlight" type="text" class="input-field">
            </div>
          </div>
          <div>
            <label class="label">Подзаголовок</label>
            <input v-model="homepage.hero.subtitle" type="text" class="input-field">
          </div>
          <div>
            <label class="label">Строка под подзаголовком</label>
            <input v-model="homepage.hero.description" type="text" class="input-field">
          </div>
        </div>

        <div class="card p-6">
          <p class="text-sm font-medium text-gray-700 mb-3">Фоновое фото</p>
          <div v-if="homepage.hero.bgImage" class="relative mb-3 rounded-xl overflow-hidden h-40 bg-gray-100">
            <img :src="homepage.hero.bgImage" class="w-full h-full object-cover">
            <button type="button" class="absolute top-2 right-2 bg-black/60 hover:bg-red-600 text-white rounded-lg px-3 py-1 text-xs transition-colors cursor-pointer" @click="clearBgImage('hero')">Удалить</button>
          </div>
          <label class="btn-outline w-full justify-center py-3 text-sm cursor-pointer">
            <svg v-if="uploadingImage === 'hero'" class="w-4 h-4 animate-spin mr-1" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
            {{ uploadingImage === 'hero' ? 'Загружаем...' : homepage.hero.bgImage ? '🔄 Заменить фото' : '+ Загрузить фото' }}
            <input type="file" accept="image/*" class="hidden" @change="uploadBgImage('hero', $event)">
          </label>
          <p class="text-xs text-gray-400 mt-2">Рекомендуется широкоформатное фото (16:9). Поверх будет тёмный оверлей.</p>
        </div>

        <div class="card p-6">
          <p class="text-sm font-medium text-gray-700 mb-3">Кнопки</p>
          <div class="space-y-3">
            <div v-for="(btn, i) in homepage.hero.buttons" :key="i" class="flex flex-wrap gap-3 items-end p-3 bg-gray-50 rounded-xl">
              <div class="flex-1">
                <label class="label">Текст кнопки</label>
                <input v-model="btn.label" type="text" class="input-field">
              </div>
              <div class="w-full sm:w-44">
                <label class="label">Стиль</label>
                <select v-model="btn.style" class="input-field">
                  <option value="filled">С заливкой (основная)</option>
                  <option value="outline">Без заливки (контурная)</option>
                </select>
              </div>
              <div class="w-full sm:w-36">
                <label class="label">Действие</label>
                <select v-model="btn.action" class="input-field" @change="btn.target = btn.action === 'phone' ? '' : '/'">
                  <option value="page">Страница</option>
                  <option value="phone">Позвонить</option>
                </select>
              </div>
              <div v-if="btn.action === 'page'" class="w-full sm:w-44">
                <label class="label">Страница</label>
                <select v-model="btn.target" class="input-field">
                  <option v-for="p in pageOptions" :key="p.value" :value="p.value">{{ p.label }}</option>
                </select>
              </div>
              <div class="flex flex-col items-center gap-1 shrink-0">
                <label class="label text-center">Иконка</label>
                <input type="checkbox" v-model="btn.showIcon" class="w-4 h-4 accent-[#C8973A] cursor-pointer mt-2">
              </div>
              <button type="button" class="mb-1 text-gray-300 hover:text-red-400 transition-colors cursor-pointer shrink-0" @click="removeBtn(homepage.hero.buttons, i)">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
          </div>
          <button type="button" class="btn-outline w-full justify-center py-2.5 text-sm mt-3" @click="addBtn(homepage.hero.buttons)">
            + Добавить кнопку
          </button>
        </div>
      </div>

      <!-- ───── ПРЕИМУЩЕСТВА ───── -->
      <div v-if="tab === 'features'" class="space-y-3">
        <div v-for="(f, i) in homepage.features" :key="i" class="card p-4">
          <div class="flex gap-3 items-start">
            <div class="w-16 shrink-0">
              <label class="label">Иконка</label>
              <input v-model="f.icon" type="text" class="input-field text-center text-xl">
            </div>
            <div class="flex-1">
              <label class="label">Заголовок</label>
              <input v-model="f.title" type="text" class="input-field">
            </div>
            <div class="flex-1">
              <label class="label">Описание</label>
              <input v-model="f.desc" type="text" class="input-field">
            </div>
            <button type="button" class="mt-6 text-gray-300 hover:text-red-400 transition-colors cursor-pointer shrink-0" @click="removeFeature(i)">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
        </div>
        <button type="button" class="btn-outline w-full justify-center py-3 text-sm" @click="addFeature">+ Добавить преимущество</button>
      </div>

      <!-- ───── БАННЕР ───── -->
      <div v-if="tab === 'cta'" class="space-y-4">
        <div class="card p-6 space-y-4">
          <div>
            <label class="label">Заголовок баннера</label>
            <input v-model="homepage.cta.title" type="text" class="input-field">
          </div>
          <div>
            <label class="label">Описание</label>
            <textarea v-model="homepage.cta.description" class="input-field resize-none" rows="3"></textarea>
          </div>
        </div>

        <div class="card p-6">
          <p class="text-sm font-medium text-gray-700 mb-3">Фоновое фото баннера</p>
          <div v-if="homepage.cta.bgImage" class="relative mb-3 rounded-xl overflow-hidden h-32 bg-gray-100">
            <img :src="homepage.cta.bgImage" class="w-full h-full object-cover">
            <button type="button" class="absolute top-2 right-2 bg-black/60 hover:bg-red-600 text-white rounded-lg px-3 py-1 text-xs transition-colors cursor-pointer" @click="clearBgImage('cta')">Удалить</button>
          </div>
          <label class="btn-outline w-full justify-center py-3 text-sm cursor-pointer">
            <svg v-if="uploadingImage === 'cta'" class="w-4 h-4 animate-spin mr-1" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
            {{ uploadingImage === 'cta' ? 'Загружаем...' : homepage.cta.bgImage ? '🔄 Заменить фото' : '+ Загрузить фото' }}
            <input type="file" accept="image/*" class="hidden" @change="uploadBgImage('cta', $event)">
          </label>
          <p class="text-xs text-gray-400 mt-2">Если не загружено — будет градиент. Поверх фото накладывается тёмный оверлей.</p>
        </div>

        <div class="card p-6">
          <p class="text-sm font-medium text-gray-700 mb-3">Кнопки</p>
          <div class="space-y-3">
            <div v-for="(btn, i) in homepage.cta.buttons" :key="i" class="flex flex-wrap gap-3 items-end p-3 bg-gray-50 rounded-xl">
              <div class="flex-1">
                <label class="label">Текст кнопки</label>
                <input v-model="btn.label" type="text" class="input-field">
              </div>
              <div class="w-full sm:w-44">
                <label class="label">Стиль</label>
                <select v-model="btn.style" class="input-field">
                  <option value="filled">С заливкой (основная)</option>
                  <option value="outline">Без заливки (контурная)</option>
                </select>
              </div>
              <div class="w-full sm:w-36">
                <label class="label">Действие</label>
                <select v-model="btn.action" class="input-field" @change="btn.target = btn.action === 'phone' ? '' : '/'">
                  <option value="page">Страница</option>
                  <option value="phone">Позвонить</option>
                </select>
              </div>
              <div v-if="btn.action === 'page'" class="w-full sm:w-44">
                <label class="label">Страница</label>
                <select v-model="btn.target" class="input-field">
                  <option v-for="p in pageOptions" :key="p.value" :value="p.value">{{ p.label }}</option>
                </select>
              </div>
              <div class="flex flex-col items-center gap-1 shrink-0">
                <label class="label text-center">Иконка</label>
                <input type="checkbox" v-model="btn.showIcon" class="w-4 h-4 accent-[#C8973A] cursor-pointer mt-2">
              </div>
              <button type="button" class="mb-1 text-gray-300 hover:text-red-400 transition-colors cursor-pointer shrink-0" @click="removeBtn(homepage.cta.buttons, i)">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
          </div>
          <button type="button" class="btn-outline w-full justify-center py-2.5 text-sm mt-3" @click="addBtn(homepage.cta.buttons)">+ Добавить кнопку</button>
        </div>
      </div>

      <!-- ───── ОТЗЫВЫ ───── -->
      <div v-if="tab === 'reviews'" class="space-y-3">
        <div v-for="(r, i) in homepage.reviews" :key="i" class="card p-4 space-y-3">
          <div class="flex gap-3">
            <div class="flex-1">
              <label class="label">Имя</label>
              <input v-model="r.name" type="text" class="input-field">
            </div>
            <div class="flex-1">
              <label class="label">Дата</label>
              <input v-model="r.date" type="text" class="input-field" placeholder="Август 2024">
            </div>
            <div class="w-24 shrink-0">
              <label class="label">Рейтинг</label>
              <select v-model.number="r.rating" class="input-field">
                <option v-for="n in 5" :key="n" :value="n">{{ n }} ★</option>
              </select>
            </div>
            <button type="button" class="mt-6 text-gray-300 hover:text-red-400 transition-colors cursor-pointer shrink-0" @click="removeReview(i)">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
          <div>
            <label class="label">Текст отзыва</label>
            <textarea v-model="r.text" class="input-field resize-none" rows="2"></textarea>
          </div>
        </div>
        <button type="button" class="btn-outline w-full justify-center py-3 text-sm" @click="addReview">+ Добавить отзыв</button>
      </div>

      <!-- ───── КАК НАС НАЙТИ ───── -->
      <div v-if="tab === 'location'" class="space-y-4">
        <div class="card p-6 space-y-4">
          <div>
            <label class="label">Заголовок раздела</label>
            <input v-model="homepage.location.title" type="text" class="input-field">
          </div>
          <div>
            <label class="label">Описание</label>
            <input v-model="homepage.location.description" type="text" class="input-field">
          </div>
        </div>
        <div class="card p-6 space-y-3">
          <p class="text-sm font-medium text-gray-700">Пункты списка</p>
          <div v-for="(item, i) in homepage.location.items" :key="i" class="flex gap-3 items-center">
            <div class="w-16 shrink-0">
              <input v-model="item.icon" type="text" class="input-field text-center text-xl" placeholder="🏖️">
            </div>
            <div class="flex-1">
              <input v-model="item.text" type="text" class="input-field" placeholder="До пляжа — 5 минут">
            </div>
            <button type="button" class="text-gray-300 hover:text-red-400 transition-colors cursor-pointer shrink-0" @click="removeLocationItem(i)">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
          <button type="button" class="btn-outline w-full justify-center py-2.5 text-sm" @click="addLocationItem">+ Добавить пункт</button>
        </div>
        <div class="card p-6 space-y-4">
          <p class="text-sm font-medium text-gray-700">Контакты и карта</p>
          <div>
            <label class="label">Телефон (для ссылки)</label>
            <input v-model="homepage.contacts.phone" type="text" class="input-field" placeholder="+79186723781">
          </div>
          <div>
            <label class="label">Адрес</label>
            <input v-model="homepage.contacts.address" type="text" class="input-field">
          </div>
          <div>
            <label class="label">Ссылка на карту</label>
            <input v-model="homepage.location.mapUrl" type="text" class="input-field" placeholder="https://yandex.ru/maps/...">
          </div>
        </div>
      </div>

      <!-- ───── ШАПКА ───── -->
      <div v-if="tab === 'header'" class="card p-6 space-y-4">
        <p class="text-sm text-gray-500">Телефон в шапке сайта (на всех страницах)</p>
        <div>
          <label class="label">Номер для звонка</label>
          <input v-model="site.header.phone" type="text" class="input-field" placeholder="+79186723781">
        </div>
        <div>
          <label class="label">Отображаемый номер</label>
          <input v-model="site.header.phoneDisplay" type="text" class="input-field" placeholder="+7 (918) 672-37-81">
        </div>
      </div>

      <!-- ───── ПОДВАЛ ───── -->
      <div v-if="tab === 'footer'" class="space-y-4">
        <div class="card p-6 space-y-4">
          <div>
            <label class="label">Описание (под логотипом)</label>
            <textarea v-model="site.footer.description" class="input-field resize-none" rows="3"></textarea>
          </div>
          <div>
            <label class="label">Email</label>
            <input v-model="site.footer.email" type="text" class="input-field" placeholder="example@mail.ru">
          </div>
          <div>
            <label class="label">Адрес</label>
            <input v-model="site.footer.address" type="text" class="input-field">
          </div>
        </div>

        <div class="card p-6 space-y-3">
          <p class="text-sm font-medium text-gray-700">Телефоны</p>
          <div v-for="(p, i) in site.footer.phones" :key="i" class="flex flex-wrap gap-3 items-end">
            <div class="flex-1">
              <label class="label">Номер для звонка</label>
              <input v-model="p.number" type="text" class="input-field" placeholder="+79186723781">
            </div>
            <div class="flex-1">
              <label class="label">Отображаемый</label>
              <input v-model="p.display" type="text" class="input-field" placeholder="+7 (918) 672-37-81">
            </div>
            <div class="w-full sm:w-36">
              <label class="label">Подпись (необяз.)</label>
              <input v-model="p.label" type="text" class="input-field" placeholder="Манана">
            </div>
            <button type="button" class="mb-1 text-gray-300 hover:text-red-400 transition-colors cursor-pointer shrink-0" @click="removePhone(i)">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
          <button type="button" class="btn-outline w-full justify-center py-2.5 text-sm" @click="addPhone">+ Добавить телефон</button>
        </div>
      </div>
    </template>
  </div>
</template>
