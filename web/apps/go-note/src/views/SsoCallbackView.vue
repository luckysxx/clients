<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { resolveAuthCallback } from '@clients/auth'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

onMounted(() => {
  const callback = resolveAuthCallback(route.query)

  if (!callback.ok || !callback.user) {
    // token 缺失，跳回登录
    router.replace('/auth')
    return
  }

  authStore.setAuth(callback.token, callback.refreshToken, callback.user)

  // 跳转到原始目标页面或首页
  router.replace(callback.redirect)
})
</script>

<template>
  <div class="callback-page">
    <p>正在登录，请稍候...</p>
  </div>
</template>

<style scoped>
.callback-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  color: var(--text-secondary, #666);
  font-size: 1.1rem;
}
</style>
