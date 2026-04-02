import { getHttpErrorMessage, type ApiEnvelope } from '@clients/request'

export class ProfileRequestError extends Error {
  status: number
  code: number

  constructor(message: string, status: number, code = 0) {
    super(message)
    this.name = 'ProfileRequestError'
    this.status = status
    this.code = code
  }
}

export interface UserProfile {
  user_id: number
  nickname: string
  avatar_url: string
  bio: string
  birthday: string
  updated_at: string
}

export interface UpdateProfilePayload {
  nickname: string
  avatar_url: string
  bio: string
  birthday: string
}

const RAW_BASE_URL = import.meta.env.VITE_API_BASE_URL?.trim() ?? ''
const API_BASE_URL = RAW_BASE_URL.replace(/\/+$/, '')

function buildApiUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return API_BASE_URL ? `${API_BASE_URL}${normalizedPath}` : normalizedPath
}

async function requestProfile<T>(path: string, init: RequestInit, token: string): Promise<T> {
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
    throw new ProfileRequestError(envelope?.msg || `请求失败（HTTP ${response.status}）`, response.status, envelope?.code || 0)
  }

  return envelope.data
}

export async function getMyProfile(token: string): Promise<UserProfile> {
  try {
    return await requestProfile<UserProfile>('/api/v1/users/me/profile', { method: 'GET' }, token)
  } catch (error) {
    if (error instanceof ProfileRequestError) {
      throw error
    }
    throw new Error(getHttpErrorMessage(error, '获取资料失败'))
  }
}

export async function updateMyProfile(token: string, payload: UpdateProfilePayload): Promise<UserProfile> {
  try {
    return await requestProfile<UserProfile>(
      '/api/v1/users/me/profile',
      {
        method: 'PUT',
        body: JSON.stringify(payload),
      },
      token,
    )
  } catch (error) {
    if (error instanceof ProfileRequestError) {
      throw error
    }
    throw new Error(getHttpErrorMessage(error, '保存资料失败'))
  }
}

export function isProfileAuthError(error: unknown): boolean {
  if (!(error instanceof ProfileRequestError)) {
    return false
  }

  const normalizedMessage = error.message.trim().toLowerCase()
  return (
    error.status === 401 ||
    error.code === 401 ||
    normalizedMessage.includes('authorization header') ||
    normalizedMessage.includes('access token') ||
    normalizedMessage.includes('bearer') ||
    normalizedMessage.includes('token')
  )
}

export function isProfileMissingError(error: unknown): boolean {
  if (!(error instanceof ProfileRequestError)) {
    return false
  }

  const normalizedMessage = error.message.trim().toLowerCase()
  return error.status === 404 || error.code === 404 || normalizedMessage.includes('记录不存在')
}
