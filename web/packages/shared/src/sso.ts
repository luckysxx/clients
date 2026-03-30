export function readSingleQueryValue(value: unknown): string {
  if (Array.isArray(value)) {
    return typeof value[0] === 'string' ? value[0] : ''
  }

  return typeof value === 'string' ? value : ''
}

export function getCurrentLocationPath(): string {
  return `${window.location.pathname}${window.location.search}${window.location.hash}`
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

interface BuildClientSsoLoginUrlOptions {
  ssoLoginUrl: string
  appCode: string
  redirectPath: string
  callbackPath?: string
  origin?: string
}

export function buildClientSsoLoginUrl(options: BuildClientSsoLoginUrlOptions): string {
  const callbackUrl = new URL(options.callbackPath || '/auth/callback', options.origin || window.location.origin)
  const normalizedRedirect = normalizeInternalPath(options.redirectPath, '/')

  callbackUrl.searchParams.set('state', normalizedRedirect)

  const ssoUrl = new URL(options.ssoLoginUrl)
  ssoUrl.searchParams.set('app_code', options.appCode)
  ssoUrl.searchParams.set('redirect_uri', callbackUrl.toString())

  return ssoUrl.toString()
}
