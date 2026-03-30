import axios, { type AxiosError, type AxiosRequestConfig, type AxiosResponse } from 'axios'
import { ElMessage } from 'element-plus'
import {
  applyBearerToken,
  createTokenRefreshQueue,
  isAuthMutationRequest,
  normalizeRefreshTokens,
  type RefreshTokenPayload,
  type RetryableRequestConfigLike,
} from '@clients/auth'
import { getCurrentLocationPath } from '@clients/shared'
import { type ApiEnvelope, getHttpErrorMessage, unwrapApiEnvelope } from '@clients/request'
import { useAuthStore } from '@/stores/auth'
import { buildSsoLoginUrl } from '@/router'

// 1. 创建 axios 实例
const service = axios.create({
  // 这里留空，让它自动匹配当前域名
  // 也就是请求会发给 http://localhost:5173/api/v1/...
  // 然后被 Vite 代理捕获
  baseURL: '',
  timeout: 5000, // 请求超时时间：5秒
})

// 2. 请求拦截器 (Request Interceptor)
service.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore()
    if (!authStore.hydrated) {
      authStore.initFromStorage()
    }

    if (authStore.token) {
      applyBearerToken(config as RetryableRequestConfigLike, authStore.token)
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

const refreshQueue = createTokenRefreshQueue()

// 3. 响应拦截器 (Response Interceptor)
service.interceptors.response.use(
  (response) => {
    try {
      return unwrapApiEnvelope(response.data as ApiEnvelope<unknown>) as unknown as AxiosResponse
    } catch (error) {
      ElMessage.error(getHttpErrorMessage(error))
      return Promise.reject(error)
    }
  },
  async (error: AxiosError<{ msg?: string; error?: string }>) => {
    // 超出 2xx 范围的状态码都会触发这里（网络错误、404、500等）
    console.error('请求出错:', error)

    const authStore = useAuthStore()
    const originalRequest = (error.config || {}) as RetryableRequestConfigLike
    const requestUrl = originalRequest.url || ''

    if (error.response?.status === 401 && !isAuthMutationRequest(requestUrl)) {
      if (originalRequest._retry || !authStore.refreshToken) {
        authStore.clearAuth()
        ElMessage.error('登录状态已失效，请重新登录')
        window.location.href = buildSsoLoginUrl(getCurrentLocationPath())
        return Promise.reject(new Error('登录状态已失效，请重新登录'))
      }

      if (refreshQueue.isRefreshing) {
        return refreshQueue.waitForToken().then((token) => {
          applyBearerToken(originalRequest, token)
          return service(originalRequest as AxiosRequestConfig)
        })
      }

      originalRequest._retry = true
      refreshQueue.startRefreshing()

      try {
        const refreshResponse = await axios.post<ApiEnvelope<RefreshTokenPayload>>('/api/v1/users/refresh', {
          refresh_token: authStore.refreshToken,
        })
        const tokens = normalizeRefreshTokens(refreshResponse.data.data ?? {}, authStore.refreshToken)

        authStore.updateTokens(tokens.accessToken, tokens.refreshToken)
        refreshQueue.resolve(tokens.accessToken)
        applyBearerToken(originalRequest, tokens.accessToken)

        return service(originalRequest as AxiosRequestConfig)
      } catch (refreshError) {
        authStore.clearAuth()
        const refreshMessage = new Error(getHttpErrorMessage(refreshError))
        refreshQueue.reject(refreshMessage)
        ElMessage.error('登录状态已失效，请重新登录')
        window.location.href = buildSsoLoginUrl(getCurrentLocationPath())
        return Promise.reject(refreshMessage)
      } finally {
        refreshQueue.finishRefreshing()
      }
    }

    // 统一弹出错误提示 (过滤掉刷新 token 时弹出的重复错误消息)
    if (error.response?.status !== 401) {
      ElMessage.error(getHttpErrorMessage(error, '网络请求失败，请稍后重试'))
    }

    return Promise.reject(error)
  },
)

export default service
