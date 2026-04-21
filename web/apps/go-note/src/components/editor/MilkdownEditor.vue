<template>
  <div class="milkdown-wrapper w-full" :class="{ 'milkdown-readonly': readonly }">
    <div ref="editorRef"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { Crepe } from '@milkdown/crepe'
import { replaceAll } from '@milkdown/kit/utils'
import { handleImageUpload } from '@/composables/useImageUpload'
import '@milkdown/crepe/theme/common/style.css'
import '@milkdown/crepe/theme/frame.css'
import '@/assets/milkdown-custom.css'

const props = defineProps<{
  modelValue: string
  readonly?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'update:headings', value: { level: number, text: string }[]): void
}>()

const editorRef = ref<HTMLElement | null>(null)
let crepe: Crepe | null = null
let isUpdating = false
let isReady = false

const extractHeadings = (markdown: string) => {
  const lines = markdown.split('\n')
  const results = []
  for (let i = 0; i < lines.length; i++) {
    const match = lines[i]!.match(/^(#{1,3})\s+(.+)$/)
    if (match) {
      results.push({ level: match[1]!.length, text: match[2]! })
    }
  }
  return results
}

onMounted(async () => {
  if (!editorRef.value) return

  crepe = new Crepe({
    root: editorRef.value,
    defaultValue: props.modelValue,
    features: {
      [Crepe.Feature.CodeMirror]: true,
      [Crepe.Feature.Table]: true,
      [Crepe.Feature.ImageBlock]: true,
      [Crepe.Feature.BlockEdit]: !props.readonly,
      [Crepe.Feature.Toolbar]: !props.readonly,
      [Crepe.Feature.ListItem]: true,
    },
    featureConfigs: {
      [Crepe.Feature.ImageBlock]: {
        onUpload: async (file: File) => handleImageUpload(file)
      }
    }
  })

  // Listen for changes
  crepe.on((listener) => {
    listener.markdownUpdated((ctx, markdown, prevMarkdown) => {
      if (isUpdating) return
      if (markdown !== props.modelValue) {
        emit('update:modelValue', markdown)
      }
      emit('update:headings', extractHeadings(markdown))
    })
  })

  await crepe.create()
  
  if (!crepe) return
  
  isReady = true
  crepe.setReadonly(!!props.readonly)
  
  // 编辑器初始化完成后，检查 modelValue 是否在初始化期间被更新过（比如草稿加载）
  // 如果 defaultValue 与当前 modelValue 不同，需要同步到编辑器
  const currentMd = crepe.getMarkdown()
  if (props.modelValue && props.modelValue !== currentMd) {
    isUpdating = true
    crepe.editor.action(replaceAll(props.modelValue))
    isUpdating = false
  }

  // Initial extract
  emit('update:headings', extractHeadings(props.modelValue))
})

watch(() => props.modelValue, (newVal) => {
  if (!crepe || !isReady) return
  try {
    const currentMd = crepe.getMarkdown()
    if (newVal !== currentMd) {
      isUpdating = true
      crepe.editor.action(replaceAll(newVal))
      isUpdating = false
    }
  } catch (e) {
    console.warn('Milkdown update skipped:', e)
  }
})

watch(() => props.readonly, (newVal) => {
  if (crepe) {
    crepe.setReadonly(!!newVal)
  }
})

onUnmounted(() => {
  isReady = false
  if (crepe) {
    crepe.destroy()
    crepe = null
  }
})
</script>

<style scoped>
.milkdown-wrapper {
  max-width: 100%;
  min-width: 0;
  overflow-wrap: break-word;
  word-break: break-word;
  overflow-x: hidden;
}
</style>
