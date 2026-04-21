<template>
  <PageShell
    label="Shared"
    :title="data?.snippet.title || '公开分享'"
    :description="data?.share.has_password ? '该分享启用了访问保护。' : '通过分享链接访问的只读文档。'"
    body-class="px-8 py-6"
  >
    <template #actions>
      <div v-if="data" class="flex items-center gap-3">
        <button type="button" class="ui-button ui-button-secondary" :disabled="importing" @click="handleImport">
          {{ importing ? '保存中...' : (data.share.kind === 'template' ? '导入模板' : '存入我的资料库') }}
        </button>
      </div>
    </template>

    <section v-if="loading" class="py-20 text-center text-sm text-[#615d59]">正在加载分享内容...</section>

    <section v-else-if="error" class="mx-auto max-w-xl rounded-[16px] border border-[rgba(0,0,0,0.08)] bg-white p-6">
      <h2 class="text-[20px] font-[700] text-[rgba(0,0,0,0.95)]">无法打开分享</h2>
      <p class="mt-2 text-[14px] leading-6 text-[#615d59]">{{ error }}</p>

      <form v-if="passwordRequired" class="mt-6 space-y-3" @submit.prevent="submitPassword">
        <label class="block text-[13px] font-[600] text-[rgba(0,0,0,0.85)]">访问密码</label>
        <input
          v-model="password"
          type="password"
          class="ui-input"
          placeholder="输入分享密码"
        />
        <button type="submit" class="ui-button ui-button-primary" :disabled="submittingPassword">
          {{ submittingPassword ? '验证中...' : '继续访问' }}
        </button>
      </form>
    </section>

    <article v-else-if="data" class="mx-auto max-w-4xl">
      <div class="mb-6 flex flex-wrap items-center gap-3 text-[13px] text-[#615d59]">
        <span class="rounded-full border border-[rgba(0,0,0,0.08)] bg-[#f6f5f4] px-3 py-1">
          {{ data.share.kind === 'template' ? '模板分享' : '文章分享' }}
        </span>
        <span v-if="data.share.expires_at">有效期至 {{ formatDate(data.share.expires_at) }}</span>
        <span>浏览 {{ data.share.view_count }}</span>
      </div>

      <div class="overflow-hidden rounded-[16px] border border-[rgba(0,0,0,0.08)] bg-[#f6f5f4] px-3 pt-4">
        <MilkdownEditor :model-value="data.snippet.content" :readonly="true" />
      </div>
    </article>
  </PageShell>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PageShell from '@/components/layout/PageShell.vue'
import MilkdownEditor from '@/components/editor/MilkdownEditor.vue'
import { getPublicShareByToken, ShareAccessError, type PublicShareResponse } from '@/api/share'
import { createSnippetFromShare } from '@/api/snippet'
import { toast } from '@/composables/useToast'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const loading = ref(true)
const submittingPassword = ref(false)
const importing = ref(false)
const error = ref('')
const password = ref('')
const data = ref<PublicShareResponse | null>(null)

const token = computed(() => String(route.params.token || ''))
const passwordRequired = ref(false)

const formatDate = (value: string) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString()
}

const loadShare = async (providedPassword?: string) => {
  loading.value = true
  error.value = ''
  passwordRequired.value = false
  try {
    data.value = await getPublicShareByToken(token.value, providedPassword)
  } catch (err) {
    data.value = null
    if (err instanceof ShareAccessError) {
      error.value = err.message
      passwordRequired.value = err.isPasswordRequired
    } else {
      error.value = err instanceof Error ? err.message : '分享读取失败'
    }
  } finally {
    loading.value = false
  }
}

const submitPassword = async () => {
  submittingPassword.value = true
  await loadShare(password.value)
  submittingPassword.value = false
}

const handleImport = async () => {
  if (!authStore.hydrated) {
    authStore.initFromStorage()
  }
  if (!authStore.isAuthenticated) {
    toast.warning('登录后才能保存到自己的知识库')
    router.push({ path: '/', query: { passport: 'login', redirect: route.fullPath } })
    return
  }
  importing.value = true
  try {
    const snippet = await createSnippetFromShare({
      token: token.value,
      password: password.value || undefined,
      title: data.value?.snippet.title,
    })
    toast.success(data.value?.share.kind === 'template' ? '模板已导入到你的知识库' : '文档已保存到你的知识库')
    router.push(`/snippets/${snippet.id}`)
  } catch (err) {
    toast.error(err instanceof Error ? err.message : '保存到知识库失败')
  } finally {
    importing.value = false
  }
}

onMounted(() => {
  loadShare()
})
</script>
