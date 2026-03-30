import { normalizeInternalPath, readSingleQueryValue } from '@clients/shared'
import type { AuthUser } from '@clients/types'

export interface AuthCallbackResolution {
  ok: boolean
  redirect: string
  token: string
  refreshToken: string
  user: AuthUser | null
}

export function resolveAuthCallback(query: Record<string, unknown>, hash = window.location.hash): AuthCallbackResolution {
  const hashParams = new URLSearchParams(hash.replace(/^#/, ''))
  const token = hashParams.get('access_token') || hashParams.get('token') || ''
  const refreshToken = hashParams.get('refresh_token') || ''
  const userId = Number(readSingleQueryValue(query.user_id) || 0)
  const username = readSingleQueryValue(query.username)
  const redirect = normalizeInternalPath(readSingleQueryValue(query.state), '/')

  if (!token || !userId || !username) {
    return {
      ok: false,
      redirect,
      token: '',
      refreshToken: '',
      user: null,
    }
  }

  return {
    ok: true,
    redirect,
    token,
    refreshToken,
    user: {
      id: userId,
      username,
      email: '',
    },
  }
}
