import { postJson } from '@/api/http'
import {
  PHONE_AUTH_SEND_CODE_PATH,
  PHONE_AUTH_ENTRY_PATH,
  PHONE_PASSWORD_LOGIN_PATH,
  type PhoneAuthSendCodeRequest,
  type PhoneAuthSendCodeResponse,
  type PhoneAuthEntryRequest,
  type PhoneAuthEntryResponse,
  type PhonePasswordLoginRequest,
  type PhonePasswordLoginResponse,
} from '@clients/shared'

export interface RegisterRequest {
  email: string
  username: string
  password: string
}

export interface RegisterResponse {
  email: string
  user_id: number
  username: string
}

export interface LoginRequest {
  username: string
  password: string
  app_code: string
  device_id: string
}

export interface LoginResponse {
  access_token: string
  refresh_token: string
  user_id: number
  username: string
}

export interface RefreshResponse {
  access_token: string
  refresh_token: string
}

export function registerBySso(payload: RegisterRequest): Promise<RegisterResponse> {
  return postJson<RegisterRequest, RegisterResponse>('/api/v1/users/register', payload)
}

export function loginBySso(payload: LoginRequest): Promise<LoginResponse> {
  return postJson<LoginRequest, LoginResponse>('/api/v1/users/login', payload)
}

export function refreshBySso(refreshToken: string): Promise<RefreshResponse> {
  return postJson<{ refresh_token: string }, RefreshResponse>('/api/v1/users/refresh', {
    refresh_token: refreshToken,
  })
}

// ── 手机号单入口 API ──

export function sendPhoneCode(payload: PhoneAuthSendCodeRequest): Promise<PhoneAuthSendCodeResponse> {
  return postJson<PhoneAuthSendCodeRequest, PhoneAuthSendCodeResponse>(PHONE_AUTH_SEND_CODE_PATH, payload)
}

export function phoneEntry(payload: PhoneAuthEntryRequest): Promise<PhoneAuthEntryResponse> {
  return postJson<PhoneAuthEntryRequest, PhoneAuthEntryResponse>(PHONE_AUTH_ENTRY_PATH, payload)
}

export function phonePasswordLogin(payload: PhonePasswordLoginRequest): Promise<PhonePasswordLoginResponse> {
  return postJson<PhonePasswordLoginRequest, PhonePasswordLoginResponse>(PHONE_PASSWORD_LOGIN_PATH, payload)
}
