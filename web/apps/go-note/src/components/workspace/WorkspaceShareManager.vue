<template>
  <article class="surface-panel p-5 sm:p-6">
    <div class="mb-6 flex items-start justify-between gap-4">
      <div>
        <p class="text-[11px] font-[600] uppercase tracking-[0.05em] text-[#a39e98]">Sharing</p>
        <h2 class="mt-2 text-[22px] font-[700] tracking-[-0.25px] text-[rgba(0,0,0,0.95)]">我的分享</h2>
        <p class="mt-1 text-[14px] text-[#615d59]">管理已经创建的公开链接，必要时可以随时撤销。</p>
      </div>
      <button type="button" class="ui-button ui-button-secondary" :disabled="loading" @click="loadShares">
        {{ loading ? '刷新中...' : '刷新列表' }}
      </button>
    </div>

    <div v-if="loading && shares.length === 0" class="py-8 text-sm text-[#615d59]">正在加载分享列表...</div>
    <div v-else-if="shares.length === 0" class="rounded-[12px] border border-dashed border-[rgba(0,0,0,0.12)] px-4 py-8 text-sm text-[#615d59]">
      还没有分享过文档。你可以在文档编辑页点击“分享”来生成公开链接。
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="share in shares"
        :key="share.id"
        class="rounded-[14px] border border-[rgba(0,0,0,0.08)] bg-white px-4 py-4"
      >
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-2 text-[13px] text-[#615d59]">
              <span class="rounded-full bg-[#f6f5f4] px-2.5 py-1">{{ share.kind }}</span>
              <span v-if="share.has_password">已加密码</span>
              <span v-if="share.expires_at">到期 {{ formatDate(share.expires_at) }}</span>
            </div>
            <p class="mt-2 truncate text-[14px] font-[600] text-[rgba(0,0,0,0.95)]">{{ buildShareURL(share.token) }}</p>
            <p class="mt-1 text-[13px] text-[#615d59]">浏览 {{ share.view_count }} · 创建于 {{ formatDate(share.created_at) }}</p>
          </div>
          <div class="flex items-center gap-2">
            <button type="button" class="ui-button ui-button-secondary" @click="copyShareURL(share.token)">复制链接</button>
            <button type="button" class="ui-button ui-button-danger" @click="removeShare(share.id)">撤销</button>
          </div>
        </div>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { deleteShare, listMyShares, type Share } from '@/api/share'
import { toast } from '@/composables/useToast'

const shares = ref<Share[]>([])
const loading = ref(false)

const formatDate = (value: string) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString()
}

const buildShareURL = (token: string) => `${window.location.origin}/s/${token}`

const copyShareURL = async (token: string) => {
  await navigator.clipboard.writeText(buildShareURL(token))
  toast.success('分享链接已复制')
}

const loadShares = async () => {
  loading.value = true
  try {
    shares.value = await listMyShares('article')
  } catch (err) {
    toast.error(err instanceof Error ? err.message : '加载分享列表失败')
  } finally {
    loading.value = false
  }
}

const removeShare = async (id: string | number) => {
  try {
    await deleteShare(id)
    shares.value = shares.value.filter((item) => String(item.id) !== String(id))
    toast.success('分享已撤销')
  } catch (err) {
    toast.error(err instanceof Error ? err.message : '撤销分享失败')
  }
}

onMounted(() => {
  loadShares()
})
</script>
