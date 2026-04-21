<template>
  <ul class="space-y-1.5">
    <li v-for="group in groups" :key="group.id" class="space-y-1.5">
      <button
        type="button"
        class="flex w-full items-center justify-between rounded-[8px] border px-3 py-2.5 text-left transition-all"
        :class="[
          isActive(group.id) || isDropTarget(group.id)
            ? 'border-[rgba(0,0,0,0.1)] bg-[rgba(0,0,0,0.05)] text-[rgba(0,0,0,0.95)]'
            : 'border-transparent bg-transparent text-[#615d59] hover:bg-[rgba(0,0,0,0.03)]',
        ]"
        :style="{ paddingLeft: `${depth * 14 + 12}px` }"
        @click="$emit('select', group.id)"
        @dragover.prevent="onDragOver($event, group.id)"
        @dragleave="onDragLeave(group.id)"
        @drop="onDrop($event, group.id)"
      >
        <span class="flex min-w-0 items-center gap-2">
          <button
            v-if="group.children.length"
            type="button"
            class="inline-flex h-5 w-5 items-center justify-center rounded-full transition-colors"
            :class="isActive(group.id) || isDropTarget(group.id) ? 'bg-[rgba(0,0,0,0.05)] text-[rgba(0,0,0,0.95)]' : 'bg-transparent text-[#a39e98]'"
            @click.stop="toggle(group.id)"
          >
            <ChevronRight class="h-3.5 w-3.5 transition-transform" :class="expanded[String(group.id)] ? 'rotate-90' : ''" />
          </button>
          <span v-else class="block h-5 w-5"></span>
          <FolderTree class="h-4 w-4 shrink-0" />
          <span class="truncate text-[13px] font-medium">{{ group.name }}</span>
        </span>

        <span
          v-if="group.snippet_count"
          class="shrink-0 rounded-full px-2 py-1 text-[10px]"
          :class="isActive(group.id) || isDropTarget(group.id) ? 'bg-[rgba(0,0,0,0.05)] text-[#615d59]' : 'bg-transparent text-[#a39e98]'"
        >
          {{ group.snippet_count }}
        </span>
      </button>

      <OrganizeGroupTree
        v-if="group.children.length && expanded[String(group.id)]"
        :groups="group.children"
        :active-group-id="activeGroupId"
        :depth="depth + 1"
        @select="$emit('select', $event)"
        @move-snippet="$emit('moveSnippet', $event)"
      />
    </li>
  </ul>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { ChevronRight, FolderTree } from 'lucide-vue-next'
import { isSameId } from '@clients/shared'
import type { OrganizeGroupNode } from '@/components/organize/types'

defineOptions({ name: 'OrganizeGroupTree' })

const props = withDefaults(defineProps<{
  groups: OrganizeGroupNode[]
  activeGroupId: string | number
  depth?: number
}>(), {
  depth: 0,
})

const emit = defineEmits<{
  select: [groupId: string | number]
  moveSnippet: [payload: { snippetId: string | number, groupId: string | number }]
}>()

const expanded = reactive<Record<string, boolean>>({})
const dropTargetId = ref<string | number | null>(null)

watch(
  () => props.groups,
  (groups) => {
    for (const group of groups) {
      const key = String(group.id)
      if (expanded[key] === undefined) {
        expanded[key] = props.depth < 1
      }
    }
  },
  { immediate: true, deep: true },
)

const toggle = (groupId: string | number) => {
  const key = String(groupId)
  expanded[key] = !expanded[key]
}

const isActive = (groupId: string | number) => isSameId(props.activeGroupId, groupId)
const isDropTarget = (groupId: string | number) => dropTargetId.value != null && isSameId(dropTargetId.value, groupId)

const onDragOver = (event: DragEvent, groupId: string | number) => {
  if (!event.dataTransfer?.types.includes('text/plain')) {
    return
  }

  event.dataTransfer.dropEffect = 'move'
  dropTargetId.value = groupId
}

const onDragLeave = (groupId: string | number) => {
  if (dropTargetId.value != null && isSameId(dropTargetId.value, groupId)) {
    dropTargetId.value = null
  }
}

const onDrop = (event: DragEvent, groupId: string | number) => {
  dropTargetId.value = null
  const snippetId = event.dataTransfer?.getData('text/plain')

  if (!snippetId) {
    return
  }

  emit('moveSnippet', {
    snippetId,
    groupId,
  })
}
</script>
