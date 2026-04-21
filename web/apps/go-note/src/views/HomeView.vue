<template>
  <PageShell
    :label="pageLabel"
    :title="currentContextLabel"
    :description="keyword ? '搜索结果' : pageDescription"
    body-class="px-8 py-6"
  >
    <template #badges>
      <div class="flex flex-wrap gap-2 items-center">
        <span class="ui-chip-muted">{{ snippets.length }} 篇文档</span>
        <span v-if="isDefaultGroupContext" class="ui-chip-muted">默认知识库</span>
        <span v-if="workspaceStore.activeGroup?.name" class="ui-chip-muted">{{ workspaceStore.activeGroup.name }}</span>
        <span v-for="tag in selectedTags" :key="tag.id" class="ui-chip-muted">
          <span class="h-2 w-2 rounded-full" :style="{ backgroundColor: tag.color }"></span>
          {{ tag.name }}
        </span>
        <span v-if="keyword" class="ui-chip-muted">搜索：{{ keyword }}</span>
      </div>
    </template>

    <template #toolbar>
      <TagFilterBar
        :tags="workspaceStore.tags"
        :model-value="selectedTagIds"
        @update:model-value="applyTagFilter"
        @clear="handleClearTagFilter"
      />
    </template>

    <section>
      <SectionHeader title="所有页面">
        <template #actions>
          <div class="flex items-center gap-1">
            <!-- 新建按钮 -->
            <DropdownMenuRoot v-if="route.name !== 'workspace-favorites' && route.name !== 'workspace-trash'">
              <DropdownMenuTrigger as-child>
                <button type="button" class="inline-flex items-center gap-1.5 rounded border border-transparent px-2 py-1 text-[13px] font-[500] text-[#0075de] outline-none transition-colors hover:bg-[rgba(0,117,222,0.06)]">
                  <Plus class="h-3.5 w-3.5" />
                  新建
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuPortal>
                <DropdownMenuContent align="end" :side-offset="6" class="ui-dropdown-content min-w-40 p-1">
                  <DropdownMenuItem
                    class="ui-dropdown-item"
                    @select="router.push({ path: '/snippets/new', query: { group_id: groupId } })"
                  >
                    <FileText class="h-4 w-4 text-[#a39e98]" />
                    <span>空白文档</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    class="ui-dropdown-item"
                    @select="workspaceStore.templateDialogOpen = true"
                  >
                    <LayoutTemplate class="h-4 w-4 text-[#a39e98]" />
                    <span>从模板创建</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    class="ui-dropdown-item"
                    @select="handleImport"
                  >
                    <Upload class="h-4 w-4 text-[#a39e98]" />
                    <span>导入 Markdown</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenuPortal>
            </DropdownMenuRoot>

            <!-- 排序按钮 -->
            <DropdownMenuRoot>
              <DropdownMenuTrigger as-child>
                <button type="button" class="inline-flex items-center gap-1.5 rounded border border-transparent px-2 py-1 text-[13px] font-[500] text-[#615d59] outline-none transition-colors hover:bg-[rgba(0,0,0,0.05)]">
                  <ArrowUpDown class="h-3.5 w-3.5" />
                  {{ sortLabel }}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuPortal>
                <DropdownMenuContent align="end" :side-offset="6" class="ui-dropdown-content min-w-36 p-1">
                  <DropdownMenuItem
                    v-for="opt in sortOptions"
                    :key="opt.value"
                    class="ui-dropdown-item justify-between"
                    @select="handleSortChange(opt.value)"
                  >
                    <span>{{ opt.label }}</span>
                    <Check v-if="sortBy === opt.value" class="h-4 w-4 text-[#0075de]" />
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenuPortal>
            </DropdownMenuRoot>

            <!-- 导出 -->
            <button
              v-if="snippets.length > 0 && route.name !== 'workspace-trash'"
              type="button"
              class="inline-flex items-center gap-1.5 rounded border border-transparent px-2 py-1 text-[13px] font-[500] text-[#615d59] outline-none transition-colors hover:bg-[rgba(0,0,0,0.05)]"
              @click="exportDialogOpen = true"
            >
              <Download class="h-3.5 w-3.5" />
              导出
            </button>
          </div>
        </template>
      </SectionHeader>

      <SkeletonLoader v-if="isFirstLoad" variant="list" :lines="6" />

      <div v-else-if="error" class="px-4 py-12 text-center sm:px-6">
        <p class="text-lg font-semibold text-[rgba(0,0,0,0.95)]">加载失败</p>
        <p class="mt-2 text-sm text-[#615d59]">{{ error }}</p>
        <button type="button" class="ui-button ui-button-primary mt-5" @click="resetAndFetch">重新加载</button>
      </div>

      <EmptyState
        v-else-if="visibleSnippets.length === 0"
        :icon="emptyStateProps.icon"
        :title="emptyStateProps.title"
        :description="emptyStateProps.description"
        :cta-text="emptyStateProps.ctaText"
        @cta="emptyStateProps.onCta"
      />

      <div v-else class="flex flex-col gap-1 pt-2" :style="containerStyle">
        <SnippetListItem
          v-for="snippet in visibleSnippets"
          :key="snippet.id"
          :snippet="snippet"
          :is-trash-env="route.name === 'workspace-trash'"
          :badge="badgeFor(snippet) || undefined"
          draggable
          @dragstart="handleDragStart"
          @click="openSnippet"
          @delete="handleDeleteSnippet"
          @restore="handleRestoreSnippet"
        />

        <!-- Load More -->
        <div v-if="hasMore" class="flex justify-center pt-4 pb-2">
          <button
            type="button"
            class="ui-button ui-button-secondary rounded-full px-6 py-2"
            :disabled="loadingMore"
            @click="loadMore"
          >
            <LoaderCircle v-if="loadingMore" class="h-4 w-4 animate-spin" />
            <template v-else>加载更多</template>
          </button>
        </div>
        <div v-else-if="!isFirstLoad && snippets.length > 0" class="flex justify-center pb-2 pt-4">
          <span class="text-[12px] text-[#a39e98]">已全部加载</span>
        </div>
      </div>
    </section>

    <ExportDialog v-model:open="exportDialogOpen" :snippets="snippets" />
  </PageShell>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ArrowUpDown,
  Files,
  FileText,
  Check,
  LoaderCircle,
  Trash2,
  Plus,
  LayoutTemplate,
  ArchiveRestore,
  Star,
  Upload,
  Download,
} from 'lucide-vue-next'
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuRoot,
  DropdownMenuTrigger,
} from 'radix-vue'
import { isSameId, parseRouteId } from '@clients/shared'
import { listMySnippets, listFavoriteSnippets, deleteSnippet, restoreSnippet, type Snippet, type SnippetListQuery, type SnippetListResponse } from '@/api/snippet'
import { confirm } from '@/composables/useConfirmDialog'
import { toast } from '@/composables/useToast'
import { pickMarkdownFile } from '@/composables/useImportExport'
import { useWorkspaceStore } from '@/stores/workspace'
import PageShell from '@/components/layout/PageShell.vue'
import Badge from '@/components/ui/Badge.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import SkeletonLoader from '@/components/ui/SkeletonLoader.vue'
import SectionHeader from '@/components/ui/SectionHeader.vue'
import TagFilterBar from '@/components/ui/TagFilterBar.vue'
import SnippetListItem from '@/components/workspace/SnippetListItem.vue'
import ExportDialog from '@/components/workspace/ExportDialog.vue'

