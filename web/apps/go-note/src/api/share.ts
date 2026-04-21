import request from '@/utils/request'
import type { Snippet } from '@/api/snippet'

/**
 * ShareAccessError 携带后端返回的结构化错误码，
 * 用于前端判断「需要密码」「密码错误」「分享过期」等状态。
 */
export class ShareAccessError extends Error {
  code: number
  constructor(code: number, message: string) {
    super(message)
    this.name = 'ShareAccessError'
    this.code = code
  }

  /** 后端返回 401 且 msg 含密码相关信息 */
  get isPasswordRequired() {
    return this.code === 401
  }

  /** 后端返回 410 / 404（分享过期或不存在） */
  get isExpiredOrNotFound() {
    return this.code === 410 || this.code === 404
  }
}

export interface Share {
  id: string | number
  token: string
  kind: 'article' | 'template'
  snippet_id: string | number
  owner_id: string | number
  has_password: boolean
  expires_at?: string
  view_count: number
  fork_count: number
  created_at: string
}

export interface CreateShareRequest {
  snippet_id: string | number
  kind: 'article' | 'template'
  password?: string
  expires_at?: string
}

export interface PublicShareResponse {
  share: Share
  snippet: Snippet
}

export const createShare = (data: CreateShareRequest) => {
  return request.post<unknown, Share>('/api/v1/notes/shares', data)
}

export const listMyShares = (kind?: 'article' | 'template') => {
  return request.get<unknown, { shares?: Share[] }>('/api/v1/notes/shares/my', {
    params: kind ? { kind } : undefined,
  }).then((res) => res.shares ?? [])
}

export const deleteShare = (id: string | number) => {
  return request.delete<unknown, { id: string | number }>(`/api/v1/notes/shares/${encodeURIComponent(String(id))}`)
}

export const getPublicShareByToken = async (
  token: string,
  password?: string,
): Promise<PublicShareResponse> => {
  const headers: Record<string, string> = {}
  if (password) {
    headers['X-Share-Password'] = password
  }

  // 绕过全局响应拦截器（它会吞掉 envelope 里的 code），
  // 直接解析响应，以便拿到密码/过期等结构化错误码。
  const { data: envelope } = await request
    .get<{ code: number; msg: string; data: PublicShareResponse | null }>(
      `/api/v1/notes/public/shares/${encodeURIComponent(token)}`,
      { headers, transformResponse: [(raw: string) => JSON.parse(raw)] },
    )

  if (envelope.code !== 200 || !envelope.data) {
    throw new ShareAccessError(envelope.code, envelope.msg || '分享读取失败')
  }

  return envelope.data
}
