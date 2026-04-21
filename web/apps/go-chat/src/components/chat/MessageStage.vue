<template>
  <main class="message-stage">
    <header class="message-stage__header">
      <div>
        <h1>{{ conversationName }}</h1>
      </div>

      <div class="header-actions">
        <button
          v-for="item in headerActions"
          :key="item.label"
          class="icon-button"
          type="button"
          :aria-label="item.label"
        >
          <component :is="item.icon" />
        </button>
      </div>
    </header>

    <div class="message-stage__body">
      <section class="message-stream">
        <article class="card-message" v-if="isSystemNotice">
          <div class="event-card">
            <div class="event-card__eyebrow">源能者娱乐系统</div>
            <h2>冥驹限定主题上线</h2>
            <p>拥有第 22 个皮肤，解锁时间 2026-04-06</p>
            <div class="event-card__footer">
              <span>荣耀联盟 · 限时活动</span>
              <span class="event-card__qr"></span>
            </div>
          </div>
        </article>

        <article
          v-for="(message, idx) in messages"
          :key="idx"
          class="message-row"
          :class="{
            'message-row--self': message.self,
          }"
        >
          <img class="message-row__avatar" :src="message.avatar" :alt="message.author">
          <div class="message-row__body">
            <div class="message-row__meta">
              <span class="message-row__author">{{ message.author }}</span>
              <span class="message-row__level">{{ message.level }}</span>
            </div>
            <div class="message-bubble">
              {{ message.text }}
            </div>
          </div>
        </article>
      </section>
    </div>

    <footer class="composer">
      <div class="resizer-y" @mousedown.prevent="startDragComposer"></div>
      <div class="composer__toolbar">
        <button
          v-for="item in composerTools"
          :key="item.label"
          class="icon-button"
          type="button"
          :aria-label="item.label"
        >
          <component :is="item.icon" />
        </button>
        <div class="composer__toolbar-spacer"></div>
        <button class="icon-button" type="button" aria-label="历史">
          <ClockIcon />
        </button>
      </div>

      <label class="composer__field">
        <textarea
          v-model="draft"
          rows="4"
          @keydown.enter.exact.prevent="sendMsg"
        ></textarea>
      </label>
    </footer>
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { PhoneCallIcon, VideoIcon, ScreenIcon, GridIcon, UserPlusIcon, MoreIcon, SmileIcon, ScissorsIcon, FolderIcon, ImageIcon, ArchiveIcon, MicIcon, ClockIcon } from '@/utils/icons'
import type { Message } from '@/utils/mock'

defineProps<{
  conversationName: string
  messages: Message[]
  isSystemNotice?: boolean
}>()

const emit = defineEmits<{
  (e: 'drag-start', event: MouseEvent): void
}>()

const draft = ref('')

const headerActions = [
  { label: '通话', icon: PhoneCallIcon },
  { label: '视频', icon: VideoIcon },
  { label: '投屏', icon: ScreenIcon },
  { label: '应用', icon: GridIcon },
  { label: '邀请', icon: UserPlusIcon },
  { label: '更多', icon: MoreIcon },
]

const composerTools = [
  { label: '表情', icon: SmileIcon },
  { label: '截图', icon: ScissorsIcon },
  { label: '文件', icon: FolderIcon },
  { label: '图片', icon: ImageIcon },
  { label: '收藏', icon: ArchiveIcon },
  { label: '语音', icon: MicIcon },
]

const startDragComposer = (e: MouseEvent) => {
  emit('drag-start', e)
}

const sendMsg = () => {
  if (!draft.value.trim()) return
  // 后续在这里补充真正的发送处理逻辑。
  draft.value = ''
}
</script>
