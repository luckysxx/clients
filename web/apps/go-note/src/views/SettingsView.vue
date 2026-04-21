<template>
  <PageShell label="Account" title="Settings" description="管理你的个人账户、安全设置以及工作区规则。" body-class="px-8 py-6" show-back>
  <TabsRoot class="flex flex-col gap-8" default-value="account">
    <div class="border-b border-[rgba(0,0,0,0.1)] pb-2">
      <h1 class="text-[26px] font-[700] tracking-[-0.625px] text-[rgba(0,0,0,0.95)] mb-6">Settings</h1>
      <TabsList class="flex gap-6">
        <TabsTrigger
          value="account"
          class="relative pb-2 text-[14px] font-[500] text-[#615d59] transition-colors hover:text-[rgba(0,0,0,0.95)] data-[state=active]:text-[rgba(0,0,0,0.95)] data-[state=active]:after:absolute data-[state=active]:after:bottom-[-9px] data-[state=active]:after:left-0 data-[state=active]:after:h-[2px] data-[state=active]:after:w-full data-[state=active]:after:bg-[#0075de]"
        >
          个人账户
        </TabsTrigger>
        <TabsTrigger
          value="workspace"
          class="relative pb-2 text-[14px] font-[500] text-[#615d59] transition-colors hover:text-[rgba(0,0,0,0.95)] data-[state=active]:text-[rgba(0,0,0,0.95)] data-[state=active]:after:absolute data-[state=active]:after:bottom-[-9px] data-[state=active]:after:left-0 data-[state=active]:after:h-[2px] data-[state=active]:after:w-full data-[state=active]:after:bg-[#0075de]"
        >
          工作区规则
        </TabsTrigger>
        <TabsTrigger
          value="sharing"
          class="relative pb-2 text-[14px] font-[500] text-[#615d59] transition-colors hover:text-[rgba(0,0,0,0.95)] data-[state=active]:text-[rgba(0,0,0,0.95)] data-[state=active]:after:absolute data-[state=active]:after:bottom-[-9px] data-[state=active]:after:left-0 data-[state=active]:after:h-[2px] data-[state=active]:after:w-full data-[state=active]:after:bg-[#0075de]"
        >
          我的分享
        </TabsTrigger>
        <TabsTrigger
          value="ai"
          class="relative pb-2 text-[14px] font-[500] text-[#615d59] transition-colors hover:text-[rgba(0,0,0,0.95)] data-[state=active]:text-[rgba(0,0,0,0.95)] data-[state=active]:after:absolute data-[state=active]:after:bottom-[-9px] data-[state=active]:after:left-0 data-[state=active]:after:h-[2px] data-[state=active]:after:w-full data-[state=active]:after:bg-[#0075de]"
        >
          AI 设置
        </TabsTrigger>
      </TabsList>
    </div>

    <TabsContent value="account" class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <section class="space-y-4">
      <article class="surface-panel p-5 sm:p-6">
        <div class="mb-6 flex items-start justify-between gap-4">
          <div>
            <p class="text-[11px] font-[600] uppercase tracking-[0.05em] text-[#a39e98]">Profile</p>
            <h2 class="mt-2 text-[22px] font-[700] tracking-[-0.25px] text-[rgba(0,0,0,0.95)]">绑定邮箱</h2>
            <p class="mt-1 text-[14px] text-[#615d59]">保留极细边框和紧凑间距，让设置页更接近 Vercel/Geist 的冷静感。</p>
          </div>
          <span class="ui-chip">{{ currentEmail || '未绑定邮箱' }}</span>
        </div>

        <form class="space-y-4" @submit.prevent="handleBindEmail">
          <div v-if="currentEmail">
            <label class="ui-label">当前邮箱</label>
            <div class="ui-input flex items-center bg-[rgba(0,0,0,0.03)] text-[#615d59]">{{ currentEmail }}</div>
          </div>
          <div>
            <label class="ui-label">邮箱地址</label>
            <input v-model="emailForm.email" class="ui-input" type="email" placeholder="name@company.com" />
          </div>
          <button type="submit" class="ui-button ui-button-primary" :disabled="emailLoading">
            <LoaderCircle v-if="emailLoading" class="h-4 w-4 animate-spin" />
            保存邮箱
          </button>
        </form>
      </article>

      <article class="surface-panel p-5 sm:p-6">
        <div class="mb-6">
          <p class="text-[11px] font-[600] uppercase tracking-[0.05em] text-[#a39e98]">Security</p>
          <h2 class="mt-2 text-[22px] font-[700] tracking-[-0.25px] text-[rgba(0,0,0,0.95)]">设置密码</h2>
          <p class="mt-1 text-[14px] text-[#615d59]">适用于尚未设置过密码的账号，保存后可直接用密码登录。</p>
        </div>

        <form class="space-y-4" @submit.prevent="handleSetPassword">
          <div>
            <label class="ui-label">新密码</label>
            <input v-model="setPwdForm.new_password" class="ui-input" type="password" placeholder="至少 8 位" />
          </div>
          <button type="submit" class="ui-button ui-button-primary" :disabled="setPwdLoading">
            <LoaderCircle v-if="setPwdLoading" class="h-4 w-4 animate-spin" />
            设置密码
          </button>
        </form>
      </article>

      <article class="surface-panel p-5 sm:p-6">
        <div class="mb-6">
          <p class="text-[11px] font-[600] uppercase tracking-[0.05em] text-[#a39e98]">Security</p>
          <h2 class="mt-2 text-[22px] font-[700] tracking-[-0.25px] text-[rgba(0,0,0,0.95)]">修改密码</h2>
          <p class="mt-1 text-[14px] text-[#615d59]">已知原密码时可直接修改，成功后会清空所有登录态。</p>
        </div>

        <form class="space-y-4" @submit.prevent="handleChangePassword">
          <div>
            <label class="ui-label">原密码</label>
            <input v-model="changePwdForm.old_password" class="ui-input" type="password" placeholder="输入当前密码" />
          </div>
          <div>
            <label class="ui-label">新密码</label>
            <input v-model="changePwdForm.new_password" class="ui-input" type="password" placeholder="输入新的密码" />
          </div>
          <button type="submit" class="ui-button ui-button-primary" :disabled="changePwdLoading">
            <LoaderCircle v-if="changePwdLoading" class="h-4 w-4 animate-spin" />
            更新密码
          </button>
        </form>
      </article>

      <article class="rounded-[12px] border border-[#dd5b00]/20 bg-[#dd5b00]/5 p-5 sm:p-6">
        <div class="mb-6">
          <p class="text-[11px] font-[600] uppercase tracking-[0.05em] text-[#dd5b00]">Danger Zone</p>
          <h2 class="mt-2 text-[22px] font-[700] tracking-[-0.25px] text-[#dd5b00]">退出全部设备</h2>
          <p class="mt-1 text-[14px] text-[#dd5b00]/70">会让当前账号在所有终端失效，需要重新登录。</p>
        </div>

        <DialogRoot v-model:open="logoutDialogOpen">
          <DialogTrigger as-child>
            <button type="button" class="ui-button ui-button-danger">立即退出全部设备</button>
          </DialogTrigger>
          <DialogPortal>
            <DialogOverlay class="dialog-overlay" />
            <DialogContent class="dialog-content">
              <DialogTitle class="text-lg font-semibold text-[rgba(0,0,0,0.95)]">确认退出全部设备</DialogTitle>
              <DialogDescription class="mt-1 text-sm text-[#615d59]">
                这个操作会让所有已登录设备的会话立即失效，通常用于密码已泄露或设备丢失时。
              </DialogDescription>
              <div class="mt-5 flex justify-end gap-2">
                <DialogClose as-child>
                  <button type="button" class="ui-button ui-button-secondary">取消</button>
                </DialogClose>
                <button type="button" class="ui-button ui-button-danger" :disabled="logoutAllLoading" @click="confirmLogoutAll">
                  <LoaderCircle v-if="logoutAllLoading" class="h-4 w-4 animate-spin" />
                  确认退出
                </button>
              </div>
            </DialogContent>
          </DialogPortal>
        </DialogRoot>
      </article>
    </section>

    <aside class="space-y-4">
      <section class="surface-panel p-5">
        <p class="text-[11px] font-[600] uppercase tracking-[0.05em] text-[#a39e98]">Account Snapshot</p>
        <div class="mt-4 flex items-center gap-3">
          <div class="flex h-12 w-12 items-center justify-center rounded-[12px] bg-[#0075de] text-sm font-[600] text-white">
            {{ userInitial }}
          </div>
          <div>
            <p class="text-[14px] font-[500] text-[rgba(0,0,0,0.95)]">{{ authStore.user?.username || 'GoNote User' }}</p>
            <p class="text-[14px] text-[#615d59]">{{ currentEmail || '未绑定邮箱' }}</p>
          </div>
        </div>
      </section>

      <section class="surface-panel p-5">
        <p class="text-[11px] font-[600] uppercase tracking-[0.05em] text-[#a39e98]">Notes</p>
        <ul class="mt-4 space-y-3 text-[14px] leading-6 text-[#615d59]">
          <li>密码长度建议至少 12 位，且和其他站点不重复。</li>
          <li>绑定邮箱后，账号恢复和后续通知会更顺畅。</li>
          <li>修改密码与退出全部设备都会强制重新登录，这是预期行为。</li>
        </ul>
      </section>
    </aside>
    </TabsContent>

    <TabsContent value="workspace" class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <section class="space-y-4">
        <!-- 占位符，将被替换为单独的组件 -->
        <WorkspaceGroupManager />
        <WorkspaceTagManager />
      </section>
      <aside class="space-y-4">
        <section class="surface-panel p-5">
          <p class="text-[11px] font-[600] uppercase tracking-[0.05em] text-[#a39e98]">Workspace Tips</p>
          <ul class="mt-4 space-y-3 text-[14px] leading-6 text-[#615d59]">
            <li>拖拽分组名称即可快速对侧边栏的分组进行重新排序。</li>
            <li>标签的颜色会在整个工作区的所有文档中同步生效。</li>
            <li>删除标签后，关联该标签的文档不会被删除，只是剥离关联。</li>
          </ul>
        </section>
      </aside>
    </TabsContent>

    <TabsContent value="sharing" class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <section class="space-y-4">
        <WorkspaceShareManager />
      </section>
      <aside class="space-y-4">
        <section class="surface-panel p-5">
          <p class="text-[11px] font-[600] uppercase tracking-[0.05em] text-[#a39e98]">Sharing Notes</p>
          <ul class="mt-4 space-y-3 text-[14px] leading-6 text-[#615d59]">
            <li>分享链接默认是只读访问，不会暴露编辑入口。</li>
            <li>你可以在创建分享时给链接加密码或设置过期时间。</li>
            <li>撤销分享后，原链接会立即失效。</li>
          </ul>
        </section>
      </aside>
    </TabsContent>

    <TabsContent value="ai">
      <AISettingsPanel />
    </TabsContent>
  </TabsRoot>
  </PageShell>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { LoaderCircle } from 'lucide-vue-next'
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
  TabsRoot,
  TabsList,
  TabsTrigger,
  TabsContent,
} from 'radix-vue'
import WorkspaceGroupManager from '@/components/workspace/WorkspaceGroupManager.vue'
import WorkspaceShareManager from '@/components/workspace/WorkspaceShareManager.vue'
import WorkspaceTagManager from '@/components/workspace/WorkspaceTagManager.vue'
import AISettingsPanel from '@/components/workspace/AISettingsPanel.vue'
import { bindEmail, changePassword, logoutAll, setPassword } from '@/api/user'
import { toast } from '@/composables/useToast'
import { useAuthStore } from '@/stores/auth'
import PageShell from '@/components/layout/PageShell.vue'

