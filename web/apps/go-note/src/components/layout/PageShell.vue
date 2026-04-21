<template>
  <div class="flex h-[calc(100vh-3rem)] flex-col overflow-hidden bg-white">
    <!-- ── 页面头部 ── -->
    <header class="shrink-0 border-b border-[rgba(0,0,0,0.1)] bg-white px-8 pb-6 pt-7">
      <div class="flex flex-wrap items-start justify-between gap-6">
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-3">
            <button
              v-if="showBack"
              type="button"
              class="group -ml-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-[6px] text-[#615d59] transition-colors hover:bg-[rgba(0,0,0,0.05)] hover:text-[rgba(0,0,0,0.95)]"
              @click="handleBack"
              title="返回"
            >
              <ArrowLeft class="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            </button>
            <div class="min-w-0">
              <p v-if="label" class="text-[11px] font-[600] uppercase tracking-[0.05em] text-[#a39e98]">{{ label }}</p>
              <h1 class="mt-1 text-[32px] font-[700] tracking-[-1px] text-[rgba(0,0,0,0.95)]">
                <slot name="title">{{ title }}</slot>
              </h1>
            </div>
          </div>
          <p v-if="description" class="mt-2 max-w-2xl text-[14px] leading-6 text-[#615d59]">{{ description }}</p>
          <div v-if="$slots.badges" class="mt-4">
            <slot name="badges" />
          </div>
        </div>
        <div v-if="$slots.actions" class="shrink-0">
          <slot name="actions" />
        </div>
      </div>

      <!-- 次级头部区域：标签、筛选器、工具栏 -->
      <div v-if="$slots.toolbar" class="mt-6">
        <slot name="toolbar" />
      </div>
    </header>

    <!-- ── 页面主体（填充剩余高度） ── -->
    <div class="min-h-0 flex-1 overflow-y-auto overflow-x-hidden" :class="bodyClass">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next'
import { useRouter } from 'vue-router'

const router = useRouter()

defineProps<{
  /** 标题上方的小标签，例如"WORKSPACE ORGANIZE"。 */
  label?: string
  /** 页面标题，也可以通过 #title 插槽传入更丰富的内容。 */
  title?: string
  /** 标题下方的一行描述。 */
  description?: string
  /** 应用于主体区域的额外 CSS 类名。 */
  bodyClass?: string
  /** 是否显示返回箭头。 */
  showBack?: boolean
}>()

const handleBack = () => {
  router.back()
}
</script>
