<template>
  <div class="flex items-center justify-between border-b border-[rgba(0,0,0,0.1)] pb-2 mb-2">
    <div class="text-[13px] font-[600] text-[#a39e98]">
      <slot name="title">{{ title }}</slot>
    </div>
    <div v-if="$slots.actions" class="flex items-center gap-2">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ title?: string }>()
</script>
