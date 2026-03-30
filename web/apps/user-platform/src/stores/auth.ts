import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import {
  clearAuthState,
  persistAuthState,
  persistAuthTokens,
  readAuthStateFromStorage,
} from '@clients/auth'
import { createAuthStorageKeys } from '@clients/shared'
import type { AuthUser } from '@clients/types'

const authStorageKeys = createAuthStorageKeys('user-platform')

export const useAuthStore = defineStore('auth', () => {
  const token = ref('')
  const refreshToken = ref('')
  const user = ref<AuthUser | null>(null)
  const hydrated = ref(false)

  const isAuthenticated = computed(() => !!token.value && !!user.value)

  function initFromStorage(force = false) {
    if (hydrated.value && !force) {
      return
    }

    const snapshot = readAuthStateFromStorage(authStorageKeys)
    token.value = snapshot.token
    refreshToken.value = snapshot.refreshToken
    user.value = snapshot.user
    hydrated.value = snapshot.hydrated
  }

  function setAuth(nextToken: string, nextRefreshToken: string, nextUser: AuthUser) {
    token.value = nextToken
    refreshToken.value = nextRefreshToken
    user.value = nextUser
    hydrated.value = true
    persistAuthState(authStorageKeys, nextToken, nextRefreshToken, nextUser)
  }

  function updateTokens(nextToken: string, nextRefreshToken: string) {
    token.value = nextToken
    refreshToken.value = nextRefreshToken
    hydrated.value = true
    persistAuthTokens(authStorageKeys, nextToken, nextRefreshToken)
  }

  function clearAuth() {
    token.value = ''
    refreshToken.value = ''
    user.value = null
    hydrated.value = true
    clearAuthState(authStorageKeys)
  }

  function logout() {
    clearAuth()
  }

  return {
    token,
    refreshToken,
    user,
    hydrated,
    isAuthenticated,
    initFromStorage,
    setAuth,
    updateTokens,
    clearAuth,
    logout,
  }
})
