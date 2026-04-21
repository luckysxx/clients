<template>
  <div v-if="variant === 'list'" class="flex flex-col gap-1 pt-2">
    <div
      v-for="i in lines"
      :key="i"
      class="animate-pulse flex items-center justify-between rounded px-2 py-3"
    >
      <div class="flex items-center gap-3 w-full">
        <div class="h-5 w-5 rounded bg-[rgba(0,0,0,0.05)]"></div>
        <div class="h-4 w-1/3 rounded bg-[rgba(0,0,0,0.05)]"></div>
      </div>
    </div>
  </div>

  <section v-else class="animate-pulse">
    <div class="h-10 w-2/3 rounded-[8px] bg-[rgba(0,0,0,0.05)]"></div>
    <div class="mt-6 flex gap-4">
      <div class="h-4 w-24 rounded-full bg-[rgba(0,0,0,0.04)]"></div>
      <div class="h-4 w-24 rounded-full bg-[rgba(0,0,0,0.04)]"></div>
    </div>
    <div class="mt-12 space-y-4">
      <div
        v-for="i in lines"
        :key="i"
        class="h-4 rounded-full bg-[rgba(0,0,0,0.04)]"
        :style="{ width: `${95 - i * 5}%` }"
      ></div>
    </div>
  </section>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  lines?: number
  variant?: 'list' | 'article'
}>(), {
  lines: 6,
  variant: 'list',
})
</script>
