<template>
  <div class="relative flex h-full flex-col overflow-hidden bg-[#f6f5f4]">
    <div class="flex items-center justify-between border-b border-[rgba(0,0,0,0.1)] px-6 py-4">
      <div>
        <h2 class="text-[14px] font-[600] text-[rgba(0,0,0,0.95)]">极客表格</h2>
        <p class="mt-1 text-[12px] text-[#615d59]">高密度整理视图，适合批量选择、批量移动和清仓。</p>
      </div>
      <div class="flex items-center gap-2 text-[12px] text-[#615d59]">
        <span class="ui-chip-muted">共 {{ snippets.length }} 篇</span>
        <span v-if="selectedIds.length" class="ui-chip">已勾选 {{ selectedIds.length }} 篇</span>
      </div>
    </div>

    <div class="app-scrollbar min-h-0 flex-1 overflow-auto">
      <table class="min-w-full border-separate border-spacing-0 text-left text-[13px] text-[rgba(0,0,0,0.95)]">
        <thead class="sticky top-0 z-10 bg-[#f6f5f4]/95 backdrop-blur-sm">
          <tr>
            <th class="w-14 border-b border-[rgba(0,0,0,0.1)] px-5 py-4">
              <input
                ref="masterCheckbox"
                type="checkbox"
                class="h-4 w-4 rounded border-[#dddddd] text-[#0075de] focus:ring-[#097fe8]"
                :checked="allSelected"
                @change="toggleAllVisible"
              />
            </th>
            <th class="border-b border-[rgba(0,0,0,0.1)] px-4 py-4 font-[500] text-[#615d59]">文档标题</th>
            <th class="border-b border-[rgba(0,0,0,0.1)] px-4 py-4 font-[500] text-[#615d59]">当前分组</th>
            <th class="border-b border-[rgba(0,0,0,0.1)] px-4 py-4 font-[500] text-[#615d59]">标签</th>
            <th class="border-b border-[rgba(0,0,0,0.1)] px-4 py-4 font-[500] text-[#615d59]">更新时间</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="snippet in snippets"
            :key="snippet.id"
            class="transition-colors hover:bg-[rgba(0,0,0,0.02)]"
            :class="isSelected(snippet.id) ? 'bg-[rgba(0,117,222,0.04)]' : ''"
          >
            <td class="border-b border-[rgba(0,0,0,0.08)] px-5 py-3 align-top">
              <input
                type="checkbox"
                class="mt-1 h-4 w-4 rounded border-[#dddddd] text-[#0075de] focus:ring-[#097fe8]"
                :checked="isSelected(snippet.id)"
                @change="toggleOne(snippet.id)"
              />
            </td>
            <td class="max-w-[420px] border-b border-[rgba(0,0,0,0.08)] px-4 py-3">
              <div class="min-w-0">
                <p class="truncate text-[14px] font-[500] text-[rgba(0,0,0,0.95)]">{{ snippet.title || '未命名文档' }}</p>
                <p class="mt-1 line-clamp-2 text-[12px] leading-5 text-[#615d59]">{{ snippet.content || '暂无内容摘要' }}</p>
              </div>
            </td>
            <td class="border-b border-[rgba(0,0,0,0.08)] px-4 py-3">
              <span class="ui-chip-muted">
                <span class="h-2 w-2 rounded-full bg-[#a39e98]"></span>
                {{ resolveGroupName(snippet.group_id) }}
              </span>
            </td>
            <td class="border-b border-[rgba(0,0,0,0.08)] px-4 py-3">
              <div class="flex max-w-[280px] flex-wrap gap-1.5">
                <span
                  v-for="tag in resolveTags(snippet.tag_ids)"
                  :key="tag.id"
                  class="inline-flex items-center gap-1 rounded-full border border-[rgba(0,0,0,0.1)] bg-[#f6f5f4] px-2 py-1 text-[11px] text-[#615d59]"
                >
                  <span class="h-1.5 w-1.5 rounded-full" :style="{ backgroundColor: tag.color }"></span>
                  {{ tag.name }}
                </span>
                <span v-if="!resolveTags(snippet.tag_ids).length" class="text-[12px] text-[#a39e98]">-</span>
              </div>
            </td>
            <td class="border-b border-[rgba(0,0,0,0.08)] px-4 py-3 text-[12px] text-[#a39e98]">
              {{ formatDate(snippet.updated_at) }}
            </td>
          </tr>

          <tr v-if="!snippets.length">
            <td colspan="5" class="px-6 py-16 text-center text-sm text-[#a39e98]">这里空空如也</td>
          </tr>
        </tbody>
      </table>
    </div>

    <Transition name="organize-bar">
      <div
        v-if="selectedIds.length"
        class="fixed bottom-8 left-1/2 z-[110] flex -translate-x-1/2 items-center gap-3 rounded-full border border-[rgba(0,0,0,0.1)] bg-[rgba(18,18,20,0.94)] px-4 py-3 text-white shadow-deep backdrop-blur-xl"
      >
        <span class="px-2 text-[13px] font-[500]">已选择 {{ selectedIds.length }} 篇</span>
        <div class="h-5 w-px bg-white/12"></div>

        <select
          v-model="targetGroupId"
          class="h-9 rounded-full border border-white/12 bg-white/10 px-3 text-[12px] text-white outline-none"
        >
          <option :value="0" class="text-black">Inbox / 收件箱</option>
          <option
            v-for="group in flatGroups"
            :key="group.id"
            :value="group.id"
            class="text-black"
          >
            {{ indentLabel(group) }}
          </option>
        </select>

        <button type="button" class="rounded-full bg-white px-4 py-2 text-[12px] font-[600] text-[rgba(0,0,0,0.95)] transition-colors hover:bg-[#f6f5f4]" @click="moveSelected">
          批量移动
        </button>
        <button type="button" class="rounded-full border border-white/10 px-4 py-2 text-[12px] font-[500] text-white/80 transition-colors hover:bg-white/10 hover:text-white" @click="$emit('clearSelection')">
          清空选择
        </button>
        <button type="button" class="rounded-full border border-[#dd5b00]/20 bg-[#dd5b00]/10 px-4 py-2 text-[12px] font-[500] text-[#dd5b00] transition-colors hover:bg-[#dd5b00]/20" @click="deleteSelected">
          批量删除
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, useTemplateRef, watch } from 'vue'
import { isSameId } from '@clients/shared'
import type { Snippet } from '@/api/snippet'
import { confirm } from '@/composables/useConfirmDialog'
import type { OrganizeGroupOption, OrganizeTagMapItem } from '@/components/organize/types'

