import {
  applyBearerToken,
  createTokenRefreshQueue,
  recoverAppSessionFromRefreshOrSso,
} from '@clients/auth'
import { type ApiEnvelope, getHttpErrorMessage, unwrapApiEnvelope } from '@clients/request'
import { buildAuthAppLoginPath, getCurrentLocationPath } from '@clients/shared'
import { useAuthStore } from '@/stores/auth'

const RAW_BASE_URL = import.meta.env.VITE_API_BASE_URL?.trim() ?? ''
const API_BASE_URL = RAW_BASE_URL.replace(/\/+$/, '')
const refreshQueue = createTokenRefreshQueue()

function buildApiUrl(path: string): string {
  if (/^https?:\/\//.test(path)) {
    return path
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return API_BASE_URL ? `${API_BASE_URL}${normalizedPath}` : normalizedPath
}

export async function postJson<TRequest, TResponse>(path: string, payload: TRequest): Promise<TResponse> {
  const response = await fetch(buildApiUrl(path), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  let envelope: ApiEnvelope<TResponse> | null = null
  try {
    envelope = (await response.json()) as ApiEnvelope<TResponse>
  } catch {
    throw new Error(`服务响应解析失败（HTTP ${response.status}）`)
  }

  if (!response.ok) {
    throw new Error(envelope?.msg || `请求失败（HTTP ${response.status}）`)
  }

  try {
    return unwrapApiEnvelope(envelope)
  } catch (error) {
    throw new Error(getHttpErrorMessage(error, '请求失败'))
  }
}

export async function requestWithAuth<T>(
  path: string,
  init: RequestInit,
  token?: string,
): Promise<T> {
  const authStore = useAuthStore()
  const authToken = token || authStore.token

  const executeRequest = async (activeToken: string) => {
    const nextHeaders: Record<string, unknown> = {
      Accept: 'application/json',
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...((init.headers as Record<string, unknown> | undefined) ?? {}),
    }

    if (activeToken) {
      applyBearerToken({ headers: nextHeaders }, activeToken)
    }

    return fetch(buildApiUrl(path), {
      ...init,
      headers: nextHeaders as HeadersInit,
    })
  }

  const redirectToAuthBoundary = () => {
    authStore.clearAuth()
    const redirectPath = authStore.isSsoSuppressed
      ? `/?passport=login&redirect=${encodeURIComponent(getCurrentLocationPath())}`
      : buildAuthAppLoginPath({
          appCode: 'go-chat',
          redirectPath: getCurrentLocationPath(),
        })

    window.location.replace(redirectPath)
  }

  let response = await executeRequest(authToken)

  if (response.status === 401) {
    if (refreshQueue.isRefreshing) {
      const recoveredToken = await refreshQueue.waitForToken()
      response = await executeRequest(recoveredToken)
    } else {
      refreshQueue.startRefreshing()

      try {
        const recoveredToken = await recoverAppSessionFromRefreshOrSso({
          appCode: 'go-chat',
          authStore,
        })
        refreshQueue.resolve(recoveredToken)
        response = await executeRequest(recoveredToken)
      } catch (error) {
        refreshQueue.reject(new Error(getHttpErrorMessage(error)))
        redirectToAuthBoundary()
        throw error
      } finally {
        refreshQueue.finishRefreshing()
      }
    }
  }

  if (response.status === 401) {
    redirectToAuthBoundary()
    throw new Error('登录状态已失效，请重新登录')
  }

  let envelope: ApiEnvelope<T> | null = null
  try {
    envelope = (await response.json()) as ApiEnvelope<T>
  } catch {
    throw new Error(`服务响应解析失败（HTTP ${response.status}）`)
  }

  if (!response.ok || !envelope || envelope.code !== 200 || envelope.data === null) {
    throw new Error(envelope?.msg || `请求失败（HTTP ${response.status}）`)
  }

  return envelope.data
}
