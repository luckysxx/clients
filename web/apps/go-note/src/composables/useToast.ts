import { readonly, ref } from 'vue'

export type ToastTone = 'success' | 'error' | 'warning' | 'info'

export interface ToastOptions {
  title?: string
  description: string
  tone?: ToastTone
  duration?: number
}

export interface ToastItem extends Required<ToastOptions> {
  id: number
}

const toasts = ref<ToastItem[]>([])
let toastSeed = 0

const DEFAULT_DURATION = 2800

const createToast = (options: ToastOptions) => {
  const item: ToastItem = {
    id: ++toastSeed,
    title: options.title ?? '',
    description: options.description,
    tone: options.tone ?? 'info',
    duration: options.duration ?? DEFAULT_DURATION,
  }

  toasts.value = [...toasts.value, item]

  window.setTimeout(() => {
    dismissToast(item.id)
  }, item.duration)

  return item.id
}

export const dismissToast = (id: number) => {
  toasts.value = toasts.value.filter((item) => item.id !== id)
}

export const toast = {
  show: createToast,
  success(description: string, title = '操作成功') {
    return createToast({ title, description, tone: 'success' })
  },
  error(description: string, title = '操作失败') {
    return createToast({ title, description, tone: 'error' })
  },
  warning(description: string, title = '请注意') {
    return createToast({ title, description, tone: 'warning' })
  },
  info(description: string, title = '提示') {
    return createToast({ title, description, tone: 'info' })
  },
}

export const useToastState = () => readonly(toasts)
