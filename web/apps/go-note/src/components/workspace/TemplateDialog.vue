<template>
  <DialogRoot v-model:open="open">
    <DialogPortal>
      <DialogOverlay class="template-dialog-overlay" />
      <DialogContent class="template-dialog-content">
        <div class="template-dialog-header">
          <DialogTitle class="template-dialog-title">从模板创建</DialogTitle>
          <DialogDescription class="template-dialog-desc">选择一个模板快速创建文档</DialogDescription>
          <DialogClose class="template-dialog-close">
            <X class="h-4 w-4" />
          </DialogClose>
        </div>

        <!-- Category tabs -->
        <div class="template-dialog-tabs">
          <button
            v-for="cat in categories"
            :key="cat.value"
            type="button"
            class="template-tab"
            :class="{ active: activeCategory === cat.value }"
            @click="activeCategory = cat.value"
          >
            {{ cat.label }}
          </button>
        </div>

        <!-- Template list -->
        <div class="template-dialog-body">
          <div v-if="loading" class="template-loading">
            <LoaderCircle class="h-5 w-5 animate-spin text-[#a39e98]" />
            <span>加载模板…</span>
          </div>

          <div v-else-if="filteredTemplates.length === 0" class="template-empty">
            <FileText class="h-8 w-8 text-[#d5d0cc]" />
            <p>该分类下暂无模板</p>
          </div>

          <div v-else class="template-grid">
            <button
              v-for="tpl in filteredTemplates"
              :key="tpl.id"
              type="button"
              class="template-card"
              :class="{ selected: selectedId === tpl.id }"
              @click="selectedId = tpl.id"
              @dblclick="handleConfirm"
            >
              <div class="template-card-header">
                <span class="template-card-name">{{ tpl.name }}</span>
                <span v-if="tpl.is_system" class="template-card-badge">系统</span>
              </div>
              <p v-if="tpl.description" class="template-card-desc">{{ tpl.description }}</p>
              <div class="template-card-meta">
                <span class="template-card-lang">{{ tpl.language }}</span>
              </div>
            </button>
          </div>
        </div>

        <!-- Footer -->
        <div class="template-dialog-footer">
          <DialogClose as-child>
            <button type="button" class="ui-button ui-button-secondary">取消</button>
          </DialogClose>
          <button
            type="button"
            class="ui-button ui-button-primary"
            :disabled="!selectedId"
            @click="handleConfirm"
          >
            使用模板
          </button>
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { X, LoaderCircle, FileText } from 'lucide-vue-next'
import {
  DialogRoot,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from 'radix-vue'
import { listSnippetTemplates, type SnippetTemplate } from '@/api/snippet'
import { useWorkspaceStore } from '@/stores/workspace'

const open = defineModel<boolean>('open', { default: false })
const router = useRouter()
const route = useRoute()
const workspaceStore = useWorkspaceStore()

const loading = ref(false)
const templates = ref<SnippetTemplate[]>([])
const activeCategory = ref('')
const selectedId = ref<string | number | null>(null)

const categories = [
  { value: '', label: '全部' },
  { value: 'meeting', label: '会议' },
  { value: 'tech_design', label: '技术方案' },
  { value: 'weekly_report', label: '周报' },
  { value: 'general', label: '通用' },
]

const filteredTemplates = computed(() => {
  if (!activeCategory.value) return templates.value
  return templates.value.filter(t => t.category === activeCategory.value)
})

const fetchTemplates = async () => {
  loading.value = true
  try {
    templates.value = await listSnippetTemplates()
  } catch {
    templates.value = []
  } finally {
    loading.value = false
  }
}

const handleConfirm = () => {
  const tpl = templates.value.find(t => t.id === selectedId.value)
  if (tpl) {
    workspaceStore.templateDialogOpen = false
    router.push({
      path: '/snippets/new',
      query: {
        template_id: tpl.id,
        group_id: route.query.group_id // 继承当前环境的 group
      }
    })
  }
}

watch(open, (isOpen) => {
  if (isOpen) {
    selectedId.value = null
    activeCategory.value = ''
    fetchTemplates()
  }
})
</script>

<style scoped>
.template-dialog-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(4px);
  z-index: 50;
  animation: fadeIn 150ms ease;
}

.template-dialog-content {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 51;
  width: min(560px, calc(100vw - 48px));
  max-height: calc(100vh - 80px);
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  animation: scaleIn 200ms cubic-bezier(0.16, 1, 0.3, 1);
}

.template-dialog-header {
  position: relative;
  padding: 24px 24px 0;
}

.template-dialog-title {
  font-size: 18px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.95);
}

.template-dialog-desc {
  font-size: 13px;
  color: #a39e98;
  margin-top: 4px;
}

.template-dialog-close {
  position: absolute;
  top: 20px;
  right: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: #a39e98;
  cursor: pointer;
  transition: all 150ms;
}

.template-dialog-close:hover {
  background: rgba(0, 0, 0, 0.06);
  color: rgba(0, 0, 0, 0.7);
}

.template-dialog-tabs {
  display: flex;
  gap: 4px;
  padding: 16px 24px 0;
  overflow-x: auto;
}

.template-tab {
  padding: 6px 14px;
  border-radius: 20px;
  border: none;
  background: transparent;
  font-size: 13px;
  font-weight: 500;
  color: #615d59;
  cursor: pointer;
  transition: all 150ms;
  white-space: nowrap;
}

.template-tab:hover {
  background: rgba(0, 0, 0, 0.05);
}

.template-tab.active {
  background: rgba(0, 0, 0, 0.08);
  color: rgba(0, 0, 0, 0.95);
}

.template-dialog-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px 24px;
  min-height: 200px;
}

.template-loading,
.template-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: 180px;
  color: #a39e98;
  font-size: 14px;
}

.template-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.template-card {
  text-align: left;
  width: 100%;
  padding: 14px 16px;
  border-radius: 12px;
  border: 1.5px solid rgba(0, 0, 0, 0.06);
  background: #fafaf9;
  cursor: pointer;
  transition: all 150ms;
}

.template-card:hover {
  border-color: rgba(0, 0, 0, 0.12);
  background: #f5f4f3;
}

.template-card.selected {
  border-color: #0075de;
  background: rgba(0, 117, 222, 0.04);
  box-shadow: 0 0 0 1px rgba(0, 117, 222, 0.2);
}

.template-card-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.template-card-name {
  font-size: 14px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.95);
}

.template-card-badge {
  font-size: 11px;
  padding: 1px 8px;
  border-radius: 10px;
  background: rgba(0, 117, 222, 0.08);
  color: #0075de;
  font-weight: 500;
}

.template-card-desc {
  font-size: 13px;
  color: #615d59;
  margin-top: 4px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.template-card-meta {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.template-card-lang {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.05);
  color: #615d59;
  font-weight: 500;
}

.template-dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 16px 24px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scaleIn {
  from { opacity: 0; transform: translate(-50%, -50%) scale(0.96); }
  to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
}
</style>
