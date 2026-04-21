/**
 * 前端运行时配置模块
 *
 * 应用启动时从 api-gateway 拉取一次配置（GET /api/v1/config/client），
 * 之后通过 getAppConfig() 同步读取缓存值。
 *
 * 本地开发时如果 gateway 未启动，自动回退到 localhost 默认值。
 */

export interface AppConfig {
  sso_login_url: string
  go_note_url: string
  go_chat_url: string
}

const defaults: AppConfig = {
  sso_login_url: 'http://localhost:5173/auth/login',
  go_note_url: 'http://localhost:5174',
  go_chat_url: 'http://localhost:5175',
}

let cached: AppConfig | null = null

/**
 * 从 api-gateway 拉取客户端配置。
 * 应在 app.mount() 之前调用一次。
 */
export async function fetchAppConfig(): Promise<AppConfig> {
  if (cached) return cached

  try {
    const res = await fetch('/api/v1/config/client')
    const envelope = await res.json()
    if (envelope.code === 200 && envelope.data) {
      cached = { ...defaults, ...envelope.data }
      return cached!
    }
  } catch {
    console.warn('[app-config] 无法获取远程配置，使用默认值')
  }

  cached = defaults
  return cached
}

/**
 * 同步读取已缓存的配置。
 * 必须在 fetchAppConfig() 完成后使用。
 */
export function getAppConfig(): AppConfig {
  return cached ?? defaults
}
