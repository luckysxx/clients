import request from '@/utils/request'

export interface PresignUploadRequest {
  filename: string
  mime_type: string
  size: number
}

export interface PresignUploadResponse {
  url: string
  object_key: string
  expires_at: string
  public_url: string
  headers: Record<string, string>
}

export interface CompleteUploadRequest {
  object_key: string
  filename: string
  size: number
  mime_type: string
  snippet_id?: number | string
}

export interface CompleteUploadResponse {
  url: string
  object_key: string
  filename: string
  size: number
  mime_type: string
  thumbnail_url?: string
}

export const requestPresign = (data: PresignUploadRequest) => {
  return request.post<unknown, PresignUploadResponse>('/api/v1/notes/uploads/presign', data)
}

export const completeUpload = (data: CompleteUploadRequest) => {
  return request.post<unknown, CompleteUploadResponse>('/api/v1/notes/uploads/complete', data)
}
