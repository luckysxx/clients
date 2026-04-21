import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login',
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
    },
    {
      path: '/register',
      redirect: (to) => ({
        path: '/login',
        query: {
          ...to.query,
          intent: 'register',
        },
      }),
    },
    {
      path: '/sso',
      redirect: (to) => ({
        path: '/login',
        query: to.query,
      }),
    },
  ],
})

export default router
