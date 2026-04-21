export interface ApiEnvelope<T> {
  code: number
  msg: string
  data: T | null
}

interface HttpErrorShape {
  response?: {
    data?: {
      msg?: string
      error?: string
    }
  }
  message?: string
}

export function unwrapApiEnvelope<T>(payload: ApiEnvelope<T>, fallback = '请求失败'): T {
  if (payload.code !== 200 || payload.data === null) {
    throw new Error(payload.msg || fallback)
  }

  return payload.data
}

export function getHttpErrorMessage(error: unknown, fallback = '请求失败，请稍后重试'): string {
  const httpError = error as HttpErrorShape
  const rawMessage = httpError.response?.data?.msg || httpError.response?.data?.error || httpError.message || ''

  if (isInfraErrorMessage(rawMessage)) {
    return '服务暂时不可用，请稍后再试'
  }

  return rawMessage || fallback
}

function isInfraErrorMessage(message: string): boolean {
  const normalized = message.toLowerCase()

  return (
    normalized.includes('name resolver error') ||
    normalized.includes('produced zero addresses') ||
    normalized.includes('rpc error') ||
    normalized.includes('connection refused') ||
    normalized.includes('unavailable') ||
    normalized.includes('internal error')
  )
}
