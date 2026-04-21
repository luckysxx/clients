<template>
  <!-- ── Inline Mode: compact strip below title ── -->
  <div v-if="mode === 'inline'" class="ai-inline-strip">
    <!-- Loading skeleton -->
    <div v-if="loading" class="flex items-center gap-2 py-1">
      <Loader2 class="h-3.5 w-3.5 animate-spin text-[#097fe8]" />
      <span class="text-[13px] text-[#a39e98]">AI 正在分析…</span>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="flex items-center gap-2 py-1 text-[13px] text-[#a39e98]">
      <AlertCircle class="h-3.5 w-3.5 text-[#dd5b00]" />
      <span>{{ error }}</span>
      <button type="button" class="ml-1 text-[#0075de] hover:underline" @click="$emit('retry')">重试</button>
    </div>

    <!-- No data -->
    <div v-else-if="!metadata" class="flex items-center gap-2 py-1 text-[13px] text-[#a39e98]">
      <Sparkles class="h-3.5 w-3.5" />
      <span>AI 尚未分析此文档</span>
    </div>

    <!-- Summary + Tags compact view -->
    <div v-else>
      <!-- Collapsible summary -->
      <button
        v-if="metadata.summary"
        type="button"
        class="group flex w-full items-start gap-2 rounded-[6px] px-1 py-1.5 text-left transition-colors hover:bg-[rgba(0,0,0,0.02)]"
        @click="inlineExpanded = !inlineExpanded"
      >
        <Sparkles class="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#097fe8]" />
        <span class="flex-1 text-[13px] leading-5 text-[#615d59]">
          <span class="font-[500] text-[rgba(0,0,0,0.95)]">AI 摘要：</span>
          <template v-if="!inlineExpanded">{{ metadata.summary.slice(0, 60) }}{{ metadata.summary.length > 60 ? '…' : '' }}</template>
          <template v-else>{{ metadata.summary }}</template>
        </span>
        <ChevronDown
          class="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#a39e98] transition-transform duration-200"
          :class="{ 'rotate-180': inlineExpanded }"
        />
      </button>

      <!-- Inline suggested tags -->
      <div v-if="metadata.suggested_tags.length" class="mt-1.5 flex flex-wrap items-center gap-1.5 pl-1">
        <Tag class="h-3 w-3 text-[#a39e98]" />
        <button
          v-for="tag in metadata.suggested_tags"
          :key="tag"
          type="button"
          class="ai-tag-chip"
          :class="isTagBound(tag) ? 'ai-tag-chip--bound' : 'ai-tag-chip--suggest'"
          :disabled="isTagBound(tag) || acceptingTag === tag"
          @click="$emit('accept-tag', tag)"
        >
          <Loader2 v-if="acceptingTag === tag" class="h-3 w-3 animate-spin" />
          <template v-else>
            <span>#{{ tag }}</span>
            <Check v-if="isTagBound(tag)" class="h-3 w-3" />
            <Plus v-else class="h-3 w-3" />
          </template>
        </button>
      </div>

      <!-- Expanded detail: todos -->
      <Transition name="expand">
        <div v-if="inlineExpanded && metadata.todos.length" class="mt-3 border-t border-[rgba(0,0,0,0.06)] pt-3 pl-1">
          <p class="text-[11px] font-[600] uppercase tracking-[0.08em] text-[#a39e98]">待办</p>
          <ul class="mt-2 space-y-1.5">
            <li v-for="(todo, idx) in metadata.todos" :key="idx" class="flex items-start gap-2 text-[13px]">
              <span
                class="mt-0.5 inline-flex h-3.5 w-3.5 items-center justify-center rounded border"
                :class="todo.done ? 'border-[#097fe8] bg-[#097fe8] text-white' : 'border-[rgba(0,0,0,0.15)]'"
              >
                <Check v-if="todo.done" class="h-2.5 w-2.5" />
              </span>
              <span class="flex-1" :class="{ 'line-through text-[#a39e98]': todo.done }">{{ todo.text }}</span>
              <span class="ai-priority-badge" :class="priorityClass(todo.priority)">{{ priorityLabel(todo.priority) }}</span>
            </li>
          </ul>
        </div>
      </Transition>
    </div>
  </div>

  <!-- ── Panel Mode: full card (original style, enhanced with interactive tags) ── -->
  <section v-else class="mt-10 rounded-[12px] border border-[rgba(0,0,0,0.1)] bg-white p-6 shadow-[rgba(0,0,0,0.04)_0px_4px_18px,rgba(0,0,0,0.027)_0px_2.025px_7.85px,rgba(0,0,0,0.02)_0px_0.8px_2.93px,rgba(0,0,0,0.01)_0px_0.175px_1.04px]">
    <header class="flex items-center justify-between gap-3">
      <div class="flex items-center gap-2">
        <Sparkles class="h-4 w-4 text-[#097fe8]" />
        <h2 class="text-[15px] font-[600] text-[rgba(0,0,0,0.95)]">AI 觉醒</h2>
      </div>
      <span v-if="metadata" class="ui-chip-muted" :title="metadata.model">
        {{ formatUpdatedAt(metadata.updated_at) }}
      </span>
    </header>

    <div v-if="loading" class="mt-5 space-y-3">
      <div class="h-3 w-3/4 animate-pulse rounded bg-[#f6f5f4]"></div>
      <div class="h-3 w-full animate-pulse rounded bg-[#f6f5f4]"></div>
      <div class="h-3 w-2/3 animate-pulse rounded bg-[#f6f5f4]"></div>
    </div>

    <div v-else-if="error" class="mt-5 flex items-center gap-3 text-[13px] text-[#615d59]">
      <AlertCircle class="h-4 w-4 text-[#dd5b00]" />
      <span>{{ error }}</span>
      <button type="button" class="ml-auto text-[#0075de] hover:underline" @click="$emit('retry')">重试</button>
    </div>

    <div v-else-if="!metadata" class="mt-5 flex items-start gap-3 rounded-[8px] bg-[#f6f5f4] px-4 py-3 text-[13px] text-[#615d59]">
      <Loader2 class="mt-0.5 h-4 w-4 animate-spin text-[#a39e98]" />
      <div class="flex-1">
        <p class="font-[500] text-[rgba(0,0,0,0.95)]">AI 正在阅读中…</p>
        <p class="mt-1">摘要、建议标签与待办会在处理完成后自动出现。</p>
      </div>
    </div>

    <div v-else class="mt-5 space-y-6">
      <div v-if="metadata.summary">
        <p class="text-[12px] font-[600] uppercase tracking-[0.08em] text-[#a39e98]">摘要</p>
        <p class="mt-2 text-[14px] leading-6 text-[rgba(0,0,0,0.95)]">{{ metadata.summary }}</p>
      </div>

      <div v-if="metadata.suggested_tags.length">
        <p class="text-[12px] font-[600] uppercase tracking-[0.08em] text-[#a39e98]">建议标签</p>
        <div class="mt-2 flex flex-wrap gap-2">
          <button
            v-for="tag in metadata.suggested_tags"
            :key="tag"
            type="button"
            class="ai-tag-chip"
            :class="isTagBound(tag) ? 'ai-tag-chip--bound' : 'ai-tag-chip--suggest'"
            :disabled="isTagBound(tag) || acceptingTag === tag"
            @click="$emit('accept-tag', tag)"
          >
            <Loader2 v-if="acceptingTag === tag" class="h-3 w-3 animate-spin" />
            <template v-else>
              <span>#{{ tag }}</span>
              <Check v-if="isTagBound(tag)" class="h-3 w-3" />
              <Plus v-else class="h-3 w-3" />
            </template>
          </button>
        </div>
      </div>

      <div v-if="metadata.todos.length">
        <p class="text-[12px] font-[600] uppercase tracking-[0.08em] text-[#a39e98]">待办</p>
        <ul class="mt-2 space-y-2">
          <li v-for="(todo, idx) in metadata.todos" :key="idx" class="flex items-start gap-3 text-[14px]">
            <span
              class="mt-0.5 inline-flex h-4 w-4 items-center justify-center rounded border"
              :class="todo.done
                ? 'border-[#097fe8] bg-[#097fe8] text-white'
                : 'border-[rgba(0,0,0,0.15)]'"
            >
              <Check v-if="todo.done" class="h-3 w-3" />
            </span>
            <span class="flex-1" :class="{ 'line-through text-[#a39e98]': todo.done }">
              {{ todo.text }}
            </span>
            <span
              class="ai-priority-badge"
              :class="priorityClass(todo.priority)"
            >{{ priorityLabel(todo.priority) }}</span>
          </li>
        </ul>
      </div>

      <p
        v-if="!metadata.summary && !metadata.suggested_tags.length && !metadata.todos.length"
        class="text-[13px] text-[#615d59]"
      >AI 本轮没有产出建议，可以稍后再看看。</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Sparkles, AlertCircle, Loader2, Check, Plus, ChevronDown, Tag } from 'lucide-vue-next'
