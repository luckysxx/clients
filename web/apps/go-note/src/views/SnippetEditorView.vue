<template>
  <PageShell
    label="Editor"
    :title="snippetId ? '编辑文档' : '新建文档'"
    :description="snippetId ? form.title : '在这里撰写你的知识文档。'"
    body-class="px-8 py-6"
    show-back
  >
  <div :class="{ 'fixed inset-0 z-50 overflow-y-auto bg-white/95 backdrop-blur px-[10vw] pt-16': focusMode }">
    <!-- Top Actions -->
    <div class="mb-12 flex items-center justify-between px-5 sm:px-0">
      <button type="button" class="group flex items-center gap-2 text-[13px] font-[500] text-[#615d59] transition-colors hover:text-[rgba(0,0,0,0.95)]" @click="goBack">
        <ArrowLeft class="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        返回
      </button>

      <div class="flex items-center gap-5 text-[13px]">

        <!-- Group Selector -->
        <div class="relative flex items-center group text-[#615d59] transition-colors hover:text-[rgba(0,0,0,0.95)]">
          <Layers class="absolute left-0 h-4 w-4 pointer-events-none" />
          <select
            v-model="form.group_id"
            class="appearance-none bg-transparent border-none pl-5.5 pr-4 py-1 text-[13px] font-[500] text-inherit outline-none cursor-pointer focus:ring-0"
          >
            <option :value="null" disabled>请选择知识库</option>
            <option :value="0">默认知识库</option>
            <option v-for="g in workspaceStore.groups" :key="g.id" :value="g.id">{{ g.name }}</option>
          </select>
          <ChevronDown class="absolute right-0 h-3 w-3 text-[#a39e98] pointer-events-none group-hover:text-[rgba(0,0,0,0.95)]" />
        </div>

        <!-- Tags -->
        <DropdownMenuRoot>
          <DropdownMenuTrigger as-child>
            <button type="button" class="group flex items-center gap-1.5 text-[#615d59] transition-colors hover:text-[rgba(0,0,0,0.95)] outline-none">
              <Tags class="h-4 w-4" />
              <span class="font-[500]">{{ form.tag_ids.length ? `已绑定 ${form.tag_ids.length}` : '无标签' }}</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuPortal>
            <DropdownMenuContent align="end" :side-offset="8" class="ui-dropdown-content min-w-45 p-2">
              <div v-if="workspaceStore.tags.length === 0" class="px-3 py-2 text-[13px] text-[#a39e98]">暂无标签</div>
              <DropdownMenuItem
                v-for="tag in workspaceStore.tags"
                :key="tag.id"
                class="ui-dropdown-item justify-between"
                @select.prevent="toggleTag(tag.id)"
              >
                <span class="flex items-center gap-2" :class="{ 'font-[600]': form.tag_ids.some(id => isSameId(id, tag.id)) }">
                  <span class="h-2 w-2 rounded-full" :style="{ backgroundColor: tag.color }"></span>
                  {{ tag.name }}
                </span>
                <Check v-if="form.tag_ids.some(id => isSameId(id, tag.id))" class="h-3 w-3 text-[#0075de]" />
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

        <!-- Focus Mode -->
        <button 
          type="button" 
          class="group flex items-center gap-1.5 text-[#615d59] transition-colors hover:text-[rgba(0,0,0,0.95)]" 
          @click="focusMode = !focusMode" 
          :title="focusMode ? '退出专注模式' : '进入专注模式'"
        >
          <Minimize v-if="focusMode" class="h-4 w-4 transition-transform group-hover:scale-110" />
          <Maximize v-else class="h-4 w-4 transition-transform group-hover:scale-110" />
          <span class="font-[500]">{{ focusMode ? '退出' : '专注' }}</span>
        </button>

        <button
          type="button"
          class="group flex items-center gap-1.5 text-[#615d59] transition-colors hover:text-[rgba(0,0,0,0.95)]"
          :title="editorMode === 'split' ? '切换到所见即所得模式' : '切换到 Markdown 双栏模式'"
          @click="toggleEditorMode"
        >
          <component :is="editorMode === 'split' ? PanelsTopLeft : Columns2" class="h-4 w-4 transition-transform group-hover:scale-110" />
          <span class="font-[500]">{{ editorMode === 'split' ? '所见即所得' : '双栏书写' }}</span>
        </button>

        <!-- Import (new mode only) -->
        <button v-if="!isEditMode" type="button" class="group flex items-center gap-1.5 text-[#615d59] transition-colors hover:text-[rgba(0,0,0,0.95)]" @click="handleImportFile" title="导入 Markdown 文件">
          <FileUp class="h-4 w-4 transition-transform group-hover:scale-110" />
          <span class="font-[500]">导入</span>
        </button>

        <!-- Delete -->
        <button v-if="isEditMode" type="button" class="group flex items-center gap-1.5 text-[#615d59] transition-colors hover:text-[#dd5b00]" @click="handleDelete" title="删除文档">
          <Trash2 class="h-4 w-4" />
          <span class="font-[500]">删除</span>
        </button>

        <button v-if="isEditMode" type="button" class="group flex items-center gap-1.5 text-[#615d59] transition-colors hover:text-[rgba(0,0,0,0.95)]" :disabled="sharing" @click="handleShare" title="创建分享链接">
          <Globe class="h-4 w-4" />
          <span class="font-[500]">{{ sharing ? '生成中' : '分享' }}</span>
        </button>

        <!-- AI Status Indicator -->
        <Transition name="fade">
          <PopoverRoot v-if="aiPollingStatus !== 'idle'">
            <PopoverTrigger as-child>
              <button
                type="button"
                class="group flex items-center gap-1.5 text-[13px] font-[500] transition-colors"
                :class="{
                  'text-[#097fe8]': aiPollingStatus === 'polling',
                  'text-[#2a9d99]': aiPollingStatus === 'ready',
                  'text-[#dd5b00]': aiPollingStatus === 'timeout' || aiPollingStatus === 'error',
                }"
              >
                <LoaderCircle v-if="aiPollingStatus === 'polling'" class="h-3.5 w-3.5 animate-spin" />
                <Sparkles v-else class="h-3.5 w-3.5" />
                <span>{{ aiStatusLabel }}</span>
              </button>
            </PopoverTrigger>
            <PopoverPortal>
              <PopoverContent
                :side-offset="8"
                align="end"
                class="z-50 w-80 rounded-[12px] border border-[rgba(0,0,0,0.1)] bg-white p-4 shadow-[rgba(0,0,0,0.04)_0px_4px_18px,rgba(0,0,0,0.027)_0px_2.025px_7.85px,rgba(0,0,0,0.02)_0px_0.8px_2.93px,rgba(0,0,0,0.01)_0px_0.175px_1.04px] outline-none"
              >
                <div v-if="aiPollingMeta" class="space-y-3">
                  <div v-if="aiPollingMeta.summary">
                    <p class="text-[11px] font-[600] uppercase tracking-[0.08em] text-[#a39e98]">摘要</p>
                    <p class="mt-1 text-[13px] leading-5 text-[rgba(0,0,0,0.95)]">{{ aiPollingMeta.summary }}</p>
                  </div>
                  <div v-if="aiPollingMeta.suggested_tags.length">
                    <p class="text-[11px] font-[600] uppercase tracking-[0.08em] text-[#a39e98]">建议标签</p>
                    <div class="mt-1 flex flex-wrap gap-1.5">
                      <span v-for="tag in aiPollingMeta.suggested_tags" :key="tag" class="inline-flex items-center gap-1 rounded-full bg-[#f2f9ff] px-2 py-0.5 text-[11px] font-[600] text-[#097fe8]">
                        #{{ tag }}
                      </span>
                    </div>
                  </div>
                  <p class="text-[11px] text-[#a39e98]">在阅读页可以一键采纳建议标签</p>
                </div>
                <p v-else-if="aiPollingStatus === 'polling'" class="text-[13px] text-[#615d59]">
                  AI 正在分析文档，请稍候…
                </p>
                <p v-else-if="aiPollingStatus === 'timeout'" class="text-[13px] text-[#615d59]">
                  AI 处理耗时较长，稍后可在阅读页查看结果。
                </p>
                <p v-else-if="aiPollingStatus === 'error'" class="text-[13px] text-[#dd5b00]">
                  AI 分析出现异常，请稍后重试。
                </p>
                <PopoverArrow class="fill-white" />
              </PopoverContent>
            </PopoverPortal>
          </PopoverRoot>
        </Transition>

        <button
          @click="saveSnippet(false)"
          :disabled="saving"
          class="ml-4 h-8 px-4 rounded-[6px] bg-[rgba(0,0,0,0.85)] hover:bg-black text-[13px] font-medium text-white transition-all flex items-center gap-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.12)] active:scale-[0.97] focus:outline-none"
        >
          <LoaderCircle v-if="saving" class="h-3.5 w-3.5 animate-spin" />
          <CloudUpload v-if="!saving" class="h-3.5 w-3.5" />
          {{ isEditMode ? '同步至云端' : '发布至云端' }}
        </button>
      </div>
    </div>

    <!-- Editor Skeleton -->
    <div v-if="loading" class="animate-pulse space-y-6 px-5 sm:px-0">
      <div class="h-12 w-2/3 rounded-[8px] bg-[rgba(0,0,0,0.04)]"></div>
      <div class="h-4 w-32 rounded-full bg-[rgba(0,0,0,0.03)]"></div>
      <div class="space-y-3 pt-6">
        <div class="h-4 w-full rounded-full bg-[rgba(0,0,0,0.03)]"></div>
        <div class="h-4 w-5/6 rounded-full bg-[rgba(0,0,0,0.03)]"></div>
        <div class="h-4 w-4/6 rounded-full bg-[rgba(0,0,0,0.03)]"></div>
      </div>
    </div>

    <!-- Main Clean Editor -->
    <div v-else class="px-5 sm:px-0">
      <input
        id="snippet-title"
        v-model="form.title"
        type="text"
        maxlength="120"
        class="w-full border-0 bg-transparent px-0 text-[38px] font-bold leading-tight tracking-[-1.5px] text-[rgba(0,0,0,0.95)] outline-none transition-all placeholder:text-[#a39e98] sm:text-[44px]"
        placeholder="输入文档标题..."
      />

      <div class="mt-4 flex flex-wrap items-center gap-4 text-[13px] text-[#a39e98]">
        <span class="inline-flex items-center gap-1.5">
          {{ charCount }} 字符
        </span>

        <!-- Auto-save Toggle -->
        <label class="flex items-center gap-1.5 cursor-pointer ml-1 select-none hover:text-[rgba(0,0,0,0.95)] transition-colors" title="开启后自动将修改暂存在浏览器中，需手动发布才会提交到云端">
          <div class="relative inline-flex h-[18px] w-8 items-center rounded-full transition-colors duration-200" :class="autoSaveEnabled ? 'bg-[#097fe8]' : 'bg-[rgba(0,0,0,0.2)]'">
            <span class="inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform duration-200 shadow-sm" :class="autoSaveEnabled ? 'translate-x-[16px]' : 'translate-x-[2px]'"></span>
          </div>
          <input type="checkbox" v-model="autoSaveEnabled" class="hidden" />
          <span>本地自动暂存</span>
        </label>

        <span v-show="autoSaveEnabled" class="inline-flex items-center gap-1.5 transition-opacity duration-500 ml-1" :class="saveStatus !== 'idle' ? 'opacity-100' : 'opacity-0'">
          <LoaderCircle v-if="saveStatus === 'saving'" class="h-3.5 w-3.5 animate-spin" />
          <Check v-else class="h-3.5 w-3.5 text-[#51a351]" />
          <span :class="{ 'text-[#51a351]': saveStatus === 'saved' }">
            {{ saveStatus === 'saving' ? '本地暂存中...' : '已暂存入浏览器' }}
          </span>
        </span>
      </div>

      <div class="mt-8 flex items-start gap-8 relative">
        <div
          class="w-full min-h-[60vh] overflow-visible"
          :class="editorMode === 'split' ? 'editor-split-grid' : 'flex-1 rounded-[12px]'"
        >
          <template v-if="editorMode === 'split'">
            <section class="editor-pane">
              <div class="editor-pane__header">
                <span>.md 源码</span>
                <span>{{ charCount }} chars</span>
              </div>
              <textarea
                ref="sourceTextareaRef"
                v-model="form.content"
                class="editor-source-textarea"
                spellcheck="false"
                placeholder="# 在这里写 Markdown..."
                @keydown.tab.prevent="handleSourceTab"
              />
            </section>

            <section class="editor-pane">
              <div class="editor-pane__header">
                <span>实时预览</span>
                <span>只读渲染</span>
              </div>
              <div class="editor-preview-panel">
                <MilkdownEditor
                  v-model="form.content"
                  :readonly="true"
                  @update:headings="toc = $event"
                />
              </div>
            </section>
          </template>

          <MilkdownEditor
            v-else
            v-model="form.content"
            @update:headings="toc = $event"
          />
        </div>

        <TableOfContents v-show="focusMode" :headings="toc" />
      </div>
    </div>
  </div>
    <!-- 知识库选择弹窗 -->
    <DialogRoot v-model:open="showGroupPicker">
      <DialogPortal>
        <DialogOverlay class="dialog-overlay" />
        <DialogContent class="dialog-content max-w-sm">
          <DialogTitle class="text-lg font-semibold text-[rgba(0,0,0,0.95)]">请选择知识库</DialogTitle>
          <DialogDescription class="mt-1 text-sm text-[#615d59]">
            发布前需要选择文档归属的知识库。
          </DialogDescription>
          <div class="mt-4 max-h-[320px] overflow-y-auto rounded-[8px] border border-[rgba(0,0,0,0.1)] bg-[#f6f5f4]">
            <button
              type="button"
              class="flex w-full items-center gap-3 border-b border-[rgba(0,0,0,0.06)] px-4 py-3 text-left transition-colors hover:bg-[rgba(0,0,0,0.03)] last:border-b-0"
              @click="pickGroup(0)"
            >
              <Layers class="h-4 w-4 shrink-0 text-[#a39e98]" />
              <span class="text-[14px] font-[500] text-[rgba(0,0,0,0.95)]">默认知识库</span>
            </button>
            <button
              v-for="g in workspaceStore.groups"
              :key="g.id"
              type="button"
              class="flex w-full items-center gap-3 border-b border-[rgba(0,0,0,0.06)] px-4 py-3 text-left transition-colors hover:bg-[rgba(0,0,0,0.03)] last:border-b-0"
              @click="pickGroup(g.id)"
            >
              <Layers class="h-4 w-4 shrink-0 text-[#a39e98]" />
              <span class="text-[14px] font-[500] text-[rgba(0,0,0,0.95)]">{{ g.name }}</span>
            </button>
          </div>
          <div class="mt-4 flex justify-end">
            <DialogClose as-child>
              <button type="button" class="h-9 rounded-[6px] border border-[rgba(0,0,0,0.1)] px-4 text-[13px] font-[500] text-[#615d59] transition-colors hover:bg-[rgba(0,0,0,0.04)] outline-none">
                取消
              </button>
            </DialogClose>
          </div>
        </DialogContent>
      </DialogPortal>
    </DialogRoot>
  </PageShell>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { watchDebounced } from '@vueuse/core'
