import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import {
  clearSsoSuppressedFlag,
  clearAuthState,
  createSsoSuppressedStorageKey,
  persistAuthState,
  persistAuthTokens,
  readSsoSuppressedFlag,
  readAuthStateFromStorage,
  writeSsoSuppressedFlag,
} from '@clients/auth'
import type { AuthUser } from '@clients/types'
import { createAuthStorageKeys } from '@clients/shared'

const authStorageKeys = createAuthStorageKeys('go-note')
const ssoSuppressedStorageKey = createSsoSuppressedStorageKey('go-note')

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string>('')
  const refreshToken = ref<string>('')
  const user = ref<AuthUser | null>(null)
  const hydrated = ref(false)
  const ssoSuppressed = ref(readSsoSuppressedFlag(ssoSuppressedStorageKey))

  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const hasToken = computed(() => !!token.value)
  const isSsoSuppressed = computed(() => ssoSuppressed.value)

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
    ssoSuppressed.value = false
    clearSsoSuppressedFlag(ssoSuppressedStorageKey)
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

  const updateEmail = (email: string) => {
    if (user.value) {
      user.value = { ...user.value, email }
      persistAuthState(authStorageKeys, token.value, refreshToken.value, user.value)
    }
  }

  const logout = () => {
    clearAuth()
  }

  const suppressSsoAutoLogin = () => {
    ssoSuppressed.value = true
    writeSsoSuppressedFlag(ssoSuppressedStorageKey)
  }

  const clearSsoSuppression = () => {
    ssoSuppressed.value = false
    clearSsoSuppressedFlag(ssoSuppressedStorageKey)
  }

  return {
    token,
    refreshToken,
    user,
    hydrated,
    isAuthenticated,
    hasToken,
    isSsoSuppressed,
    initFromStorage,
    setAuth,
    updateTokens,
    updateEmail,
    clearAuth,
    logout,
    suppressSsoAutoLogin,
    clearSsoSuppression,
  }
})
