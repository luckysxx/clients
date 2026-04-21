import { requestWithAuth } from './http'

export interface UserProfile {
  user_id: number
  nickname: string
  avatar_url: string
  bio: string
  birthday: string
  updated_at: string
}

export const fetchUserProfile = () => {
  return requestWithAuth<UserProfile>('/api/v1/users/me/profile', { method: 'GET' })
}
