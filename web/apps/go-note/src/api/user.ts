import axios from 'axios'
import { type ApiEnvelope } from '@clients/request'
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

type LogoutEnvelope = ApiEnvelope<null>

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

export const getOrCreateDeviceID = () => {
  let deviceID = localStorage.getItem('device_id')

  if (!deviceID) {
    deviceID = crypto.randomUUID()
    localStorage.setItem('device_id', deviceID)
  }

  return deviceID
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
// 说明: 当前网关成功时返回 data=null，因此这里使用原生 axios 处理 envelope。
export const logout = async (accessToken: string) => {
  const response = await axios.post<LogoutEnvelope>(
    '/api/v1/users/logout',
    { device_id: getOrCreateDeviceID() },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  )

  if (response.data.code !== 200) {
    throw new Error(response.data.msg || '退出登录失败')
  }

  return {
    success: true,
  }
}
