import { logoutAppSession } from '@clients/auth'
import {
  PHONE_AUTH_SEND_CODE_PATH,
  PHONE_AUTH_ENTRY_PATH,
  type PhoneAuthSendCodeRequest,
  type PhoneAuthSendCodeResponse,
  type PhoneAuthEntryRequest,
  type PhoneAuthEntryResponse,
} from '@clients/shared'
import request from '@/utils/request'

export interface User {
  id: number
  username: string
  email?: string
}

export interface LoginRequest {
  username: string
  password: string
  app_code: string
  device_id: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
}

export interface LoginResponse {
  access_token: string
  refresh_token: string
  user_id: number
  username: string
  email: string
}

export interface RegisterResponse {
  user_id: number
  username: string
  email?: string
}

export interface RefreshTokenResponse {
  access_token: string
  refresh_token: string
}

export interface LogoutResponse {
  success: boolean
}

export interface ChangePasswordRequest {
  old_password: string
  new_password: string
}

export interface ChangePasswordResponse {
  user_id: number
  message: string
}

export interface SetPasswordRequest {
  new_password: string
}

export interface SetPasswordResponse {
  user_id: number
  message: string
}

export interface BindEmailRequest {
  email: string
}

export interface BindEmailResponse {
  user_id: number
  email: string
  message: string
}

export interface LogoutAllSessionsResponse {
  user_id: number
  message: string
}

type RawLoginResponse = Partial<{
  token: string
  Token: string
  access_token: string
  refresh_token: string
  Refresh_token: string
  user_id: number
  UserID: number
  username: string
  Username: string
  email: string
  Email: string
}>

type RawRegisterResponse = Partial<{
  user_id: number
  UserID: number
  username: string
  Username: string
  email: string
  Email: string
}>

type RawRefreshTokenResponse = Partial<{
  token: string
  Token: string
  access_token: string
  refresh_token: string
  Refresh_token: string
}>

const normalizeLoginResponse = (raw: RawLoginResponse): LoginResponse => {
  const token = raw.token ?? raw.Token ?? raw.access_token
  const refreshToken = raw.refresh_token ?? raw.Refresh_token
  const userID = raw.user_id ?? raw.UserID
  const username = raw.username ?? raw.Username
  const email = raw.email ?? raw.Email ?? ''

  if (!token || userID === undefined || !username) {
    throw new Error('登录响应字段缺失')
  }

  return {
    access_token: token,
    refresh_token: refreshToken ?? '',
    user_id: userID,
    username,
    email,
  }
}

const normalizeRegisterResponse = (raw: RawRegisterResponse): RegisterResponse => {
  const userID = raw.user_id ?? raw.UserID
  const username = raw.username ?? raw.Username
  const email = raw.email ?? raw.Email

  if (userID === undefined || !username) {
    throw new Error('注册响应字段缺失')
  }

  return {
    user_id: userID,
    username,
    email,
  }
}

const normalizeRefreshTokenResponse = (raw: RawRefreshTokenResponse): RefreshTokenResponse => {
  const accessToken = raw.access_token ?? raw.token ?? raw.Token
  const refreshToken = raw.refresh_token ?? raw.Refresh_token

  if (!accessToken) {
    throw new Error('刷新 Token 响应字段缺失')
  }

  return {
    access_token: accessToken,
    refresh_token: refreshToken ?? '',
  }
}

// 用户登录
// 对应后端: POST /api/v1/users/login
export const login = (data: LoginRequest) => {
  return request.post<unknown, RawLoginResponse>('/api/v1/users/login', data).then(normalizeLoginResponse)
}

// 用户注册
// 对应后端: POST /api/v1/users/register
export const register = (data: RegisterRequest) => {
  return request
    .post<unknown, RawRegisterResponse>('/api/v1/users/register', data)
    .then(normalizeRegisterResponse)
}

// 刷新 Token
// 对应后端: POST /api/v1/users/refresh
export const refreshToken = (refreshToken: string) => {
  return request.post<unknown, RawRefreshTokenResponse>('/api/v1/users/refresh', {
    refresh_token: refreshToken,
  }).then(normalizeRefreshTokenResponse)
}

// 退出登录
// 对应网关: POST /api/v1/users/logout
export const logout = async (accessToken: string) => {
  await logoutAppSession({ accessToken, appCode: 'go-note' })

  return {
    success: true,
  }
}

// ── 手机号单入口 API ──

// 发送手机验证码
// 对应后端: POST /api/v1/users/phone-code/send
export const sendPhoneCode = (data: PhoneAuthSendCodeRequest) => {
  return request
    .post<unknown, PhoneAuthSendCodeResponse>(PHONE_AUTH_SEND_CODE_PATH, data)
}

// 手机号登录 / 自动注册
// 对应后端: POST /api/v1/users/phone-entry
export const phoneEntry = (data: PhoneAuthEntryRequest) => {
  return request
    .post<unknown, PhoneAuthEntryResponse>(PHONE_AUTH_ENTRY_PATH, data)
}

// ── 用户安全能力 ──

// 修改密码
// 对应后端: POST /api/v1/users/password/change
export const changePassword = (data: ChangePasswordRequest) => {
  return request.post<unknown, ChangePasswordResponse>('/api/v1/users/password/change', data)
}

// 设置密码
// 对应后端: POST /api/v1/users/password/set
export const setPassword = (data: SetPasswordRequest) => {
  return request.post<unknown, SetPasswordResponse>('/api/v1/users/password/set', data)
}

// 绑定邮箱
// 对应后端: POST /api/v1/users/email/bind
export const bindEmail = (data: BindEmailRequest) => {
  return request.post<unknown, BindEmailResponse>('/api/v1/users/email/bind', data)
}

// 退出全部设备
// 对应后端: POST /api/v1/users/logout-all
export const logoutAll = () => {
  return request.post<unknown, LogoutAllSessionsResponse>('/api/v1/users/logout-all')
}
