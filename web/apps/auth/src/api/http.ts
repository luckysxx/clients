import { type ApiEnvelope, getHttpErrorMessage, unwrapApiEnvelope } from '@clients/request'

const RAW_BASE_URL = import.meta.env.VITE_API_BASE_URL?.trim() ?? ''
const API_BASE_URL = RAW_BASE_URL.replace(/\/+$/, '')

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
  token: string,
): Promise<T> {
  const response = await fetch(buildApiUrl(path), {
    ...init,
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...init.headers,
    },
  })

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
