<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps<{
  isAuthenticated: boolean
  userName?: string
  workspacePath: string
}>()

const emit = defineEmits<{
  (e: 'login'): void
  (e: 'register'): void
}>()

const router = useRouter()
const userInitial = computed(() => props.userName?.substring(0, 1).toUpperCase() || 'G')
</script>

<template>
  <nav class="top-nav">
    <div class="logo">
      <slot name="logo"></slot>
    </div>
    <div class="nav-actions">
      <template v-if="isAuthenticated">
        <button class="profile-pill" type="button" @click="router.push(workspacePath)">
          <div class="profile-avatar">{{ userInitial }}</div>
          <span class="profile-name">{{ userName }}</span>
        </button>
        <button type="button" class="nav-btn primary-nav-btn" @click="router.push(workspacePath)">进入工作台</button>
      </template>
      <template v-else>
        <button type="button" class="nav-btn ghost-nav-btn" @click="emit('login')">登录</button>
        <button type="button" class="nav-btn primary-nav-btn" @click="emit('register')">注册</button>
      </template>
    </div>
  </nav>
</template>

<style scoped>
.top-nav {
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.profile-pill {
  min-height: 40px;
  padding: 4px 12px 4px 4px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: white;
  border: 1px solid rgba(229, 231, 235, 1);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
  cursor: pointer;
  transition: all 0.2s ease;
}

.profile-pill:hover {
  background: #f9fafb;
}

.profile-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #ffd8b0 0%, #f8b4d9 100%);
  color: #5f2a4a;
  font-weight: 700;
  font-size: 14px;
}

.profile-name {
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #111827;
  font-weight: 600;
  font-size: 14px;
}

.nav-btn {
  height: 40px;
  padding: 0 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.ghost-nav-btn {
  background: transparent;
  color: #4b5563;
  border: none;
}

.ghost-nav-btn:hover {
  background: rgba(17, 24, 39, 0.05);
  color: #111827;
}

.primary-nav-btn {
  background: #111827;
  color: white;
  border: none;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.primary-nav-btn:hover {
  background: #1f2937;
  transform: translateY(-1px);
}
</style>
