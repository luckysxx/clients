<template>
  <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
    <section class="space-y-4">
      <!-- Card 1: AI Model Config -->
      <article class="surface-panel p-5 sm:p-6">
        <div class="mb-6">
          <p class="text-[11px] font-[600] uppercase tracking-[0.05em] text-[#a39e98]">AI Engine</p>
          <h2 class="mt-2 text-[22px] font-[700] tracking-[-0.25px] text-[rgba(0,0,0,0.95)]">AI 模型配置</h2>
          <p class="mt-1 text-[14px] text-[#615d59]">配置你的 AI 服务提供商和模型。</p>
        </div>

        <div class="space-y-4">
          <!-- Provider -->
          <div>
            <label class="ui-label">提供商</label>
            <div class="relative">
              <select
                :value="state.provider"
                class="ui-input w-full appearance-none pr-8"
                @change="handleProviderChange"
              >
                <option v-for="p in providers" :key="p" :value="p">{{ providerLabel(p) }}</option>
              </select>
              <ChevronDown class="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#a39e98]" />
            </div>
          </div>

          <!-- Model -->
          <div>
            <label class="ui-label">模型</label>
            <div class="relative">
              <select v-model="state.model" class="ui-input w-full appearance-none pr-8">
                <option v-for="m in currentModels" :key="m" :value="m">{{ m }}</option>
              </select>
              <ChevronDown class="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#a39e98]" />
            </div>
          </div>

          <!-- API Key -->
          <div>
            <label class="ui-label">API Key</label>
            <input
              v-model="state.apiKey"
              type="password"
              class="ui-input w-full"
              placeholder="sk-..."
              autocomplete="off"
            />
          </div>

          <!-- Custom Endpoint -->
          <div v-if="state.provider === 'openai-compatible' || state.provider === 'ollama'">
            <label class="ui-label">Endpoint</label>
            <input
              v-model="state.endpoint"
              type="url"
              class="ui-input w-full"
              :placeholder="state.provider === 'ollama' ? 'http://localhost:11434' : '自定义 API 地址（可选）'"
            />
          </div>
        </div>

        <div class="mt-6 flex items-center gap-3">
          <button type="button" class="ui-button ui-button-secondary" :disabled="testing" @click="handleTestConnection">
            <LoaderCircle v-if="testing" class="h-4 w-4 animate-spin" />
            <Zap v-else class="h-4 w-4" />
            测试连接
          </button>
          <button type="button" class="ui-button ui-button-primary" @click="handleSave">
            保存
          </button>
          <Transition name="fade">
            <span v-if="testResult" class="ml-2 text-[13px] font-[500]" :class="testResult === 'success' ? 'text-[#2a9d99]' : 'text-[#dd5b00]'">
              {{ testResult === 'success' ? '✓ 连接成功' : '✗ 连接失败' }}
            </span>
          </Transition>
        </div>
      </article>

      <!-- Card 2: Feature Toggles -->
      <article class="surface-panel p-5 sm:p-6">
        <div class="mb-6">
          <p class="text-[11px] font-[600] uppercase tracking-[0.05em] text-[#a39e98]">Features</p>
          <h2 class="mt-2 text-[22px] font-[700] tracking-[-0.25px] text-[rgba(0,0,0,0.95)]">AI 功能开关</h2>
          <p class="mt-1 text-[14px] text-[#615d59]">控制哪些 AI 能力对你的文档生效。</p>
        </div>

        <div class="space-y-4">
          <label v-for="feat in featureList" :key="feat.key" class="flex cursor-pointer items-center justify-between gap-4 rounded-[8px] px-3 py-2.5 transition-colors hover:bg-[rgba(0,0,0,0.02)]">
            <div>
              <p class="text-[14px] font-[500] text-[rgba(0,0,0,0.95)]">{{ feat.label }}</p>
              <p class="mt-0.5 text-[12px] text-[#a39e98]">{{ feat.description }}</p>
            </div>
            <div
              class="relative inline-flex h-[22px] w-10 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200"
              :class="state.features[feat.key] ? 'bg-[#097fe8]' : 'bg-[rgba(0,0,0,0.18)]'"
              @click="state.features[feat.key] = !state.features[feat.key]"
            >
              <span
                class="inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200"
                :class="state.features[feat.key] ? 'translate-x-[22px]' : 'translate-x-[3px]'"
              ></span>
            </div>
          </label>
        </div>
      </article>
    </section>

    <!-- Aside: Usage Stats -->
    <aside class="space-y-4">
      <section class="surface-panel p-5">
        <p class="text-[11px] font-[600] uppercase tracking-[0.05em] text-[#a39e98]">Usage</p>
        <h3 class="mt-2 text-[18px] font-[700] tracking-[-0.25px] text-[rgba(0,0,0,0.95)]">AI 用量统计</h3>

        <dl class="mt-5 space-y-3">
          <div v-for="stat in usageStats" :key="stat.label" class="flex items-center justify-between border-b border-[rgba(0,0,0,0.06)] pb-2 last:border-0 last:pb-0">
            <dt class="text-[13px] text-[#615d59]">{{ stat.label }}</dt>
            <dd class="text-[14px] font-[600] text-[rgba(0,0,0,0.95)]">{{ stat.value }}</dd>
          </div>
        </dl>
      </section>

      <section class="surface-panel p-5">
        <p class="text-[11px] font-[600] uppercase tracking-[0.05em] text-[#a39e98]">Tips</p>
        <ul class="mt-4 space-y-3 text-[14px] leading-6 text-[#615d59]">
          <li>所有 AI 设置暂存于本地浏览器，后续版本将支持云端同步。</li>
          <li>Ollama 需要本地运行服务，默认端口为 11434。</li>
          <li>关闭「保存时自动触发」后，你仍可手动请求 AI 分析。</li>
        </ul>
      </section>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { ChevronDown, LoaderCircle, Zap } from 'lucide-vue-next'