const router = useRouter()
const route = useRoute()
const workspaceStore = useWorkspaceStore()

const loading = ref(true)
const isFirstLoad = ref(true)
const loadingMore = ref(false)
const error = ref('')
const exportDialogOpen = ref(false)
const snippets = ref<Snippet[]>([])
const draftMap = ref<Record<string, { title: string; content: string; group_id?: string | number | null; timestamp: number }>>({})

const loadDraftMap = () => {
  const map: Record<string, any> = {}
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.startsWith('go-note-draft-')) {
      try {
        map[key.replace('go-note-draft-', '')] = JSON.parse(localStorage.getItem(key)!)
      } catch {}
    }
  }
  draftMap.value = map
}

type DraftStatus = 'latest' | 'pending_update' | 'new_draft'
const draftStatus = (snippet: Snippet): DraftStatus => {
  const d = draftMap.value[String(snippet.id)]
  if (!d) return 'latest'
  if (d.title !== snippet.title || d.content !== snippet.content) return 'pending_update'
  return 'latest'
}
const nextCursor = ref('')
const hasMore = ref(false)
const sortBy = ref<'updated_at' | 'created_at' | 'title'>('updated_at')

const PAGE_SIZE = 20

const sortOptions = [
  { value: 'updated_at' as const, label: '最近更新' },
  { value: 'created_at' as const, label: '最近创建' },
  { value: 'title' as const, label: '按标题' },
]