import { onBeforeRouteLeave, useRoute, useRouter } from 'vue-router'
import { LoaderCircle, CloudUpload, ArrowLeft, Globe, Trash2, Tags, Check, Plus, Maximize, Minimize, Layers, ChevronDown, FileUp, Columns2, PanelsTopLeft, Sparkles } from 'lucide-vue-next'
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuRoot,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from 'radix-vue'
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
} from 'radix-vue'
import {
  PopoverArrow,
  PopoverContent,
  PopoverPortal,
  PopoverRoot,
  PopoverTrigger,
} from 'radix-vue'
import { createSnippet, getSnippet, updateSnippet, deleteSnippet, setSnippetTags, moveSnippet, getSnippetTemplate } from '@/api/snippet'
import { createShare } from '@/api/share'
import { confirm } from '@/composables/useConfirmDialog'
import { toast } from '@/composables/useToast'
import { useWorkspaceStore } from '@/stores/workspace'
import { isSameId } from '@clients/shared'
import { pickMarkdownFile } from '@/composables/useImportExport'
import PageShell from '@/components/layout/PageShell.vue'
import MilkdownEditor from '@/components/editor/MilkdownEditor.vue'
import TableOfContents from '@/components/editor/TableOfContents.vue'
import { useAIPolling } from '@/composables/useAIPolling'

