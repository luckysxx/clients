import type { AuthUser } from '@clients/types'
import type { AuthStorageKeys } from '@clients/shared'

export interface AuthStateSnapshot {
  token: string
  refreshToken: string
  user: AuthUser | null
  hydrated: boolean
}

export function readAuthStateFromStorage(keys: AuthStorageKeys): AuthStateSnapshot {
  const token = localStorage.getItem(keys.token) || ''
  const refreshToken = localStorage.getItem(keys.refreshToken) || ''
  const rawUser = localStorage.getItem(keys.user)

  if (!rawUser) {
    return {
      token,
      refreshToken,
      user: null,
      hydrated: true,
    }
  }

  try {
    return {
      token,
      refreshToken,
      user: JSON.parse(rawUser) as AuthUser,
      hydrated: true,
    }
  } catch {
    localStorage.removeItem(keys.user)
    return {
      token,
      refreshToken,
      user: null,
      hydrated: true,
    }
  }
}

export function persistAuthState(keys: AuthStorageKeys, token: string, refreshToken: string, user: AuthUser): void {
  localStorage.setItem(keys.token, token)
  localStorage.setItem(keys.refreshToken, refreshToken)
  localStorage.setItem(keys.user, JSON.stringify(user))
}

export function persistAuthTokens(keys: AuthStorageKeys, token: string, refreshToken: string): void {
  localStorage.setItem(keys.token, token)
  localStorage.setItem(keys.refreshToken, refreshToken)
}

export function clearAuthState(keys: AuthStorageKeys): void {
  localStorage.removeItem(keys.token)
  localStorage.removeItem(keys.refreshToken)
  localStorage.removeItem(keys.user)
}
