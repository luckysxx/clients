<template>
  <div class="min-h-screen">
    <div v-if="showWorkspaceShell" class="flex min-h-screen bg-transparent">
      <aside
        class="app-scrollbar fixed inset-y-0 left-0 z-30 flex shrink-0 flex-col overflow-y-auto overflow-x-hidden whitespace-nowrap border-r border-[rgba(0,0,0,0.1)] bg-[#f6f5f4] px-3 py-3 text-[rgba(0,0,0,0.95)] transition-all duration-200 ease-in-out"
        :class="sidebarCollapsed ? 'w-16' : 'w-57.5'"
      >
        <div class="mb-5 flex" :class="sidebarCollapsed ? 'items-center justify-center' : 'items-center gap-2'">
          <button type="button" class="ui-icon-button" @click="sidebarCollapsed = !sidebarCollapsed">
            <PanelLeftClose v-if="!sidebarCollapsed" class="h-4 w-4" />
            <PanelLeftOpen v-else class="h-4 w-4" />
          </button>

          <button
            v-show="!sidebarCollapsed"
            type="button"
            class="flex min-w-0 flex-1 items-center gap-2 rounded px-2 py-1.5 text-left transition-colors duration-150 hover:bg-[rgba(0,0,0,0.05)]"
            @click="handleBrandClick"
          >
            <div class="flex shrink-0 h-6 w-6 items-center justify-center rounded text-[rgba(0,0,0,0.95)]">
              <NotebookPen class="h-5 w-5" />
            </div>
            <div class="min-w-0">
              <p class="truncate text-[14px] font-[600] text-[rgba(0,0,0,0.95)]">GoNote</p>
            </div>
          </button>
        </div>

        <div v-if="!sidebarCollapsed" class="mb-4 flex items-center gap-1.5">
          <button
            type="button"
            class="group relative flex h-8 flex-1 items-center gap-2 rounded-md border border-transparent bg-[rgba(0,0,0,0.04)] px-2.5 text-left text-[13px] transition-all duration-150 hover:bg-[rgba(0,0,0,0.06)] outline-none"
            @click="openCommandPalette"
          >
            <Search class="h-3.5 w-3.5 text-[#a39e98]" />
            <span class="flex-1 font-[400] text-[#a39e98] group-hover:text-[#615d59]">搜索</span>
            <span class="text-[11px] font-[500] text-[#a39e98] tracking-widest opacity-70 group-hover:opacity-100 transition-opacity mr-0.5">⌘ K</span>
          </button>

          <DropdownMenuRoot>
            <DropdownMenuTrigger as-child>
              <button
                type="button"
                class="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-transparent bg-[rgba(0,0,0,0.04)] text-[#a39e98] transition-all duration-150 hover:bg-[rgba(0,0,0,0.06)] hover:text-[rgba(0,0,0,0.95)] outline-none"
              >
                <Plus class="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuPortal>
              <DropdownMenuContent align="end" :side-offset="4" class="ui-dropdown-content min-w-44 z-50">
                <DropdownMenuItem class="ui-dropdown-item" @select="router.push('/snippets/new')">
                  <FileText class="h-4 w-4 text-[#a39e98]" />
                  <span>新建空白文档</span>
                </DropdownMenuItem>
                <DropdownMenuItem class="ui-dropdown-item" @select="workspaceStore.templateDialogOpen = true">
                  <LayoutTemplate class="h-4 w-4 text-[#a39e98]" />
                  <span>从模板创建</span>
                </DropdownMenuItem>
                <DropdownMenuItem class="ui-dropdown-item" @select="groupDialogOpen = true">
                  <FolderPlus class="h-4 w-4 text-[#a39e98]" />
                  <span>新建分组</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenuPortal>
          </DropdownMenuRoot>
        </div>

        <section class="mb-5 space-y-2">
          <div v-show="!sidebarCollapsed" class="flex items-center justify-between px-2">
            <p class="text-[11px] font-[600] text-[#a39e98]">Workspace</p>
            <button type="button" class="rounded p-1 text-[#a39e98] transition-colors hover:bg-[rgba(0,0,0,0.08)] hover:text-[rgba(0,0,0,0.95)]" @click="handleAllDocs">
              <Library class="h-3.5 w-3.5" />
            </button>
          </div>

          <div class="space-y-1" :class="sidebarCollapsed ? 'flex flex-col items-center gap-2' : ''">
            <button
              v-for="item in primaryNav"
              :key="item.label"
              type="button"
              class="flex items-center transition-all duration-150"
              :class="[
                isRouteActive(item.path) && (item.path !== '/workspace' || workspaceStore.activeGroupId == null) ? 'bg-[rgba(0,0,0,0.05)] font-[500] text-[rgba(0,0,0,0.95)]' : 'text-[#615d59] hover:bg-[rgba(0,0,0,0.05)] hover:text-[rgba(0,0,0,0.95)]',
                sidebarCollapsed ? 'justify-center h-8 w-8 rounded px-0' : 'w-full justify-between rounded-[4px] px-2 py-1 text-[14px]'
              ]"
              :title="sidebarCollapsed ? item.label : ''"
              @click="item.path === '/workspace' ? handleAllDocs() : router.push(item.path)"
            >
              <span class="inline-flex items-center gap-2">
                <component :is="item.icon" :class="sidebarCollapsed ? 'h-4 w-4' : 'h-4 w-4 text-[#a39e98] group-hover:text-[#615d59]'" />
                <template v-if="!sidebarCollapsed">{{ item.label }}</template>
              </span>
              <span v-if="!sidebarCollapsed && item.label === '全部文档'" class="group-tree-count">{{ workspaceStore.groups.length }}</span>
            </button>
          </div>
        </section>

        <section v-if="!sidebarCollapsed" class="mb-5 space-y-2">
          <div class="flex items-center justify-between px-2">
            <p class="text-[11px] font-[600] text-[#a39e98]">Groups</p>
            <DialogRoot v-model:open="groupDialogOpen">
              <DialogTrigger as-child>
                <button type="button" class="rounded p-1 text-[#a39e98] transition-colors hover:bg-[rgba(0,0,0,0.08)] hover:text-[rgba(0,0,0,0.95)]">
                  <Plus class="h-3.5 w-3.5" />
                </button>
              </DialogTrigger>
              <DialogPortal>
                <DialogOverlay class="dialog-overlay" />
                <DialogContent class="dialog-content">
                  <DialogTitle class="text-lg font-semibold text-[rgba(0,0,0,0.95)]">新建分组</DialogTitle>
                  <DialogDescription class="mt-1 text-sm text-[#615d59]">
                    侧栏会立即刷新，新的分组可直接用于过滤文档。
                  </DialogDescription>
                  <div class="mt-5 space-y-4">
                    <div>
                      <label class="ui-label">分组名称</label>
                      <input v-model="newGroupName" class="ui-input" placeholder="例如：后端笔记" @keydown.enter.prevent="submitCreateGroup" />
                    </div>
                    <div class="flex justify-end gap-2">
                      <DialogClose as-child>
                        <button type="button" class="ui-button ui-button-secondary">取消</button>
                      </DialogClose>
                      <button type="button" class="ui-button ui-button-primary" @click="submitCreateGroup">创建分组</button>
                    </div>
                  </div>
                </DialogContent>
              </DialogPortal>
            </DialogRoot>
          </div>

          <ul class="mb-1 space-y-1">
            <li class="space-y-1">
              <div
                class="group-tree-button"
                :class="{ 'group-tree-button-active': isSameId(workspaceStore.activeGroupId, 0) || isDragOverInbox }"
                style="padding-left: 10px;"
                @dragover.prevent="onDragOverInbox"
                @dragleave="onDragLeaveInbox"
                @drop="onDropSnippet"
              >
                <div class="flex min-w-0 flex-1 items-center gap-2">
                  <span class="block w-4 shrink-0"></span>
                  <button
                    type="button"
                    class="flex min-w-0 flex-1 items-center gap-2 text-left"
                    @click="handleGroupClick(0)"
                  >
                    <Inbox class="shrink-0 text-[#a39e98] h-4 w-4" />
                    <span class="truncate text-left">Inbox / 收件箱</span>
                  </button>
                </div>
              </div>
            </li>
          </ul>

          <WorkspaceGroupTree :groups="groupTree" :active-id="workspaceStore.activeGroupId" @select="handleGroupClick" />
        </section>


      </aside>

      <section class="flex min-h-screen min-w-0 flex-1 flex-col overflow-x-hidden transition-all duration-200 ease-in-out" :class="sidebarCollapsed ? 'pl-16' : 'pl-57.5'">
        <header class="sticky top-0 z-20 flex h-12 items-center justify-between border-b border-[rgba(0,0,0,0.1)] bg-white px-6">
          <div class="mx-auto flex w-full max-w-none items-center justify-between gap-4">
            <div class="flex items-center gap-3">
              <div class="flex items-center gap-1.5 text-[14px] text-[#615d59]">
                <span v-for="crumb in breadcrumbs" :key="crumb" class="inline-flex items-center gap-1.5">
                  <span>{{ crumb }}</span>
                  <span v-if="crumb !== breadcrumbs[breadcrumbs.length - 1]" class="text-[#a39e98]">/</span>
                </span>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <DropdownMenuRoot v-if="isAuthenticated">
                <DropdownMenuTrigger as-child>
                  <button
                    type="button"
                    class="inline-flex h-8 items-center gap-2 rounded px-2 text-left outline-none transition-all duration-150 hover:bg-[rgba(0,0,0,0.05)]"
                  >
                    <span class="flex h-5 w-5 items-center justify-center rounded bg-[#0075de] text-[11px] font-[600] text-white">
                      {{ userInitial }}
                    </span>
                    <span class="hidden text-[14px] font-[500] text-[rgba(0,0,0,0.95)] md:block">{{ authStore.user?.username }}</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuContent align="end" :side-offset="10" class="ui-dropdown-content min-w-45">
                    <DropdownMenuItem class="ui-dropdown-item" @select="router.push('/about')">
                      <Sparkles class="h-4 w-4" />
                      关于 GoNote
                    </DropdownMenuItem>
                    <DropdownMenuItem class="ui-dropdown-item" @select="router.push('/settings')">
                      <Settings2 class="h-4 w-4" />
                      账户设置
                    </DropdownMenuItem>
                    <DropdownMenuItem class="ui-dropdown-item" @select="openPassportFromShell('login')">
                      <Users class="h-4 w-4" />
                      切换账号
                    </DropdownMenuItem>
                    <DropdownMenuSeparator class="ui-dropdown-separator" />
                    <DropdownMenuItem class="ui-dropdown-item text-red-600 data-highlighted:bg-red-50 data-highlighted:text-red-700" @select="handleLogout">
                      <LogOut class="h-4 w-4" />
                      退出登录
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenuPortal>
              </DropdownMenuRoot>
              <button v-else type="button" class="ui-button ui-button-primary" @click="openPassportFromShell('register')">
                登录 / 注册
              </button>
            </div>
          </div>
        </header>

        <main class="flex-1 w-full bg-white overflow-hidden">
            <router-view v-slot="{ Component }">
              <transition name="fade" mode="out-in">
                <component :is="Component" :key="route.path" />
              </transition>
            </router-view>
        </main>
      </section>
    </div>

    <main v-else>
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" :key="route.fullPath" />
        </transition>
      </router-view>
    </main>

    <UiConfirmDialogHost />
    <UiToastViewport />
    <CommandPalette />
    <TemplateDialog v-model:open="workspaceStore.templateDialogOpen" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { buildAuthAppLoginPath } from '@clients/shared'
