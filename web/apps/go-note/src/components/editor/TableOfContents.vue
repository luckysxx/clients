<template>
  <div class="table-of-contents sticky top-20 hidden lg:block w-48 shrink-0 text-xs">
    <p class="font-[600] text-[#a39e98] mb-3 uppercase tracking-wider">大纲结构</p>
    <ul class="space-y-2 border-l-2 border-[rgba(0,0,0,0.08)] pl-3">
      <li v-for="(h, index) in headings" :key="index" :class="{ 'pl-3': h.level === 2, 'pl-6': h.level === 3 }">
        <button class="text-[#615d59] hover:text-[rgba(0,0,0,0.95)] line-clamp-1 text-left transition-colors" @click="scrollToHeading(index)">
          {{ h.text }}
        </button>
      </li>
      <li v-if="headings.length === 0" class="text-[#a39e98] italic">暂无标题结构</li>
    </ul>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  headings: { level: number; text: string }[]
}>()

const scrollToHeading = (index: number) => {
  // Simple heuristic: find all headings in the milkdown editor and scroll to the Nth one
  const elms = document.querySelectorAll('.milkdown .ProseMirror h1, .milkdown .ProseMirror h2, .milkdown .ProseMirror h3')
  if (elms[index]) {
    elms[index].scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
}
</script>
