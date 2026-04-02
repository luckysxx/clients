<template>
  <div class="workspace-home">
    <section class="quick-actions">
      <button
        v-for="action in quickActions"
        :key="action.title"
        type="button"
        class="action-card"
        @click="action.action"
      >
        <span class="action-icon" :class="action.iconClass">
          <el-icon><component :is="action.icon" /></el-icon>
        </span>
        <span class="action-copy">
          <strong>{{ action.title }}</strong>
          <small>{{ action.description }}</small>
        </span>
        <el-icon class="action-arrow"><ArrowDown /></el-icon>
      </button>
    </section>

    <section class="document-panel">
      <div class="panel-head">
        <div class="panel-tabs">
          <button
            v-for="tab in tabs"
            :key="tab.label"
            type="button"
            class="tab-button"
            :class="{ 'is-active': tab.active }"
            @click="tab.action"
          >
            {{ tab.label }}
          </button>
        </div>

        <div class="panel-tools">
          <button type="button" class="tool-button" @click="showFutureFeature('筛选')">
            <el-icon><Filter /></el-icon>
            <span>筛选</span>
          </button>
          <button type="button" class="tool-button" @click="showFutureFeature('显示设置')">
            <el-icon><Setting /></el-icon>
            <span>显示设置</span>
          </button>
          <div class="view-switch">
            <button type="button" class="view-button is-active">
              列表
            </button>
            <button type="button" class="view-button" @click="showFutureFeature('卡片视图')">
              卡片
            </button>
          </div>
        </div>
      </div>

      <template v-if="loading">
        <div class="loading-panel">
          <el-skeleton :rows="7" animated />
        </div>
      </template>

      <el-result v-else-if="error" icon="warning" title="加载失败" :sub-title="error" class="state-panel">
        <template #extra>
          <el-button type="primary" @click="fetchSnippets">重试</el-button>
        </template>
      </el-result>

      <div v-else-if="visibleSnippets.length === 0" class="empty-panel">
        <div class="empty-badge">
          <el-icon><Files /></el-icon>
        </div>
        <h3>{{ keyword ? '没有匹配的文档' : '还没有文档' }}</h3>
        <p>
          {{ keyword ? '换个关键词试试，或者直接创建一个新的代码文档。' : '创建你的第一份代码文档，工作区就会显示在这里。' }}
        </p>
        <el-button type="primary" @click="router.push('/snippets/new')">新建文档</el-button>
      </div>

      <div v-else class="document-table">
        <div class="table-head">
          <span>标题</span>
          <span>位置</span>
          <span>修改时间</span>
          <span>创建时间</span>
          <span></span>
        </div>

        <div
          v-for="snippet in visibleSnippets"
          :key="snippet.id"
          class="table-row"
          role="button"
          tabindex="0"
          @click="openSnippet(snippet.id)"
          @keydown.enter.prevent="openSnippet(snippet.id)"
        >
          <span class="cell title-cell">
            <span class="file-icon" :class="languageClass(snippet.language)">
              {{ languageAbbr(snippet.language) }}
            </span>
            <span class="file-copy">
              <strong>{{ snippet.title }}</strong>
              <small>{{ snippet.language }} · {{ snippet.visibility === 'public' ? '公开文档' : '私有文档' }}</small>
            </span>
          </span>
          <span class="cell muted-cell">{{ locationLabel(snippet) }}</span>
          <span class="cell muted-cell">{{ formatRelativeDate(snippet.updated_at) }}</span>
          <span class="cell muted-cell">{{ formatAbsoluteDate(snippet.created_at) }}</span>
          <span class="cell row-action">
            <button
              type="button"
              class="row-more"
              @click.stop="openSnippet(snippet.id)"
            >
              <el-icon><MoreFilled /></el-icon>
            </button>
          </span>
        </div>

        <div class="table-end">
          <span class="end-line"></span>
          <span>已经到底了</span>
          <span class="end-line"></span>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  ArrowDown,
  CollectionTag,
  Files,
  Filter,
  MoreFilled,
  Plus,
  Setting,
  UploadFilled,
} from '@element-plus/icons-vue'
import { listMySnippets, type Snippet } from '@/api/snippet'

const router = useRouter()
const route = useRoute()
const loading = ref(false)
const error = ref('')
const snippets = ref<Snippet[]>([])

const keyword = computed(() => {
  if (typeof route.query.q !== 'string') {
    return ''
  }
  return route.query.q.trim().toLowerCase()
})

