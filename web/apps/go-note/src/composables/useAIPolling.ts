import { ref, onUnmounted, type Ref } from 'vue'
import { getSnippetAiMetadata, type AIMetadata } from '@/api/snippet'

export type AIPollingStatus = 'idle' | 'polling' | 'ready' | 'timeout' | 'error'

const POLL_INTERVAL_MS = 3_000
const MAX_POLLS = 10

export function useAIPolling() {
  const status = ref<AIPollingStatus>('idle')
  const metadata = ref<AIMetadata | null>(null)
  const error = ref('')

  let timer: ReturnType<typeof setTimeout> | null = null
  let pollCount = 0

  const clearTimer = () => {
    if (timer !== null) {
      clearTimeout(timer)
      timer = null
    }
  }

  const stopPolling = () => {
    clearTimer()
    pollCount = 0
    // keep current status/metadata — caller decides whether to reset
  }

  const startPolling = (snippetId: string | number) => {
    stopPolling()
    status.value = 'polling'
    metadata.value = null
    error.value = ''
    pollCount = 0

    const tick = async () => {
      pollCount++

      try {
        const result = await getSnippetAiMetadata(snippetId)

        if (result !== null) {
          // AI has produced data
          metadata.value = result
          status.value = 'ready'
          stopPolling()
          return
        }
      } catch (err) {
        // Network or unexpected error — stop polling
        error.value = err instanceof Error ? err.message : '获取 AI 元数据失败'
        status.value = 'error'
        stopPolling()
        return
      }

      // result was null (404) → not ready yet
      if (pollCount >= MAX_POLLS) {
        status.value = 'timeout'
        stopPolling()
        return
      }

      // schedule next poll
      timer = setTimeout(tick, POLL_INTERVAL_MS)
    }

    // first tick fires immediately
    tick()
  }

  /**
   * Quick summary string for the current state, useful for toolbar labels.
   */
  const statusLabel = (suggestionsCount?: number) => {
    switch (status.value) {
      case 'polling':
        return '⚡ AI 分析中…'
      case 'ready': {
        const n = suggestionsCount ?? (metadata.value?.suggested_tags.length ?? 0)
        return `✅ AI 就绪 · ${n} 个建议`
      }
      case 'timeout':
        return '⏳ AI 处理较慢，稍后查看'
      case 'error':
        return '❌ AI 分析异常'
      default:
        return ''
    }
  }

  onUnmounted(stopPolling)

  return {
    status,
    metadata,
    error,
    startPolling,
    stopPolling,
    statusLabel,
  }
}
