export const PHONE_AUTH_SEND_CODE_PATH = '/api/v1/users/phone/code'
export const PHONE_AUTH_ENTRY_PATH = '/api/v1/users/phone/entry'
export const PHONE_PASSWORD_LOGIN_PATH = '/api/v1/users/phone/password-login'

export type PhoneAuthEntryAction =
  | 'code_sent'
  | 'logged_in'
  | 'registered_and_logged_in'
  | 'needs_email_binding'
  | 'invalid_code'
  | 'rate_limited'
  | 'phone_conflict'

export interface PhoneAuthSendCodeRequest {
  phone: string
  scene: 'login'
}

export interface PhoneAuthSendCodeResponse {
  action: 'code_sent' | 'rate_limited'
  cooldown_seconds?: number
  message?: string
}

export interface PhoneAuthEntryRequest {
  phone: string
  verification_code: string
  app_code: string
  device_id: string
}

export interface PhoneAuthEntryResponse {
  action: PhoneAuthEntryAction
  access_token?: string
  refresh_token?: string
  user_id?: number
  username?: string
  email?: string
  phone?: string
  should_bind_email?: boolean
  message?: string
}

export interface PhonePasswordLoginRequest {
  phone: string
  password: string
  app_code: string
  device_id: string
}

export interface PhonePasswordLoginResponse {
  access_token?: string
  refresh_token?: string
  user_id?: number
  username?: string
  phone?: string
  message?: string
}