const props = defineProps<{
  snippets: Snippet[]
  flatGroups: OrganizeGroupOption[]
  tagMap: Map<string, OrganizeTagMapItem>
  selectedIds: Array<string | number>
}>()

const emit = defineEmits<{
  moveSelected: [payload: { ids: Array<string | number>, groupId: string | number }]
  deleteSelected: [ids: Array<string | number>]
  setSelection: [ids: Array<string | number>]
  clearSelection: []
}>()

const targetGroupId = ref<string | number>(0)
const masterCheckbox = useTemplateRef<HTMLInputElement>('masterCheckbox')
const isSelected = (id: string | number) => props.selectedIds.some((selectedId) => isSameId(selectedId, id))

const allSelected = computed(() => props.snippets.length > 0 && props.snippets.every((snippet) => isSelected(snippet.id)))
const someSelected = computed(() => props.snippets.some((snippet) => isSelected(snippet.id)))

watch(
  [allSelected, someSelected],
  () => {
    if (masterCheckbox.value) {
      masterCheckbox.value.indeterminate = !allSelected.value && someSelected.value
    }
  },
  { immediate: true },
)

const toggleOne = (id: string | number) => {
  if (isSelected(id)) {
    emit('setSelection', props.selectedIds.filter((selectedId) => !isSameId(selectedId, id)))
    return
  }

  emit('setSelection', [...props.selectedIds, id])
}

const toggleAllVisible = () => {
  if (allSelected.value) {
    emit('setSelection', props.selectedIds.filter((selectedId) => !props.snippets.some((snippet) => isSameId(snippet.id, selectedId))))
    return
  }

  const merged = [...props.selectedIds]
  for (const snippet of props.snippets) {
    if (!merged.some((id) => isSameId(id, snippet.id))) {
      merged.push(snippet.id)
    }
  }
  emit('setSelection', merged)
}

const resolveGroupName = (groupId?: string | number) => {
  if (groupId == null || isSameId(groupId, 0)) {
    return 'Inbox / 收件箱'
  }

  return props.flatGroups.find((group) => isSameId(group.id, groupId))?.name ?? '未知分组'
}

const resolveTags = (ids?: Array<string | number>) => {
  if (!ids?.length) {
    return []
  }

  return ids
    .map((id) => props.tagMap.get(String(id)))
    .filter((tag): tag is OrganizeTagMapItem => Boolean(tag))
}

const moveSelected = () => {
  emit('moveSelected', {
    ids: props.selectedIds,
    groupId: targetGroupId.value,
  })
}

const deleteSelected = async () => {
  const accepted = await confirm({
    title: '批量删除',
    description: `确定要删除选中的 ${props.selectedIds.length} 篇文档吗？此操作不可逆。`,
    confirmText: '删除',
    cancelText: '取消',
    tone: 'danger',
  })

  if (!accepted) {
    return
  }

  emit('deleteSelected', props.selectedIds)
}

const indentLabel = (group: OrganizeGroupOption) => `${'　'.repeat(group.depth)}${group.name}`

const formatDate = (value: string) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}
</script>

<style scoped>
.organize-bar-enter-active,
.organize-bar-leave-active {
  transition: opacity 0.24s ease, transform 0.24s ease;
}

.organize-bar-enter-from,
.organize-bar-leave-to {
  opacity: 0;
  transform: translate(-50%, 16px);
}
</style>
