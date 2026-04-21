<template>
  <div class="flex h-full min-h-0 overflow-hidden bg-[#f6f5f4]">
    <aside class="app-scrollbar flex w-[320px] shrink-0 flex-col overflow-y-auto border-r border-[rgba(0,0,0,0.1)] bg-white px-4 py-5">
      <div class="px-2">
        <h2 class="text-[14px] font-[600] text-[rgba(0,0,0,0.95)]">经典分栏</h2>
        <p class="mt-1 text-[12px] leading-5 text-[#615d59]">左侧选分组，右侧全部展开，用最接近文件管理器的方式做整理。</p>
      </div>

      <div class="mt-5">
        <button
          type="button"
          class="flex w-full items-center justify-between rounded-[8px] border px-3 py-3 text-left transition-all"
          :class="isInboxActive || isInboxDropTarget
            ? 'border-[rgba(0,0,0,0.1)] bg-[rgba(0,0,0,0.05)] text-[rgba(0,0,0,0.95)]'
            : 'border-transparent bg-transparent text-[#615d59] hover:bg-[rgba(0,0,0,0.03)]'"
          @click="$emit('setActiveGroup', 0)"
          @dragover.prevent="onInboxDragOver"
          @dragleave="onInboxDragLeave"
          @drop="onInboxDrop"
        >
          <span class="flex items-center gap-2">
            <Inbox class="h-4 w-4" />
            <span class="text-[13px] font-[500]">Inbox / 收件箱</span>
          </span>
          <span
            class="rounded-full px-2 py-1 text-[10px]"
            :class="isInboxActive || isInboxDropTarget ? 'bg-[rgba(0,0,0,0.05)] text-[#615d59]' : 'bg-transparent text-[#a39e98]'"
          >
            {{ inboxSnippets.length }}
          </span>
        </button>
      </div>

      <div class="mt-5 px-2 text-[11px] font-[600] uppercase tracking-[0.05em] text-[#a39e98]">自定义分组</div>
      <div class="mt-3">
        <OrganizeGroupTree
          :groups="groups"
          :active-group-id="activeGroupId"
          @select="$emit('setActiveGroup', $event)"
          @move-snippet="$emit('moveSnippet', $event)"
        />
      </div>
    </aside>

    <main class="min-h-0 min-w-0 flex-1 overflow-hidden">
      <div class="flex h-full min-h-0 flex-col">
        <div class="flex items-center justify-between border-b border-[rgba(0,0,0,0.1)] bg-white px-6 py-4">
          <div>
            <h3 class="text-[15px] font-[600] text-[rgba(0,0,0,0.95)]">{{ currentGroupName }}</h3>
            <p class="mt-1 text-[12px] text-[#615d59]">把右侧卡片拖到左侧任意分组，完成归档。</p>
          </div>
          <div class="flex items-center gap-2 text-[12px] text-[#615d59]">
            <span class="ui-chip-muted">{{ activeSnippets.length }} 篇文档</span>
          </div>
        </div>

        <div class="app-scrollbar min-h-0 flex-1 overflow-y-auto px-6 py-5">
          <div v-if="activeSnippets.length" class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            <article
              v-for="snippet in activeSnippets"
              :key="snippet.id"
              draggable="true"
              class="group flex min-h-[208px] cursor-grab flex-col rounded-[12px] border border-[rgba(0,0,0,0.1)] bg-white p-4 shadow-soft active:cursor-grabbing"
              @dragstart="(event) => onDragStart(event, snippet.id)"
            >
              <div class="flex items-start justify-between gap-3">
                <h4 class="line-clamp-2 text-[15px] font-[500] leading-6 text-[rgba(0,0,0,0.95)]">{{ snippet.title || '未命名文档' }}</h4>
                <Files class="h-4 w-4 shrink-0 text-[#a39e98] transition-colors group-hover:text-[#615d59]" />
              </div>

              <p class="mt-3 line-clamp-4 text-[12px] leading-5 text-[#615d59]">{{ snippet.content || '暂无内容摘要' }}</p>

              <div class="mt-auto border-t border-[rgba(0,0,0,0.08)] pt-4">
                <div class="flex flex-wrap gap-1.5">
                  <span
                    v-for="tag in resolveTags(snippet.tag_ids)"
                    :key="tag.id"
                    class="inline-flex items-center gap-1 rounded-full border border-[rgba(0,0,0,0.1)] bg-[#f6f5f4] px-2 py-1 text-[10px] text-[#615d59]"
                  >
                    <span class="h-1.5 w-1.5 rounded-full" :style="{ backgroundColor: tag.color }"></span>
                    {{ tag.name }}
                  </span>
                  <span v-if="!resolveTags(snippet.tag_ids).length" class="text-[11px] text-[#a39e98]">无标签</span>
                </div>
                <div class="mt-3 text-[11px] text-[#a39e98]">更新于 {{ formatDate(snippet.updated_at) }}</div>
              </div>
            </article>
          </div>

          <div v-else class="flex h-full min-h-[360px] flex-col items-center justify-center rounded-[12px] border border-dashed border-[rgba(0,0,0,0.15)] bg-white text-center">
            <Files class="h-10 w-10 text-[#a39e98]" />
            <p class="mt-4 text-[14px] font-[500] text-[rgba(0,0,0,0.95)]">当前分组下暂无文档</p>
            <p class="mt-2 max-w-sm text-[12px] leading-5 text-[#615d59]">可以先切到 Inbox 选中文档，或者直接把看板和表格里整理过的内容继续拖进目标分组。</p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { Files, Inbox } from 'lucide-vue-next'
