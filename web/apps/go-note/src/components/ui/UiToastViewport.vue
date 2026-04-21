<template>
  <div class="pointer-events-none fixed right-4 top-4 z-[80] flex w-[min(380px,calc(100vw-2rem))] flex-col gap-2">
    <TransitionGroup name="toast">
      <article
        v-for="item in toasts"
        :key="item.id"
        class="pointer-events-auto rounded-[12px] border bg-white/95 p-4 shadow-deep backdrop-blur-xl"
        :class="toneClassMap[item.tone]"
      >
        <div class="flex items-start gap-3">
          <div class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] border" :class="iconClassMap[item.tone]">
            <component :is="iconMap[item.tone]" class="h-4 w-4" />
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-sm font-[600] text-[rgba(0,0,0,0.95)]">{{ item.title }}</p>
            <p class="mt-1 text-sm leading-6 text-[#615d59]">{{ item.description }}</p>
          </div>
          <button
            type="button"
            class="inline-flex h-7 w-7 items-center justify-center rounded text-[#a39e98] transition-colors hover:bg-[rgba(0,0,0,0.05)] hover:text-[rgba(0,0,0,0.95)]"
            @click="dismissToast(item.id)"
          >
            <X class="h-4 w-4" />
          </button>
        </div>
      </article>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { AlertCircle, CheckCircle2, Info, TriangleAlert, X } from 'lucide-vue-next'
import { dismissToast, useToastState, type ToastTone } from '@/composables/useToast'

const toasts = useToastState()

const iconMap: Record<ToastTone, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: TriangleAlert,
  info: Info,
}

const toneClassMap: Record<ToastTone, string> = {
  success: 'border-[#2a9d99]/30',
  error: 'border-[#dd5b00]/30',
  warning: 'border-[#dd5b00]/20',
  info: 'border-[rgba(0,0,0,0.1)]',
}

const iconClassMap: Record<ToastTone, string> = {
  success: 'border-[#2a9d99]/30 bg-[#2a9d99]/10 text-[#2a9d99]',
  error: 'border-[#dd5b00]/30 bg-[#dd5b00]/10 text-[#dd5b00]',
  warning: 'border-[#dd5b00]/20 bg-[#dd5b00]/10 text-[#dd5b00]',
  info: 'border-[rgba(0,0,0,0.1)] bg-[#f6f5f4] text-[#615d59]',
}
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
