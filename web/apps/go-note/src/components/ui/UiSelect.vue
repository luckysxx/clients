<template>
  <SelectRoot :model-value="modelValue" @update:model-value="handleChange">
    <SelectTrigger class="ui-select-trigger" :aria-label="placeholder">
      <SelectValue :placeholder="placeholder" />
      <SelectIcon>
        <ChevronsUpDown class="h-4 w-4 text-[#a39e98]" />
      </SelectIcon>
    </SelectTrigger>

    <SelectPortal>
      <SelectContent position="popper" :side-offset="8" class="ui-select-content">
        <SelectViewport class="p-1">
          <SelectItem
            v-for="option in options"
            :key="option.value"
            class="ui-select-item"
            :value="option.value"
          >
            <SelectItemText>{{ option.label }}</SelectItemText>
            <SelectItemIndicator class="absolute right-2 inline-flex items-center">
              <Check class="h-4 w-4" />
            </SelectItemIndicator>
          </SelectItem>
        </SelectViewport>
      </SelectContent>
    </SelectPortal>
  </SelectRoot>
</template>

<script setup lang="ts">
import {
  SelectContent,
  SelectIcon,
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
  SelectPortal,
  SelectRoot,
  SelectTrigger,
  SelectValue,
  SelectViewport,
} from 'radix-vue'
import { Check, ChevronsUpDown } from 'lucide-vue-next'

defineProps<{
  modelValue: string
  placeholder?: string
  options: Array<{ label: string; value: string }>
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const handleChange = (value: string | undefined) => {
  if (value) {
    emit('update:modelValue', value)
  }
}
</script>
