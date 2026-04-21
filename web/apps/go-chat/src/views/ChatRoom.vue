<template>
  <MessageStage
    :conversation-name="conversation?.name ?? 'Unknown'"
    :messages="currentMessages"
    :is-system-notice="isSystemNotice"
    @drag-start="$emit('composer-drag-start', $event)"
  />
  <InfoPanel
    :members="currentMembers"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import MessageStage from '@/components/chat/MessageStage.vue'
import InfoPanel from '@/components/chat/InfoPanel.vue'
import { mockConversations, mockMessages, mockMembers } from '@/utils/mock'

const route = useRoute()

defineEmits<{
  (e: 'composer-drag-start', event: MouseEvent): void
}>()

const chatId = computed(() => route.params.id as string)

const conversation = computed(() => {
  return mockConversations.find(c => c.id === chatId.value)
})

const currentMessages = computed(() => {
  return mockMessages[chatId.value] || []
})

const currentMembers = computed(() => {
  return mockMembers[chatId.value] || []
})

const isSystemNotice = computed(() => {
  return chatId.value === '1' // Example logic for mock simulation
})
</script>
