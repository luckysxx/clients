<template>
  <div class="title-bar">
    <div class="title-bar__avatar-wrap">
      <img class="title-bar__avatar" :src="workspaceAvatar" :alt="displayName" />
      <span class="status-dot"></span>
    </div>
    <span class="title-bar__name">{{ displayName }}</span>
    <span class="title-bar__status">{{ bio }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { makeAvatar } from '@/utils/mock'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const displayName = computed(() => {
  return authStore.profile?.nickname || authStore.user?.username || 'GUEST'
})

const bio = computed(() => {
  return authStore.profile?.bio || '生活原本沉闷，但跑起来就会有风'
})

const workspaceAvatar = computed(() => {
  if (authStore.profile?.avatar_url) {
    return authStore.profile.avatar_url
  }
  return makeAvatar(displayName.value.charAt(0).toUpperCase() || 'U', '#ff7eb6', '#5b8cff')
})
</script>
