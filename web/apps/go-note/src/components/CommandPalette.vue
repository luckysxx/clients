<template>
  <DialogRoot :open="isOpen" @update:open="setOpen">
    <DialogPortal>
      <DialogOverlay class="dialog-overlay data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
      <DialogContent class="fixed left-1/2 top-[20%] z-50 w-full max-w-2xl -translate-x-1/2 rounded-[12px] border border-[rgba(0,0,0,0.1)] bg-white shadow-deep overflow-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[20%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[20%]">
        
        <!-- Search Input -->
        <div class="flex items-center border-b border-[rgba(0,0,0,0.08)] px-4 h-14">
          <Search class="mr-3 h-5 w-5 text-[#a39e98]" />
          <input
            ref="inputRef"
            v-model="searchQuery"
            class="flex-1 bg-transparent border-none text-[16px] text-[rgba(0,0,0,0.95)] outline-none placeholder:text-[#a39e98]"
            placeholder="搜索或者输入命令..."
            @keydown="handleKeydown"
          />
          <span class="ml-2 bg-[#f6f5f4] text-[#615d59] font-mono text-xs border-none px-1.5 py-0.5 rounded">esc</span>
        </div>

        <!-- Results / Actions -->
        <div class="max-h-[60vh] overflow-y-auto p-2">
          
          <div v-if="loading" class="p-4 text-center text-sm text-[#615d59]">
            <LoaderCircle class="w-5 h-5 animate-spin mx-auto" />
          </div>

          <div v-else-if="searchQuery.trim() && snippets.length === 0" class="p-8 text-center text-sm text-[#615d59]">
            未找到搜索 "{searchQuery}" 的结果
          </div>

          <template v-else>
            <!-- Actions -->
            <div v-if="!searchQuery.trim()" class="mb-4">
              <div class="px-2 py-1.5 text-[11px] font-[600] text-[#a39e98] uppercase tracking-[0.05em]">Actions</div>
              <button 
                class="w-full flex items-center gap-3 rounded-[4px] px-2 py-2.5 text-sm text-left hover:bg-[rgba(0,0,0,0.05)] focus:bg-[rgba(0,0,0,0.05)] outline-none transition-colors"
                @click="executeAction('create')"
              >
                <div class="flex h-6 w-6 items-center justify-center rounded bg-[#f6f5f4] text-[#615d59]">
                  <Plus class="h-4 w-4" />
                </div>
                <span class="flex-1 text-[rgba(0,0,0,0.95)]">新建 Snippet</span>
                <span class="text-xs text-[#a39e98] font-mono">↵</span>
              </button>
              
              <button 
                class="w-full flex items-center gap-3 rounded-[4px] px-2 py-2.5 text-sm text-left hover:bg-[rgba(0,0,0,0.05)] focus:bg-[rgba(0,0,0,0.05)] outline-none transition-colors"
                @click="executeAction('settings')"
              >
                <div class="flex h-6 w-6 items-center justify-center rounded bg-[#f6f5f4] text-[#615d59]">
                  <Settings2 class="h-4 w-4" />
                </div>
                <span class="flex-1 text-[rgba(0,0,0,0.95)]">空间设置</span>
              </button>
            </div>

            <!-- Snippets -->
            <div v-if="snippets.length > 0">
              <div class="px-2 py-1.5 text-[11px] font-[600] text-[#a39e98] uppercase tracking-[0.05em]">
                Snippets
              </div>
              <button 
                v-for="snippet in snippets" 
                :key="snippet.id"
                class="w-full flex items-center gap-3 rounded-[4px] px-2 py-2.5 text-sm text-left hover:bg-[rgba(0,0,0,0.05)] focus:bg-[rgba(0,0,0,0.05)] outline-none transition-colors"
                @click="goToSnippet(snippet.id)"
              >
                <div class="flex h-6 w-6 items-center justify-center rounded bg-[#f6f5f4] text-[#615d59]">
                  <FileText class="h-4 w-4" />
                </div>
                <div class="flex-1 overflow-hidden">
                  <div class="truncate text-[rgba(0,0,0,0.95)]">{{ snippet.title }}</div>
                  <div class="truncate text-xs text-[#a39e98] mt-0.5" v-if="snippet.content">{{ snippet.content.substring(0, 50) }}...</div>
                </div>
              </button>
            </div>
          </template>

        </div>
        
        <!-- Footer -->
        <div class="border-t border-[rgba(0,0,0,0.08)] bg-[#f6f5f4] px-4 py-3 flex items-center justify-between text-xs text-[#615d59]">
          <div class="flex items-center gap-4">
            <span class="flex items-center gap-1"><span class="font-mono bg-white border border-[rgba(0,0,0,0.1)] rounded px-1">↵</span> 选择</span>
            <span class="flex items-center gap-1"><span class="font-mono bg-white border border-[rgba(0,0,0,0.1)] rounded px-1">↑↓</span> 导航</span>
          </div>
          <div>Go-Note Command</div>
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMagicKeys, watchDebounced } from '@vueuse/core'
import { DialogPortal, DialogRoot, DialogOverlay, DialogContent } from 'radix-vue'
import { Search, FileText, Plus, Settings2, LoaderCircle } from 'lucide-vue-next'
import { searchSnippets, type Snippet } from '@/api/snippet'

const router = useRouter()
const { meta, k, ctrl } = useMagicKeys()

const isOpen = ref(false)
const searchQuery = ref('')
const snippets = ref<Snippet[]>([])
const loading = ref(false)
const inputRef = ref<HTMLInputElement | null>(null)

// 全局监听 Cmd+K / Ctrl+K 快捷键。
watch(() => (meta?.value && k?.value) || (ctrl?.value && k?.value), (v) => {
  if (v) {
    isOpen.value = true
  }
})

const handleOpenEvent = () => {
  isOpen.value = true
}

onMounted(() => {
  window.addEventListener('open-command-palette', handleOpenEvent)
})

onUnmounted(() => {
  window.removeEventListener('open-command-palette', handleOpenEvent)
})

const setOpen = (val: boolean) => {
  isOpen.value = val
  if (!val) {
    searchQuery.value = ''
    snippets.value = []
  } else {
    nextTick(() => {
      inputRef.value?.focus()
    })
  }
}

// 立即响应输入状态，避免在 300ms debounce 期间暴露出“未找到”提示（闪烁问题）
watch(searchQuery, (q) => {
  if (q.trim()) {
    loading.value = true
  } else {
    snippets.value = []
    loading.value = false
  }
})

watchDebounced(searchQuery, async (q) => {
  if (!q.trim()) return
  
  try {
    const res = await searchSnippets({ keyword: q.trim(), limit: 10 })
    snippets.value = res || []
  } catch (error) {
    console.error('Search failed', error)
  } finally {
    loading.value = false
  }
}, { debounce: 300 })

const handleKeydown = (e: KeyboardEvent) => {
  // 这里后续可以根据焦点状态补充更完整的键盘导航逻辑。
  // 当前先依赖 Tab / Shift+Tab 和鼠标点击操作。
}

const executeAction = (action: string) => {
  isOpen.value = false
  if (action === 'create') {
    router.push('/snippets/new')
  } else if (action === 'settings') {
    router.push('/settings')
  }
}

const goToSnippet = (id: number | string) => {
  isOpen.value = false
  router.push(`/${id}`)
}
</script>
