<template>
  <component
    :is="tag"
    v-bind="linkProps"
    :class="[
      'flex items-center justify-between gap-4 overflow-hidden rounded-[12px] border border-[rgba(0,0,0,0.1)] border-l-[3px] border-l-[#dd5b00] bg-[#f6f5f4] px-4 py-3 text-[13px]',
      to ? 'transition-colors hover:bg-[rgba(0,0,0,0.04)]' : '',
    ]"
  >
    <div class="flex items-center gap-2 text-[#615d59]">
      <FileEdit class="h-4 w-4 text-[#dd5b00]" />
      <span class="font-[500]"><slot>{{ message }}</slot></span>
    </div>
    <div v-if="$slots.actions || trailing" class="flex items-center gap-4">
      <slot name="actions">
        <span class="text-[12px] font-[500] text-[#615d59]">{{ trailing }}</span>
      </slot>
    </div>
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { FileEdit } from 'lucide-vue-next'
import { RouterLink, type RouteLocationRaw } from 'vue-router'

const props = defineProps<{
  message?: string
  trailing?: string
  to?: RouteLocationRaw
}>()

const tag = computed(() => (props.to ? RouterLink : 'div'))
const linkProps = computed(() => (props.to ? { to: props.to } : {}))
</script>