const route = useRoute()
const router = useRouter()
const workspaceStore = useWorkspaceStore()

const loading = ref(false)
const saving = ref(false)
const sharing = ref(false)
const newTagName = ref('')

const snippetId = computed(() => (route.params.id as string) || '')
const isEditMode = computed(() => Boolean(snippetId.value))

const originalGroupId = ref<number | string>(0)

const form = reactive({
  title: '',
  content: '',
  language: 'markdown',
  group_id: null as string | number | null,
  tag_ids: [] as (string | number)[],
})

const charCount = computed(() => form.content.length)

const focusMode = ref(false)
const toc = ref<any[]>([])
const saveStatus = ref<'idle' | 'saving' | 'saved'>('idle')
const autoSaveEnabled = ref(false) // 默认关闭，让用户自行决定是否开启
const editorMode = ref<'wysiwyg' | 'split'>('wysiwyg')
const sourceTextareaRef = ref<HTMLTextAreaElement | null>(null)
let saveStatusTimer: any = null
const initialLoadDone = ref(false)

// AI Polling
const { status: aiPollingStatus, metadata: aiPollingMeta, startPolling: startAIPolling, statusLabel: aiStatusLabelFn } = useAIPolling()
const aiStatusLabel = computed(() => aiStatusLabelFn())

