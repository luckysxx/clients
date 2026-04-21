<template>
  <article
    class="group flex cursor-pointer items-center gap-3 overflow-hidden rounded px-2 py-2 mt-0.5 transition-colors duration-150 hover:bg-[rgba(0,0,0,0.04)]"
    :draggable="draggable"
    @dragstart="e => $emit('dragstart', e, snippet)"
    @click="$emit('click', snippet.id)"
  >
    <div class="flex min-w-0 flex-1 items-center gap-3">
      <div class="flex h-6 w-6 shrink-0 items-center justify-center text-[#a39e98] transition-colors group-hover:text-[#615d59]">
        <FileText class="h-4 w-4" />
      </div>
      <div class="min-w-0 flex-1 overflow-hidden">
        <div class="flex items-center gap-2 min-w-0">
          <h3 class="min-w-0 shrink truncate text-[15px] font-[500] text-[rgba(0,0,0,0.95)] decoration-[rgba(0,0,0,0.3)] group-hover:underline underline-offset-4">{{ snippet.title }}</h3>
          <Badge v-if="badge" :tone="badge.tone" class="shrink-0">{{ badge.text }}</Badge>
          <div v-if="snippet.tag_ids?.length" class="hidden md:flex shrink-0 items-center gap-1 overflow-hidden max-w-[40%]">
            <template v-for="tag in resolvedTags" :key="tag.id">
              <span
                class="inline-flex shrink-0 items-center gap-1 rounded bg-[rgba(0,0,0,0.04)] px-1.5 py-0.5 text-[10px] font-[500] text-[#615d59]"
              >
                <span class="h-1.5 w-1.5 rounded-full" :style="{ backgroundColor: tag.color }"></span>
                {{ tag.name }}
              </span>
            </template>
          </div>
        </div>
      </div>
    </div>

    <div class="ml-auto flex shrink-0 items-center gap-4 text-[13px] text-[#a39e98]">
      <div class="hidden sm:block">
        更新于 {{ formattedDate }}
      </div>
      <div class="flex items-center gap-0.5">
        <template v-if="isTrashEnv">
          <button type="button" class="flex h-7 w-7 items-center justify-center opacity-0 transition-opacity group-hover:opacity-100 hover:bg-[rgba(0,0,0,0.08)] rounded text-[#2a9d99]" title="恢复文档" @click.stop="$emit('restore', snippet)">
            <ArchiveRestore class="h-3.5 w-3.5" />
          </button>
          <button type="button" class="flex h-7 w-7 items-center justify-center opacity-0 transition-opacity group-hover:opacity-100 hover:bg-[rgba(0,0,0,0.08)] rounded text-[#dd5b00]" title="彻底删除" @click.stop="$emit('delete', snippet)">
            <Trash2 class="h-3.5 w-3.5" />
          </button>
        </template>
        <template v-else-if="!hideActions">
          <button type="button" class="flex h-7 w-7 items-center justify-center opacity-0 transition-opacity group-hover:opacity-100 hover:bg-[rgba(0,0,0,0.08)] rounded text-[#dd5b00]" :title="String(snippet.id) === 'draft:new' ? '丢弃本地草稿' : '移入回收站'" @click.stop="$emit('delete', snippet)">
            <Trash2 class="h-3.5 w-3.5" />
          </button>
        </template>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { FileText, Trash2, ArchiveRestore } from 'lucide-vue-next'
import { useWorkspaceStore } from '@/stores/workspace'
import { isSameId } from '@clients/shared'
import type { Snippet } from '@/api/snippet'
import { formatRelativeDate } from '@/utils/date'
import Badge from '@/components/ui/Badge.vue'

const props = defineProps<{
  snippet: Snippet
  isTrashEnv?: boolean
  hideActions?: boolean
  badge?: { text: string, tone: 'draft' | 'pending' | 'latest' } | null
  draggable?: boolean
}>()

defineEmits(['click', 'dragstart', 'delete', 'restore'])

const workspaceStore = useWorkspaceStore()

const resolvedTags = computed(() => {
  if (!props.snippet.tag_ids?.length) return []
  return props.snippet.tag_ids.map(id => workspaceStore.tags.find(t => isSameId(t.id, id))).filter((t): t is any => Boolean(t))
})

const formattedDate = computed(() => formatRelativeDate(props.snippet.updated_at))
</script>