import {
  ChevronRight,
  Library,
  LogOut,
  NotebookPen,
  PanelLeftClose,
  PanelLeftOpen,
  PanelTop,
  Plus,
  Search,
  Settings2,
  Sparkles,
  Users,
  LayoutDashboard,
  Star,
  Trash2,
  Inbox,
  FileText,
  FolderKanban,
  FolderPlus,
  FileEdit,
  LayoutTemplate,
  Home,
} from 'lucide-vue-next'
import { isSameId, parseRouteId } from '@clients/shared'
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuRoot,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from 'radix-vue'
import { moveSnippet } from '@/api/snippet'
import { logout } from '@/api/user'
import { useAuthStore } from '@/stores/auth'
import { useWorkspaceStore } from '@/stores/workspace'
import UiConfirmDialogHost from '@/components/ui/UiConfirmDialogHost.vue'
import UiToastViewport from '@/components/ui/UiToastViewport.vue'
import WorkspaceGroupTree from '@/components/WorkspaceGroupTree.vue'
import CommandPalette from '@/components/CommandPalette.vue'
import TemplateDialog from '@/components/workspace/TemplateDialog.vue'
import { toast } from '@/composables/useToast'

interface WorkspaceGroupInput {
  id: number
  parent_id?: number | null
  name: string
  snippet_count: number
  children?: WorkspaceGroupInput[]
}