// Watch for AI ready to show toast
watch(aiPollingStatus, (newStatus) => {
  if (newStatus === 'ready' && aiPollingMeta.value) {
    const tagCount = aiPollingMeta.value.suggested_tags.length
    const hasSummary = !!aiPollingMeta.value.summary
    const parts: string[] = []
    if (tagCount) parts.push(`${tagCount} 个标签建议`)
    if (hasSummary) parts.push('1 条摘要')
    if (parts.length) {
      toast.success(`AI 分析完成：生成了 ${parts.join('和 ')}`)
    }
  }
})

const draftKey = computed(() => `go-note-draft-${snippetId.value || 'new'}`)
const editorModeKey = 'go-note-editor-mode'
const hasUnsavedChanges = ref(false)
const showGroupPicker = ref(false)

const toggleEditorMode = () => {
  editorMode.value = editorMode.value === 'split' ? 'wysiwyg' : 'split'
}

const resizeSourceTextarea = () => {
  const el = sourceTextareaRef.value
  if (!el || editorMode.value !== 'split') return
  el.style.height = 'auto'
  el.style.height = `${Math.max(el.scrollHeight, 480)}px`
}

const checkLocalDraft = () => {
  const legacyKey = `go_note_draft_${snippetId.value || 'new'}`
  const legacy = localStorage.getItem(legacyKey)
  if (legacy && !localStorage.getItem(draftKey.value)) {
    localStorage.setItem(draftKey.value, legacy)
    localStorage.removeItem(legacyKey)
  }
  const raw = localStorage.getItem(draftKey.value)
  if (raw) {
    try {
      const draft = JSON.parse(raw)
      if (draft.content !== form.content || draft.title !== form.title) {
        form.title = draft.title
        form.content = draft.content
        if (draft.group_id !== undefined) form.group_id = draft.group_id
        if (draft.tag_ids) form.tag_ids = draft.tag_ids
        toast.info('您有一份未发布的本地修改草稿，已自动恢复')
        autoSaveEnabled.value = true // 既然有草稿，顺带帮用户开启本地暂存
      } else {
        localStorage.removeItem(draftKey.value)
      }
    } catch (e) {
      localStorage.removeItem(draftKey.value)
    }
  }
}