const visibleSnippets = computed(() => {
  const filtered = keyword.value
    ? snippets.value.filter((item) => item.title.toLowerCase().includes(keyword.value))
    : snippets.value

  return [...filtered].sort((left, right) => {
    const leftTime = new Date(left.updated_at).getTime()
    const rightTime = new Date(right.updated_at).getTime()
    return rightTime - leftTime
  })
})

const quickActions = [
  {
    title: '新建',
    description: '新建文档开始协作',
    icon: Plus,
    iconClass: 'is-create',
    action: () => router.push('/snippets/new'),
  },
  {
    title: '上传',
    description: '上传本地代码文件',
    icon: UploadFilled,
    iconClass: 'is-upload',
    action: () => showFutureFeature('上传本地文件'),
  },
  {
    title: '模板库',
    description: '选择模板快速新建',
    icon: CollectionTag,
    iconClass: 'is-template',
    action: () => showFutureFeature('模板库'),
  },
]

const tabs = [
  { label: '最近访问', active: false, action: () => showFutureFeature('最近访问') },
  { label: '归我所有', active: true, action: () => undefined },
  { label: '与我共享', active: false, action: () => showFutureFeature('与我共享') },
  { label: '收藏', active: false, action: () => showFutureFeature('收藏') },
  { label: '+', active: false, action: () => showFutureFeature('自定义分组') },
]

const fetchSnippets = async () => {
  loading.value = true
  error.value = ''
  try {
    snippets.value = await listMySnippets()
  } catch (err) {
    snippets.value = []
    error.value = err instanceof Error ? err.message : '无法加载你的代码片段'
  } finally {
    loading.value = false
  }
}

const openSnippet = (id: string | number) => {
  router.push(`/snippets/${id}`)
}

const showFutureFeature = (label: string) => {
  ElMessage.info(`${label} 功能稍后接入`)
}

const languageAbbr = (language: string) => {
  return language.slice(0, 2).toUpperCase()
}

const languageClass = (language: string) => {
  const value = language.toLowerCase()
  if (['go', 'rs', 'rust'].includes(value)) return 'is-blue'
  if (['js', 'javascript', 'ts', 'typescript'].includes(value)) return 'is-yellow'
  if (['sql', 'json', 'yaml'].includes(value)) return 'is-orange'
  return 'is-purple'
}

const locationLabel = (snippet: Snippet) => {
  return snippet.visibility === 'public' ? '共享空间' : '我的云盘'
}

const formatAbsoluteDate = (value: string) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

const formatRelativeDate = (value: string) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const diffDays = Math.round((today.getTime() - target.getTime()) / 86400000)
  const time = new Intl.DateTimeFormat('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date)

  if (diffDays === 0) {
    return `今天 ${time}`
  }

  if (diffDays === 1) {
    return `昨天 ${time}`
  }

  if (date.getFullYear() === now.getFullYear()) {
    return new Intl.DateTimeFormat('zh-CN', {
      month: 'long',
      day: 'numeric',
    }).format(date)
  }

  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).format(date)
}

onMounted(() => {
  fetchSnippets()
})
</script>

