<template>
  <PageShell
    label="Groups"
    title="知识分组"
    description="管理和浏览你的知识库结构。"
    body-class="bg-[#f6f5f4]"
  >
    <template #actions>
      <button
        type="button"
        class="ui-button ui-button-primary"
        @click="groupDialogOpen = true"
      >
        <Plus class="h-4 w-4" />
        新建分组
      </button>
    </template>

    <template #badges>
      <div class="flex items-center gap-2">
        <span class="ui-chip-muted">{{ workspaceStore.groups.length }} 个分组</span>
        <span class="ui-chip-muted">{{ totalSnippetCount }} 篇文档</span>
      </div>
    </template>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-24 gap-3 text-[14px] text-[#615d59]">
      <LoaderCircle class="h-5 w-5 animate-spin" />
      正在加载分组信息...
    </div>

    <!-- Empty -->
    <div v-else-if="groupCards.length === 0" class="px-6 py-6">
      <EmptyState
        :icon="FolderOpen"
        title="还没有分组"
        description="创建第一个分组来组织你的知识库。"
        cta-text="新建分组"
        @cta="groupDialogOpen = true"
      />
    </div>

    <!-- Card Grid -->
    <div v-else class="px-6 py-6">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <article
          v-for="card in groupCards"
          :key="card.id"
          class="group grid grid-rows-[auto_1fr_auto] overflow-hidden rounded-[12px] border border-[rgba(0,0,0,0.1)] bg-white shadow-soft transition-all duration-200 hover:shadow-deep"
        >
          <!-- Card Header -->
          <div class="flex items-center justify-between border-b border-[rgba(0,0,0,0.1)] px-5 py-4">
            <div class="flex min-w-0 items-center gap-2.5">
              <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-[6px]" :class="card.isInbox ? 'bg-[rgba(0,117,222,0.08)]' : 'bg-[rgba(0,0,0,0.04)]'">
                <component :is="card.isInbox ? Inbox : Folder" class="h-4 w-4" :class="card.isInbox ? 'text-[#0075de]' : 'text-[#615d59]'" />
              </div>
              <div class="min-w-0">
                <h3 class="truncate text-[14px] font-[600] text-[rgba(0,0,0,0.95)]">{{ card.name }}</h3>
                <p class="text-[11px] text-[#a39e98]">{{ card.isInbox ? '默认承接未归档文档' : `${card.count} 篇文档` }}</p>
              </div>
            </div>
            <span class="shrink-0 rounded-full border border-[rgba(0,0,0,0.1)] bg-[#f6f5f4] px-2.5 py-0.5 text-[11px] font-[600] text-[#615d59]">
              {{ card.count }}
            </span>
          </div>

          <!-- Recent Docs Preview -->
          <div class="min-h-[120px] overflow-hidden px-1 py-1">
            <template v-if="card.recentDocs.length > 0">
              <SnippetListItem
                v-for="doc in card.recentDocs"
                :key="doc.id"
                :snippet="doc"
                hide-actions
                @click="(id) => router.push(`/snippets/${id}`)"
              />
            </template>
            <p v-else class="flex items-center justify-center h-full text-[12px] text-[#a39e98]">暂无文档</p>
          </div>

          <!-- Card Footer -->
          <div class="flex items-center justify-between border-t border-[rgba(0,0,0,0.1)] px-5 py-3">
            <button
              type="button"
              class="text-[12px] font-[500] text-[#0075de] transition-colors hover:text-[#005bab] outline-none"
              @click="router.push({ path: '/workspace', query: { group_id: String(card.id) } })"
            >
              查看文档 →
            </button>

            <DropdownMenuRoot v-if="!card.isInbox">
              <DropdownMenuTrigger as-child>
                <button
                  type="button"
                  class="flex h-7 w-7 items-center justify-center rounded text-[#a39e98] opacity-0 transition-all group-hover:opacity-100 hover:bg-[rgba(0,0,0,0.05)] hover:text-[rgba(0,0,0,0.95)] outline-none"
                >
                  <MoreHorizontal class="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuPortal>
                <DropdownMenuContent align="end" :side-offset="4" class="ui-dropdown-content min-w-36 p-1">
                  <DropdownMenuItem
                    class="ui-dropdown-item"
                    @select="openRenameDialog(card)"
                  >
                    <Pencil class="h-4 w-4 text-[#a39e98]" />
                    <span>重命名</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    class="ui-dropdown-item text-[#dd5b00] data-highlighted:bg-[rgba(221,91,0,0.06)] data-highlighted:text-[#dd5b00]"
                    @select="handleDeleteGroup(card)"
                  >
                    <Trash2 class="h-4 w-4" />
                    <span>删除分组</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenuPortal>
            </DropdownMenuRoot>
            <span v-else class="h-7 w-7" aria-hidden="true" />
          </div>
        </article>
      </div>
    </div>

    <!-- Create Group Dialog -->
    <DialogRoot v-model:open="groupDialogOpen">
      <DialogPortal>
        <DialogOverlay class="dialog-overlay" />
        <DialogContent class="dialog-content">
          <DialogTitle class="text-lg font-semibold text-[rgba(0,0,0,0.95)]">新建分组</DialogTitle>
          <DialogDescription class="mt-1 text-sm text-[#615d59]">
            创建一个新的分组来组织你的知识库。
          </DialogDescription>
          <div class="mt-5 space-y-4">
            <div>
              <label class="ui-label">分组名称</label>
              <input
                ref="createInputRef"
                v-model="newGroupName"
                class="ui-input"
                placeholder="例如：后端笔记"
                @keydown.enter.prevent="submitCreateGroup"
              />
            </div>
            <div class="flex justify-end gap-2">
              <DialogClose as-child>
                <button type="button" class="ui-button ui-button-secondary">取消</button>
              </DialogClose>
              <button type="button" class="ui-button ui-button-primary" @click="submitCreateGroup">创建分组</button>
            </div>
          </div>
        </DialogContent>
      </DialogPortal>
    </DialogRoot>

    <!-- Rename Dialog -->
    <DialogRoot v-model:open="renameDialogOpen">
      <DialogPortal>
        <DialogOverlay class="dialog-overlay" />
        <DialogContent class="dialog-content">
          <DialogTitle class="text-lg font-semibold text-[rgba(0,0,0,0.95)]">重命名分组</DialogTitle>
          <DialogDescription class="mt-1 text-sm text-[#615d59]">
            修改分组名称不会影响其中的文档。
          </DialogDescription>
          <div class="mt-5 space-y-4">
            <div>
              <label class="ui-label">新名称</label>
              <input
                ref="renameInputRef"
                v-model="renameName"
                class="ui-input"
                placeholder="输入新的分组名称"
                @keydown.enter.prevent="submitRename"
              />
            </div>
            <div class="flex justify-end gap-2">
              <DialogClose as-child>
                <button type="button" class="ui-button ui-button-secondary">取消</button>
              </DialogClose>
              <button type="button" class="ui-button ui-button-primary" @click="submitRename">确认</button>
            </div>
          </div>
        </DialogContent>
      </DialogPortal>
    </DialogRoot>
  </PageShell>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import {
  Folder,
  FolderOpen,
  Inbox,
  LoaderCircle,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-vue-next'
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuRoot,
  DropdownMenuTrigger,
} from 'radix-vue'
import { isSameId } from '@clients/shared'
import { listMySnippets, updateSnippetGroup, type Snippet } from '@/api/snippet'
import { confirm } from '@/composables/useConfirmDialog'
import { toast } from '@/composables/useToast'
import { useWorkspaceStore } from '@/stores/workspace'
import SnippetListItem from '@/components/workspace/SnippetListItem.vue'

interface GroupCard {
  id: string | number
  name: string
  isInbox: boolean
  count: number
  recentDocs: Snippet[]
}

const router = useRouter()
const workspaceStore = useWorkspaceStore()

const loading = ref(true)
const allSnippets = ref<Snippet[]>([])

// Create dialog
const groupDialogOpen = ref(false)
const newGroupName = ref('')
const createInputRef = ref<HTMLInputElement | null>(null)

// Rename dialog
const renameDialogOpen = ref(false)
const renameName = ref('')
const renameTargetId = ref<string | number | null>(null)
const renameInputRef = ref<HTMLInputElement | null>(null)

const totalSnippetCount = computed(() => allSnippets.value.length)

const groupCards = computed<GroupCard[]>(() => {
  const snippetsByGroup = new Map<string, Snippet[]>()

  // Bucket snippets by group
  for (const snippet of allSnippets.value) {
    const gid = String(snippet.group_id ?? 0)
    if (!snippetsByGroup.has(gid)) {
      snippetsByGroup.set(gid, [])
    }
    snippetsByGroup.get(gid)!.push(snippet)
  }

  // Build cards
  const cards: GroupCard[] = []

  // Inbox first
  const inboxDocs = snippetsByGroup.get('0') ?? []
  cards.push({
    id: 0,
    name: 'Inbox / 收件箱',
    isInbox: true,
    count: inboxDocs.length,
    recentDocs: inboxDocs.slice(0, 3),
  })

  // Other groups
  for (const group of workspaceStore.groups) {
    const docs = snippetsByGroup.get(String(group.id)) ?? []
    cards.push({
      id: group.id,
      name: group.name,
      isInbox: false,
      count: docs.length,
      recentDocs: docs.slice(0, 3),
    })
  }

  return cards
})

const loadAllSnippets = async () => {
  loading.value = true
  try {
    let cursor = ''
    let hasMore = true
    const all: Snippet[] = []

    while (hasMore && all.length < 500) {
      const response = await listMySnippets({ limit: 100, cursor, status: 'active' })
      all.push(...response.snippets)
      hasMore = !!response.has_more
      cursor = response.next_cursor || ''
      if (!cursor) break
    }

    allSnippets.value = all
  } catch {
    toast.error('加载文档数据失败')
  } finally {
    loading.value = false
  }
}

const submitCreateGroup = async () => {
  const name = newGroupName.value.trim()
  if (!name) {
    toast.warning('请输入分组名称')
    return
  }

  try {
    await workspaceStore.addGroup({ name })
    newGroupName.value = ''
    groupDialogOpen.value = false
    toast.success('分组已创建')
  } catch (e) {
    toast.error(e instanceof Error ? e.message : '创建分组失败')
  }
}

const openRenameDialog = async (card: GroupCard) => {
  renameTargetId.value = card.id
  renameName.value = card.name
  renameDialogOpen.value = true
  await nextTick()
  renameInputRef.value?.focus()
  renameInputRef.value?.select()
}

const submitRename = async () => {
  const name = renameName.value.trim()
  if (!name || renameTargetId.value == null) {
    toast.warning('请输入分组名称')
    return
  }

  try {
    await updateSnippetGroup(renameTargetId.value, { name })
    await workspaceStore.fetchGroups()
    renameDialogOpen.value = false
    toast.success('分组已重命名')
  } catch (e) {
    toast.error(e instanceof Error ? e.message : '重命名失败')
  }
}

const handleDeleteGroup = async (card: GroupCard) => {
  const accepted = await confirm({
    title: '删除分组',
    description: `确定要删除分组「${card.name}」吗？分组内的 ${card.count} 篇文档会移入收件箱，不会被删除。`,
    confirmText: '删除分组',
    cancelText: '取消',
    tone: 'danger',
  })

  if (!accepted) return

  try {
    await workspaceStore.removeGroup(card.id)
    // Reload snippets to reflect group changes
    await loadAllSnippets()
    toast.success('分组已删除')
  } catch (e) {
    toast.error(e instanceof Error ? e.message : '删除分组失败')
  }
}

onMounted(async () => {
  await Promise.all([
    workspaceStore.groups.length ? Promise.resolve() : workspaceStore.fetchGroups(),
    workspaceStore.tags.length ? Promise.resolve() : workspaceStore.fetchTags(),
    loadAllSnippets(),
  ])
})
</script>
