import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import {
  clearAuthState,
  persistAuthState,
  persistAuthTokens,
  readAuthStateFromStorage,
} from '@clients/auth'
import type { AuthUser } from '@clients/types'
import { createAuthStorageKeys } from '@clients/shared'

const authStorageKeys = createAuthStorageKeys()

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string>('')
  const refreshToken = ref<string>('')
  const user = ref<AuthUser | null>(null)
  const hydrated = ref(false)

  const isAuthenticated = computed(() => !!token.value)

  const initFromStorage = (force = false) => {
    if (hydrated.value && !force) {
      return
    }

    const snapshot = readAuthStateFromStorage(authStorageKeys)
    token.value = snapshot.token
    refreshToken.value = snapshot.refreshToken
    user.value = snapshot.user
    hydrated.value = snapshot.hydrated
  }

  const setAuth = (nextToken: string, nextRefreshToken: string, nextUser: AuthUser) => {
    token.value = nextToken
    refreshToken.value = nextRefreshToken
    user.value = nextUser
    hydrated.value = true
    persistAuthState(authStorageKeys, nextToken, nextRefreshToken, nextUser)
  }

  const updateTokens = (nextToken: string, nextRefreshToken: string) => {
    token.value = nextToken
    refreshToken.value = nextRefreshToken
    hydrated.value = true
    persistAuthTokens(authStorageKeys, nextToken, nextRefreshToken)
  }

  const clearAuth = () => {
    token.value = ''
    refreshToken.value = ''
    user.value = null
    hydrated.value = true
    clearAuthState(authStorageKeys)
  }

  const logout = () => {
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