interface WorkspaceGroupNode {
  id: number
  parent_id?: number | null
  name: string
  snippet_count: number
  children: WorkspaceGroupNode[]
}

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const workspaceStore = useWorkspaceStore()

const sidebarCollapsed = ref(false)
const workspaceKeyword = ref('')
const groupDialogOpen = ref(false)
const newGroupName = ref('')

const isDragOverInbox = ref(false)
const onDragOverInbox = (e: DragEvent) => {
  e.preventDefault()
  if (e.dataTransfer?.types.includes('text/plain')) {
    e.dataTransfer.dropEffect = 'move'
    isDragOverInbox.value = true
  }
}
const onDragLeaveInbox = () => {
  isDragOverInbox.value = false
}
const onDropSnippet = async (e: DragEvent) => {
  isDragOverInbox.value = false
  const snippetIdStr = e.dataTransfer?.getData('text/plain')
  if (!snippetIdStr) return

  try {
    await moveSnippet(snippetIdStr, { group_id: 0 })
    toast.success('已移入收件箱')
    window.dispatchEvent(new CustomEvent('snippet-moved'))
  } catch {
    toast.error('移动失败')
  }
}

const primaryNav = [
  { label: '开始', path: '/workspace/start', icon: Home },
  { label: '全部文档', path: '/workspace', icon: PanelTop },
  { label: '知识分组', path: '/workspace/groups', icon: FolderKanban },
  { label: '统一整理', path: '/workspace/organize', icon: LayoutDashboard },
  { label: '我的收藏', path: '/workspace/favorites', icon: Star },
  { label: '本地草稿', path: '/workspace/drafts', icon: FileEdit },
  { label: '回收站', path: '/workspace/trash', icon: Trash2 },
]

