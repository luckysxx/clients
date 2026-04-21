import re

with open('src/App.vue', 'r', encoding='utf-8') as f:
    content = f.read()

template_pattern = re.compile(
    r'(<div class="mb-5 flex items-center".*?</section>\s*</aside>)',
    re.DOTALL
)

template_replacement = """<div class="mb-6 flex items-center" :class="sidebarCollapsed ? 'justify-center' : 'gap-2'">
          <button type="button" class="ui-icon-button border-white/[0.1] bg-white/[0.05] text-neutral-300 hover:bg-white/[0.1] hover:text-white" @click="sidebarCollapsed = !sidebarCollapsed">
            <PanelLeftClose v-if="!sidebarCollapsed" class="h-4 w-4" />
            <PanelLeftOpen v-else class="h-4 w-4" />
          </button>

          <button
            v-show="!sidebarCollapsed"
            type="button"
            class="flex min-w-0 flex-1 items-center gap-3 rounded-xl px-2 py-1.5 text-left transition-colors duration-150 hover:bg-white/[0.06]"
            @click="handleBrandClick"
          >
            <div class="flex shrink-0 h-8 w-8 items-center justify-center rounded-lg bg-[linear-gradient(135deg,#8b8cf8,#53b3ff)] text-black">
              <NotebookPen class="h-4 w-4" />
            </div>
            <div class="min-w-0">
              <p class="truncate text-[13px] font-semibold tracking-wide text-white">GoNote</p>
              <p class="truncate text-[11px] text-neutral-500">Docs for builders</p>
            </div>
          </button>
        </div>

        <div v-if="!sidebarCollapsed" class="mb-6">
          <div class="relative group cursor-text">
            <Search class="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500 group-hover:text-neutral-400 transition-colors" />
            <input
              v-model="workspaceKeyword"
              type="search"
              class="h-8 w-full rounded-lg border border-transparent bg-white/[0.05] pl-8 pr-12 text-[13px] text-white outline-none transition-all duration-150 placeholder:text-neutral-500 hover:bg-white/[0.08] focus:border-white/[0.15] focus:bg-white/[0.1] focus:shadow-[0_0_0_2px_rgba(255,255,255,0.05)]"
              placeholder="搜索..."
              @keydown.enter.prevent="handleWorkspaceSearch"
            />
            <div class="pointer-events-none absolute right-1.5 top-1/2 flex -translate-y-1/2 items-center gap-0.5">
              <kbd class="flex h-4 items-center justify-center rounded-md border border-white/[0.1] bg-white/[0.05] px-1.5 font-sans text-[10px] font-medium text-neutral-500">⌘</kbd>
              <kbd class="flex h-4 items-center justify-center rounded-md border border-white/[0.1] bg-white/[0.05] px-1.5 font-sans text-[10px] font-medium text-neutral-500">K</kbd>
            </div>
          </div>
        </div>

        <div class="flex-1 overflow-y-auto app-scrollbar pr-2 -mr-2 flex flex-col">
          <nav class="mb-8 space-y-0.5">
            <button
              v-for="item in topNav"
              :key="item.label"
              type="button"
              class="group flex items-center rounded-lg text-[13px] font-medium transition-all duration-150 relative"
              :class="[
                isRouteActive(item.path) ? 'bg-white/[0.08] text-white' : 'text-neutral-400 hover:bg-white/[0.06] hover:text-white',
                sidebarCollapsed ? 'justify-center w-10 h-10 px-0 mx-auto mb-1' : 'w-full justify-start gap-2.5 px-2.5 py-1.5'
              ]"
              @click="handleSystemNav(item.path)"
            >
              <div v-if="isRouteActive(item.path) && !sidebarCollapsed" class="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-[3px] rounded-r-full bg-white"></div>
              <component :is="item.icon" class="h-[15px] w-[15px] shrink-0 transition-colors" :class="isRouteActive(item.path) ? 'text-current' : 'text-neutral-500 group-hover:text-neutral-300'" />
              <span v-if="!sidebarCollapsed" class="truncate">{{ item.label }}</span>
            </button>
          </nav>

          <section v-if="!sidebarCollapsed" class="mb-8 relative">
            <div class="group flex items-center justify-between px-2.5 pb-2">
              <p class="text-xs font-medium text-neutral-500 group-hover:text-neutral-400 transition-colors">知识库</p>
              <DialogRoot v-model:open="groupDialogOpen">
                <DialogTrigger as-child>
                  <button type="button" class="rounded p-0.5 text-neutral-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-white/[0.08] hover:text-white">
                    <Plus class="h-3.5 w-3.5" />
                  </button>
                </DialogTrigger>
                <DialogPortal>
                  <DialogOverlay class="dialog-overlay" />
                  <DialogContent class="dialog-content">
                    <DialogTitle class="text-lg font-semibold text-neutral-950">新建分组</DialogTitle>
                    <DialogDescription class="mt-1 text-sm text-neutral-500">
                      侧栏会立即刷新，新的分组可直接用于过滤文档。
                    </DialogDescription>
                    <div class="mt-5 space-y-4">
                      <div>
                        <label class="ui-label">分组名称</label>
                        <input v-model="newGroupName" class="ui-input" placeholder="例如：后端笔记" @keydown.enter.prevent="submitCreateGroup" />
                      </div>
                      <div class="flex justify-end gap-2">
                        <DialogClose as-child>
                          <button type="button" class="ui-button">取消</button>
                        </DialogClose>
                        <button type="button" class="ui-button ui-button-primary" @click="submitCreateGroup">创建分组</button>
                      </div>
                    </div>
                  </DialogContent>
                </DialogPortal>
              </DialogRoot>
            </div>
            <WorkspaceGroupTree :groups="groupTree" :active-id="workspaceStore.activeGroupId" @select="handleGroupClick" />
          </section>

          <section v-if="!sidebarCollapsed" class="mb-8">
            <div class="group flex items-center justify-between px-2.5 pb-2">
              <p class="text-xs font-medium text-neutral-500 group-hover:text-neutral-400 transition-colors">标签</p>
              <DialogRoot v-model:open="tagDialogOpen">
                <DialogTrigger as-child>
                  <button type="button" class="rounded p-0.5 text-neutral-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-white/[0.08] hover:text-white">
                    <Plus class="h-3.5 w-3.5" />
                  </button>
                </DialogTrigger>
                <DialogPortal>
                  <DialogOverlay class="dialog-overlay" />
                  <DialogContent class="dialog-content">
                    <DialogTitle class="text-lg font-semibold text-neutral-950">新建标签</DialogTitle>
                    <DialogDescription class="mt-1 text-sm text-neutral-500">
                      用低饱和颜色给知识点做索引，方便主视图即时筛选。
                    </DialogDescription>
                    <div class="mt-5 space-y-4">
                      <div>
                        <label class="ui-label">标签名称</label>
                        <input v-model="newTagName" class="ui-input" placeholder="例如：Go / 性能 / 架构" />
                      </div>
                      <div>
                        <label class="ui-label">标签颜色</label>
                        <div class="flex flex-wrap gap-2">
                          <button
                            v-for="color in tagPalette"
                            :key="color"
                            type="button"
                            class="h-8 w-8 rounded-full border transition-all duration-150"
                            :class="newTagColor === color ? 'scale-110 border-neutral-950' : 'border-black/[0.1]'"
                            :style="{ backgroundColor: color }"
                            @click="newTagColor = color"
                          />
                        </div>
                      </div>
                      <div class="flex justify-end gap-2">
                        <DialogClose as-child>
                          <button type="button" class="ui-button">取消</button>
                        </DialogClose>
                        <button type="button" class="ui-button ui-button-primary" @click="submitCreateTag">创建标签</button>
                      </div>
                    </div>
                  </DialogContent>
                </DialogPortal>
              </DialogRoot>
            </div>
            <div class="flex flex-wrap gap-1.5 px-2.5">
              <button
                v-for="tag in workspaceStore.tags"
                :key="tag.id"
                type="button"
                class="inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium transition-all duration-150"
                :class="workspaceStore.activeTagId === tag.id ? 'border-white/[0.15] bg-white/[0.1] text-white' : 'border-white/[0.04] bg-white/[0.02] text-neutral-400 hover:border-white/[0.1] hover:bg-white/[0.06] hover:text-white'"
                @click="handleTagClick(tag.id)"
              >
                <div class="h-1.5 w-1.5 rounded-full" :style="{ backgroundColor: tag.color || '#818cf8', opacity: workspaceStore.activeTagId === tag.id ? '1' : '0.6' }"></div>
                {{ tag.name }}
              </button>
            </div>
          </section>

          <section v-if="!sidebarCollapsed" class="mt-auto space-y-0.5 pt-6 pb-2">
            <button
              v-for="item in bottomNav"
              :key="item.label"
              type="button"
              class="group flex w-full items-center rounded-lg px-2.5 py-1.5 text-[13px] font-medium transition-all duration-150"
              :class="isRouteActive(item.path) ? 'bg-white/[0.08] text-white' : 'text-neutral-400 hover:bg-white/[0.06] hover:text-white'"
              @click="handleSystemNav(item.path)"
            >
              <component :is="item.icon" class="h-[15px] w-[15px] shrink-0 text-neutral-500 group-hover:text-neutral-300" />
              <span class="truncate ml-2.5">{{ item.label }}</span>
            </button>
          </section>
        </div>
      </aside>"""

