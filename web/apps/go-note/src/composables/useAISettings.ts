import { reactive, watch } from 'vue'

export type AIProvider = 'openai' | 'anthropic' | 'ollama' | 'openai-compatible'

export interface AIFeatures {
  autoTagSuggestion: boolean
  autoSummary: boolean
  todoExtraction: boolean
  triggerOnSave: boolean
}

export interface AISettingsState {
  provider: AIProvider
  model: string
  apiKey: string
  endpoint: string
  features: AIFeatures
}

const STORAGE_KEY = 'go-note-ai-settings'

const DEFAULT_MODELS: Record<AIProvider, string> = {
  openai: 'gpt-4o-mini',
  anthropic: 'claude-3-haiku-20240307',
  ollama: 'llama3',
  'openai-compatible': 'gpt-4o-mini',
}

const DEFAULT_STATE: AISettingsState = {
  provider: 'openai',
  model: 'gpt-4o-mini',
  apiKey: '',
  endpoint: '',
  features: {
    autoTagSuggestion: true,
    autoSummary: true,
    todoExtraction: true,
    triggerOnSave: true,
  },
}

function loadFromStorage(): AISettingsState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_STATE, features: { ...DEFAULT_STATE.features } }
    const parsed = JSON.parse(raw)
    return {
      provider: parsed.provider ?? DEFAULT_STATE.provider,
      model: parsed.model ?? DEFAULT_STATE.model,
      apiKey: parsed.apiKey ?? '',
      endpoint: parsed.endpoint ?? '',
      features: {
        autoTagSuggestion: parsed.features?.autoTagSuggestion ?? true,
        autoSummary: parsed.features?.autoSummary ?? true,
        todoExtraction: parsed.features?.todoExtraction ?? true,
        triggerOnSave: parsed.features?.triggerOnSave ?? true,
      },
    }
  } catch {
    return { ...DEFAULT_STATE, features: { ...DEFAULT_STATE.features } }
  }
}

function saveToStorage(state: AISettingsState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

/** singleton state shared across components */
let _state: ReturnType<typeof reactive<AISettingsState>> | null = null

export function useAISettings() {
  if (!_state) {
    _state = reactive<AISettingsState>(loadFromStorage())

    // persist on every change
    watch(() => ({ ..._state! }), (v) => saveToStorage(v as AISettingsState), { deep: true })
  }

  const state = _state

  const resetToDefaults = () => {
    Object.assign(state, { ...DEFAULT_STATE, features: { ...DEFAULT_STATE.features } })
  }

  const save = () => {
    saveToStorage(state)
  }

  const modelsForProvider = (provider: AIProvider): string[] => {
    switch (provider) {
      case 'openai':
        return ['gpt-4o-mini', 'gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo']
      case 'anthropic':
        return ['claude-3-haiku-20240307', 'claude-3-sonnet-20240229', 'claude-3-opus-20240229']
      case 'ollama':
        return ['llama3', 'mistral', 'codellama', 'gemma']
      case 'openai-compatible':
        return ['gpt-4o-mini', 'custom']
      default:
        return []
    }
  }

  const providerLabel = (provider: AIProvider): string => {
    switch (provider) {
      case 'openai': return 'OpenAI'
      case 'anthropic': return 'Anthropic (Claude)'
      case 'ollama': return 'Ollama（本地）'
      case 'openai-compatible': return '兼容 OpenAI API'
    }
  }

  const setProvider = (p: AIProvider) => {
    state.provider = p
    state.model = DEFAULT_MODELS[p] || ''
  }

  return {
    state,
    save,
    resetToDefaults,
    modelsForProvider,
    providerLabel,
    setProvider,
    DEFAULT_MODELS,
  }
}
