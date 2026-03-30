export interface AuthStorageKeys {
  token: string
  refreshToken: string
  user: string
}

export function createAuthStorageKeys(namespace = ''): AuthStorageKeys {
  if (!namespace) {
    return {
      token: 'token',
      refreshToken: 'refresh_token',
      user: 'user',
    }
  }

  return {
    token: `${namespace}.token`,
    refreshToken: `${namespace}.refresh_token`,
    user: `${namespace}.user`,
  }
}
