<template>
  <div class="app-shell">
    <div v-if="showWorkspaceShell" class="workspace-shell">
      <aside class="workspace-sidebar">
        <div class="sidebar-top">
          <button class="sidebar-menu" type="button" @click="handlePlaceholderAction('工作区导航')">
            <el-icon><Operation /></el-icon>
          </button>
          <button class="brand" type="button" @click="router.push('/')">
            <span class="brand-mark">
              <span class="brand-mark__leaf"></span>
            </span>
            <span class="brand-text">GoNote 文档</span>
          </button>
        </div>

        <div class="sidebar-search">
          <el-input
            v-model="workspaceKeyword"
            placeholder="搜索文档"
            clearable
            @input="handleWorkspaceSearch"
            @clear="handleWorkspaceSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>

        <nav class="sidebar-nav">
          <button
            v-for="item in primaryNav"
            :key="item.label"
            type="button"
            class="nav-item"
            :class="{ 'is-active': isRouteActive(item.path) }"
            @click="router.push(item.path)"
          >
            <el-icon><component :is="item.icon" /></el-icon>
            <span>{{ item.label }}</span>
          </button>
        </nav>

        <section class="sidebar-group">
          <p class="group-title">置顶文档</p>
          <button
            v-for="doc in pinnedDocs"
            :key="doc.title"
            type="button"
            class="doc-shortcut"
            @click="handlePlaceholderAction(doc.title)"
          >
            <el-icon><Document /></el-icon>
            <span>{{ doc.title }}</span>
          </button>
        </section>

        <section class="sidebar-group">
          <div class="group-header">
            <p class="group-title">我的文档库</p>
            <button type="button" class="icon-button subtle" @click="router.push('/snippets/new')">
              <el-icon><Plus /></el-icon>
            </button>
          </div>
          <button type="button" class="doc-creator" @click="router.push('/snippets/new')">
            <el-icon><EditPen /></el-icon>
            <span>新建文档</span>
          </button>
        </section>

        <div class="sidebar-footer">
          <button type="button" class="footer-tool" @click="router.push('/about')">
            <el-icon><InfoFilled /></el-icon>
            <span>关于</span>
          </button>
          <button
            v-if="isAuthenticated"
            type="button"
            class="footer-tool"
            @click="handleLogout"
          >
            <el-icon><SwitchButton /></el-icon>
            <span>退出</span>
          </button>
          <button v-else type="button" class="footer-tool" @click="router.push('/auth')">
            <el-icon><UserFilled /></el-icon>
            <span>登录</span>
          </button>
        </div>
      </aside>

      <section class="workspace-main">
        <header class="workspace-topbar">
          <div class="topbar-title">
            <h1>{{ pageTitle }}</h1>
            <p>{{ pageSubtitle }}</p>
          </div>

          <div class="topbar-actions">
            <button
              v-for="action in topbarActions"
              :key="action.label"
              type="button"
              class="icon-button"
              :aria-label="action.label"
              @click="action.action"
            >
              <el-icon><component :is="action.icon" /></el-icon>
            </button>

            <button
              class="profile-pill"
              type="button"
              @click="isAuthenticated ? handlePlaceholderAction('个人中心') : router.push('/auth')"
            >
              <el-avatar :size="40" class="profile-avatar">
                {{ userInitial }}
              </el-avatar>
              <span class="profile-name">{{ authStore.user?.username || '游客' }}</span>
              <el-icon class="profile-arrow"><ArrowDown /></el-icon>
            </button>
          </div>
        </header>

        <main class="workspace-content">
          <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </main>
      </section>
    </div>

    <main v-else class="auth-shell">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  ArrowDown,
  Document,
  EditPen,
  Grid,
  House,
  InfoFilled,
  Operation,
  Plus,
  Reading,
  Search,
  Share,
  SwitchButton,
  UserFilled,
  Bell,
  FolderOpened,
} from '@element-plus/icons-vue'
import { logout } from '@/api/user'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const workspaceKeyword = ref('')

const isAuthenticated = computed(() => authStore.isAuthenticated)
const showWorkspaceShell = computed(() => !['auth', 'sso-callback'].includes(String(route.name ?? '')))
const userInitial = computed(() => authStore.user?.username?.slice(0, 1).toUpperCase() || 'G')

const primaryNav = [
  { label: '主页', path: '/', icon: House },
  {
    label: '云盘',
    path: '/snippets/new',
    icon: FolderOpened,
  },
  {
    label: '知识库',
    path: '/about',
    icon: Reading,
  },
]

