import type { LocationQuery } from 'vue-router'
import {
  normalizeInternalPath,
  readSingleQueryValue,
  resolvePassportBrand,
} from '@clients/shared'

export interface SsoRouteContext {
  clientId: string
  appId: string
  appCode: string
  redirectUri: string
  state: string
  isSsoMode: boolean
  hasRedirect: boolean
}

export function resolveAppCode(query: LocationQuery, fallback = 'unknown'): string {
  const appId = readSingleQueryValue(query.app_id).trim()
  const appCode = readSingleQueryValue(query.app_code).trim()
  const clientId = readSingleQueryValue(query.client_id).trim()
  return resolvePassportBrand(appCode || appId || clientId || fallback, fallback).appCode
}

export function resolveAppId(query: LocationQuery, fallback = 'unknown'): string {
  const appId = readSingleQueryValue(query.app_id).trim()
  const appCode = readSingleQueryValue(query.app_code).trim()
  const clientId = readSingleQueryValue(query.client_id).trim()
  return resolvePassportBrand(appId || appCode || clientId || fallback, fallback).appId
}

export function resolvePostAuthRedirect(query: LocationQuery, fallback = '/'): string {
  return normalizeInternalPath(readSingleQueryValue(query.redirect), fallback)
}

export function buildAppNavigationTarget(baseUrl: string, internalPath: string): string {
  return new URL(normalizeInternalPath(internalPath, '/'), baseUrl).toString()
}

export function resolveSsoRouteContext(
  query: LocationQuery,
  fallbackAppCode = 'unknown',
): SsoRouteContext {
  const clientId = readSingleQueryValue(query.client_id).trim()
  const appId = resolveAppId(query, fallbackAppCode)
  const appCode = resolveAppCode(query, fallbackAppCode)
  const redirectUri = readSingleQueryValue(query.redirect_uri).trim()
  const state = readSingleQueryValue(query.state).trim()
  const hasRedirect = appCode.length > 0 && redirectUri.length > 0 && isSafeRedirectUri(redirectUri)

  return {
    clientId,
    appId,
    appCode,
    redirectUri,
    state,
    isSsoMode: hasRedirect,
    hasRedirect,
  }
}

export function buildSsoRedirectTarget(context: SsoRouteContext, payload: {
  accessToken: string
  refreshToken: string
  userId: number
  username: string
}): string {
  const callbackUrl = new URL(context.redirectUri)
  callbackUrl.searchParams.set('result', 'logged_in')
  callbackUrl.searchParams.set('user_id', String(payload.userId))
  callbackUrl.searchParams.set('username', payload.username)

  if (context.clientId) {
    callbackUrl.searchParams.set('client_id', context.clientId)
  }
  if (context.appCode) {
    callbackUrl.searchParams.set('app_code', context.appCode)
  }
  if (context.appId) {
    callbackUrl.searchParams.set('app_id', context.appId)
  }
  if (context.state) {
    callbackUrl.searchParams.set('state', context.state)
  }

  const hashParams = new URLSearchParams({
    access_token: payload.accessToken,
    refresh_token: payload.refreshToken,
    token_type: 'Bearer',
  })
  callbackUrl.hash = hashParams.toString()

  return callbackUrl.toString()
}

export function buildAuthLandingTarget(redirectUri: string, _payload: {
  accessToken: string
  refreshToken: string
  userId: number
  username: string
}): string {
  const landingUrl = new URL(redirectUri)
  const hashParams = new URLSearchParams({
    access_token: _payload.accessToken,
    refresh_token: _payload.refreshToken,
    token_type: 'Bearer',
    user_id: String(_payload.userId),
    username: _payload.username,
  })
  landingUrl.hash = hashParams.toString()
  return landingUrl.toString()
}

export function buildPreservedSsoQuery(query: LocationQuery, fallbackAppCode = 'go-chat'): Record<string, string> {
  const next: Record<string, string> = {}
  const appId = resolveAppId(query, fallbackAppCode)
  const appCode = resolveAppCode(query, fallbackAppCode)

  if (appId) {
    next.app_id = appId
  }
  if (appCode) {
    next.app_code = appCode
  }

  const redirectUri = readSingleQueryValue(query.redirect_uri).trim()
  const state = readSingleQueryValue(query.state).trim()
  const clientId = readSingleQueryValue(query.client_id).trim()
  const redirect = resolvePostAuthRedirect(query, '')
  const intent = readSingleQueryValue(query.intent).trim()

  if (redirectUri) next.redirect_uri = redirectUri
  if (state) next.state = state
  if (clientId) next.client_id = clientId
  if (redirect) next.redirect = redirect
  if (intent) next.intent = intent

  return next
}

function isSafeRedirectUri(uri: string): boolean {
  try {
    const parsed = new URL(uri)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}
