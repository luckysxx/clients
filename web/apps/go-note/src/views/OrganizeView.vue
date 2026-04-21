<template>
  <div class="flex h-[calc(100vh-3rem)] flex-col overflow-hidden bg-white">
    <header class="border-b border-[rgba(0,0,0,0.1)] bg-white px-8 pb-6 pt-7">
      <div class="flex flex-wrap items-start justify-between gap-6">
        <div class="max-w-3xl">
          <p class="text-[11px] font-[600] uppercase tracking-[0.05em] text-[#a39e98]">Workspace Organize</p>
          <h1 class="mt-2 text-[32px] font-[700] tracking-[-1px] text-[rgba(0,0,0,0.95)]">
            统一整理
          </h1>
          <p class="mt-2 max-w-2xl text-[14px] leading-6 text-[#615d59]">
            在一个沉浸式工作台里批量归档、移动和清理文档。三种模式共用同一份数据，不再来回丢状态。
          </p>
        </div>

        <div class="grid min-w-[280px] grid-cols-3 gap-3">
          <article class="rounded-[8px] border border-[rgba(0,0,0,0.1)] bg-white px-4 py-3 shadow-soft">
            <p class="text-[11px] font-[600] uppercase tracking-[0.05em] text-[#a39e98]">文档</p>
            <p class="mt-2 text-[20px] font-[600] text-[rgba(0,0,0,0.95)]">{{ snippets.length }}</p>
          </article>
          <article class="rounded-[8px] border border-[rgba(0,0,0,0.1)] bg-white px-4 py-3 shadow-soft">
            <p class="text-[11px] font-[600] uppercase tracking-[0.05em] text-[#a39e98]">分组</p>
            <p class="mt-2 text-[20px] font-[600] text-[rgba(0,0,0,0.95)]">{{ flatGroups.length }}</p>
          </article>
          <article class="rounded-[8px] border border-[rgba(0,0,0,0.1)] bg-white px-4 py-3 shadow-soft">
            <p class="text-[11px] font-[600] uppercase tracking-[0.05em] text-[#a39e98]">已选择</p>
            <p class="mt-2 text-[20px] font-[600] text-[rgba(0,0,0,0.95)]">{{ selectedIds.length }}</p>
          </article>
        </div>
      </div>

      <div class="mt-6 flex flex-wrap items-center justify-between gap-4">
        <div class="inline-flex rounded border border-[rgba(0,0,0,0.1)] bg-[#f6f5f4] p-[2px]">
          <button
            v-for="item in modes"
            :key="item.value"
            type="button"
            class="inline-flex items-center gap-1.5 rounded-[3px] px-3 py-1.5 text-[13px] font-[500] transition-colors duration-150"
            :class="mode === item.value
              ? 'bg-white text-[rgba(0,0,0,0.95)] shadow-[0_1px_2px_rgba(0,0,0,0.05)]'
              : 'text-[#615d59] hover:text-[rgba(0,0,0,0.95)]'"
            @click="mode = item.value"
          >
            <component :is="item.icon" class="h-4 w-4" />
            <span>{{ item.label }}</span>
          </button>
        </div>

        <div class="flex flex-wrap items-center gap-2 text-[12px] text-[#615d59]">
          <span class="rounded border border-[rgba(0,0,0,0.1)] bg-white px-2 py-1">当前模式：{{ activeModeLabel }}</span>
          <span class="rounded border border-[rgba(0,0,0,0.1)] bg-white px-2 py-1">Inbox：{{ inboxCount }} 篇</span>
          <span v-if="loading" class="rounded border border-[rgba(0,0,0,0.1)] bg-white px-2 py-1">正在同步...</span>
        </div>
      </div>
    </header>

    <DraftNotificationBanner
      v-if="localDraftCount > 0"
      to="/workspace/drafts"
      :message="`您有 ${localDraftCount} 份未发布的本地草稿`"
      trailing="前往草稿箱 →"
      class="mx-6 mt-4"
    />

    <div class="min-h-0 flex-1 px-6 pb-6 pt-6 bg-[#f6f5f4]">
      <div class="flex h-full min-h-0 flex-col overflow-hidden rounded-[8px] border border-[rgba(0,0,0,0.1)] bg-white shadow-soft">
        <div v-if="loading" class="flex flex-1 items-center justify-center gap-3 text-sm text-[#615d59]">
          <LoaderCircle class="h-5 w-5 animate-spin" />
          正在整理文档列表...
        </div>

        <component
          :is="currentViewComponent"
          v-else
          :snippets="snippets"
          :groups="groupTree"
          :flat-groups="flatGroups"
          :tag-map="tagMap"
          :active-group-id="activeGroupId"
          :selected-ids="selectedIds"
          @move-snippet="handleMoveSnippet"
          @move-selected="handleMoveSelected"
          @delete-selected="handleDeleteSelected"
          @set-active-group="handleSetActiveGroup"
          @set-selection="handleSetSelection"
          @clear-selection="selectedIds = []"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Columns3, LayoutGrid, LoaderCircle, Table2 } from 'lucide-vue-next'
