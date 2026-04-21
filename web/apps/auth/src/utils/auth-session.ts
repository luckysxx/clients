export interface TokenPair {
  accessToken: string
  refreshToken: string
}

export function createDeviceId(): string {
  if (typeof globalThis !== 'undefined' && globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID()
  }

  const timePart = Date.now().toString(36)
  const randomPart = Math.random().toString(36).slice(2, 12)
  return `device-${timePart}-${randomPart}`
}

export function getOrCreateDeviceId(storageKey = 'device_id'): string {
  const existing = localStorage.getItem(storageKey)
  if (existing) {
    return existing
  }

  const next = createDeviceId()
  localStorage.setItem(storageKey, next)
  return next
}

export function isJwtExpired(token: string, bufferSeconds = 30): boolean {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return true

    const payloadPart = parts[1]
    if (!payloadPart) return true

    const payload = JSON.parse(atob(payloadPart)) as { exp?: number }
    if (!payload.exp) return true

    return payload.exp * 1000 < Date.now() + bufferSeconds * 1000
  } catch {
    return true
  }
}

interface EnsureFreshTokensOptions {
  accessToken: string
  refreshToken: string
  refresh: (refreshToken: string) => Promise<TokenPair>
  onTokensUpdated?: (accessToken: string, refreshToken: string) => void
  onExpired?: () => void
}

export async function ensureFreshTokens(options: EnsureFreshTokensOptions): Promise<TokenPair | null> {
  if (!isJwtExpired(options.accessToken)) {
    return {
      accessToken: options.accessToken,
      refreshToken: options.refreshToken,
    }
  }

  if (!options.refreshToken) {
    options.onExpired?.()
    return null
  }

  try {
    const refreshed = await options.refresh(options.refreshToken)
    options.onTokensUpdated?.(refreshed.accessToken, refreshed.refreshToken)
    return refreshed
  } catch {
    options.onExpired?.()
    return null
  }
}
