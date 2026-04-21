<template>
  <DialogRoot v-model:open="open">
    <DialogPortal>
      <DialogOverlay class="dialog-overlay" />
      <DialogContent class="dialog-content max-w-lg">
        <DialogTitle class="text-lg font-semibold text-[rgba(0,0,0,0.95)]">导出文档</DialogTitle>
        <DialogDescription class="mt-1 text-sm text-[#615d59]">
          选择要导出的文档，然后选择保存到指定文件夹或下载 ZIP。
        </DialogDescription>

        <!-- Select All / Search -->
        <div class="mt-4 flex items-center justify-between gap-3">
          <label class="flex items-center gap-2 text-[13px] text-[#615d59] cursor-pointer select-none">
            <input
              type="checkbox"
              :checked="isAllSelected"
              :indeterminate="isIndeterminate"
              class="h-4 w-4 rounded border-[rgba(0,0,0,0.2)] text-[#0075de] focus:ring-[#0075de] cursor-pointer"
              @change="toggleSelectAll"
            />
            全选（{{ selectedIds.size }} / {{ filteredSnippets.length }}）
          </label>
          <div class="relative">
            <Search class="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#a39e98]" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="搜索文档..."
              class="h-8 w-48 rounded-[6px] border border-[rgba(0,0,0,0.1)] bg-[#f6f5f4] pl-7 pr-3 text-[12px] text-[rgba(0,0,0,0.95)] outline-none transition-colors placeholder:text-[#a39e98] focus:border-[rgba(0,0,0,0.2)]"
            />
          </div>
        </div>

        <!-- Document List -->
        <div class="mt-3 max-h-[320px] overflow-y-auto rounded-[8px] border border-[rgba(0,0,0,0.1)] bg-[#f6f5f4]">
          <div v-if="filteredSnippets.length === 0" class="py-8 text-center text-[13px] text-[#a39e98]">
            {{ searchQuery ? '没有匹配的文档' : '暂无文档' }}
          </div>
          <label
            v-for="s in filteredSnippets"
            :key="s.id"
            class="flex items-center gap-3 border-b border-[rgba(0,0,0,0.06)] px-4 py-2.5 transition-colors hover:bg-[rgba(0,0,0,0.03)] cursor-pointer last:border-b-0"
          >
            <input
              type="checkbox"
              :checked="selectedIds.has(String(s.id))"
              class="h-4 w-4 shrink-0 rounded border-[rgba(0,0,0,0.2)] text-[#0075de] focus:ring-[#0075de] cursor-pointer"
              @change="toggleItem(s.id)"
            />
            <div class="min-w-0 flex-1">
              <p class="truncate text-[13px] font-[500] text-[rgba(0,0,0,0.95)]">{{ s.title || '未命名文档' }}</p>
              <p class="mt-0.5 text-[11px] text-[#a39e98]">{{ formatDate(s.updated_at) }}</p>
            </div>
          </label>
        </div>

        <!-- Progress -->
        <div v-if="busy" class="mt-3 flex items-center gap-2 text-[13px] text-[#615d59]">
          <LoaderCircle class="h-3.5 w-3.5 animate-spin" />
          正在导出... {{ progress.done }} / {{ progress.total }}
        </div>

        <!-- Actions -->
        <div class="mt-5 flex items-center justify-between">
          <span class="text-[12px] text-[#a39e98]">已选 {{ selectedIds.size }} 篇</span>
          <div class="flex items-center gap-2.5">
            <DialogClose as-child>
              <button type="button" class="h-9 rounded-[6px] border border-[rgba(0,0,0,0.1)] px-4 text-[13px] font-[500] text-[#615d59] transition-colors hover:bg-[rgba(0,0,0,0.04)] outline-none">
                取消
              </button>
            </DialogClose>
            <button
              type="button"
              :disabled="selectedIds.size === 0 || busy"
              class="h-9 rounded-[6px] bg-[rgba(0,0,0,0.85)] px-5 text-[13px] font-[500] text-white transition-all hover:bg-black active:scale-[0.97] disabled:opacity-40 disabled:pointer-events-none outline-none flex items-center gap-1.5"
              @click="handleFolder"
            >
              <Download class="h-3.5 w-3.5" />
              导出
            </button>
          </div>
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { Download, LoaderCircle, Search } from 'lucide-vue-next'
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
} from 'radix-vue'
import type { Snippet } from '@/api/snippet'
import { exportToFolder } from '@/composables/useImportExport'

const props = defineProps<{
  snippets: Snippet[]
}>()

const open = defineModel<boolean>('open', { default: false })

const searchQuery = ref('')
const selectedIds = ref<Set<string>>(new Set())
const busy = ref(false)
const progress = reactive({ total: 0, done: 0 })

watch(open, (val) => {
  if (val) {
    searchQuery.value = ''
    busy.value = false
    progress.total = 0
    progress.done = 0
    selectedIds.value = new Set(props.snippets.map((s) => String(s.id)))
  }
})

const filteredSnippets = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return props.snippets
  return props.snippets.filter((s) => s.title.toLowerCase().includes(q))
})

const isAllSelected = computed(
  () => filteredSnippets.value.length > 0 && filteredSnippets.value.every((s) => selectedIds.value.has(String(s.id))),
)

const isIndeterminate = computed(
  () => !isAllSelected.value && filteredSnippets.value.some((s) => selectedIds.value.has(String(s.id))),
)

function getSelected() {
  return props.snippets.filter((s) => selectedIds.value.has(String(s.id)))
}

function toggleSelectAll() {
  if (isAllSelected.value) {
    for (const s of filteredSnippets.value) selectedIds.value.delete(String(s.id))
  } else {
    for (const s of filteredSnippets.value) selectedIds.value.add(String(s.id))
  }
  selectedIds.value = new Set(selectedIds.value)
}

function toggleItem(id: string | number) {
  const key = String(id)
  if (selectedIds.value.has(key)) selectedIds.value.delete(key)
  else selectedIds.value.add(key)
  selectedIds.value = new Set(selectedIds.value)
}

async function handleFolder() {
  const selected = getSelected()
  if (selected.length === 0) return

  busy.value = true
  progress.total = selected.length
  progress.done = 0

  const result = await exportToFolder(selected, (p) => {
    progress.done = p.done
  })

  busy.value = false
  if (result >= 0) open.value = false  // -1 = 用户取消，不关闭
}


function formatDate(v: string) {
  const d = new Date(v)
  if (Number.isNaN(d.getTime())) return v
  return new Intl.DateTimeFormat('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}
</script>