const sortLabel = computed(() =>
  sortOptions.find(opt => opt.value === sortBy.value)?.label ?? '最近更新'
)

// ─── 过渡动画状态 ───────────────────────────────────────────────
// visible: 正常显示
// hidden:  半透明（数据加载中）
// sliding: 淡入恢复
const viewState = ref<'visible' | 'hidden' | 'sliding'>('hidden')

const containerStyle = computed(() => {
  switch (viewState.value) {
    case 'hidden':
      return {
        opacity: '0.3',
        transition: 'opacity 150ms ease-out',
      }
    case 'sliding':
      return {
        opacity: '1',
        transition: 'opacity 300ms ease-out',
      }
    default:
      return {
        opacity: '1',
        transition: 'none',
      }
  }
})

const keyword = computed(() => {
  if (typeof route.query.q !== 'string') {
    return ''
  }
  return route.query.q.trim().toLowerCase()
})

const groupId = computed(() => parseRouteId(route.query.group_id))
const isDefaultGroupContext = computed(() => isSameId(groupId.value, 0))

const selectedTagIds = computed(() => {
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

const selectedTags = computed(() =>
  workspaceStore.tags.filter((tag) => selectedTagIds.value.some((id) => isSameId(id, tag.id)))
)

const hasTagFilter = computed(() => selectedTagIds.value.length > 0)

const newDraftVirtual = computed<Snippet | null>(() => {
  const d = draftMap.value['new']
  if (!d) return null
  const dg = d.group_id
  const gid = groupId.value
  const matchesGroup = (gid == null) || (dg != null && isSameId(dg, gid as any))
  if (!matchesGroup) return null
  return {
    id: 'draft:new' as any,
    title: d.title || '未命名草稿',
    content: d.content || '',
    language: 'markdown',
    created_at: new Date(d.timestamp).toISOString(),
    updated_at: new Date(d.timestamp).toISOString(),
    group_id: (dg ?? 0) as any,
    tag_ids: [],
  } as Snippet
})

const visibleSnippets = computed(() => {
  const base = newDraftVirtual.value ? [newDraftVirtual.value, ...snippets.value] : snippets.value
  // 先按关键词前端过滤（后端也会过滤，这里是额外的保险）
  const keywordFiltered = keyword.value
    ? base.filter((item) => item.title.toLowerCase().includes(keyword.value) || item.content.toLowerCase().includes(keyword.value))
    : base

  // 按标签前端过滤（多标签 AND 交集）
  const tagFiltered = selectedTagIds.value.length
    ? keywordFiltered.filter((item) => selectedTagIds.value.every((selectedId) =>
      (item.tag_ids ?? []).some((tagId) => isSameId(tagId, selectedId))
    ))
    : keywordFiltered

  // 不再前端排序 — 后端已按 sort_by 排好序
  return tagFiltered
})

const currentContextLabel = computed(() => {
  if (route.name === 'workspace-favorites') {
    return '我的收藏'
  }
  if (route.name === 'workspace-trash') {
    return '回收站'
  }
  if (isDefaultGroupContext.value) {
    return '默认知识库'
  }
  if (workspaceStore.activeGroup?.name) {
    return workspaceStore.activeGroup.name
  }
  if (keyword.value) {
    return `搜索: ${keyword.value}`
  }
  return '全部文档'
})

const emptyStateProps = computed(() => {
  if (route.name === 'workspace-favorites') {
    return {
      icon: Star,
      title: '暂无收藏，快去收藏吧',
      description: '你可以在阅读文档时点击右上角的★按钮进行收藏。',
      ctaText: undefined,
      onCta: () => {},
    }
  }
  if (route.name === 'workspace-trash') {
    return {
      icon: Trash2,
      title: '回收站为空',
      description: '删除的文档会在这里保留。',
      ctaText: undefined,
      onCta: () => {},
    }
  }
  return {
    icon: Files,
    title: keyword.value ? '没有匹配的文档' : '这里还没有文档',
    description: keyword.value ? '可以换个关键词，或者从左侧标签与分组切换不同上下文。' : '从左侧快速创建第一篇文档后，这里会自动接住它。',
    ctaText: '新建文档',
    onCta: () => router.push({ path: '/snippets/new', query: { group_id: groupId.value } }),
  }
})

const pageLabel = computed(() => {
  if (route.name === 'workspace-favorites') return 'Favorites'
  if (route.name === 'workspace-trash') return 'Trash'
  return 'Documents'
})

const pageDescription = computed(() => {
  if (route.name === 'workspace-favorites') return '快速访问你最常用或最重要的内容。'
  if (route.name === 'workspace-trash') return '已移入回收站的文档会在这里保留，你可以恢复或彻底删除。'
  return '你的全部知识与思考。'
})

const buildQuery = (cursor?: string): SnippetListQuery => {
  const isGlobal = route.name === 'workspace-trash' || route.name === 'workspace-favorites'
  
  const query: SnippetListQuery = {
    group_id: isGlobal ? undefined : groupId.value,
    keyword: keyword.value || undefined,
    sort_by: sortBy.value,
    limit: PAGE_SIZE,
    cursor: cursor || undefined,
  }
  
  if (route.name === 'workspace-trash') {
    query.status = 'trashed'
  } else {
    query.status = 'active'
  }
  
  return query
}

const doFetch = async (query: SnippetListQuery): Promise<SnippetListResponse> => {
  if (route.name === 'workspace-favorites') {
    const list = await listFavoriteSnippets(query)
    return { snippets: list, next_cursor: '', has_more: false }
  }
  return listMySnippets(query)
}

const fetchSnippets = async () => {
  loading.value = true
  error.value = ''
  try {
    const result = await doFetch(buildQuery())
    snippets.value = result.snippets
    nextCursor.value = result.next_cursor
    hasMore.value = result.has_more
  } catch (err) {
    snippets.value = []
    nextCursor.value = ''
    hasMore.value = false
    error.value = err instanceof Error ? err.message : '无法加载你的代码片段'
  } finally {
    loading.value = false
    isFirstLoad.value = false
  }
}

const loadMore = async () => {
  if (!nextCursor.value || loadingMore.value) return
  loadingMore.value = true
  try {
    const result = await doFetch(buildQuery(nextCursor.value))
    snippets.value = [...snippets.value, ...result.snippets]
    nextCursor.value = result.next_cursor
    hasMore.value = result.has_more
  } catch (err) {
    toast.error(err instanceof Error ? err.message : '加载更多失败')
  } finally {
    loadingMore.value = false
  }
}

const resetAndFetch = () => {
  nextCursor.value = ''
  hasMore.value = false
  fetchSnippets()
}

const handleSortChange = (value: 'updated_at' | 'created_at' | 'title') => {
  sortBy.value = value
}

// ─── 上下文切换过渡 ─────────────────────────────────────────────
// 思路：切换时瞬间隐藏 → 获取新数据 → 滑入动画
// 这样新 header 和新数据永远一起出现，没有"旧数据闪烁"的可能
const switchContext = async (_newVal?: any, oldVal?: any) => {
  if (oldVal === undefined) {
    // 首次加载：获取数据后直接滑入
    await fetchSnippets()
    viewState.value = 'hidden'
    await nextTick()
    // 强制浏览器"看到" hidden 状态，再切 sliding
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        viewState.value = 'sliding'
      })
    })
    return
  }

  // 后续切换：瞬间隐藏 → 换数据 → 滑入
  viewState.value = 'hidden'   // 瞬间不可见（transition: none）
  nextCursor.value = ''
  hasMore.value = false
  await fetchSnippets()        // 获取新数据（用户看不到任何变化）
  await nextTick()             // 等 DOM 用新数据渲染完成

  // 强制浏览器渲染 hidden 帧，然后启动滑入动画
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      viewState.value = 'sliding'
    })
  })
}