const isAuthenticated = computed(() => authStore.isAuthenticated)
const showWorkspaceShell = computed(() => !['landing'].includes(String(route.name ?? '')))
const isWorkspaceImmersive = computed(() => route.name === 'workspace-organize')
const userInitial = computed(() => authStore.user?.username?.slice(0, 1).toUpperCase() || 'G')

const pageTitle = computed(() => {
  switch (route.name) {
    case 'snippet-new':
      return '新建文档'
    case 'snippet-edit':
      return '编辑文档'
    case 'snippet-detail':
      return '文档详情'
    case 'about':
      return '关于 GoNote'
    case 'settings':
      return '账户设置'
    case 'workspace-organize':
      return '统一整理'
    case 'workspace-start':
      return '开始'
    case 'workspace-groups':
      return '知识分组'
    case 'workspace-favorites':
      return '我的收藏'
    case 'workspace-drafts':
      return '本地草稿箱'
    case 'workspace-trash':
      return '回收站'
    default:
      return '知识工作台'
  }
})

const groupTree = computed<WorkspaceGroupNode[]>(() => buildGroupTree(workspaceStore.groups as WorkspaceGroupInput[]))
const selectedWorkspaceTagIds = computed(() => {
  const raw = typeof route.query.tag_ids === 'string'
    ? route.query.tag_ids
    : typeof route.query.tag_id === 'string'
      ? route.query.tag_id
      : ''

  if (!raw) return []

  return raw
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
})

const breadcrumbs = computed(() => {
  const base = ['GoNote']

  if (route.name === 'workspace') {
    if (isSameId(workspaceStore.activeGroupId, 0)) {
      return [...base, '默认知识库', '文档列表']
    }

    if (workspaceStore.activeGroup?.name) {
      return [...base, workspaceStore.activeGroup.name, '文档列表']
    }

    return [...base, '全部文档']
  }

  if (route.name === 'snippet-new') {
    return [...base, '创建文档']
  }

  if (route.name === 'snippet-edit') {
    return [...base, '编辑文档']
  }

  if (route.name === 'snippet-detail') {
    return [...base, '阅读文档']
  }

  if (route.name === 'settings') {
    return [...base, '账户设置']
  }

  if (route.name === 'about') {
    return [...base, '产品说明']
  }

  if (route.name === 'workspace-organize') {
    return [...base, '统一整理']
  }

  if (route.name === 'workspace-start') {
    return [...base, '开始']
  }

  if (route.name === 'workspace-groups') {
    return [...base, '知识分组']
  }

  if (route.name === 'workspace-favorites') {
    return [...base, '我的收藏']
  }

  if (route.name === 'workspace-drafts') {
    return [...base, '本地草稿']
  }

  if (route.name === 'workspace-trash') {
    return [...base, '回收站']
  }

  return base
})

