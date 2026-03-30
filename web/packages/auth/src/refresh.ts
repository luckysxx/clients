export interface RefreshTokenPayload {
  access_token?: string
  token?: string
  refresh_token?: string
}

export interface RetryableRequestConfigLike {
  url?: string
  headers?: Record<string, unknown>
  _retry?: boolean
}

interface PendingRefreshEntry {
  reject: (error: Error) => void
  resolve: (token: string) => void
}

export function isAuthMutationRequest(
  url: string,
  authPaths = ['/users/login', '/users/register', '/users/refresh'],
): boolean {
  return authPaths.some((path) => url.includes(path))
}

export function normalizeRefreshTokens(
  payload: RefreshTokenPayload,
  fallbackRefreshToken = '',
): { accessToken: string; refreshToken: string } {
  const accessToken = payload.access_token || payload.token || ''
  const refreshToken = payload.refresh_token || fallbackRefreshToken

  if (!accessToken) {
    throw new Error('刷新登录状态失败')
  }

  return {
    accessToken,
    refreshToken,
  }
}

export function applyBearerToken(config: RetryableRequestConfigLike, token: string): void {
  config.headers = config.headers || {}
  config.headers.Authorization = `Bearer ${token}`
}

export function createTokenRefreshQueue() {
  let isRefreshing = false
  let pendingQueue: PendingRefreshEntry[] = []

  return {
    finishRefreshing() {
      isRefreshing = false
    },
    get isRefreshing() {
      return isRefreshing
    },
    reject(error: Error) {
      pendingQueue.forEach((entry) => entry.reject(error))
      pendingQueue = []
    },
    resolve(token: string) {
      pendingQueue.forEach((entry) => entry.resolve(token))
      pendingQueue = []
    },
    startRefreshing() {
      isRefreshing = true
    },
    waitForToken() {
      return new Promise<string>((resolve, reject) => {
        pendingQueue.push({ resolve, reject })
      })
    },
  }
}
