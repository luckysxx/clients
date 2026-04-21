<template>
  <PageShell
    label="Reading"
    :title="snippet?.title || '加载中…'"
    :description="snippet ? undefined : '正在获取文档内容'"
    body-class="px-8 py-6"
    show-back
  >
    <SkeletonLoader v-if="loading" variant="article" :lines="3" />

    <section v-else-if="error" class="py-16 text-center">
      <p class="text-lg font-semibold text-[rgba(0,0,0,0.95)]">呜呼，文档走丢了</p>
      <p class="mt-2 text-sm text-[#615d59]">{{ error }}</p>
      <button type="button" class="ui-button ui-button-secondary mt-6" @click="retry">再试一下</button>
    </section>

    <div v-else-if="snippet" :class="{ 'fixed inset-0 z-[100] overflow-y-auto bg-white/95 backdrop-blur px-[5vw] lg:px-[15vw] pt-16': focusMode }">
      <article class="pb-24">
      <DraftNotificationBanner
        v-if="localDraft"
        class="mb-6"
        :message="showDraft ? `正在展示本地草稿（${formatDate(new Date(localDraft.timestamp).toISOString())}），尚未发布至云端。` : '已切换到云端最近发布版本。'"
      >
        <template #actions>
          <button type="button" class="group flex items-center gap-1.5 text-[#615d59] transition-colors hover:text-[rgba(0,0,0,0.95)]" @click="showDraft = !showDraft">
            <span class="font-[500]">{{ showDraft ? '查看云端版本' : '查看本地草稿' }}</span>
          </button>
          <button type="button" class="group flex items-center gap-1.5 text-[#615d59] transition-colors hover:text-[rgba(0,0,0,0.95)]" @click="goToEdit">
            <PencilLine class="h-4 w-4 transition-transform group-hover:-translate-y-0.5" />
            <span class="font-[500]">继续编辑</span>
          </button>
          <button type="button" class="group flex items-center gap-1.5 text-[#615d59] transition-colors hover:text-[#dd5b00]" @click="discardDraft">
            <Trash2 class="h-4 w-4" />
            <span class="font-[500]">丢弃草稿</span>
          </button>
        </template>
      </DraftNotificationBanner>

      <header>
        <h1 class="text-[40px] font-bold leading-tight tracking-[-1.5px] text-[rgba(0,0,0,0.95)] sm:text-[48px]">{{ displayTitle }}</h1>
        
        <div class="mt-4 flex flex-wrap gap-2 items-center">
            <template v-if="snippet.tag_ids?.length">
                <div
                  v-for="tagId in snippet.tag_ids"
                  :key="tagId"
                  class="inline-flex items-center gap-1.5 rounded-full border border-[rgba(0,0,0,0.1)] bg-[#f6f5f4] px-2.5 py-1 text-[12px] font-[500] text-[#615d59] transition-colors hover:bg-[rgba(0,0,0,0.05)]"
                >
                    <template v-if="resolveTag(tagId)">
                      <span class="h-1.5 w-1.5 rounded-full" :style="{ backgroundColor: resolveTag(tagId)!.color }"></span>
                      <span>{{ resolveTag(tagId)!.name }}</span>
                      <button
                        type="button"
                        class="ml-0.5 inline-flex h-5 w-5 cursor-pointer items-center justify-center rounded-full text-[#a39e98] transition-colors hover:bg-[rgba(0,0,0,0.08)] hover:text-[#dd5b00]"
                        title="删除标签"
                        aria-label="删除标签"
                        @click="handleDeleteTag(tagId)"
                      >
                        <Trash2 class="h-3 w-3" />
                      </button>
                    </template>
                    <span v-else>未知标签</span>
                </div>
            </template>
            
            <DropdownMenuRoot>
              <DropdownMenuTrigger as-child>
                <button type="button" class="inline-flex h-6 w-6 items-center justify-center rounded-full border border-dashed border-[rgba(0,0,0,0.15)] text-[#a39e98] outline-none transition-colors hover:bg-[rgba(0,0,0,0.05)] hover:text-[rgba(0,0,0,0.95)]" title="添加/移除标签">
                  <Plus class="h-3 w-3" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuPortal>
                <DropdownMenuContent align="start" :side-offset="8" class="ui-dropdown-content min-w-45 p-2">
                  <div v-if="workspaceStore.tags.length === 0" class="px-3 py-2 text-[13px] text-[#a39e98]">暂无标签</div>
                  <DropdownMenuItem
                    v-for="tag in workspaceStore.tags"
                    :key="tag.id"
                    class="ui-dropdown-item justify-between"
                    @select.prevent="toggleTag(tag.id)"
                  >
                    <span class="flex items-center gap-2">
                      <span class="h-2 w-2 rounded-full" :style="{ backgroundColor: tag.color }"></span>
                      {{ tag.name }}
                    </span>
                    <Check v-if="snippet.tag_ids?.some(id => isSameId(id, tag.id))" class="h-3 w-3 text-[#0075de]" />
                  </DropdownMenuItem>
                  <DropdownMenuSeparator class="ui-dropdown-separator" />
                  <div class="relative flex items-center px-2 py-1" @keydown.stop>
                    <input
                      v-model="newTagName"
                      class="w-full rounded bg-[#f6f5f4] px-2.5 py-1.5 pr-6 text-[12px] text-[rgba(0,0,0,0.95)] outline-none transition-all placeholder:text-[#a39e98] focus:ring-1 focus:ring-[rgba(0,0,0,0.1)]"
                      placeholder="新建标签..."
                      @keydown.enter.prevent="handleCreateTag"
                    />
                    <button
                      v-show="newTagName.trim()"
                      type="button"
                      class="absolute right-3.5 text-[#a39e98] transition-colors hover:text-[rgba(0,0,0,0.95)]"
                      @pointerdown.stop
                      @click.stop="handleCreateTag"
                    >
                      <Plus class="h-3 w-3" />
                    </button>
                  </div>
                </DropdownMenuContent>
              </DropdownMenuPortal>
            </DropdownMenuRoot>
        </div>

        <div class="mt-6 flex flex-wrap items-center gap-5 border-b border-[rgba(0,0,0,0.1)] pb-6 text-[13px] text-[#615d59]">
          <div class="flex items-center gap-2">
            <Clock3 class="h-4 w-4" />
            <span>{{ formatDate(snippet.updated_at) }}</span>
          </div>
          <div class="flex items-center gap-2">
            <Layers class="h-4 w-4" />
            <span class="uppercase tracking-wider">{{ snippet.language || 'text' }}</span>
          </div>


          <div class="flex-1"></div>
          
          <div class="flex flex-wrap items-center gap-x-4 gap-y-2">
            <button type="button" class="group flex items-center gap-1.5 transition-colors hover:text-[#0075de]" :class="snippet.is_favorite ? 'text-[#0075de]' : 'text-[#615d59] hover:text-[rgba(0,0,0,0.95)]'" @click="toggleFavorite">
              <Star class="h-4 w-4 transition-transform group-hover:scale-110" :class="{ 'fill-current': snippet.is_favorite }" />
              <span class="font-[500]">{{ snippet.is_favorite ? '已收藏' : '收藏' }}</span>
            </button>
            <button type="button" class="group flex items-center gap-1.5 transition-colors hover:text-[rgba(0,0,0,0.95)] text-[#615d59]" :title="focusMode ? '退出专注模式' : '专注模式'" @click="focusMode = !focusMode">
              <Minimize v-if="focusMode" class="h-4 w-4 transition-transform group-hover:scale-110" />
              <Maximize v-else class="h-4 w-4 transition-transform group-hover:scale-110" />
              <span class="font-[500]">{{ focusMode ? '退出' : '专注' }}</span>
            </button>
            <button type="button" class="group flex items-center gap-1.5 transition-colors hover:text-[rgba(0,0,0,0.95)]" @click="goToEdit">
              <PencilLine class="h-4 w-4 transition-transform group-hover:-translate-y-0.5" />
              <span class="font-[500]">编辑</span>
            </button>
            <button type="button" class="group flex items-center gap-1.5 transition-colors hover:text-[#dd5b00] text-[#615d59]" @click="handleDelete">
              <Trash2 class="h-4 w-4" />
              <span class="font-[500]">删除</span>
            </button>
            <button type="button" class="group flex items-center gap-1.5 transition-colors hover:text-[rgba(0,0,0,0.95)] text-[#615d59]" :disabled="!snippet.content" @click="copyContent">
              <Copy class="h-4 w-4 transition-transform group-hover:scale-110" />
              <span class="font-[500]">复制</span>
            </button>
            <button type="button" class="group flex items-center gap-1.5 transition-colors hover:text-[rgba(0,0,0,0.95)] text-[#615d59]" @click="handleExport">
              <Download class="h-4 w-4 transition-transform group-hover:scale-110" />
              <span class="font-[500]">导出</span>
            </button>
          </div>
        </div>
      </header>

      <!-- AI Inline Strip: summary + suggested tags below title -->
      <AIInsightPanel
        mode="inline"
        :loading="aiLoading"
        :metadata="aiMetadata"
        :error="aiError"
        :snippet-id="snippetId"
        :bound-tag-names="boundTagNames"
        :accepting-tag="acceptingTag"
        @retry="fetchAIMetadata(snippetId)"
        @accept-tag="handleAcceptTag"
      />

      <div class="mt-10 overflow-hidden rounded-[12px] border border-[rgba(0,0,0,0.1)] bg-[#f6f5f4] pt-4 px-2">
        <MilkdownEditor :model-value="displayContent" :readonly="true" />
      </div>

    </article>
    </div>
  </PageShell>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  Clock3,
  Copy,
  Download,
  Layers,
  PencilLine,
  Trash2,
  Plus,
  Check,
  Maximize,
  Minimize,
  Star,
} from 'lucide-vue-next'
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuRoot,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from 'radix-vue'
import { getSnippet, getSnippetAiMetadata, deleteSnippet, deleteSnippetTag, setSnippetTags, favoriteSnippet, unfavoriteSnippet, type Snippet, type AIMetadata } from '@/api/snippet'
import MilkdownEditor from '@/components/editor/MilkdownEditor.vue'
import AIInsightPanel from '@/components/editor/AIInsightPanel.vue'
import SkeletonLoader from '@/components/ui/SkeletonLoader.vue'
import DraftNotificationBanner from '@/components/ui/DraftNotificationBanner.vue'
import { confirm } from '@/composables/useConfirmDialog'
import { toast } from '@/composables/useToast'
import { useWorkspaceStore } from '@/stores/workspace'
import { isSameId } from '@clients/shared'
import { exportSingleToFile } from '@/composables/useImportExport'