const syncWorkspaceKeyword = () => {
  workspaceKeyword.value = typeof route.query.q === 'string' ? route.query.q : ''
}

const syncWorkspaceFilters = () => {
  const routeGroupId = parseRouteId(route.query.group_id) as string | number | null
  const routeTagId = parseRouteId(route.query.tag_id) as string | number | null
  workspaceStore.selectGroup(routeGroupId)
  workspaceStore.activeTagId = selectedWorkspaceTagIds.value[0] ?? routeTagId
}

const buildGroupTree = (groups: WorkspaceGroupInput[]) => {
  if (!groups.length) return []

  const normalizeNode = (group: WorkspaceGroupInput): WorkspaceGroupNode => ({
    id: group.id,
    parent_id: group.parent_id,
    name: group.name,
    snippet_count: group.snippet_count,
    children: (group.children ?? []).map(normalizeNode),
  })

  if (groups.some((group) => Array.isArray(group.children))) {
    return groups.filter((group) => !group.parent_id)
      .map(normalizeNode)
  }

  const map = new Map<string, WorkspaceGroupNode & { children: WorkspaceGroupNode[] }>()
  const roots: Array<WorkspaceGroupNode & { children: WorkspaceGroupNode[] }> = []

  for (const group of groups) {
    map.set(String(group.id), {
      ...group,
      children: [],
    })
  }

  for (const group of map.values()) {
    if (group.parent_id && map.has(String(group.parent_id))) {
      map.get(String(group.parent_id))?.children.push(group)
    } else {
      roots.push(group)
    }
  }

  return roots
}

const handleWorkspaceSearch = () => {
  const q = workspaceKeyword.value.trim()
  router.replace({
    path: '/workspace',
    query: {
      ...route.query,
      q: q || undefined,
    },
  })
}

const openCommandPalette = () => {
  window.dispatchEvent(new CustomEvent('open-command-palette'))
}

const handleAllDocs = () => {
  workspaceStore.selectGroup(null)
  workspaceStore.selectTag(null)
  router.push({
    path: '/workspace',
    query: {
      q: typeof route.query.q === 'string' ? route.query.q : undefined,
      tag_id: undefined,
      tag_ids: undefined,
    },
  })
}

const handleGroupClick = (id: string | number) => {
  router.push({
    path: '/workspace',
    query: {
      q: typeof route.query.q === 'string' ? route.query.q : undefined,
      group_id: String(id),
      tag_id: undefined,
    },
  })
}

const isRouteActive = (path: string) => {
  if (path === '/workspace') {
    return route.path === '/workspace'
  }
  return route.path.startsWith(path)
}

const handleBrandClick = () => {
  router.push(isAuthenticated.value ? '/workspace' : '/')
}

const openPassportFromShell = (intent: 'login' | 'register' = 'login') => {
  authStore.clearSsoSuppression()
  window.location.replace(buildAuthAppLoginPath({
    appCode: 'go-note',
    intent,
    redirectPath: route.fullPath,
  }))
}

const submitCreateGroup = async () => {
  const name = newGroupName.value.trim()
  if (!name) {
    toast.warning('请输入分组名称')
    return
  }

  await workspaceStore.addGroup({ name })
  newGroupName.value = ''
  groupDialogOpen.value = false
  toast.success('分组已创建')
}

const handleLogout = async () => {
  const accessToken = authStore.token
  authStore.suppressSsoAutoLogin()

  try {
    if (accessToken) {
      await logout(accessToken)
    }
  } catch (error) {
    toast.warning(error instanceof Error ? error.message : '退出接口调用失败，已清理本地登录态')
  } finally {
    authStore.logout()
    toast.success('已退出登录')
    router.push('/')
  }
}

watch(
  () => route.fullPath,
  () => {
    syncWorkspaceKeyword()
    syncWorkspaceFilters()
  },
  { immediate: true },
)

onMounted(async () => {
  window.addEventListener('open-group-dialog', () => { groupDialogOpen.value = true })
  authStore.initFromStorage()
  await Promise.all([workspaceStore.fetchGroups(), workspaceStore.fetchTags()])
  syncWorkspaceFilters()
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.12s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