const pinnedDocs = [
  { title: '@ GoNote 管理员，你的快速上手指南' },
  { title: '开发约定与分享规范' },
]

const topbarActions = [
  { label: '搜索', icon: Search, action: () => handlePlaceholderAction('全局搜索') },
  { label: '分享', icon: Share, action: () => handlePlaceholderAction('分享工作区') },
  { label: '消息', icon: Bell, action: () => handlePlaceholderAction('消息中心') },
  { label: '应用', icon: Grid, action: () => handlePlaceholderAction('应用中心') },
]

const pageTitle = computed(() => {
  switch (route.name) {
    case 'snippet-new':
      return '新建文档'
    case 'snippet-edit':
      return '编辑文档'
    case 'snippet-detail':
      return '文档详情'
    case 'about':
      return '关于'
    default:
      return '主页'
  }
})

const pageSubtitle = computed(() => {
  switch (route.name) {
    case 'snippet-new':
      return '创建新的代码文档并保存到你的工作区。'
    case 'snippet-edit':
      return '继续完善已有文档内容。'
    case 'snippet-detail':
      return '查看文档内容、语言和更新时间。'
    case 'about':
      return '查看 GoNote 的产品定位和技术栈。'
    default:
      return '整理代码片段、快速打开最近内容。'
  }
})

const syncWorkspaceKeyword = () => {
  workspaceKeyword.value = typeof route.query.q === 'string' ? route.query.q : ''
}

const handleWorkspaceSearch = () => {
  const q = workspaceKeyword.value.trim()
  router.replace({
    path: '/',
    query: q ? { q } : {},
  })
}

const isRouteActive = (path: string) => {
  if (path === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(path)
}

const handlePlaceholderAction = (label: string) => {
  ElMessage.info(`${label} 功能正在接入`)
}

const handleLogout = async () => {
  const accessToken = authStore.token

  try {
    if (accessToken) {
      await logout(accessToken)
    }
  } catch (error) {
    ElMessage.warning(error instanceof Error ? error.message : '退出接口调用失败，已清理本地登录态')
  } finally {
    authStore.logout()
    ElMessage.success('已退出登录')
    router.push('/auth')
  }
}

watch(
  () => route.fullPath,
  () => {
    syncWorkspaceKeyword()
  },
  { immediate: true },
)

onMounted(() => {
  authStore.initFromStorage()
})
</script>

<style lang="scss">
:root {
  --app-bg: #f7f8fb;
  --surface: #ffffff;
  --surface-muted: #f3f5fa;
  --surface-hover: #eef2ff;
  --line: #e7ebf3;
  --line-strong: #d7dfec;
  --text-main: #1d2129;
  --text-secondary: #667085;
  --text-tertiary: #98a2b3;
  --brand: #3662ec;
  --brand-soft: #dfe7ff;
  --brand-deep: #1d4ed8;
  --orange-soft: #fff1e6;
  --orange-main: #ff7d00;
  --yellow-soft: #fff7da;
  --yellow-main: #e6a400;
  --shadow-shell: 0 20px 60px rgba(15, 23, 42, 0.08);
  --shadow-card: 0 8px 30px rgba(31, 41, 55, 0.06);
  --radius-card: 18px;
  --radius-pill: 999px;
}

* {
  box-sizing: border-box;
}

html,
body,
#app {
  min-height: 100vh;
}