import { isSameId } from '@clients/shared'
import { deleteSnippet, listMySnippets, moveSnippet, type Snippet, type SnippetGroup, type SnippetTag } from '@/api/snippet'
import { toast } from '@/composables/useToast'
import { useWorkspaceStore } from '@/stores/workspace'
import DraftNotificationBanner from '@/components/ui/DraftNotificationBanner.vue'
import OrganizeKanban from '@/components/organize/OrganizeKanban.vue'
import OrganizeSplit from '@/components/organize/OrganizeSplit.vue'
import OrganizeTable from '@/components/organize/OrganizeTable.vue'
import type { OrganizeGroupNode, OrganizeGroupOption, OrganizeTagMapItem } from '@/components/organize/types'

defineOptions({ name: 'OrganizeView' })

type Mode = 'kanban' | 'table' | 'split'

interface MovePayload {
  snippetId: string | number
  groupId: string | number
}

interface BulkMovePayload {
  ids: Array<string | number>
  groupId: string | number
}

const workspaceStore = useWorkspaceStore()

const mode = ref<Mode>('kanban')
const loading = ref(true)
const snippets = ref<Snippet[]>([])
const localDraftCount = ref(0)

const countLocalDrafts = () => {
  let n = 0
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.startsWith('go-note-draft-')) n++
  }
  localDraftCount.value = n
}
const selectedIds = ref<Array<string | number>>([])
const activeGroupId = ref<string | number>(0)

const modes = [
  { value: 'kanban' as Mode, label: '看板视图', icon: Columns3 },
  { value: 'table' as Mode, label: '极客表格', icon: Table2 },
  { value: 'split' as Mode, label: '经典分栏', icon: LayoutGrid },
]

const currentViewComponent = computed(() => {
  switch (mode.value) {
    case 'table':
      return OrganizeTable
    case 'split':
      return OrganizeSplit
    default:
      return OrganizeKanban
  }
})

const activeModeLabel = computed(() => modes.find((item) => item.value === mode.value)?.label ?? '')

const groupTree = computed<OrganizeGroupNode[]>(() => buildGroupTree(workspaceStore.groups))

const flatGroups = computed<OrganizeGroupOption[]>(() => {
  const items: OrganizeGroupOption[] = []

  const walk = (nodes: OrganizeGroupNode[], depth = 0) => {
    for (const node of nodes) {
      items.push({ id: node.id, name: node.name, depth })
      if (node.children.length) {
        walk(node.children, depth + 1)
      }
    }
  }

  walk(groupTree.value)
  return items
})

const tagMap = computed(() => {
  const map = new Map<string, OrganizeTagMapItem>()
  for (const tag of workspaceStore.tags) {
    map.set(String(tag.id), {
      ...(tag as SnippetTag),
      color: tag.color || '#c5cbd3',
    })
  }
  return map
})

const inboxCount = computed(() => snippets.value.filter((snippet) => isInboxSnippet(snippet)).length)