import type { AIMetadata } from '@/api/snippet'

const props = defineProps<{
  loading: boolean
  metadata: AIMetadata | null
  error: string
  /** Display mode: 'inline' for compact strip, 'panel' for full card */
  mode?: 'inline' | 'panel'
  /** ID of snippet, used for tag binding context */
  snippetId?: string | number
  /** Names of tags already bound to this snippet */
  boundTagNames?: string[]
  /** Name of the tag currently being accepted (for loading state) */
  acceptingTag?: string
}>()

defineEmits<{
  (e: 'retry'): void
  (e: 'accept-tag', tagName: string): void
}>()

const inlineExpanded = ref(false)

const isTagBound = (tagName: string) => {
  return props.boundTagNames?.some(
    name => name.toLowerCase() === tagName.toLowerCase()
  ) ?? false
}

const priorityLabel = (p: string) => {
  switch (p) {
    case 'high': return '高'
    case 'low': return '低'
    default: return '中'
  }
}

const priorityClass = (p: string) => {
  if (p === 'high') return 'ai-priority-badge--high'
  if (p === 'low') return 'ai-priority-badge--low'
  return ''
}

const formatUpdatedAt = (value: string) => {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return new Intl.DateTimeFormat('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}
</script>

<style scoped>
/* ── Inline strip ── */
.ai-inline-strip {
  margin-top: 0.75rem;
  padding: 0.5rem 0;
}

/* ── Tag chips ── */
.ai-tag-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 3px 10px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.01em;
  transition: all 0.15s ease;
  border: 1px solid transparent;
  cursor: pointer;
  outline: none;
}

.ai-tag-chip--suggest {
  background: #f2f9ff;
  color: #097fe8;
  border-color: rgba(9, 127, 232, 0.15);
}
.ai-tag-chip--suggest:hover:not(:disabled) {
  background: #e2f0ff;
  border-color: rgba(9, 127, 232, 0.3);
}
.ai-tag-chip--suggest:active:not(:disabled) {
  transform: scale(0.95);
}

.ai-tag-chip--bound {
  background: #f0faf0;
  color: #2a9d99;
  border-color: rgba(42, 157, 153, 0.15);
  cursor: default;
}

.ai-tag-chip:disabled {
  opacity: 0.7;
}

/* ── Priority ── */
.ai-priority-badge {
  display: inline-flex;
  padding: 1px 6px;
  border-radius: 9999px;
  font-size: 11px;
  font-weight: 500;
  color: #a39e98;
  background: #f6f5f4;
}
.ai-priority-badge--high {
  color: #dd5b00;
  background: rgba(221, 91, 0, 0.08);
}
.ai-priority-badge--low {
  color: #a39e98;
}

/* ── Expand transition ── */
.expand-enter-active,
.expand-leave-active {
  transition: all 0.25s ease;
  overflow: hidden;
}
.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
}
.expand-enter-to,
.expand-leave-from {
  opacity: 1;
  max-height: 400px;
}
</style>
