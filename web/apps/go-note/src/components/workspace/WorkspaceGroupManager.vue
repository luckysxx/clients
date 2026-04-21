<template>
  <article class="surface-panel p-5 sm:p-6">
    <div class="mb-6 flex justify-between items-start">
      <div>
        <p class="text-[11px] font-[600] uppercase tracking-[0.05em] text-[#a39e98]">Organization</p>
        <h2 class="mt-2 text-[22px] font-[700] tracking-[-0.25px] text-[rgba(0,0,0,0.95)]">分组管理</h2>
        <p class="mt-1 text-[14px] text-[#615d59]">上下拖动可调整排序。在右侧输入框快速创建新分组。</p>
      </div>
    </div>

    <!-- Create Group -->
    <form @submit.prevent="handleCreateGroup" class="mb-4 flex gap-2">
      <input 
        v-model="newGroupName"
        type="text" 
        placeholder="新建分组..." 
        class="ui-input flex-1"
        :disabled="loading"
      />
      <button type="submit" class="ui-button ui-button-primary whitespace-nowrap" :disabled="!newGroupName.trim() || loading">
        <Plus class="w-4 h-4 mr-1" /> 添加
      </button>
    </form>

    <!-- Group List -->
    <div class="space-y-2" v-if="!loadingInit">
      <draggable 
        v-model="groups" 
        item-key="id" 
        handle=".drag-handle"
        ghost-class="opacity-50"
        @end="onDragEnd"
        class="space-y-2"
      >
        <template #item="{ element }">
          <div class="flex items-center gap-3 p-3 bg-white border border-[rgba(0,0,0,0.1)] rounded-[8px] group hover:border-[rgba(0,0,0,0.15)] transition-colors">
            <button class="drag-handle text-[#a39e98] hover:text-[#615d59] cursor-grab active:cursor-grabbing">
              <GripVertical class="w-5 h-5" />
            </button>
            
            <div class="flex-1 flex items-center">
              <input 
                v-if="editingId === element.id"
                v-model="editingName"
                @blur="saveEdit(element)"
                @keyup.enter="saveEdit(element)"
                @keyup.esc="cancelEdit"
                class="bg-[#f6f5f4] border-none px-2 py-1 rounded text-sm w-full focus:ring-1 focus:ring-[#097fe8] outline-none"
                autoFocus
              />
              <span 
                v-else 
                class="text-sm font-[500] text-[rgba(0,0,0,0.95)] cursor-pointer hover:text-[#0075de]"
                @click="startEdit(element)"
              >
                {{ element.name }}
              </span>
            </div>

            <div class="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                type="button" 
                class="p-1.5 text-[#a39e98] hover:text-[#dd5b00] rounded hover:bg-[#dd5b00]/10"
                @click="handleDelete(element)"
                title="删除分组"
              >
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
          </div>
        </template>
      </draggable>
      
      <div v-if="groups.length === 0" class="text-sm text-[#615d59] text-center py-6 border border-dashed border-[rgba(0,0,0,0.15)] rounded-[8px]">
        还没有创建任何分组。
      </div>
    </div>
    <div v-else class="flex justify-center py-6">
      <LoaderCircle class="w-5 h-5 animate-spin text-[#a39e98]" />
    </div>
  </article>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import draggable from 'vuedraggable'
import { Plus, GripVertical, Trash2, LoaderCircle } from 'lucide-vue-next'
import { 
  listSnippetGroups, 
  createSnippetGroup, 
  updateSnippetGroup, 
  deleteSnippetGroup,
  type SnippetGroup
} from '@/api/snippet'
import { toast } from '@/composables/useToast'

const groups = ref<SnippetGroup[]>([])
const loadingInit = ref(true)
const loading = ref(false)
const newGroupName = ref('')

const editingId = ref<number | string | null>(null)
const editingName = ref('')

const loadGroups = async () => {
  try {
    const res = await listSnippetGroups()
    // 返回值是数组。
    const sorted = (res || []).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
    groups.value = sorted
  } catch (error) {
    toast.error('加载分组失败')
  } finally {
    loadingInit.value = false
  }
}

const handleCreateGroup = async () => {
  const name = newGroupName.value.trim()
  if (!name) return
  
  loading.value = true
  try {
    const res = await createSnippetGroup({ name })
    groups.value.push(res)
    newGroupName.value = ''
    toast.success('分组创建成功')
  } catch (error) {
    toast.error('创建分组失败')
  } finally {
    loading.value = false
  }
}

const startEdit = (group: SnippetGroup) => {
  editingId.value = group.id
  editingName.value = group.name
}

const cancelEdit = () => {
  editingId.value = null
  editingName.value = ''
}

const saveEdit = async (group: SnippetGroup) => {
  const newName = editingName.value.trim()
  if (!newName || newName === group.name) {
    cancelEdit()
    return
  }

  try {
    await updateSnippetGroup(group.id, { name: newName })
    const index = groups.value.findIndex(g => g.id === group.id)
    if (index !== -1) {
      groups.value[index]!.name = newName
    }
  } catch (error) {
    toast.error('重命名失败')
  } finally {
    cancelEdit()
  }
}

const handleDelete = async (group: SnippetGroup) => {
  if (!confirm(`确定要删除分组 "${group.name}" 吗？该分组下的文档不会被删除，会被移入 Inbox。`)) {
    return
  }

  try {
    await deleteSnippetGroup(group.id)
    groups.value = groups.value.filter(g => g.id !== group.id)
    toast.success('删除成功')
  } catch (error) {
    toast.error('删除分组失败')
  }
}

const onDragEnd = async () => {
  // 根据拖拽后的数组顺序更新各项的 sort_order。
  const updatePromises = groups.value.map((g, index) => {
    // 假设 order 步长为 10，给以后留出空间，不过直接用 index + 1 也可以
    const newOrder = index + 1
    if (g.sort_order !== newOrder) {
      g.sort_order = newOrder
      return updateSnippetGroup(g.id, { name: g.name, sort_order: newOrder })
    }
    return Promise.resolve()
  })

  try {
    await Promise.all(updatePromises)
  } catch (error) {
    toast.error('保存排序失败')
    await loadGroups() // 出错时恢复原始顺序。
  }
}

onMounted(() => {
  loadGroups()
})
</script>
