<template>
  <div class="flex h-[calc(100vh-3rem)] flex-col overflow-hidden bg-white">
    <div class="min-h-0 flex-1 overflow-y-auto app-scrollbar">
      <div class="mx-auto w-full max-w-[960px] px-8 py-10">

        <!-- ── Hero Greeting ── -->
        <section class="mb-10">
          <p class="text-[11px] font-[600] uppercase tracking-[0.05em] text-[#a39e98] mb-3">Dashboard</p>
          <h1 class="text-[32px] font-[700] tracking-[-1px] text-[rgba(0,0,0,0.95)] leading-tight">{{ greeting }}</h1>
          <p class="mt-2 text-[15px] text-[#615d59] leading-relaxed">{{ todayDate }}</p>
          <p class="mt-1 text-[13px] text-[#a39e98] italic">{{ dailyTip }}</p>
        </section>

        <!-- ── Quick Actions ── -->
        <section class="mb-10">
          <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <button
              v-for="action in quickActions"
              :key="action.title"
              type="button"
              class="group flex flex-col items-center gap-2.5 rounded-[12px] border border-[rgba(0,0,0,0.1)] bg-white px-4 py-5 shadow-soft outline-none transition-all duration-200 hover:shadow-deep hover:scale-[1.02] active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[#097fe8]"
              @click="action.handler"
            >
              <div class="flex h-10 w-10 items-center justify-center rounded-[8px] transition-colors duration-200" :class="action.iconBg">
                <component :is="action.icon" class="h-5 w-5" :class="action.iconColor" />
              </div>
              <span class="text-[13px] font-[600] text-[rgba(0,0,0,0.95)]">{{ action.title }}</span>
              <span class="text-[11px] text-[#a39e98] leading-tight text-center">{{ action.desc }}</span>
            </button>
          </div>
        </section>

        <!-- ── Stats Overview ── -->
        <section class="mb-10">
          <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div
              v-for="stat in stats"
              :key="stat.label"
              class="rounded-[12px] border border-[rgba(0,0,0,0.1)] bg-[#f6f5f4] px-4 py-4 cursor-pointer transition-all duration-200 hover:bg-white hover:shadow-soft"
              @click="stat.handler?.()"
            >
              <p class="text-[26px] font-[700] tracking-[-0.625px] text-[rgba(0,0,0,0.95)] leading-tight">{{ stat.value }}</p>
              <p class="mt-1 text-[12px] font-[500] text-[#615d59]">{{ stat.label }}</p>
            </div>
          </div>
        </section>

        <!-- ── Content: Recent + Favorites ── -->
        <section class="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <!-- Recent Documents -->
          <div class="rounded-[12px] border border-[rgba(0,0,0,0.1)] bg-white">
            <div class="flex items-center justify-between border-b border-[rgba(0,0,0,0.1)] px-5 py-3.5">
              <div class="flex items-center gap-2">
                <Clock class="h-4 w-4 text-[#a39e98]" />
                <span class="text-[13px] font-[600] text-[rgba(0,0,0,0.95)]">近期更新</span>
              </div>
              <button
                type="button"
                class="text-[12px] font-[500] text-[#0075de] transition-colors hover:text-[#005bab] outline-none"
                @click="router.push('/workspace')"
              >
                查看全部
              </button>
            </div>
            <div class="px-3 py-2">
              <SkeletonLoader v-if="recentLoading" variant="list" :lines="4" />

              <div v-else-if="recentError" class="py-8 text-center">
                <p class="text-[13px] text-[#615d59]">{{ recentError }}</p>
              </div>

              <div v-else-if="recentSnippets.length === 0" class="py-10 text-center">
                <div class="mx-auto flex h-10 w-10 items-center justify-center rounded-[8px] border border-[rgba(0,0,0,0.1)] bg-white shadow-soft">
                  <Files class="h-4.5 w-4.5 text-[#615d59]" />
                </div>
                <p class="mt-3 text-[14px] font-[600] text-[rgba(0,0,0,0.95)]">暂无近期文档</p>
                <p class="mt-1 text-[13px] text-[#a39e98]">创建或更新的文档会显示在这里</p>
              </div>

              <div v-else class="flex flex-col gap-0.5">
                <SnippetListItem
                  v-for="snippet in recentSnippets"
                  :key="snippet.id"
                  :snippet="snippet"
                  hide-actions
                  @click="(id) => router.push(`/snippets/${id}`)"
                />
              </div>
            </div>
          </div>

          <!-- Favorites -->
          <div class="rounded-[12px] border border-[rgba(0,0,0,0.1)] bg-white">
            <div class="flex items-center justify-between border-b border-[rgba(0,0,0,0.1)] px-5 py-3.5">
              <div class="flex items-center gap-2">
                <Star class="h-4 w-4 text-[#a39e98]" />
                <span class="text-[13px] font-[600] text-[rgba(0,0,0,0.95)]">我的收藏</span>
              </div>
              <button
                type="button"
                class="text-[12px] font-[500] text-[#0075de] transition-colors hover:text-[#005bab] outline-none"
                @click="router.push('/workspace/favorites')"
              >
                管理收藏
              </button>
            </div>
            <div class="px-3 py-2">
              <SkeletonLoader v-if="favLoading" variant="list" :lines="4" />

              <div v-else-if="favError" class="py-8 text-center">
                <p class="text-[13px] text-[#615d59]">{{ favError }}</p>
              </div>

              <div v-else-if="favSnippets.length === 0" class="py-10 text-center">
                <div class="mx-auto flex h-10 w-10 items-center justify-center rounded-[8px] border border-[rgba(0,0,0,0.1)] bg-white shadow-soft">
                  <Star class="h-4.5 w-4.5 text-[#615d59]" />
                </div>
                <p class="mt-3 text-[14px] font-[600] text-[rgba(0,0,0,0.95)]">暂无收藏</p>
                <p class="mt-1 text-[13px] text-[#a39e98]">点击文档右上角的 ★ 快速收藏</p>
              </div>

              <div v-else class="flex flex-col gap-0.5">
                <SnippetListItem
                  v-for="snippet in favSnippets"
                  :key="snippet.id"
                  :snippet="snippet"
                  hide-actions
                  @click="(id) => router.push(`/snippets/${id}`)"
                />
              </div>
            </div>
          </div>
        </section>

        <!-- Bottom spacer -->
        <div class="h-12"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  FileText,
  FolderPlus,
  LayoutTemplate,
  Sparkles,
  Files,
  Star,
  Clock,
} from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { useWorkspaceStore } from '@/stores/workspace'
import { listRecentSnippets, listFavoriteSnippets, type Snippet } from '@/api/snippet'
import SkeletonLoader from '@/components/ui/SkeletonLoader.vue'
import SnippetListItem from '@/components/workspace/SnippetListItem.vue'

