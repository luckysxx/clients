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
import { createAuthStorageKeys } from '@clients/shared'
import type { AuthUser } from '@clients/types'
import { fetchUserProfile, type UserProfile } from '@/api/user'

const authStorageKeys = createAuthStorageKeys('go-chat')
const ssoSuppressedStorageKey = createSsoSuppressedStorageKey('go-chat')

export const useAuthStore = defineStore('auth', () => {
  const token = ref('')
  const refreshToken = ref('')
  const user = ref<AuthUser | null>(null)
  const profile = ref<UserProfile | null>(null)
  const hydrated = ref(false)
  const ssoSuppressed = ref(readSsoSuppressedFlag(ssoSuppressedStorageKey))

  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const hasToken = computed(() => !!token.value)
  const isSsoSuppressed = computed(() => ssoSuppressed.value)

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
    ssoSuppressed.value = false
    clearSsoSuppressedFlag(ssoSuppressedStorageKey)
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
    profile.value = null
    hydrated.value = true
    clearAuthState(authStorageKeys)
  }

  async function loadProfile() {
    if (!token.value) return
    try {
      const resp = await fetchUserProfile()
      profile.value = resp
    } catch (err) {
      console.error('Failed to load user profile in go-chat', err)
    }
  }

  function logout() {
    clearAuth()
  }

  function suppressSsoAutoLogin() {
    ssoSuppressed.value = true
    writeSsoSuppressedFlag(ssoSuppressedStorageKey)
  }

  function clearSsoSuppression() {
    ssoSuppressed.value = false
    clearSsoSuppressedFlag(ssoSuppressedStorageKey)
  }

  return {
    token,
    refreshToken,
    user,
    profile,
    hydrated,
    isAuthenticated,
    hasToken,
    isSsoSuppressed,
    initFromStorage,
    setAuth,
    updateTokens,
    clearAuth,
    loadProfile,
    logout,
    suppressSsoAutoLogin,
    clearSsoSuppression,
  }
})
