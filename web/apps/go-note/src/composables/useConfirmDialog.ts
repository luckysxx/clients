import { reactive, readonly } from 'vue'

export interface ConfirmDialogOptions {
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  tone?: 'default' | 'danger'
}

interface ConfirmDialogState extends Required<ConfirmDialogOptions> {
  open: boolean
}

const state = reactive<ConfirmDialogState>({
  open: false,
  title: '',
  description: '',
  confirmText: '确认',
  cancelText: '取消',
  tone: 'default',
})

let resolver: ((value: boolean) => void) | null = null

export const useConfirmDialogState = () => readonly(state)

export const confirm = (options: ConfirmDialogOptions) => {
  state.open = true
  state.title = options.title
  state.description = options.description
  state.confirmText = options.confirmText ?? '确认'
  state.cancelText = options.cancelText ?? '取消'
  state.tone = options.tone ?? 'default'

  return new Promise<boolean>((resolve) => {
    resolver = resolve
  })
}

export const settleConfirm = (accepted: boolean) => {
  state.open = false
  resolver?.(accepted)
  resolver = null
}

export const closeConfirm = () => {
  settleConfirm(false)
}
