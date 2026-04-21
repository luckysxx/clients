<template>
  <section class="conversation-panel">
    <div class="resizer-x" @mousedown.prevent="startDragPanel"></div>
    <div class="search-row">
      <label class="search-box">
        <SearchIcon />
        <input v-model="keyword" type="text" placeholder="搜索">
      </label>
      <button class="round-button" type="button" aria-label="新建会话">
        <PlusIcon />
      </button>
    </div>

    <div class="conversation-list">
      <router-link
        v-for="item in mockConversations"
        :key="item.id"
        :to="`/app/chat/${item.id}`"
        class="conversation-item"
        active-class="is-active"
      >
        <img class="conversation-item__avatar" :src="item.avatar" :alt="item.name">
        <div class="conversation-item__content">
          <div class="conversation-item__head">
            <strong>{{ item.name }}</strong>
            <span>{{ item.time }}</span>
          </div>
          <p>{{ item.preview }}</p>
        </div>
      </router-link>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { SearchIcon, PlusIcon } from '@/utils/icons'
import { mockConversations } from '@/utils/mock'

const keyword = ref('')

const emit = defineEmits<{
  (e: 'drag-start', event: MouseEvent): void
}>()

const startDragPanel = (e: MouseEvent) => {
  emit('drag-start', e)
}
</script>

<style scoped>
/* Ensure router-link doesn't mess up styles */
.conversation-item {
  color: inherit;
  text-decoration: none;
  display: flex;
}
</style>
