import type { AuthUser } from '@clients/types'

interface ApiEnvelope<T> {
  code: number
  msg: string
  data: T | null
}

export interface AppSessionPayload {
  access_token: string
  refresh_token: string
  user_id: number
  username: string
  email?: string
}

export interface AppRefreshPayload {
  access_token: string
  refresh_token: string
}

export interface AppSessionStoreLike {
  hasToken: boolean
  isSsoSuppressed: boolean
  refreshToken: string
  setAuth: (token: string, refreshToken: string, user: AuthUser) => void
  updateTokens: (token: string, refreshToken: string) => void
}

export interface AppSessionOptions {
  appCode: string
  authStore: AppSessionStoreLike
  deviceIdStorageKey?: string
}

const defaultDeviceIdStorageKey = 'device_id'

export function createSsoSuppressedStorageKey(appCode: string): string {
  return `${appCode}.sso_suppressed`
}

export function readSsoSuppressedFlag(storageKey: string): boolean {
  return localStorage.getItem(storageKey) === '1'
}

export function writeSsoSuppressedFlag(storageKey: string): void {
  localStorage.setItem(storageKey, '1')
}

export function clearSsoSuppressedFlag(storageKey: string): void {
  localStorage.removeItem(storageKey)
}

export function getOrCreateDeviceId(storageKey = defaultDeviceIdStorageKey): string {
  let deviceId = localStorage.getItem(storageKey)

  if (!deviceId) {
    deviceId = crypto.randomUUID()
    localStorage.setItem(storageKey, deviceId)
  }

  return deviceId
}

function normalizeSessionUser(payload: AppSessionPayload): AuthUser {
  return {
    id: payload.user_id,
    username: payload.username,
    email: payload.email ?? '',
  }
}

async function postJson<TRequest, TResponse>(
  path: string,
  payload: TRequest,
  init?: RequestInit,
): Promise<TResponse> {
  const headers = init?.headers instanceof Headers
    ? Object.fromEntries(init.headers.entries())
    : Array.isArray(init?.headers)
      ? Object.fromEntries(init.headers)
      : (init?.headers ?? {})

  const response = await fetch(path, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...headers,
    },
    credentials: init?.credentials,
    body: JSON.stringify(payload),
  })

  let envelope: ApiEnvelope<TResponse> | null = null
  try {
    envelope = (await response.json()) as ApiEnvelope<TResponse>
  } catch {
    throw new Error(`服务响应解析失败（HTTP ${response.status}）`)
  }

  if (!response.ok || !envelope) {
    throw new Error(envelope?.msg || `请求失败（HTTP ${response.status}）`)
  }

  if (envelope.code !== 200 || envelope.data === null) {
    throw new Error(envelope.msg || '请求失败')
  }

  return envelope.data
}

export async function exchangeAppSession(payload: {
  app_code: string
  device_id: string
}): Promise<AppSessionPayload> {
  return postJson<typeof payload, AppSessionPayload>('/api/v1/users/sso/exchange', payload, {
    credentials: 'include',
  })
}

export async function refreshAppSession(refreshToken: string): Promise<AppRefreshPayload> {
  return postJson<{ refresh_token: string }, AppRefreshPayload>('/api/v1/users/refresh', {
    refresh_token: refreshToken,
  })
}

export async function logoutAppSession(options: {
  accessToken: string
  appCode: string
  deviceIdStorageKey?: string
}): Promise<void> {
  const response = await fetch('/api/v1/users/logout', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${options.accessToken}`,
    },
    body: JSON.stringify({
      app_code: options.appCode,
      device_id: getOrCreateDeviceId(options.deviceIdStorageKey),
    }),
  })

  let envelope: ApiEnvelope<null> | null = null
  try {
    envelope = (await response.json()) as ApiEnvelope<null>
  } catch {
    throw new Error(`服务响应解析失败（HTTP ${response.status}）`)
  }

  if (!response.ok || !envelope || envelope.code !== 200) {
    throw new Error(envelope?.msg || `请求失败（HTTP ${response.status}）`)
  }
}

export function applyAppSession(authStore: AppSessionStoreLike, payload: AppSessionPayload): void {
  authStore.setAuth(payload.access_token, payload.refresh_token, normalizeSessionUser(payload))
}

export function bootstrapAppSessionFromUrlHash(authStore: AppSessionStoreLike): boolean {
  const payload = readAppSessionFromUrlHash()
  if (!payload) {
    return false
  }

  applyAppSession(authStore, payload)
  clearAppSessionHash()
  return true
}

function readAppSessionFromUrlHash(): AppSessionPayload | null {
  const rawHash = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : window.location.hash
  if (!rawHash) {
    return null
  }

  const params = new URLSearchParams(rawHash)
  const accessToken = params.get('access_token')?.trim() || ''
  const refreshToken = params.get('refresh_token')?.trim() || ''
  const userID = Number(params.get('user_id') || 0)
  const username = params.get('username')?.trim() || ''

  if (!accessToken || !refreshToken || !userID || !username) {
    return null
  }

  return {
    access_token: accessToken,
    refresh_token: refreshToken,
    user_id: userID,
    username,
  }
}

function clearAppSessionHash(): void {
  const url = new URL(window.location.href)
  url.hash = ''
  window.history.replaceState({}, document.title, url.toString())
}

export async function bootstrapAppSessionFromSso(options: AppSessionOptions): Promise<boolean> {
  if (options.authStore.hasToken || options.authStore.isSsoSuppressed) {
    return false
  }

  const payload = await exchangeAppSession({
    app_code: options.appCode,
    device_id: getOrCreateDeviceId(options.deviceIdStorageKey),
  })

  applyAppSession(options.authStore, payload)
  return true
}

export async function recoverAppSessionFromRefreshOrSso(options: AppSessionOptions): Promise<string> {
  if (options.authStore.refreshToken) {
    try {
      const payload = await refreshAppSession(options.authStore.refreshToken)
      options.authStore.updateTokens(payload.access_token, payload.refresh_token || options.authStore.refreshToken)
      return payload.access_token
    } catch (error) {
      console.warn(`[${options.appCode}] refresh failed, trying sso exchange`, error)
    }
  }

  if (options.authStore.isSsoSuppressed) {
    throw new Error('当前应用已退出登录，请重新登录')
  }

  const payload = await exchangeAppSession({
    app_code: options.appCode,
    device_id: getOrCreateDeviceId(options.deviceIdStorageKey),
  })

  applyAppSession(options.authStore, payload)
  return payload.access_token
}
