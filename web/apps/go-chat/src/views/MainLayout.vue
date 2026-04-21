<template>
  <div class="chat-page" :style="{ '--panel-width': panelWidth + 'px', '--composer-height': composerHeight + 'px' }">
    <TitleBar />

    <div class="chat-shell">
      <PrimaryRail />
      <ConversationPanel @drag-start="startDragPanel" />
      <router-view @composer-drag-start="startDragComposer"></router-view>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import TitleBar from '@/components/layout/TitleBar.vue'
import PrimaryRail from '@/components/layout/PrimaryRail.vue'
import ConversationPanel from '@/components/chat/ConversationPanel.vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

onMounted(() => {
  authStore.loadProfile().catch(console.error)
})

const panelWidth = ref(Number(localStorage.getItem('goChat:panelWidth')) || 300)
const composerHeight = ref(Number(localStorage.getItem('goChat:composerHeight')) || 220)

let isDraggingPanel = false
let isDraggingComposer = false
let startX = 0
let startY = 0
let startWidth = 0
let startHeight = 0

const startDragPanel = (e: MouseEvent) => {
  isDraggingPanel = true
  startX = e.clientX
  startWidth = panelWidth.value
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
  document.body.style.cursor = 'col-resize'
}

const startDragComposer = (e: MouseEvent) => {
  isDraggingComposer = true
  startY = e.clientY
  startHeight = composerHeight.value
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
  document.body.style.cursor = 'row-resize'
}

const onDrag = (e: MouseEvent) => {
  if (isDraggingPanel) {
    const delta = e.clientX - startX
    panelWidth.value = Math.max(200, Math.min(600, startWidth + delta))
  } else if (isDraggingComposer) {
    const delta = startY - e.clientY
    composerHeight.value = Math.max(120, Math.min(500, startHeight + delta))
  }
}

const stopDrag = () => {
  isDraggingPanel = false
  isDraggingComposer = false
  
  localStorage.setItem('goChat:panelWidth', String(panelWidth.value))
  localStorage.setItem('goChat:composerHeight', String(composerHeight.value))

  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
  document.body.style.cursor = ''
}
</script>