const route = useRoute()
const router = useRouter()
const workspaceStore = useWorkspaceStore()

const loading = ref(false)
const error = ref('')
const snippet = ref<Snippet | null>(null)
const aiLoading = ref(false)
const aiError = ref('')
const aiMetadata = ref<AIMetadata | null>(null)
const newTagName = ref('')
const focusMode = ref(false)
const localDraft = ref<{ title: string; content: string; timestamp: number } | null>(null)
const showDraft = ref(true)
const acceptingTag = ref('')

const boundTagNames = computed(() => {
  if (!snippet.value?.tag_ids?.length) return []
  return snippet.value.tag_ids
    .map(id => resolveTag(id))
    .filter(Boolean)
    .map(t => t!.name)
})

const displayTitle = computed(() => (localDraft.value && showDraft.value ? localDraft.value.title : snippet.value?.title) || '')
const displayContent = computed(() => (localDraft.value && showDraft.value ? localDraft.value.content : snippet.value?.content) || '')

const snippetId = computed(() => (route.params.id as string) || '')

const draftKey = computed(() => `go-note-draft-${snippetId.value}`)

const loadLocalDraft = () => {
  if (!snippetId.value) { localDraft.value = null; return }
  const legacy = localStorage.getItem(`go_note_draft_${snippetId.value}`)
  if (legacy && !localStorage.getItem(draftKey.value)) {
    localStorage.setItem(draftKey.value, legacy)
    localStorage.removeItem(`go_note_draft_${snippetId.value}`)
  }
  const raw = localStorage.getItem(draftKey.value)
  if (!raw) { localDraft.value = null; return }
  try { localDraft.value = JSON.parse(raw) } catch { localDraft.value = null }
}

