import { createRouter, createWebHistory } from 'vue-router'
import { resolveAuthRouteAccess } from '@clients/auth'
import { buildClientSsoLoginUrl } from '@clients/shared'
import HomeView from '../views/HomeView.vue'
import { useAuthStore } from '@/stores/auth'

// user-platform SSO 登录页地址
const SSO_LOGIN_URL = import.meta.env.VITE_SSO_LOGIN_URL || 'http://localhost:5173/login'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: true },
    },
    {
      path: '/auth',
      name: 'auth',
      component: () => import('../views/AuthView.vue'),
      meta: { guestOnly: true },
    },
    {
      path: '/auth/callback',
      name: 'sso-callback',
      component: () => import('../views/SsoCallbackView.vue'),
    },
    {
      path: '/snippets/new',
      name: 'snippet-new',
      component: () => import('../views/SnippetEditorView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/snippets/:id',
      name: 'snippet-detail',
      component: () => import('../views/PasteView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/snippets/:id/edit',
      name: 'snippet-edit',
      component: () => import('../views/SnippetEditorView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/paste/:id',
      redirect: (to) => ({ path: `/snippets/${to.params.id as string}` }),
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
    },
  ],
})

/**
 * 构建 SSO 登录跳转 URL
 * 携带 app_code 和 redirect_uri，登录成功后 user-platform 会带 token 跳回 callback
 */
function buildSsoLoginUrl(redirectAfterLogin: string): string {
  return buildClientSsoLoginUrl({
    ssoLoginUrl: SSO_LOGIN_URL,
    appCode: 'go-note',
    redirectPath: redirectAfterLogin,
    callbackPath: '/auth/callback',
  })
}

router.beforeEach((to) => {
  const authStore = useAuthStore()
  if (!authStore.hydrated) {
    authStore.initFromStorage()
  }

  return resolveAuthRouteAccess({
    to,
    isAuthenticated: authStore.isAuthenticated,
    authRoute: '/auth',
    authenticatedRoute: '/',
  })
})

export { buildSsoLoginUrl }
export default router