const loadSnippet = async () => {
  if (!workspaceStore.groups.length) {
    workspaceStore.fetchGroups().catch(() => {})
  }

  if (!isEditMode.value) {
    const defaultGroupId = route.query.group_id as string
    if (defaultGroupId && defaultGroupId !== '0') {
      form.group_id = parseInt(defaultGroupId, 10)
    } else {
      form.group_id = null
    }

    const templateId = route.query.template_id as string
    if (templateId) {
      loading.value = true
      try {
        const template = await getSnippetTemplate(templateId)
        form.title = template.name
        form.content = template.content
        if (template.language) form.language = template.language
      } catch (err) {
        toast.error('加载模板失败')
      } finally {
        loading.value = false
      }
    } else if (route.query.from_import === '1') {
      // 从 HomeView/外部导入：读取 sessionStorage 中的文件内容
      const raw = sessionStorage.getItem('go-note-import')
      if (raw) {
        try {
          const data = JSON.parse(raw)
          form.title = data.title || ''
          form.content = data.content || ''
          toast.success('文件内容已导入，请检查后发布')
        } catch {}
        sessionStorage.removeItem('go-note-import')
      }
    } else if (route.query.from_draft === '1') {
      checkLocalDraft()
    }
    setTimeout(() => { initialLoadDone.value = true }, 500)
    return
  }

  loading.value = true
  try {
    const snippet = await getSnippet(snippetId.value)
    form.title = snippet.title
    form.content = snippet.content
    form.language = snippet.language
    form.group_id = snippet.group_id ?? 0
    form.tag_ids = snippet.tag_ids ?? []
    originalGroupId.value = form.group_id as string | number
    
    checkLocalDraft()
    
    setTimeout(() => { initialLoadDone.value = true }, 500)
  } catch (err) {
    toast.error(err instanceof Error ? err.message : '加载失败')
    router.replace('/workspace')
  } finally {
    loading.value = false
  }
}