const discardDraft = async () => {
  const ok = await confirm({ title: '丢弃本地草稿', description: '本地暂存的修改将被清除，此操作不可逆。', tone: 'danger', confirmText: '丢弃' })
  if (!ok) return
  localStorage.removeItem(draftKey.value)
  localDraft.value = null
  toast.success('本地草稿已丢弃')
}

const fetchDocument = async (id: string) => {
  if (!id) {
    error.value = '无效的文档 ID'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const currentSnippet = await getSnippet(id)
    snippet.value = currentSnippet
    loadLocalDraft()
    fetchAIMetadata(id)
  } catch {
    snippet.value = null
    error.value = '文档不存在或你无权查看'
  } finally {
    loading.value = false
  }
}

const fetchAIMetadata = async (id: string) => {
  if (!id) return
  aiLoading.value = true
  aiError.value = ''
  try {
    aiMetadata.value = await getSnippetAiMetadata(id)
  } catch (err) {
    aiMetadata.value = null
    aiError.value = err instanceof Error ? err.message : '获取 AI 元数据失败'
  } finally {
    aiLoading.value = false
  }
}

const resolveTag = (id: string | number) => workspaceStore.tags.find((t) => isSameId(t.id, id))

const toggleTag = async (tagId: number | string) => {
  if (!snippet.value) return
  const currentTags = [...(snippet.value.tag_ids ?? [])]
  let newTags: (string | number)[]
  if (currentTags.some(id => isSameId(id, tagId))) {
    newTags = currentTags.filter(id => !isSameId(id, tagId))
  } else {
    newTags = [...currentTags, String(tagId)]
  }
  
  // 先做乐观更新，失败时再回滚。
  snippet.value.tag_ids = newTags
  
  try {
    await setSnippetTags(snippet.value.id, { tag_ids: newTags })
  } catch (err) {
    snippet.value.tag_ids = currentTags
    toast.error('修改标签失败')
  }
}

