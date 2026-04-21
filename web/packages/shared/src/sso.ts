import { getAppConfig } from './app-config'

export function readSingleQueryValue(value: unknown): string {
  if (Array.isArray(value)) {
    return typeof value[0] === 'string' ? value[0] : ''
  }

  return typeof value === 'string' ? value : ''
}

export function getCurrentLocationPath(): string {
  return `${window.location.pathname}${window.location.search}${window.location.hash}`
}

export interface AuthAppLoginOptions {
  appCode: string
  intent?: 'login' | 'register'
  redirectPath?: string
}

export function buildAuthAppLoginPath(options: AuthAppLoginOptions): string {
  const target = new URL(getAppConfig().sso_login_url)
  target.searchParams.set('app_code', options.appCode)

  if (options.intent) {
    target.searchParams.set('intent', options.intent)
  }

  if (options.redirectPath) {
    target.searchParams.set('redirect', normalizeInternalPath(options.redirectPath, '/'))
  }

  return target.toString()
}

export function normalizeInternalPath(candidate: string, fallback = '/'): string {
  if (!candidate) {
    return fallback
  }

  try {
    const parsed = new URL(candidate, window.location.origin)
    if (parsed.origin !== window.location.origin) {
      return fallback
    }

    return `${parsed.pathname}${parsed.search}${parsed.hash}` || fallback
  } catch {
    if (candidate.startsWith('/') && !candidate.startsWith('//')) {
      return candidate
    }

    return fallback
  }
}