import { isSameId } from '@clients/shared'
import type { Snippet } from '@/api/snippet'
import OrganizeGroupTree from '@/components/organize/OrganizeGroupTree.vue'
import type { OrganizeGroupNode, OrganizeTagMapItem } from '@/components/organize/types'

const props = defineProps<{
  snippets: Snippet[]
  groups: OrganizeGroupNode[]
  activeGroupId: string | number
  tagMap: Map<string, OrganizeTagMapItem>
}>()

const emit = defineEmits<{
  moveSnippet: [payload: { snippetId: string | number, groupId: string | number }]
  setActiveGroup: [groupId: string | number]
}>()

const inboxSnippets = computed(() => props.snippets.filter((snippet) => snippet.group_id == null || isSameId(snippet.group_id, 0)))
const activeSnippets = computed(() => {
  if (isSameId(props.activeGroupId, 0)) {
    return inboxSnippets.value
  }

  return props.snippets.filter((snippet) => isSameId(snippet.group_id, props.activeGroupId))
})

const currentGroupName = computed(() => {
  if (isSameId(props.activeGroupId, 0)) {
    return 'Inbox / 收件箱'
  }

  const lookup = (nodes: OrganizeGroupNode[]): string | null => {
    for (const node of nodes) {
      if (isSameId(node.id, props.activeGroupId)) {
        return node.name
      }
      const childMatch = lookup(node.children)
      if (childMatch) {
        return childMatch
      }
    }
    return null
  }

  return lookup(props.groups) ?? '未知分组'
})

const isInboxDropTarget = ref(false)
const isInboxActive = computed(() => isSameId(props.activeGroupId, 0))

const onDragStart = (event: DragEvent, snippetId: string | number) => {
  if (!event.dataTransfer) {
    return
  }

  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('text/plain', String(snippetId))
}

const onInboxDragOver = (event: DragEvent) => {
  if (!event.dataTransfer?.types.includes('text/plain')) {
    return
  }

  event.dataTransfer.dropEffect = 'move'
  isInboxDropTarget.value = true
}

const onInboxDragLeave = () => {
  isInboxDropTarget.value = false
}

const onInboxDrop = (event: DragEvent) => {
  isInboxDropTarget.value = false
  const snippetId = event.dataTransfer?.getData('text/plain')

  if (!snippetId) {
    return
  }

  emit('moveSnippet', {
    snippetId,
    groupId: 0,
  })
}

const resolveTags = (ids?: Array<string | number>) => {
  if (!ids?.length) {
    return []
  }

  return ids
    .map((id) => props.tagMap.get(String(id)))
    .filter((tag): tag is OrganizeTagMapItem => Boolean(tag))
    .slice(0, 4)
}

const formatDate = (value: string) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}
</script>
