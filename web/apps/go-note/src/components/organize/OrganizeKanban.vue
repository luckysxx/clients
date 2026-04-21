<template>
  <div class="flex h-full flex-col overflow-hidden bg-[#f6f5f4]">
    <div class="flex items-center justify-between border-b border-[rgba(0,0,0,0.1)] px-6 py-4">
      <div>
        <h2 class="text-[14px] font-[600] text-[rgba(0,0,0,0.95)]">看板视图</h2>
        <p class="mt-1 text-[12px] text-[#615d59]">把文档像卡片一样拖进目标分组，适合快速归类。</p>
      </div>
      <p class="text-[12px] text-[#a39e98]">拖拽后会立即同步到后端</p>
    </div>

    <div class="app-scrollbar flex min-h-0 flex-1 gap-4 overflow-x-auto overflow-y-hidden px-6 py-5">
      <section
        v-for="column in columns"
        :key="column.id"
        class="flex h-full w-[320px] shrink-0 flex-col rounded-[12px] border border-[rgba(0,0,0,0.1)] bg-white shadow-soft"
      >
        <header class="flex items-center justify-between border-b border-[rgba(0,0,0,0.1)] px-4 py-4">
          <div class="min-w-0">
            <h3 class="truncate text-[14px] font-[600] text-[rgba(0,0,0,0.95)]">{{ column.name }}</h3>
            <p class="mt-1 text-[11px] text-[#a39e98]">{{ column.id === 0 ? '默认承接未归档文档' : '拖入后完成重新归类' }}</p>
          </div>
          <span class="rounded-full border border-[rgba(0,0,0,0.1)] bg-[#f6f5f4] px-2.5 py-1 text-[11px] font-[600] text-[#615d59]">{{ column.list.length }}</span>
        </header>

        <draggable
          v-model="column.list"
          item-key="id"
          group="organize-snippets"
          class="app-scrollbar min-h-0 flex-1 space-y-3 overflow-y-auto px-3 py-3"
          ghost-class="organize-kanban-ghost"
          chosen-class="organize-kanban-chosen"
          drag-class="organize-kanban-drag"
          :animation="180"
          @change="(event: DraggableChangeEvent) => handleChange(event, column.id)"
        >
          <template #item="{ element }">
            <article class="cursor-grab rounded-[12px] border border-[rgba(0,0,0,0.1)] bg-white p-4 shadow-soft active:cursor-grabbing">
              <div class="flex items-start justify-between gap-3">
                <h4 class="line-clamp-2 text-[14px] font-[500] leading-6 text-[rgba(0,0,0,0.95)]">{{ element.title || '未命名文档' }}</h4>
                <div class="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[#a39e98]"></div>
              </div>

              <p class="mt-3 line-clamp-3 text-[12px] leading-5 text-[#615d59]">
                {{ element.content || '暂无内容摘要' }}
              </p>

              <div class="mt-4 flex items-center justify-between gap-3 border-t border-[rgba(0,0,0,0.1)] pt-3">
                <div class="flex min-w-0 flex-wrap gap-1.5">
                  <span
                    v-for="tag in resolveTags(element.tag_ids)"
                    :key="tag.id"
                    class="inline-flex items-center gap-1 rounded-full border border-[rgba(0,0,0,0.1)] bg-[#f6f5f4] px-2 py-1 text-[10px] text-[#615d59]"
                  >
                    <span class="h-1.5 w-1.5 rounded-full" :style="{ backgroundColor: tag.color }"></span>
                    {{ tag.name }}
                  </span>
                  <span v-if="!resolveTags(element.tag_ids).length" class="text-[11px] text-[#a39e98]">无标签</span>
                </div>
                <span class="shrink-0 text-[11px] text-[#a39e98]">{{ formatRelativeDate(element.updated_at) }}</span>
              </div>
            </article>
          </template>
        </draggable>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import draggable from 'vuedraggable'
import { isSameId } from '@clients/shared'
import type { Snippet } from '@/api/snippet'
import type { OrganizeGroupNode, OrganizeGroupOption, OrganizeTagMapItem } from '@/components/organize/types'

interface KanbanColumn {
  id: string | number
  name: string
  list: Snippet[]
}

interface DraggableChangeEvent {
  added?: {
    element: Snippet
  }
}

const props = defineProps<{
  snippets: Snippet[]
  groups: OrganizeGroupNode[]
  flatGroups: OrganizeGroupOption[]
  tagMap: Map<string, OrganizeTagMapItem>
}>()

const emit = defineEmits<{
  moveSnippet: [payload: { snippetId: string | number, groupId: string | number }]
}>()

const columns = ref<KanbanColumn[]>([])

watch(
  () => [props.snippets, props.flatGroups],
  () => {
    const nextColumns: KanbanColumn[] = [
      { id: 0, name: 'Inbox / 收件箱', list: [] },
      ...props.flatGroups.map((group) => ({
        id: group.id,
        name: `${'· '.repeat(group.depth)}${group.name}`,
        list: [],
      })),
    ]

    for (const snippet of props.snippets) {
      const target = nextColumns.find((column) => isSameId(column.id, snippet.group_id ?? 0)) ?? nextColumns[0]
      target!.list.push({ ...snippet })
    }

    columns.value = nextColumns
  },
  { immediate: true, deep: true },
)

const resolveTags = (ids?: Array<string | number>) => {
  if (!ids?.length) {
    return []
  }

  return ids
    .map((id) => props.tagMap.get(String(id)))
    .filter((tag): tag is OrganizeTagMapItem => Boolean(tag))
    .slice(0, 3)
}

const handleChange = (event: DraggableChangeEvent, groupId: string | number) => {
  if (!event.added) {
    return
  }

  emit('moveSnippet', {
    snippetId: event.added.element.id,
    groupId,
  })
}

const formatRelativeDate = (value: string) => {
  const date = new Date(value)
  const diff = Date.now() - date.getTime()
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour

  if (Number.isNaN(date.getTime())) {
    return ''
  }
  if (diff < hour) {
    return `${Math.max(1, Math.floor(diff / minute))} 分钟前`
  }
  if (diff < day) {
    return `${Math.floor(diff / hour)} 小时前`
  }
  if (diff < day * 7) {
    return `${Math.floor(diff / day)} 天前`
  }

  return new Intl.DateTimeFormat('zh-CN', { month: 'short', day: 'numeric' }).format(date)
}
</script>

<style scoped>
.organize-kanban-ghost {
  opacity: 0.45;
}

.organize-kanban-chosen {
  transform: rotate(0.5deg) scale(1.01);
}

.organize-kanban-drag {
  cursor: grabbing;
}
</style>
