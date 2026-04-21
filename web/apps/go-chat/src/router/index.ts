import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '@/views/MainLayout.vue'
import { useAuthStore } from '@/stores/auth'
import { buildAuthAppLoginPath } from '@clients/shared'
import { bootstrapAppSessionFromSso } from '@clients/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'landing',
      component: () => import('@/views/LandingView.vue'),
    },
    {
      path: '/login',
      redirect: '/',
    },
    {
      path: '/register',
      redirect: '/',
    },
    {
      path: '/sso',
      redirect: '/',
    },
    {
      path: '/chat/:id',
      redirect: (to) => ({ path: `/app/chat/${to.params.id as string}` }),
    },
    {
      path: '/app',
      component: MainLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'Home',
          component: () => import('@/views/EmptyChat.vue'),
        },
        {
          path: 'chat/:id',
          name: 'Chat',
          component: () => import('@/views/ChatRoom.vue'),
        },
      ],
    },
  ],
})

router.beforeEach(async (to) => {
  const authStore = useAuthStore()
  if (!authStore.hydrated) {
    authStore.initFromStorage()
  }

  if (to.meta?.requiresAuth && !authStore.isAuthenticated) {
    if (authStore.isSsoSuppressed) {
      return {
        path: '/',
        query: {
          passport: 'login',
          redirect: to.fullPath,
        },
      }
    }

    try {
      const swapped = await bootstrapAppSessionFromSso({
        appCode: 'go-chat',
        authStore,
      })
      if (swapped) return true
    } catch (e) {
      console.warn('go-chat lazy sso failed', e)
    }

    window.location.replace(buildAuthAppLoginPath({
      appCode: 'go-chat',
      redirectPath: to.fullPath,
    }))
    return false
  }

  return true
})

export default router
