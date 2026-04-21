<template>
  <ul class="space-y-1">
    <li v-for="group in groups" :key="group.id" class="space-y-1">
      <div
        class="group-tree-button"
        :class="{ 'group-tree-button-active': isSameId(activeId, group.id) || dragOverId === group.id }"
        :style="{ paddingLeft: `${depth * 12 + 10}px` }"
        @dragover.prevent="onDragOver($event, group.id)"
        @dragleave="onDragLeave(group.id)"
        @drop="onDrop($event, group.id)"
      >
        <div class="flex min-w-0 flex-1 items-center justify-between gap-2 group/item">
          <div class="flex min-w-0 flex-1 items-center gap-2">
            <button
              v-if="group.children.length"
              type="button"
              class="group-tree-toggle"
              :aria-label="expanded[group.id] ? '收起分组' : '展开分组'"
              @click.stop="toggle(group.id)"
            >
              <ChevronRight class="transition-transform duration-150" :class="{ 'rotate-90': expanded[group.id] }" />
            </button>
            <span v-else class="block w-4 shrink-0"></span>
            <button
              type="button"
              class="flex min-w-0 flex-1 items-center gap-2 text-left"
              @click="$emit('select', group.id)"
            >
              <Book class="shrink-0 text-[#a39e98] w-4 h-4" />
              <span class="truncate text-left">{{ group.name }}</span>
            </button>
          </div>
          <div class="flex items-center gap-1 opacity-0 transition-opacity group-hover/item:opacity-100">
            <DropdownMenuRoot>
              <DropdownMenuTrigger as-child>
                <button type="button" class="flex h-5 w-5 items-center justify-center rounded text-[#a39e98] transition-colors hover:bg-[rgba(0,0,0,0.08)] hover:text-[rgba(0,0,0,0.95)]" @click.stop>
                  <MoreHorizontal class="h-3.5 w-3.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuPortal>
                <DropdownMenuContent align="end" :side-offset="8" class="ui-dropdown-content min-w-30">
                  <DropdownMenuItem
                    class="ui-dropdown-item text-red-600 data-highlighted:bg-red-50 data-highlighted:text-red-700"
                    @select="handleDelete(group)"
                  >
                    <Trash2 class="h-3.5 w-3.5" />
                    删除分组
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenuPortal>
            </DropdownMenuRoot>
          </div>
        </div>
        <span v-if="group.snippet_count" class="group-tree-count">{{ group.snippet_count }}</span>
      </div>

      <WorkspaceGroupTree
        v-if="group.children.length && expanded[group.id]"
        :groups="group.children"
        :active-id="activeId"
        :depth="depth + 1"
        @select="$emit('select', $event)"
      />
    </li>
  </ul>
</template>

<script setup lang="ts">
import { reactive, watch, ref } from 'vue'
import { ChevronRight, Book, MoreHorizontal, Trash2 } from 'lucide-vue-next'
import { isSameId } from '@clients/shared'
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuRoot,
  DropdownMenuTrigger,
} from 'radix-vue'
import { deleteSnippetGroup, moveSnippet } from '@/api/snippet'
import { confirm } from '@/composables/useConfirmDialog'
import { toast } from '@/composables/useToast'
import { useWorkspaceStore } from '@/stores/workspace'

defineOptions({
  name: 'WorkspaceGroupTree',
})

interface GroupTreeNode {
  id: string | number
  name: string
  snippet_count: number
  children: GroupTreeNode[]
  parent_id?: string | number | null
}

const props = withDefaults(defineProps<{
  groups: GroupTreeNode[]
  activeId?: string | number | null
  depth?: number
}>(), {
  activeId: null,
  depth: 0,
})

defineEmits<{
  select: [id: string | number]
}>()

const expanded = reactive<Record<string, boolean>>({})

const seedExpanded = (nodes: GroupTreeNode[]) => {
  for (const node of nodes) {
    const key = String(node.id)
    if (expanded[key] === undefined) {
      expanded[key] = props.depth < 1
    }
    if (node.children.length) {
      seedExpanded(node.children)
    }
  }
}

watch(
  () => props.groups,
  (nodes) => {
    seedExpanded(nodes)
  },
  { immediate: true, deep: true },
)

const toggle = (id: string | number) => {
  const key = String(id)
  expanded[key] = !expanded[key]
}

const dragOverId = ref<string | number | null>(null)

const onDragOver = (e: DragEvent, id: string | number) => {
  e.preventDefault()
  if (e.dataTransfer?.types.includes('text/plain')) {
    e.dataTransfer.dropEffect = 'move'
    dragOverId.value = id
  }
}

const onDragLeave = (id: string | number) => {
  if (dragOverId.value === id) {
    dragOverId.value = null
  }
}

const onDrop = async (e: DragEvent, id: string | number) => {
  dragOverId.value = null
  const snippetId = e.dataTransfer?.getData('text/plain')
  if (!snippetId) return

  try {
    await moveSnippet(snippetId, { group_id: id })
    toast.success('已移入分组')
    workspaceStore.fetchGroups() // Refresh group snippet counts
    window.dispatchEvent(new CustomEvent('snippet-moved'))
  } catch (err) {
    toast.error('移动失败')
  }
}

const workspaceStore = useWorkspaceStore()
const handleDelete = async (group: GroupTreeNode) => {
  const accepted = await confirm({
    title: '删除分组',
    description: `确定要删除分组“${group.name}”吗？此操作不可逆。`,
    confirmText: '删除',
    cancelText: '取消',
    tone: 'danger',
  })

  if (!accepted) {
    return
  }

  try {
    await deleteSnippetGroup(group.id)
    toast.success('分组已删除')
    workspaceStore.fetchGroups()
    if (isSameId(workspaceStore.activeGroupId, group.id)) {
      workspaceStore.selectGroup(null)
    }
  } catch (e) {
    toast.error(e instanceof Error ? e.message : '删除失败')
  }
}
</script>