const loadAllSnippets = async () => {
  loading.value = true

  try {
    let cursor = ''
    let hasMore = true
    const all: Snippet[] = []

    while (hasMore && all.length < 500) {
      const response = await listMySnippets({ limit: 100, cursor })
      all.push(...response.snippets)
      hasMore = !!response.has_more
      cursor = response.next_cursor || ''

      if (!cursor) {
        break
      }
    }

    snippets.value = all
    selectedIds.value = selectedIds.value.filter((id) => all.some((snippet) => isSameId(snippet.id, id)))
  } catch {
    toast.error('加载文档数据失败')
  } finally {
    loading.value = false
  }
}

const patchSnippetGroup = (snippetId: string | number, groupId: string | number) => {
  snippets.value = snippets.value.map((snippet) => (
    isSameId(snippet.id, snippetId)
      ? { ...snippet, group_id: groupId }
      : snippet
  ))
}

const handleMoveSnippet = async ({ snippetId, groupId }: MovePayload) => {
  const snippet = snippets.value.find((item) => isSameId(item.id, snippetId))
  if (!snippet || isSameId(snippet.group_id ?? 0, groupId)) {
    return
  }

  try {
    await moveSnippet(snippetId, { group_id: groupId })
    patchSnippetGroup(snippetId, groupId)
    await workspaceStore.fetchGroups()
    toast.success(isSameId(groupId, 0) ? '已移入收件箱' : '已更新分组')
  } catch {
    toast.error('移动失败')
  }
}

const handleMoveSelected = async ({ ids, groupId }: BulkMovePayload) => {
  if (!ids.length) {
    return
  }

  const results = await Promise.allSettled(ids.map((id) => moveSnippet(id, { group_id: groupId })))
  const successIds = ids.filter((_, index) => results[index]?.status === 'fulfilled')

  if (!successIds.length) {
    toast.error('批量移动失败')
    return
  }

  for (const id of successIds) {
    patchSnippetGroup(id, groupId)
  }

  selectedIds.value = selectedIds.value.filter((id) => !successIds.some((item) => isSameId(item, id)))
  await workspaceStore.fetchGroups()
  toast.success(`成功移动 ${successIds.length} 篇文档`)
}

const handleDeleteSelected = async (ids: Array<string | number>) => {
  if (!ids.length) {
    return
  }

  const results = await Promise.allSettled(ids.map((id) => deleteSnippet(id)))
  const successIds = ids.filter((_, index) => results[index]?.status === 'fulfilled')

  if (!successIds.length) {
    toast.error('批量删除失败')
    return
  }

  snippets.value = snippets.value.filter((snippet) => !successIds.some((id) => isSameId(id, snippet.id)))
  selectedIds.value = selectedIds.value.filter((id) => !successIds.some((item) => isSameId(item, id)))
  await workspaceStore.fetchGroups()
  toast.success(`成功删除 ${successIds.length} 篇文档`)
}

const handleSetSelection = (ids: Array<string | number>) => {
  selectedIds.value = ids
}

const handleSetActiveGroup = (groupId: string | number) => {
  activeGroupId.value = groupId
}

onMounted(async () => {
  await Promise.all([
    workspaceStore.groups.length ? Promise.resolve() : workspaceStore.fetchGroups(),
    workspaceStore.tags.length ? Promise.resolve() : workspaceStore.fetchTags(),
    loadAllSnippets(),
  ])
  countLocalDrafts()
})

function buildGroupTree(groups: SnippetGroup[]) {
  if (!groups.length) {
    return []
  }

  const map = new Map<string, OrganizeGroupNode>()
  const roots: OrganizeGroupNode[] = []

  for (const group of groups) {
    map.set(String(group.id), {
      ...group,
      children: [],
    })
  }

  for (const node of map.values()) {
    const parentId = node.parent_id
    if (parentId != null && map.has(String(parentId))) {
      map.get(String(parentId))?.children.push(node)
    } else {
      roots.push(node)
    }
  }

  return roots
}

function isInboxSnippet(snippet: Snippet) {
  return snippet.group_id == null || isSameId(snippet.group_id, 0)
}
</script>
