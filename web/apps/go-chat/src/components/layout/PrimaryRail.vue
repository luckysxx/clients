<template>
  <aside class="primary-rail">
    <button
      v-for="item in railActions"
      :key="item.label"
      class="rail-button"
      :class="{ 'is-active': item.active }"
      type="button"
      :aria-label="item.label"
    >
      <component :is="item.icon" />
    </button>

    <div class="primary-rail__spacer"></div>

    <button class="rail-button rail-button--notice" type="button" aria-label="消息提醒">
      <MailIcon />
      <span class="notice-dot"></span>
    </button>
    <button class="rail-button" type="button" aria-label="设备">
      <PhoneIcon />
    </button>
    <div class="menu-container">
      <button class="rail-button" :class="{'is-active': isMenuOpen}" type="button" @click="toggleMenu" aria-label="菜单">
        <MenuIcon />
      </button>

      <div v-if="isMenuOpen" class="rail-menu-popup">
        <button class="menu-item" type="button">
          <GearIcon />
          <span>设置</span>
        </button>
        <button class="menu-item menu-item--danger" type="button" @click="handleLogout">
          <ExitIcon />
          <span>退出账号</span>
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { logoutAppSession } from '@clients/auth'
import { useAuthStore } from '@/stores/auth'
import { BubbleIcon, UserIcon, StarIcon, HashIcon, ShareIcon, GridIcon, MailIcon, PhoneIcon, MenuIcon, GearIcon, ExitIcon } from '@/utils/icons'

const railActions = [
  { label: '聊天', icon: BubbleIcon, active: true },
  { label: '联系人', icon: UserIcon },
  { label: '收藏', icon: StarIcon },
  { label: '频道', icon: HashIcon },
  { label: '传输', icon: ShareIcon },
  { label: '更多', icon: GridIcon },
]

const router = useRouter()
const authStore = useAuthStore()

const isMenuOpen = ref(false)

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const handleLogout = async () => {
  const accessToken = authStore.token
  authStore.suppressSsoAutoLogin()

  try {
    if (accessToken) {
      await logoutAppSession({
        accessToken,
        appCode: 'go-chat',
      })
    }
  } catch (error) {
    console.warn('go-chat logout request failed', error)
  } finally {
    authStore.logout()
  }

  router.push('/')
}

const handleClickOutside = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  if (!target.closest('.menu-container')) {
    isMenuOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.menu-container {
  position: relative;
}

.rail-menu-popup {
  position: absolute;
  bottom: 0;
  left: calc(100% + 8px);
  width: 160px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
  border: 1px solid #eef0f4;
  padding: 8px 0;
  display: flex;
  flex-direction: column;
  z-index: 100;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 10px 16px;
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 14px;
  color: #1f2937;
  text-align: left;
  transition: background 0.2s;
}

.menu-item:hover {
  background: #f3f4f6;
}

.menu-item svg {
  width: 18px;
  height: 18px;
  color: #6b7280;
}

.menu-item--danger {
  color: #dc2626;
}

.menu-item--danger svg {
  color: #dc2626;
}
</style>