// 校验暂存/发布所需的最小字段；暂存和云端发布共用。
// 返回错误信息或 null。autosave 模式下调用方应静默忽略。
const validateForm = (): string | null => {
  if (!form.title.trim()) return '请输入标题'
  if (!form.content.trim()) return '请输入正文'
  if (form.group_id === null || form.group_id === undefined) return '请选择所属知识库'
  return null
}

const canSave = computed(() => validateForm() === null)

const saveLocalDraft = (isManual = false) => {
  const err = validateForm()
  if (err) {
    if (isManual) toast.warning(err)
    return
  }
  saveStatus.value = 'saving'
  const draft = {
    title: form.title,
    content: form.content,
    group_id: form.group_id,
    tag_ids: form.tag_ids,
    timestamp: Date.now()
  }
  localStorage.setItem(draftKey.value, JSON.stringify(draft))
  hasUnsavedChanges.value = false
  
  saveStatus.value = 'saved'
  if (isManual) {
    toast.success('草稿已暂存至本机浏览器')
  }
  
  if (saveStatusTimer) clearTimeout(saveStatusTimer)
  saveStatusTimer = setTimeout(() => {
    saveStatus.value = 'idle'
  }, 2500)
}

const saveSnippet = async (isAutoSave = false) => {
  if (isAutoSave) {
    saveLocalDraft()
    return
  }

  // 校验标题和正文
  if (!form.title.trim()) { toast.warning('请输入标题'); return }
  if (!form.content.trim()) { toast.warning('请输入正文'); return }

  // 未选知识库 → 弹出选择弹窗
  if (form.group_id === null || form.group_id === undefined) {
    showGroupPicker.value = true
    return
  }

  const groupId = form.group_id as string | number
  saving.value = true
  try {
    if (isEditMode.value) {
      const updated = await updateSnippet(snippetId.value, {
        title: form.title,
        content: form.content,
        language: form.language,
        group_id: groupId,
        tag_ids: form.tag_ids,
      })
      await setSnippetTags(snippetId.value, { tag_ids: form.tag_ids })

      if (groupId !== originalGroupId.value) {
        try {
          await moveSnippet(snippetId.value, { group_id: groupId })
          originalGroupId.value = groupId
        } catch (e) {
          toast.warning('文档内容已更新，但分组修改失败')
        }
      }

      localStorage.removeItem(draftKey.value)
      hasUnsavedChanges.value = false
      toast.success('更新成功')
      // Start AI polling after successful cloud save
      startAIPolling(snippetId.value)
      router.replace(`/snippets/${updated.id}`)
    } else {
      const created = await createSnippet({
        title: form.title,
        content: form.content,
        language: form.language,
        group_id: groupId,
        tag_ids: form.tag_ids,
      })
      await setSnippetTags(created.id, { tag_ids: form.tag_ids })
      
      localStorage.removeItem(draftKey.value)
      hasUnsavedChanges.value = false
      toast.success('创建成功')
      // Start AI polling for newly created snippet
      startAIPolling(created.id)
      router.replace(`/snippets/${created.id}`)
    }
  } catch (err) {
    toast.error(err instanceof Error ? err.message : '保存失败')
  } finally {
    saving.value = false
  }
}

