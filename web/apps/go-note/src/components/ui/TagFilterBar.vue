<template>
  <div class="flex flex-wrap gap-2 items-center">
    <span class="inline-flex items-center gap-1 text-[12px] font-[600] text-[#a39e98] mr-1">
      <Filter class="h-3.5 w-3.5" />
      {{ label }}
    </span>
    <button
      v-for="tag in tags"
      :key="tag.id"
      type="button"
      class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-[600] transition-colors border"
      :class="isSelected(tag.id)
        ? 'border-transparent bg-[#f2f9ff] text-[#097fe8]'
        : 'border-[rgba(0,0,0,0.1)] bg-white text-[#615d59] hover:bg-[rgba(0,0,0,0.02)]'"
      @click="toggle(tag.id)"
    >
      <span class="h-1.5 w-1.5 rounded-full" :style="{ backgroundColor: tag.color }"></span>
      <span>{{ tag.name }}</span>
    </button>
    <button
      v-if="modelValue.length"
      type="button"
      class="inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-[600] text-[#a39e98] hover:bg-[rgba(0,0,0,0.05)] transition-colors"
      @click="emit('clear')"
    >
      {{ clearLabel }}
    </button>
    <span v-if="tags.length === 0" class="text-[12px] text-[#a39e98]">{{ emptyText }}</span>
  </div>
</template>

<script setup lang="ts" generic="T extends { id: string | number; name: string; color: string }">
import { Filter } from 'lucide-vue-next'
import { isSameId } from '@clients/shared'

const props = withDefaults(defineProps<{
  tags: T[]
  modelValue: (string | number)[]
  label?: string
  clearLabel?: string
  emptyText?: string
}>(), {
  label: '过滤',
  clearLabel: '清除过滤',
  emptyText: '暂无标签',
})

const emit = defineEmits<{
  'update:modelValue': [value: (string | number)[]]
  clear: []
}>()

const isSelected = (id: string | number) =>
  props.modelValue.some((v) => isSameId(v, id))

const toggle = (id: string | number) => {
  const next = isSelected(id)
    ? props.modelValue.filter((v) => !isSameId(v, id))
    : [...props.modelValue, String(id)]
  emit('update:modelValue', next)
}
</script>