const router = useRouter()
const authStore = useAuthStore()

const currentEmail = computed(() => authStore.user?.email?.trim() || '')
const userInitial = computed(() => authStore.user?.username?.slice(0, 1).toUpperCase() || 'G')

const emailForm = reactive({ email: '' })
const setPwdForm = reactive({ new_password: '' })
const changePwdForm = reactive({ old_password: '', new_password: '' })

const emailLoading = ref(false)
const setPwdLoading = ref(false)
const changePwdLoading = ref(false)
const logoutAllLoading = ref(false)
const logoutDialogOpen = ref(false)

const handleGlobalInvalidation = (message: string) => {
  toast.success(message)
  authStore.suppressSsoAutoLogin()
  authStore.logout()
  router.push('/')
}

const handleBindEmail = async () => {
  if (!emailForm.email.trim()) {
    toast.warning('请输入邮箱')
    return
  }

  emailLoading.value = true
  try {
    const result = await bindEmail(emailForm)
    authStore.updateEmail(result.email || emailForm.email)
    toast.success('邮箱绑定成功')
    emailForm.email = ''
  } catch (error) {
    toast.error(error instanceof Error ? error.message : '邮箱绑定失败')
  } finally {
    emailLoading.value = false
  }
}

const handleSetPassword = async () => {
  if (setPwdForm.new_password.length < 8) {
    toast.warning('密码长度至少需要 8 位')
    return
  }

  setPwdLoading.value = true
  try {
    await setPassword(setPwdForm)
    toast.success('密码设置成功')
    setPwdForm.new_password = ''
  } catch (error) {
    toast.error(error instanceof Error ? error.message : '设置密码失败')
  } finally {
    setPwdLoading.value = false
  }
}

const handleChangePassword = async () => {
  if (!changePwdForm.old_password || !changePwdForm.new_password) {
    toast.warning('请填写完整密码信息')
    return
  }

  if (changePwdForm.new_password.length < 8) {
    toast.warning('新密码长度至少需要 8 位')
    return
  }

  changePwdLoading.value = true
  try {
    await changePassword(changePwdForm)
    handleGlobalInvalidation('密码修改成功，请重新登录')
  } catch (error) {
    toast.error(error instanceof Error ? error.message : '修改密码失败')
  } finally {
    changePwdLoading.value = false
  }
}

const confirmLogoutAll = async () => {
  logoutAllLoading.value = true
  try {
    await logoutAll()
    logoutDialogOpen.value = false
    handleGlobalInvalidation('已退出全部设备，请重新登录')
  } catch (error) {
    toast.error(error instanceof Error ? error.message : '退出全部设备失败')
  } finally {
    logoutAllLoading.value = false
  }
}
</script>
