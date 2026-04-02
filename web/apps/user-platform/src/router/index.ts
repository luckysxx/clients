import { createRouter, createWebHistory } from 'vue-router'
import { resolveAuthRouteAccess } from '@clients/auth'
import SsoLoginView from '@/views/SsoLoginView.vue'
import SsoRegisterView from '@/views/SsoRegisterView.vue'
import AccountView from '@/views/AccountView.vue'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login',
    },
    {
      path: '/account',
      name: 'account',
      component: AccountView,
      meta: { requiresAuth: true },
    },
    {
      path: '/register',
      name: 'sso-register',
      component: SsoRegisterView,
      meta: { guestOnly: true },
    },
    {
      path: '/login',
      name: 'sso-login',
      component: SsoLoginView,
      meta: { guestOnly: true },
    },
  ],
})

router.beforeEach((to) => {
  const authStore = useAuthStore()
  if (!authStore.hydrated) {
    authStore.initFromStorage()
  }

  return resolveAuthRouteAccess({
    to,
    isAuthenticated: authStore.isAuthenticated,
    authRoute: '/login',
    authenticatedRoute: '/account',
    allowGuestOnlyWhenAuthenticated: (target) => {
      if (!target.meta?.guestOnly) {
        return false
      }

      try {
        const parsed = new URL(target.fullPath, window.location.origin)
        const redirectUri = parsed.searchParams.get('redirect_uri') || ''
        return redirectUri.length > 0
      } catch {
        return false
      }
    },
  })
})

export default router