body {
  margin: 0;
  background:
    radial-gradient(circle at top left, rgba(54, 98, 236, 0.08), transparent 24%),
    linear-gradient(180deg, #fbfcff 0%, #f5f7fb 100%);
  color: var(--text-main);
  font-family:
    'SF Pro Display',
    'PingFang SC',
    'Hiragino Sans GB',
    'Microsoft YaHei',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

button,
input,
textarea,
select {
  font: inherit;
}

.app-shell {
  min-height: 100vh;
}

.workspace-shell {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 296px minmax(0, 1fr);
}

.workspace-sidebar {
  padding: 18px 14px 14px;
  border-right: 1px solid rgba(215, 223, 236, 0.85);
  background: rgba(255, 255, 255, 0.74);
  backdrop-filter: blur(20px);
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.sidebar-top {
  display: flex;
  align-items: center;
  gap: 12px;
}

.sidebar-menu,
.brand,
.nav-item,
.doc-shortcut,
.doc-creator,
.footer-tool,
.icon-button,
.profile-pill {
  border: 0;
  background: transparent;
  cursor: pointer;
}

.sidebar-menu {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  transition: background-color 0.2s ease;
}

.sidebar-menu:hover,
.icon-button:hover,
.footer-tool:hover {
  background: var(--surface-muted);
}

.brand {
  padding: 0;
  display: inline-flex;
  align-items: center;
  gap: 12px;
  color: var(--text-main);
}

.brand-mark {
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: linear-gradient(135deg, #4f7cff 0%, #3b82f6 52%, #14b8a6 100%);
  position: relative;
  box-shadow: 0 10px 24px rgba(54, 98, 236, 0.24);
}

.brand-mark__leaf {
  width: 14px;
  height: 14px;
  border-radius: 4px 10px 4px 10px;
  background: rgba(255, 255, 255, 0.92);
  transform: rotate(28deg);
}

.brand-text {
  font-size: 21px;
  font-weight: 700;
  letter-spacing: 0.01em;
}

.sidebar-search :deep(.el-input__wrapper) {
  min-height: 44px;
  border-radius: 14px;
  background: var(--surface);
  box-shadow: inset 0 0 0 1px rgba(231, 235, 243, 0.9);
}

.sidebar-nav,
.sidebar-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nav-item,
.doc-shortcut,
.doc-creator,
.footer-tool {
  min-height: 46px;
  padding: 0 14px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--text-secondary);
  transition:
    background-color 0.18s ease,
    color 0.18s ease,
    transform 0.18s ease;
}

.nav-item:hover,
.doc-shortcut:hover,
.doc-creator:hover {
  background: var(--surface-muted);
  color: var(--text-main);
  transform: translateX(2px);
}

.nav-item.is-active {
  background: linear-gradient(180deg, #dfe8ff 0%, #d8e3ff 100%);
  color: var(--brand);
  font-weight: 700;
}

.group-title {
  margin: 0;
  padding: 6px 10px 2px;
  color: var(--text-tertiary);
  font-size: 13px;
  font-weight: 600;
}

.group-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.doc-shortcut {
  align-items: flex-start;
  padding-top: 12px;
  padding-bottom: 12px;
  min-height: auto;
  line-height: 1.45;
  text-align: left;
}

.doc-creator {
  background: var(--surface);
  box-shadow: inset 0 0 0 1px rgba(231, 235, 243, 0.95);
  color: var(--text-main);
}

.sidebar-footer {
  margin-top: auto;
  padding-top: 14px;
  border-top: 1px solid var(--line);
  display: flex;
  gap: 10px;
}

.footer-tool {
  flex: 1;
  justify-content: center;
  background: var(--surface);
  box-shadow: inset 0 0 0 1px rgba(231, 235, 243, 0.95);
}

.workspace-main {
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.workspace-topbar {
  min-height: 84px;
  padding: 22px 28px 12px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
}

.topbar-title h1 {
  margin: 0;
  font-size: 26px;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.topbar-title p {
  margin: 6px 0 0;
  color: var(--text-secondary);
  font-size: 14px;
}

.topbar-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.icon-button {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  transition: background-color 0.18s ease;
}

.icon-button.subtle {
  width: 34px;
  height: 34px;
  border-radius: 10px;
}

.profile-pill {
  min-height: 44px;
  padding: 4px 8px 4px 4px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: var(--surface);
  box-shadow:
    0 10px 24px rgba(15, 23, 42, 0.05),
    inset 0 0 0 1px rgba(231, 235, 243, 0.95);
}

.profile-avatar {
  background: linear-gradient(135deg, #ffd8b0 0%, #f8b4d9 100%);
  color: #5f2a4a;
  font-weight: 700;
}

.profile-name {
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--text-main);
  font-weight: 600;
}

.profile-arrow {
  color: var(--text-tertiary);
}

.workspace-content {
  flex: 1;
  min-height: 0;
  padding: 0 28px 28px;
}

.auth-shell {
  min-height: 100vh;
  width: 100%;
}

.auth-shell > * {
  width: 100%;
}

.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.24s ease,
    transform 0.24s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

@media (max-width: 1100px) {
  .workspace-shell {
    grid-template-columns: 1fr;
  }

  .workspace-sidebar {
    border-right: 0;
    border-bottom: 1px solid rgba(215, 223, 236, 0.85);
  }

  .sidebar-footer {
    margin-top: 0;
  }
}

@media (max-width: 720px) {
  .workspace-topbar {
    padding: 18px 18px 10px;
    flex-direction: column;
    align-items: stretch;
  }

  .workspace-content {
    padding: 0 18px 18px;
  }

  .topbar-actions {
    flex-wrap: wrap;
  }

  .profile-pill {
    width: 100%;
    justify-content: flex-start;
  }

  .sidebar-footer {
    flex-direction: column;
  }
}
</style>