const router = useRouter()
const authStore = useAuthStore()
const workspaceStore = useWorkspaceStore()

// ─── Loading states ───────────────────────────────────────────────
const recentLoading = ref(true)
const recentError = ref('')
const recentSnippets = ref<Snippet[]>([])

const favLoading = ref(true)
const favError = ref('')
const favSnippets = ref<Snippet[]>([])

// ─── Greeting logic ───────────────────────────────────────────────
const greeting = computed(() => {
  const hour = new Date().getHours()
  const name = authStore.user?.username || '朋友'
  if (hour < 5) return `夜深了，${name}`
  if (hour < 12) return `早上好，${name}`
  if (hour < 14) return `中午好，${name}`
  if (hour < 18) return `下午好，${name}`
  return `晚上好，${name}`
})

const todayDate = computed(() => {
  const opts: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric', weekday: 'long' }
  return new Date().toLocaleDateString('zh-CN', opts)
})

const tips = [
  '书写是最好的思考方式。',
  '将碎片想法整理成知识结构。',
  '好记性不如好笔头。',
  '记录今天，未来会感谢你。',
  '知识在于积累，灵感在于记录。',
  '用文档沉淀你的思考。',
  '每天一点记录，汇聚成知识海洋。',
]

const dailyTip = computed(() => {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  )
  return tips[dayOfYear % tips.length]
})

// ─── Quick Actions ────────────────────────────────────────────────
const quickActions = [
  {
    title: '新建文档',
    desc: '从空白页面开始',
    icon: FileText,
    iconBg: 'bg-[rgba(0,117,222,0.08)]',
    iconColor: 'text-[#0075de]',
    handler: () => router.push('/snippets/new'),
  },
  {
    title: '新建分组',
    desc: '组织你的知识库',
    icon: FolderPlus,
    iconBg: 'bg-[rgba(42,157,153,0.08)]',
    iconColor: 'text-[#2a9d99]',
    handler: () => {
      window.dispatchEvent(new CustomEvent('open-group-dialog'))
    },
  },
  {
    title: '模板中心',
    desc: '快速选用模板',
    icon: LayoutTemplate,
    iconBg: 'bg-[rgba(221,91,0,0.08)]',
    iconColor: 'text-[#dd5b00]',
    handler: () => {
      workspaceStore.templateDialogOpen = true
    },
  },
  {
    title: 'AI 助手',
    desc: '智能写作 (即将推出)',
    icon: Sparkles,
    iconBg: 'bg-[rgba(57,28,87,0.08)]',
    iconColor: 'text-[#391c57]',
    handler: () => {
      // Future AI capabilities
    },
  },
]

// ─── Stats ────────────────────────────────────────────────────────
const localDraftCount = computed(() => {
  let count = 0
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key?.startsWith('go-note-draft-')) count++
  }
  return count
})

const stats = computed(() => [
  {
    value: recentSnippets.value.length > 0 ? `${recentSnippets.value.length}+` : '0',
    label: '近期活跃文档',
    handler: () => router.push('/workspace'),
  },
  {
    value: String(workspaceStore.groups.length),
    label: '知识分组',
    handler: () => router.push('/workspace/groups'),
  },
  {
    value: String(favSnippets.value.length),
    label: '收藏文档',
    handler: () => router.push('/workspace/favorites'),
  },
  {
    value: String(localDraftCount.value),
    label: '本地草稿',
    handler: () => router.push('/workspace/drafts'),
  },
])

// ─── Data fetching ────────────────────────────────────────────────
onMounted(async () => {
  // Ensure workspace data is loaded
  if (!workspaceStore.groups.length) {
    workspaceStore.fetchGroups()
  }
  if (!workspaceStore.tags.length) {
    workspaceStore.fetchTags()
  }

  // Fetch recent snippets
  try {
    recentLoading.value = true
    const result = await listRecentSnippets({ limit: 6 })
    recentSnippets.value = Array.isArray(result) ? result : (result as any).snippets || []
  } catch (err: any) {
    recentError.value = err.message || '加载近期文档失败'
  } finally {
    recentLoading.value = false
  }

  // Fetch favorite snippets
  try {
    favLoading.value = true
    const result = await listFavoriteSnippets({ limit: 6 })
    favSnippets.value = Array.isArray(result) ? result : []
  } catch (err: any) {
    favError.value = err.message || '加载收藏失败'
  } finally {
    favLoading.value = false
  }
})
</script>
