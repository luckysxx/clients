<template>
  <article class="surface-panel p-5 sm:p-6">
    <div class="mb-6 flex justify-between items-start">
      <div>
        <p class="text-[11px] font-[600] uppercase tracking-[0.05em] text-[#a39e98]">Classification</p>
        <h2 class="mt-2 text-[22px] font-[700] tracking-[-0.25px] text-[rgba(0,0,0,0.95)]">标签设置</h2>
        <p class="mt-1 text-[14px] text-[#615d59]">统一管理色彩和名称，让你的文档系统更井井有条。</p>
      </div>
    </div>

    <!-- Create Tag -->
    <form @submit.prevent="handleCreateTag" class="mb-6 space-y-3">
      <div class="flex items-center gap-2">
        <input 
          v-model="newTagName"
          type="text" 
          placeholder="新建系统标签..." 
          class="ui-input flex-1"
          :disabled="loading"
        />
        <button type="submit" class="ui-button ui-button-primary whitespace-nowrap" :disabled="!newTagName.trim() || loading">
          <Plus class="w-4 h-4 mr-1" /> 添加
        </button>
      </div>
      <!-- Color Picker -->
      <div class="flex items-center gap-2 mt-2">
        <span class="text-[11px] text-[#615d59] font-[600] mr-1">选择颜色:</span>
        <button
          v-for="color in PRESET_COLORS"
          :key="color"
          type="button"
          class="w-5 h-5 rounded-full border border-[rgba(0,0,0,0.1)] hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0075de]"
          :class="[{ 'ring-2 ring-offset-2 ring-[#0075de] scale-110': newTagColor === color }]"
          :style="{ backgroundColor: color }"
          @click="newTagColor = color"
        />
      </div>
    </form>

    <!-- Tag List -->
    <div class="space-y-2" v-if="!loadingInit">
      <div 
        v-for="tag in tags" 
        :key="tag.id"
        class="flex items-center gap-3 p-3 bg-white border border-[rgba(0,0,0,0.1)] rounded-[8px] group hover:border-[rgba(0,0,0,0.15)] transition-colors"
      >
        <button 
          class="relative w-5 h-5 rounded-full border border-[rgba(0,0,0,0.1)] cursor-pointer overflow-hidden flex items-center justify-center group/color"
          :style="{ backgroundColor: tag.color }"
          title="点击随机切换颜色"
          @click="randomizeColor(tag)"
        >
          <div class="absolute inset-0 bg-black/10 opacity-0 group-hover/color:opacity-100 transition-opacity"></div>
        </button>
        
        <div class="flex-1 flex items-center">
          <input 
            v-if="editingId === tag.id"
            v-model="editingName"
            @blur="saveEdit(tag)"
            @keyup.enter="saveEdit(tag)"
            @keyup.esc="cancelEdit"
            class="bg-[#f6f5f4] border-none px-2 py-1 rounded text-sm w-full focus:ring-1 focus:ring-[#097fe8] outline-none"
            autoFocus
          />
          <span 
            v-else 
            class="text-sm font-[500] text-[rgba(0,0,0,0.95)] cursor-pointer hover:text-[#0075de]"
            @click="startEdit(tag)"
          >
            {{ tag.name }}
          </span>
        </div>

        <div class="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            type="button" 
            class="p-1.5 text-[#a39e98] hover:text-[#dd5b00] rounded hover:bg-[#dd5b00]/10"
            @click="handleDelete(tag)"
            title="删除标签"
          >
            <Trash2 class="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div v-if="tags.length === 0" class="text-sm text-[#615d59] text-center py-6 border border-dashed border-[rgba(0,0,0,0.15)] rounded-[8px]">
        还没有创建任何系统标签。
      </div>
    </div>
    <div v-else class="flex justify-center py-6">
      <LoaderCircle class="w-5 h-5 animate-spin text-[#a39e98]" />
    </div>
  </article>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Plus, Trash2, LoaderCircle } from 'lucide-vue-next'
import { 
  listSnippetTags, 
  createSnippetTag, 
  updateSnippetTag, 
  deleteSnippetTag,
  type SnippetTag
} from '@/api/snippet'
import { toast } from '@/composables/useToast'

const PRESET_COLORS = [
  '#94a3b8', // slate
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#14b8a6', // teal
  '#3b82f6', // blue
  '#6366f1', // indigo
  '#a855f7', // purple
  '#ec4899', // pink
]

const tags = ref<SnippetTag[]>([])
const loadingInit = ref(true)
const loading = ref(false)

const newTagName = ref('')
const newTagColor = ref(PRESET_COLORS[0])

const editingId = ref<number | string | null>(null)
const editingName = ref('')

const loadTags = async () => {
  try {
    const res = await listSnippetTags()
    tags.value = res || []
  } catch (error) {
    toast.error('加载标签失败')
  } finally {
    loadingInit.value = false
  }
}

const handleCreateTag = async () => {
  const name = newTagName.value.trim()
  if (!name) return
  
  loading.value = true
  try {
    const res = await createSnippetTag({ name, color: newTagColor.value })
    tags.value.push(res)
    newTagName.value = ''
    newTagColor.value = PRESET_COLORS[0]
    toast.success('标签创建成功')
  } catch (error) {
    toast.error('创建标签失败')
  } finally {
    loading.value = false
  }
}

const startEdit = (tag: SnippetTag) => {
  editingId.value = tag.id
  editingName.value = tag.name
}

const cancelEdit = () => {
  editingId.value = null
  editingName.value = ''
}

const saveEdit = async (tag: SnippetTag) => {
  const newName = editingName.value.trim()
  if (!newName || newName === tag.name) {
    cancelEdit()
    return
  }

  try {
    await updateSnippetTag(tag.id, { name: newName, color: tag.color || '#94a3b8' })
    const index = tags.value.findIndex(t => t.id === tag.id)
    if (index !== -1) {
      tags.value[index]!.name = newName
    }
  } catch (error) {
    toast.error('重命名失败')
  } finally {
    cancelEdit()
  }
}

const randomizeColor = async (tag: SnippetTag) => {
  const currentIndex = PRESET_COLORS.indexOf(tag.color || '')
  const nextIndex = (currentIndex + 1) % PRESET_COLORS.length
  const newColor = PRESET_COLORS[nextIndex]!

  try {
    await updateSnippetTag(tag.id, { name: tag.name, color: newColor })
    const index = tags.value.findIndex(t => t.id === tag.id)
    if (index !== -1) {
      tags.value[index]!.color = newColor
    }
  } catch (error) {
    toast.error('颜色更新失败')
  }
}

const handleDelete = async (tag: SnippetTag) => {
  if (!confirm(`确定要删除标签 "${tag.name}" 吗？关联该标签的文档将丢失该标签属性，但自身不会被删除。`)) {
    return
  }

  try {
    await deleteSnippetTag(tag.id)
    tags.value = tags.value.filter(t => t.id !== tag.id)
    toast.success('删除标签成功')
  } catch (error) {
    toast.error('删除标签失败')
  }
}

onMounted(() => {
  loadTags()
})
</script>