const toggleFavorite = async () => {
  if (!snippet.value) return
  const isFav = snippet.value.is_favorite
  
  // 乐观更新
  snippet.value.is_favorite = !isFav
  
  try {
    if (isFav) {
      await unfavoriteSnippet(snippet.value.id)
      toast.success('已取消收藏')
    } else {
      await favoriteSnippet(snippet.value.id)
      toast.success('已收藏')
    }
  } catch (err) {
    // 失败回滚
    snippet.value.is_favorite = isFav
    toast.error('操作失败')
  }
}

const handleCreateTag = async () => {
  const name = newTagName.value.trim()
  if (!name || !snippet.value) return
  
  try {
    const created = await workspaceStore.addTag({ name })
    newTagName.value = ''
    await toggleTag(created.id)
    toast.success('新增标签成功')
  } catch (e: any) {
    toast.error(e.message || '创建标签失败')
  }
}

const handleDeleteTag = async (tagId: string | number) => {
  if (!snippet.value) return

  const tag = resolveTag(tagId)
  if (!tag) {
    toast.error('标签不存在')
    return
  }

  const accepted = await confirm({
    title: '删除标签',
    description: `确定要删除标签"${tag.name}"吗？此操作不可逆。`,
    confirmText: '删除',
    cancelText: '取消',
    tone: 'danger',
  })

  if (!accepted) {
    return
  }

  try {
    await deleteSnippetTag(tag.id)
    workspaceStore.tags = workspaceStore.tags.filter(item => !isSameId(item.id, tag.id))
    snippet.value.tag_ids = (snippet.value.tag_ids ?? []).filter(id => !isSameId(id, tag.id))
    toast.success('标签已删除')
  } catch (e) {
    toast.error(e instanceof Error ? e.message : '删除失败')
  }
}

/** Accept an AI-suggested tag: create if needed, then bind to snippet */
const handleAcceptTag = async (tagName: string) => {
  if (!snippet.value || acceptingTag.value) return
  acceptingTag.value = tagName

  try {
    // Check if tag already exists in workspace
    let existingTag = workspaceStore.tags.find(
      t => t.name.toLowerCase() === tagName.toLowerCase()
    )

    // Create if not exists
    if (!existingTag) {
      existingTag = await workspaceStore.addTag({ name: tagName })
    }

    // Check if already bound
    const currentTags = [...(snippet.value.tag_ids ?? [])]
    const alreadyBound = currentTags.some(id => isSameId(id, existingTag!.id))
    if (!alreadyBound) {
      const newTags = [...currentTags, String(existingTag.id)]
      await setSnippetTags(snippet.value.id, { tag_ids: newTags })
      snippet.value.tag_ids = newTags
    }

    toast.success(`标签 "${tagName}" 已绑定`)
  } catch (err) {
    toast.error(err instanceof Error ? err.message : '绑定标签失败')
  } finally {
    acceptingTag.value = ''
  }
}

const retry = () => {
  fetchDocument(snippetId.value)
}

const copyContent = async () => {
  if (!snippet.value?.content) return

  try {
    await navigator.clipboard.writeText(snippet.value.content)
    toast.success('复制成功')
  } catch {
    toast.error('复制失败')
  }
}

const handleExport = async () => {
  if (!snippet.value) return
  await exportSingleToFile({
    title: snippet.value.title,
    content: snippet.value.content,
  })
}

const goToEdit = () => {
  if (!snippetId.value) return
  router.push(`/snippets/${snippetId.value}/edit`)
}

const handleDelete = async () => {
  if (!snippet.value) return

  const accepted = await confirm({
    title: '删除文档',
    description: `确定要删除文档"${snippet.value.title}"吗？此操作不可逆。`,
    confirmText: '删除',
    cancelText: '取消',
    tone: 'danger',
  })

  if (!accepted) {
    return
  }

  try {
    await deleteSnippet(snippet.value.id)
    const key = `go-note-draft-${snippet.value.id}`
    if (localStorage.getItem(key)) {
      localStorage.removeItem(key)
    }
    toast.success('文档已移入回收站')
    router.replace('/workspace')
  } catch (e) {
    toast.error(e instanceof Error ? e.message : '删除失败')
  }
}

const formatDate = (value: string) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

onMounted(() => {
  if (!workspaceStore.tags.length) {
    workspaceStore.fetchTags()
  }
  if (snippetId.value) {
    fetchDocument(snippetId.value)
  }
})

watch(
  () => route.params.id,
  (value) => {
    if (typeof value === 'string' && value) {
      fetchDocument(value)
    }
  },
)
</script>