watch(() => [form.title, form.content, form.group_id, form.tag_ids], () => {
  if (initialLoadDone.value && !saving.value) {
    hasUnsavedChanges.value = true
  }
}, { deep: true })

watchDebounced(() => [form.content, form.title], (newVal) => {
  if (initialLoadDone.value && autoSaveEnabled.value && hasUnsavedChanges.value) {
     saveLocalDraft()
  }
}, { deep: true, debounce: 2000, maxWait: 8000 })

onBeforeRouteLeave(async (to, from) => {
  if (hasUnsavedChanges.value && saveStatus.value !== 'saved') {
    const answer = await confirm({
      title: '未保存的编辑内容',
      description: '当前文档有尚未覆盖到草稿箱或云端的修改，强行离开会丢失这些改动。确定要离开吗？',
      tone: 'danger',
      confirmText: '强制离开',
      cancelText: '留在此页'
    })
    if (!answer) return false
  }
})

const toggleTag = (id: number | string) => {
  const idx = form.tag_ids.findIndex(item => isSameId(item, id))
  if (idx === -1) {
    form.tag_ids.push(String(id))
  } else {
    form.tag_ids.splice(idx, 1)
  }
}

const handleCreateTag = async () => {
  const name = newTagName.value.trim()
  if (!name) return
  
  try {
    const created = await workspaceStore.addTag({ name })
    newTagName.value = ''
    toggleTag(created.id)
    toast.success('新增标签成功')
  } catch (e: any) {
    toast.error(e.message || '创建标签失败')
  }
}

const handleDelete = async () => {
  const accepted = await confirm({
    title: '删除文档',
    description: `确定要删除文档"${form.title || '未命名文档'}"吗？此操作不可逆。`,
    confirmText: '删除',
    cancelText: '取消',
    tone: 'danger',
  })

  if (!accepted) {
    return
  }

  try {
    await deleteSnippet(snippetId.value)
    toast.success('文档已删除')
    router.replace('/workspace')
  } catch (e) {
    toast.error(e instanceof Error ? e.message : '删除失败')
  }
}