new_content, count = template_pattern.subn(template_replacement, content)
if count != 1:
    print(f"Failed to replace template! count={count}")
    exit(1)

content = new_content

import_pattern = re.compile(
    r'(PanelLeftOpen,\n\s*PanelTop,\n\s*Plus,\n\s*Search,\n\s*Settings2,\n\s*Sparkles,\n\s*Users,\n} from \'lucide-vue-next\')',
    re.MULTILINE
)

import_replacement = """PanelLeftOpen,
  PanelTop,
  Plus,
  Search,
  Settings2,
  Sparkles,
  Users,
  Clock,
  Star,
  FileEdit,
  Trash2,
} from 'lucide-vue-next'"""

new_content, count = import_pattern.subn(import_replacement, content)
if count != 1:
    print(f"Failed to replace imports! count={count}")
    exit(1)

content = new_content

nav_pattern = re.compile(
    r'(const primaryNav = \[\n\s*\{ label: \'全部文档\', path: \'/workspace\', icon: PanelTop \},\n\])',
    re.MULTILINE
)

nav_replacement = """const topNav = [
  { label: '全部文档', path: '/workspace', icon: PanelTop },
  { label: '最近访问', path: '/workspace/recent', icon: Clock },
  { label: '我的收藏', path: '/workspace/favorites', icon: Star },
]

const bottomNav = [
  { label: '草稿箱', path: '/workspace/drafts', icon: FileEdit },
  { label: '回收站', path: '/workspace/trash', icon: Trash2 },
]"""

new_content, count = nav_pattern.subn(nav_replacement, content)
if count != 1:
    print(f"Failed to replace nav config! count={count}")
    exit(1)

content = new_content

route_active_pattern = re.compile(
    r'(const isRouteActive = \(path: string\) => \{\n\s*if \(path === \'/workspace\'\) \{\n\s*return route.path === \'/workspace\'\n\s*\}\n\s*return route.path.startsWith\(path\)\n\})',
    re.MULTILINE
)

route_active_replacement = """const isRouteActive = (path: string) => {
  if (path === '/workspace') {
    return route.path === '/workspace' && !route.query.group_id && !route.query.tag
  }
  return route.path.startsWith(path)
}

const handleSystemNav = (path: string) => {
  if (path === '/workspace') {
    handleAllDocs()
    return
  }
  router.push(path).catch(() => {
    // 这里未必能直接使用 ElMessage，因此先退化为输出 toast 提示
    console.info('该功能模块正在开发中...')
  })
}"""

new_content, count = route_active_pattern.subn(route_active_replacement, content)
if count != 1:
    print(f"Failed to replace route active! count={count}")
    exit(1)

content = new_content

with open('src/App.vue', 'w', encoding='utf-8') as f:
    f.write(content)

print("SUCCESS")
