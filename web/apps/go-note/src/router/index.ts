import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { useAuthStore } from '@/stores/auth'
import { buildAuthAppLoginPath } from '@clients/shared'
import { bootstrapAppSessionFromSso } from '@clients/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'landing',
      component: () => import('../views/LandingView.vue'),
    },
    {
      path: '/auth',
      redirect: '/',
    },
    {
      path: '/workspace',
      name: 'workspace',
      component: HomeView,
      meta: { requiresAuth: true },
    },
    {
      path: '/workspace/organize',
      name: 'workspace-organize',
      component: () => import('../views/OrganizeView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/workspace/start',
      name: 'workspace-start',
      component: () => import('../views/StartView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/workspace/groups',
      name: 'workspace-groups',
      component: () => import('../views/GroupsView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/workspace/favorites',
      name: 'workspace-favorites',
      component: HomeView,
      meta: { requiresAuth: true },
    },
    {
      path: '/workspace/trash',
      name: 'workspace-trash',
      component: HomeView,
      meta: { requiresAuth: true },
    },
    {
      path: '/workspace/drafts',
      name: 'workspace-drafts',
      component: () => import('../views/DraftsView.vue'),
      meta: { requiresAuth: true },
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
      component: () => import('../views/DocumentView.vue'),
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
      path: '/s/:token',
      name: 'share-public',
      component: () => import('../views/SharePublicView.vue'),
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('../views/SettingsView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/workspace',
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
        appCode: 'go-note',
        authStore,
      })
      if (swapped) return true
    } catch (e) {
      console.warn('go-note lazy sso failed', e)
    }

    window.location.replace(buildAuthAppLoginPath({
      appCode: 'go-note',
      redirectPath: to.fullPath,
    }))
    return false
  }

  return true
})

export default router