watch([groupId, selectedTagIds, keyword, sortBy], switchContext, { immediate: true })

const resolveTag = (id: string | number) => workspaceStore.tags.find((tag) => isSameId(tag.id, id))

const applyTagFilter = (nextTagIds: (string | number)[]) => {
  router.push({
    path: route.path,
    query: {
      ...route.query,
      tag_id: undefined,
      tag_ids: nextTagIds.length ? nextTagIds.map(String).join(',') : undefined,
    },
  })
}

const handleClearTagFilter = () => {
  const newQuery = { ...route.query }
  delete newQuery.tag_id
  delete newQuery.tag_ids
  router.push({
    path: route.path,
    query: newQuery,
  })
}

const handleImport = async () => {
  const file = await pickMarkdownFile()
  if (!file) return
  // 临时存入 sessionStorage，编辑器页面读取后立即清除
  sessionStorage.setItem('go-note-import', JSON.stringify(file))
  router.push('/snippets/new?from_import=1')
}


const handleDeleteSnippet = async (snippet: Snippet) => {
  const isDraft = String(snippet.id) === 'draft:new'
  const isTrashEnv = route.name === 'workspace-trash'
  
  const title = isDraft ? '丢弃本地草稿' : (isTrashEnv ? '彻底删除文档' : '移入回收站')
  const description = isDraft
    ? '该操作将丢弃本地暂存的草稿内容，此操作不可逆。'
    : (isTrashEnv ? `确定要彻底删除文档"${snippet.title}"吗？此操作不可逆。` : `确定要将文档"${snippet.title}"移入回收站吗？`)
  const confirmText = isDraft ? '丢弃草稿' : (isTrashEnv ? '彻底删除' : '移入回收站')

  const accepted = await confirm({
    title,
    description,
    confirmText,
    cancelText: '取消',
    tone: 'danger',
  })

  if (!accepted) {
    return
  }

  if (isDraft) {
    localStorage.removeItem('go-note-draft-new')
    loadDraftMap()
    toast.success('草稿已丢弃')
    return
  }

  try {
    await deleteSnippet(snippet.id)
    // 如果主文档被删（或软删），顺带清理其名下可能的本地草稿，避免悬挂的脏状态
    const key = `go-note-draft-${snippet.id}`
    if (localStorage.getItem(key)) {
      localStorage.removeItem(key)
      loadDraftMap()
    }
    toast.success(isTrashEnv ? '文档已彻底删除' : '文档已移入回收站')
    resetAndFetch()
  } catch (e) {
    toast.error(e instanceof Error ? e.message : '删除失败')
  }
}

