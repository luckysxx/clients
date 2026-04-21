<template>
  <PageShell title="本地草稿箱" description="这里统一存放了您在本设备浏览器中暂存的全部未更新文档草稿。如果清理了浏览器缓存则草稿将永久丢失。" show-back>
    <template #actions>
      <button 
        v-show="drafts.length > 0"
        @click="clearAllDrafts"
        class="inline-flex h-8 items-center gap-1.5 rounded-md border border-red-200 bg-red-50 text-red-600 px-3 text-[13px] font-[500] hover:bg-red-100 transition-colors"
      >
        <Trash2 class="h-3.5 w-3.5" />
        清空草稿箱
      </button>
    </template>

    <div>
      <EmptyState
        v-show="drafts.length === 0"
        variant="circle"
        :icon="FileEdit"
        title="草稿箱空空如也"
        description="您尚未发布的任何本地自动保护或手动暂存数据将出现在这里"
      />

    <div v-show="drafts.length > 0" class="mx-6 my-2">
      <DataTable :columns="draftColumns">
        <tr v-for="draft in sortedDrafts" :key="draft.key" class="group cursor-pointer transition-colors hover:bg-[#f6f5f4]" @click="continueDraft(draft)">
          <td class="min-w-0 max-w-[400px] px-6 py-4">
            <div class="flex flex-col">
              <span class="block truncate text-[15px] font-[600] text-[rgba(0,0,0,0.95)]">{{ draft.data.title || '无标题文档' }}</span>
              <span class="mt-1 block truncate text-[13px] font-[400] text-[#a39e98]">{{ stripHtml(draft.data.content) }}</span>
            </div>
          </td>
          <td class="px-6 py-4">
            <span v-if="draft.isNew" class="inline-flex items-center rounded-full bg-[#f2f9ff] px-2 py-1 text-[12px] font-[600] tracking-[0.125px] text-[#097fe8]">新文档暂存</span>
            <span v-else-if="draft.isImport" class="inline-flex items-center rounded-full bg-[#f0fdf4] px-2 py-1 text-[12px] font-[600] tracking-[0.125px] text-[#16a34a]">导入文档</span>
            <span v-else class="inline-flex items-center rounded-full bg-[rgba(0,0,0,0.04)] px-2 py-1 text-[12px] font-[600] tracking-[0.125px] text-[#615d59]">更新记录</span>
          </td>
          <td class="whitespace-nowrap px-6 py-4 text-[13px] font-[400] text-[#615d59]">{{ formatTime(draft.data.timestamp) }}</td>
          <td class="px-6 py-4 text-right">
            <div class="flex items-center justify-end opacity-0 transition-opacity group-hover:opacity-100">
              <button @click.stop="deleteDraft(draft.key)" class="rounded-[4px] p-1.5 text-[#a39e98] transition-colors hover:bg-white hover:text-[#dd5b00]" title="丢弃此草稿">
                <Trash2 class="h-4 w-4" />
              </button>
            </div>
          </td>
        </tr>
      </DataTable>
    </div>
    </div>
  </PageShell>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { FileEdit, Trash2 } from 'lucide-vue-next'
import PageShell from '@/components/layout/PageShell.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import DataTable, { type DataTableColumn } from '@/components/ui/DataTable.vue'

const draftColumns: DataTableColumn[] = [
  { key: 'title', label: '暂存文档' },
  { key: 'type', label: '类型', class: 'w-32' },
  { key: 'time', label: '最后修改时间', class: 'w-48' },
  { key: 'actions', class: 'w-28' },
]
import { toast } from '@/composables/useToast'
import { confirm } from '@/composables/useConfirmDialog'

interface DraftItem {
  key: string
  isNew: boolean
  isImport: boolean
  snippetId?: string
  data: {
    title: string
    content: string
    timestamp: number
    group_id?: string | number | null
  }
}

const router = useRouter()
const drafts = ref<DraftItem[]>([])

const loadDrafts = () => {
  const items: DraftItem[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.startsWith('go-note-draft-')) {
      try {
        const raw = localStorage.getItem(key)
        if (raw) {
          const data = JSON.parse(raw)
          const isNew = key === 'go-note-draft-new'
          const isImport = key.startsWith('go-note-draft-import-')
          const snippetId = (isNew || isImport) ? undefined : key.replace('go-note-draft-', '')
          items.push({ key, isNew, isImport, snippetId, data })
        }
      } catch (e) {}
    }
  }
  drafts.value = items
}

const sortedDrafts = computed(() => {
  return [...drafts.value].sort((a, b) => b.data.timestamp - a.data.timestamp)
})

const formatTime = (ts: number) => {
  if (!ts) return '-'
  return new Intl.DateTimeFormat('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(ts))
}

const stripHtml = (html: string) => {
  if (!html) return '暂无内容'
  return html.replace(/<[^>]*>?/gm, '').substring(0, 50) || '暂无内容'
}

const continueDraft = (draft: DraftItem) => {
  if (draft.isImport) {
    // 导入草稿：复制内容到 go-note-draft-new，然后删除导入 key，打开新建编辑器
    const draftData = {
      title: draft.data.title,
      content: draft.data.content,
      group_id: draft.data.group_id ?? null,
      timestamp: Date.now(),
    }
    localStorage.setItem('go-note-draft-new', JSON.stringify(draftData))
    localStorage.removeItem(draft.key)
    router.push({ path: '/snippets/new', query: { from_draft: '1' } })
  } else if (draft.isNew) {
    router.push({ path: '/snippets/new', query: { from_draft: '1' } })
  } else {
    router.push({ path: `/snippets/${draft.snippetId}/edit`, query: { from_draft: '1' } })
  }
}

const deleteDraft = async (key: string) => {
  if (await confirm({ title: '彻底丢弃此草稿', description: '操作不可逆，确定吗？', tone: 'danger', confirmText: '彻底丢弃' })) {
    localStorage.removeItem(key)
    loadDrafts()
    toast.success('草稿已丢弃')
  }
}

const clearAllDrafts = async () => {
  if (!drafts.value.length) return
  if (await confirm({ title: '清空本地草稿箱', description: '将清空浏览器本地暂存的所有草稿数据，不可恢复！', tone: 'danger', confirmText: '全部清空' })) {
    drafts.value.forEach(d => localStorage.removeItem(d.key))
    loadDrafts()
    toast.success('所有草稿已清空')
  }
}

onMounted(loadDrafts)
</script>