<style scoped lang="scss">
.workspace-home {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.action-card {
  padding: 18px 20px;
  border: 1px solid var(--line);
  border-radius: var(--radius-card);
  background: var(--surface);
  box-shadow: var(--shadow-card);
  display: flex;
  align-items: center;
  gap: 14px;
  text-align: left;
  cursor: pointer;
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    border-color 0.18s ease;
}

.action-card:hover {
  transform: translateY(-2px);
  border-color: rgba(54, 98, 236, 0.24);
  box-shadow: 0 14px 34px rgba(54, 98, 236, 0.08);
}

.action-icon {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.action-icon.is-create {
  background: var(--brand-soft);
  color: var(--brand);
}

.action-icon.is-upload {
  background: var(--orange-soft);
  color: var(--orange-main);
}

.action-icon.is-template {
  background: var(--yellow-soft);
  color: var(--yellow-main);
}

.action-copy {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.action-copy strong {
  font-size: 15px;
}

.action-copy small {
  color: var(--text-secondary);
  font-size: 13px;
}

.action-arrow {
  color: var(--text-tertiary);
}

.document-panel {
  padding: 10px 0 0;
}

.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 14px;
}

.panel-tabs {
  display: flex;
  align-items: center;
  gap: 18px;
  flex-wrap: wrap;
}

.tab-button,
.tool-button,
.view-button,
.table-row,
.row-more {
  border: 0;
  background: transparent;
  font: inherit;
}

.tab-button {
  padding: 6px 0;
  color: var(--text-secondary);
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
}

.tab-button.is-active {
  color: var(--brand);
}

.panel-tools {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.tool-button {
  min-height: 38px;
  padding: 0 12px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--text-secondary);
  cursor: pointer;
}

.tool-button:hover {
  background: var(--surface-muted);
}

.view-switch {
  padding: 4px;
  border-radius: 14px;
  background: var(--surface);
  box-shadow: inset 0 0 0 1px rgba(231, 235, 243, 0.95);
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.view-button {
  min-width: 56px;
  height: 32px;
  border-radius: 10px;
  color: var(--text-secondary);
  cursor: pointer;
}

.view-button.is-active {
  background: var(--brand-soft);
  color: var(--brand);
  font-weight: 700;
}

.loading-panel,
.state-panel,
.empty-panel {
  border-radius: var(--radius-card);
  background: var(--surface);
  box-shadow: var(--shadow-card);
}

.loading-panel {
  padding: 26px;
}

.empty-panel {
  min-height: 360px;
  padding: 48px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.empty-badge {
  width: 64px;
  height: 64px;
  border-radius: 22px;
  background: var(--brand-soft);
  color: var(--brand);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  margin-bottom: 14px;
}

.empty-panel h3 {
  margin: 0;
  font-size: 22px;
}

.empty-panel p {
  max-width: 420px;
  margin: 10px 0 20px;
  color: var(--text-secondary);
  line-height: 1.7;
}

.document-table {
  overflow: hidden;
  border-radius: var(--radius-card);
  background: rgba(255, 255, 255, 0.72);
}

.table-head,
.table-row {
  display: grid;
  grid-template-columns: minmax(320px, 1.8fr) minmax(140px, 0.6fr) minmax(160px, 0.7fr) minmax(160px, 0.7fr) 60px;
  align-items: center;
  gap: 16px;
}

.table-head {
  min-height: 52px;
  padding: 0 10px 0 8px;
  color: var(--text-secondary);
  font-size: 15px;
  font-weight: 700;
}

.table-row {
  width: 100%;
  min-height: 76px;
  padding: 0 10px 0 8px;
  border-top: 1px solid var(--line);
  text-align: left;
  cursor: pointer;
  transition: background-color 0.18s ease;
}

.table-row:hover {
  background: rgba(54, 98, 236, 0.04);
}

.cell {
  min-width: 0;
}

.title-cell {
  display: flex;
  align-items: center;
  gap: 14px;
}

.file-icon {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.04em;
  color: #fff;
  flex-shrink: 0;
}

.file-icon.is-blue {
  background: linear-gradient(135deg, #60a5fa 0%, #2563eb 100%);
}

.file-icon.is-yellow {
  background: linear-gradient(135deg, #fbbf24 0%, #f97316 100%);
}

.file-icon.is-orange {
  background: linear-gradient(135deg, #fb923c 0%, #ea580c 100%);
}

.file-icon.is-purple {
  background: linear-gradient(135deg, #c084fc 0%, #8b5cf6 100%);
}

.file-copy {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.file-copy strong,
.muted-cell {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-copy strong {
  font-size: 16px;
}

.file-copy small,
.muted-cell {
  color: var(--text-secondary);
  font-size: 14px;
}

.row-action {
  display: flex;
  justify-content: flex-end;
}

.row-more {
  width: 34px;
  height: 34px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  cursor: pointer;
}

.row-more:hover {
  background: var(--surface-muted);
}

.table-end {
  padding: 36px 0 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  color: var(--text-tertiary);
}

.end-line {
  width: 80px;
  height: 1px;
  background: var(--line-strong);
}

@media (max-width: 1100px) {
  .quick-actions {
    grid-template-columns: 1fr;
  }

  .panel-head {
    flex-direction: column;
    align-items: flex-start;
  }

  .document-table {
    overflow-x: auto;
  }

  .table-head,
  .table-row {
    min-width: 860px;
  }
}

@media (max-width: 720px) {
  .panel-tabs {
    gap: 14px;
  }

  .tab-button {
    font-size: 15px;
  }

  .tool-button span {
    display: none;
  }
}
</style>
