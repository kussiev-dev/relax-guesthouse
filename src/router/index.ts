import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior: () => ({ top: 0 }),
  routes: [
    // Public
    { path: '/', component: () => import('@/views/HomePage.vue'), meta: { title: 'Гостевой дом Релакс — Джемете, Анапа' } },
    { path: '/rooms', component: () => import('@/views/RoomsPage.vue'), meta: { title: 'Номера — Релакс' } },
    { path: '/rooms/:id', component: () => import('@/views/RoomDetailPage.vue'), meta: { title: 'Номер — Релакс' } },
    { path: '/booking', component: () => import('@/views/BookingPage.vue'), meta: { title: 'Забронировать — Релакс' } },
    { path: '/contacts', component: () => import('@/views/ContactsPage.vue'), meta: { title: 'Контакты — Релакс' } },
    // Admin
    { path: '/admin/login', component: () => import('@/views/admin/AdminLogin.vue'), meta: { title: 'Вход в панель управления' } },
    {
      path: '/admin',
      component: () => import('@/views/admin/AdminLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        { path: '', redirect: '/admin/dashboard' },
        { path: 'dashboard', component: () => import('@/views/admin/AdminDashboard.vue'), meta: { title: 'Дашборд' } },
        { path: 'bookings', component: () => import('@/views/admin/AdminBookings.vue'), meta: { title: 'Заявки' } },
        { path: 'calendar', component: () => import('@/views/admin/AdminCalendar.vue'), meta: { title: 'Календарь' } },
        { path: 'rooms', component: () => import('@/views/admin/AdminRooms.vue'), meta: { title: 'Номера' } },
      ],
    },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

router.beforeEach(async (to, _from, next) => {
  const title = to.meta.title as string | undefined
  if (title) document.title = title

  if (to.meta.requiresAuth) {
    const token = localStorage.getItem('admin_token')
    if (!token) return next('/admin/login')
  }
  next()
})

export default router