const handleShare = async () => {
  if (!snippetId.value) {
    toast.warning('请先发布文档后再创建分享链接')
    return
  }

  const passwordInput = window.prompt('为分享链接设置密码（可留空）', '')
  if (passwordInput === null) {
    return
  }

  const expiryInput = window.prompt('设置有效分钟数（可留空，例如 60）', '')
  if (expiryInput === null) {
    return
  }

  let expiresAt: string | undefined
  const trimmedExpiry = expiryInput.trim()
  if (trimmedExpiry) {
    const minutes = Number(trimmedExpiry)
    if (!Number.isFinite(minutes) || minutes <= 0) {
      toast.warning('有效分钟数需要是大于 0 的数字')
      return
    }
    expiresAt = new Date(Date.now() + minutes * 60 * 1000).toISOString()
  }

  sharing.value = true
  try {
    const share = await createShare({
      snippet_id: snippetId.value,
      kind: 'article',
      password: passwordInput.trim() || undefined,
      expires_at: expiresAt,
    })
    const shareURL = `${window.location.origin}/s/${share.token}`
    await navigator.clipboard.writeText(shareURL)
    toast.success('分享链接已生成并复制到剪贴板')
  } catch (err) {
    toast.error(err instanceof Error ? err.message : '创建分享失败')
  } finally {
    sharing.value = false
  }
}

const handleImportFile = async () => {
  const file = await pickMarkdownFile()
  if (!file) return
  form.title = file.title
  form.content = file.content
  toast.success('文件内容已导入，请检查后发布')
}

const pickGroup = (id: string | number) => {
  form.group_id = id
  showGroupPicker.value = false
  // 选完知识库后自动继续发布
  saveSnippet(false)
}

const goBack = () => {
  if (isEditMode.value) {
    router.push(`/snippets/${snippetId.value}`)
    return
  }
  router.push('/workspace')
}

const handleKeydown = (e: KeyboardEvent) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
    e.preventDefault()
    if (!saving.value && initialLoadDone.value) {
      saveLocalDraft(true)
    }
  }
}

const handleSourceTab = (e: KeyboardEvent) => {
  const target = e.target as HTMLTextAreaElement | null
  if (!target) return
  const start = target.selectionStart
  const end = target.selectionEnd
  const nextValue = `${form.content.slice(0, start)}  ${form.content.slice(end)}`
  form.content = nextValue

  requestAnimationFrame(() => {
    target.selectionStart = start + 2
    target.selectionEnd = start + 2
    resizeSourceTextarea()
  })
}

const handleBeforeUnload = (e: BeforeUnloadEvent) => {
  if (hasUnsavedChanges.value && saveStatus.value !== 'saved') {
    e.preventDefault()
    e.returnValue = ''
  }
}

onMounted(() => {
  const savedEditorMode = localStorage.getItem(editorModeKey)
  if (savedEditorMode === 'split' || savedEditorMode === 'wysiwyg') {
    editorMode.value = savedEditorMode
  }
  loadSnippet()
  nextTick(() => {
    resizeSourceTextarea()
  })
  window.addEventListener('keydown', handleKeydown)
  window.addEventListener('beforeunload', handleBeforeUnload)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  window.removeEventListener('beforeunload', handleBeforeUnload)
})

watch(editorMode, (mode) => {
  localStorage.setItem(editorModeKey, mode)
  nextTick(() => {
    resizeSourceTextarea()
  })
})

watch(() => form.content, () => {
  nextTick(() => {
    resizeSourceTextarea()
  })
})
</script>

<style scoped>
.editor-split-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 1rem;
}

.editor-pane {
  min-width: 0;
  min-height: 60vh;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 16px;
  background:
    linear-gradient(180deg, rgba(246, 245, 244, 0.9), rgba(255, 255, 255, 0.92));
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.editor-pane__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.85rem 1rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: #615d59;
  background: rgba(255, 255, 255, 0.72);
}

.editor-source-textarea {
  width: 100%;
  min-height: calc(60vh - 52px);
  padding: 1.1rem 1rem 1.4rem;
  border: 0;
  outline: 0;
  resize: none;
  overflow: hidden;
  background: transparent;
  color: rgba(0, 0, 0, 0.92);
  font-family: 'SFMono-Regular', 'SF Mono', 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 14px;
  line-height: 1.75;
  tab-size: 2;
}

.editor-preview-panel {
  min-height: calc(60vh - 52px);
  padding: 0.25rem 0;
}

@media (max-width: 1024px) {
  .editor-split-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .editor-pane,
  .editor-source-textarea,
  .editor-preview-panel {
    min-height: 46vh;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
