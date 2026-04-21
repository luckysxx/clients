<template>
  <span :class="['inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold tracking-[0.125px] shrink-0', toneClass]">
    <slot />
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type Tone = 'draft' | 'pending' | 'latest' | 'info' | 'neutral'

const props = withDefaults(defineProps<{ tone?: Tone }>(), { tone: 'neutral' })

const toneClass = computed(() => {
  switch (props.tone) {
    case 'draft': return 'bg-[#fff1e6] text-[#dd5b00]'
    case 'pending': return 'bg-[#f2f9ff] text-[#097fe8]'
    case 'latest': return 'bg-[#e8f5f2] text-[#2a9d99]'
    case 'info': return 'bg-[#f2f9ff] text-[#097fe8]'
    default: return 'bg-[#f6f5f4] text-[#615d59] border border-[rgba(0,0,0,0.1)]'
  }
})
</script>