const handleRestoreSnippet = async (snippet: Snippet) => {
  try {
    await restoreSnippet(snippet.id)
    toast.success('文档已恢复')
    resetAndFetch()
  } catch (e) {
    toast.error(e instanceof Error ? e.message : '恢复失败')
  }
}

const handleDragStart = (e: DragEvent, snippet: Snippet) => {
  if (e.dataTransfer) {
    e.dataTransfer.setData('text/plain', snippet.id.toString())
    e.dataTransfer.effectAllowed = 'move'
  }
}

const openSnippet = (id: string | number) => {
  if (String(id) === 'draft:new') {
    router.push({ path: '/snippets/new', query: { from_draft: '1' } })
    return
  }
  router.push(`/snippets/${id}`)
}

const badgeFor = (snippet: Snippet): { text: string; tone: 'draft' | 'pending' | 'latest' } => {
  if (String(snippet.id) === 'draft:new') return { text: '草稿', tone: 'draft' }
  const st = draftStatus(snippet)
  if (st === 'pending_update') return { text: '更新待发布', tone: 'pending' }
  return { text: '已是最新', tone: 'latest' }
}

const formatRelativeDate = (value: string) => {
  const date = new Date(value)
  const diff = Date.now() - date.getTime()

  if (Number.isNaN(date.getTime())) {
    return value
  }

  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour

  if (diff < hour) {
    return `${Math.max(1, Math.floor(diff / minute))} 分钟前`
  }
  if (diff < day) {
    return `${Math.floor(diff / hour)} 小时前`
  }
  if (diff < day * 7) {
    return `${Math.floor(diff / day)} 天前`
  }

  return formatAbsoluteDate(value)
}

const formatAbsoluteDate = (value: string) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date)
}

const handleSnippetMoved = () => {
  resetAndFetch()
}

onMounted(() => {
  if (!workspaceStore.groups.length) {
    workspaceStore.fetchGroups()
  }
  if (!workspaceStore.tags.length) {
    workspaceStore.fetchTags()
  }
  window.addEventListener('snippet-moved', handleSnippetMoved)
  loadDraftMap()
  window.addEventListener('focus', loadDraftMap)
})

onBeforeUnmount(() => {
  window.removeEventListener('snippet-moved', handleSnippetMoved)
  window.removeEventListener('focus', loadDraftMap)
})
</script>