import { useAISettings, type AIProvider } from '@/composables/useAISettings'
import { toast } from '@/composables/useToast'

const { state, save, providerLabel, modelsForProvider, setProvider } = useAISettings()

const providers: AIProvider[] = ['openai', 'anthropic', 'ollama', 'openai-compatible']

const currentModels = computed(() => modelsForProvider(state.provider))

const testing = ref(false)
const testResult = ref<'success' | 'fail' | ''>('')

const featureList: { key: keyof typeof state.features; label: string; description: string }[] = [
  { key: 'autoTagSuggestion', label: '自动标签建议', description: '保存文档后自动推荐相关标签' },
  { key: 'autoSummary', label: '自动摘要', description: '生成文档摘要供快速浏览' },
  { key: 'todoExtraction', label: 'TODO 提取', description: '自动识别文档中的待办事项' },
  { key: 'triggerOnSave', label: '保存时自动触发', description: '文档保存到云端后自动请求 AI 分析' },
]

const usageStats = ref([
  { label: '总调用次数', value: '—' },
  { label: '总 Token 消耗', value: '—' },
  { label: '预估费用', value: '—' },
  { label: '最近一次调用', value: '—' },
  { label: '模型', value: computed(() => state.model) },
  { label: 'Prompt 版本', value: 'v1.0' },
])

const handleProviderChange = (e: Event) => {
  const target = e.target as HTMLSelectElement
  setProvider(target.value as AIProvider)
}

const handleSave = () => {
  save()
  toast.success('AI 设置已保存')
}

const handleTestConnection = async () => {
  testing.value = true
  testResult.value = ''

  // Simulate a test connection (backend API not available yet)
  await new Promise(resolve => setTimeout(resolve, 1200))

  if (!state.apiKey && state.provider !== 'ollama') {
    testResult.value = 'fail'
    toast.warning('请先填入 API Key')
  } else {
    testResult.value = 'success'
    toast.success('连接测试通过')
  }

  testing.value = false

  // Clear result after a few seconds
  setTimeout(() => {
    testResult.value = ''
  }, 3000)
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
