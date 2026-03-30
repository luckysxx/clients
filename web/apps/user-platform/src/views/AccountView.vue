<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

import { getMyProfile, isProfileAuthError, isProfileMissingError, updateMyProfile } from '@/api/profile'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const GO_NOTE_URL = import.meta.env.VITE_GO_NOTE_URL?.trim() || 'http://localhost:5174'

const profileForm = reactive({
  nickname: '',
  avatar_url: '',
  birthday: '',
  bio: '',
})

const isLoading = ref(false)
const isSaving = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const lastUpdatedAt = ref('')

const currentUser = computed(() => authStore.user)
const avatarPreview = computed(() => profileForm.avatar_url.trim())
const displayName = computed(() => profileForm.nickname.trim() || currentUser.value?.username || '未命名用户')
const avatarInitial = computed(() => displayName.value.slice(0, 1).toUpperCase())
const profileCompletion = computed(() => {
  let score = 0
  if (profileForm.nickname.trim()) score += 25
  if (profileForm.avatar_url.trim()) score += 25
  if (profileForm.birthday.trim()) score += 25
  if (profileForm.bio.trim()) score += 25
  return score
})

function buildGoNoteLaunchUrl(): string {
  if (!currentUser.value || !authStore.token) {
    return GO_NOTE_URL
  }

  const callbackUrl = new URL('/auth/callback', GO_NOTE_URL)
  callbackUrl.searchParams.set('result', 'logged_in')
  callbackUrl.searchParams.set('user_id', String(currentUser.value.id))
  callbackUrl.searchParams.set('username', currentUser.value.username)
  callbackUrl.searchParams.set('app_code', 'go-note')
  callbackUrl.searchParams.set('state', '/')

  const hashParams = new URLSearchParams({
    access_token: authStore.token,
    refresh_token: authStore.refreshToken,
    token_type: 'Bearer',
  })
  callbackUrl.hash = hashParams.toString()

  return callbackUrl.toString()
}

function fillProfileForm(profile: {
  nickname: string
  avatar_url: string
  birthday: string
  bio: string
  updated_at: string
}) {
  profileForm.nickname = profile.nickname || ''
  profileForm.avatar_url = profile.avatar_url || ''
  profileForm.birthday = profile.birthday || ''
  profileForm.bio = profile.bio || ''
  lastUpdatedAt.value = profile.updated_at || ''
}

function resetProfileForm() {
  fillProfileForm({
    nickname: '',
    avatar_url: '',
    birthday: '',
    bio: '',
    updated_at: '',
  })
}

async function loadProfile() {
  if (!authStore.isAuthenticated || !authStore.token) {
    await router.replace('/login')
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    const profile = await getMyProfile(authStore.token)
    fillProfileForm(profile)
  } catch (error) {
    if (isProfileAuthError(error)) {
      authStore.clearAuth()
      await router.replace('/login')
      return
    }
    if (isProfileMissingError(error)) {
      resetProfileForm()
      return
    }
    errorMessage.value = error instanceof Error ? error.message : '获取资料失败'
  } finally {
    isLoading.value = false
  }
}

async function saveProfile() {
  if (!authStore.isAuthenticated || !authStore.token || isSaving.value) {
    if (!authStore.isAuthenticated) {
      await router.replace('/login')
    }
    return
  }

  isSaving.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const profile = await updateMyProfile(authStore.token, {
      nickname: profileForm.nickname.trim(),
      avatar_url: profileForm.avatar_url.trim(),
      birthday: profileForm.birthday.trim(),
      bio: profileForm.bio.trim(),
    })
    fillProfileForm(profile)
    successMessage.value = '资料已保存'
  } catch (error) {
    if (isProfileAuthError(error)) {
      authStore.clearAuth()
      await router.replace('/login')
      return
    }
    errorMessage.value = error instanceof Error ? error.message : '保存资料失败'
  } finally {
    isSaving.value = false
  }
}

function openGoNote() {
  window.location.assign(buildGoNoteLaunchUrl())
}

async function handleLogout() {
  authStore.logout()
  await router.replace('/login')
}

onMounted(async () => {
  authStore.initFromStorage()
  if (!authStore.isAuthenticated) {
    await router.replace('/login')
    return
  }
  await loadProfile()
})
</script>

<template>
  <main class="profile-page">
    <section class="profile-shell">
      <header class="topbar">
        <div class="brand">
          <div class="brand-mark">L</div>
          <div>
            <p class="brand-label">Luckys Workspace</p>
            <h1>个人资料</h1>
          </div>
        </div>

        <div class="topbar-actions">
          <button type="button" class="secondary-btn" @click="openGoNote">打开 GoNote</button>
          <button type="button" class="ghost-btn" @click="handleLogout">退出登录</button>
        </div>
      </header>

      <section class="hero-panel">
        <div class="hero-copy">
          <p class="hero-tag">统一身份中心</p>
          <h2>账号资料将在网关下统一流转，并复用到聊天、笔记和后续业务应用。</h2>
          <p class="hero-desc">这套页面更偏企业产品风格，强调清晰的信息结构、稳定的表单体验，以及可继续扩展的资料卡片布局。</p>
        </div>

        <div class="hero-metrics">
          <div class="metric-card primary">
            <span>资料完整度</span>
            <strong>{{ profileCompletion }}%</strong>
          </div>
          <div class="metric-card">
            <span>账号名</span>
            <strong>{{ currentUser?.username || '--' }}</strong>
          </div>
          <div class="metric-card">
            <span>最近更新</span>
            <strong>{{ lastUpdatedAt || '尚未更新' }}</strong>
          </div>
        </div>
      </section>

      <section class="content-grid">
        <aside class="summary-panel">
          <article class="summary-card profile-card">
            <div class="avatar-wrap">
              <img v-if="avatarPreview" :src="avatarPreview" alt="avatar preview" />
              <span v-else>{{ avatarInitial }}</span>
            </div>

            <div class="identity-block">
              <h3>{{ displayName }}</h3>
              <p>ID {{ currentUser?.id ?? '--' }}</p>
              <p>@{{ currentUser?.username || '--' }}</p>
            </div>
          </article>

          <article class="summary-card info-card">
            <div class="info-row">
              <span>生日</span>
              <strong>{{ profileForm.birthday || '未设置' }}</strong>
            </div>
            <div class="info-row">
              <span>签名长度</span>
              <strong>{{ profileForm.bio.trim().length }}/256</strong>
            </div>
            <div class="info-row">
              <span>接入状态</span>
              <strong class="online">{{ isLoading ? '同步中' : '已连接网关' }}</strong>
            </div>
          </article>

          <article class="summary-card preview-card">
            <div class="preview-head">
              <span class="dot" />
              <strong>资料预览</strong>
            </div>
            <p class="preview-name">{{ displayName }}</p>
            <p class="preview-bio">{{ profileForm.bio || '你的签名会显示在聊天名片和联系人卡片里。' }}</p>
          </article>
        </aside>

        <section class="editor-panel">
          <header class="section-head">
            <div>
              <p class="section-label">Profile Settings</p>
              <h3>编辑资料</h3>
            </div>
            <span class="section-status">{{ isLoading ? '加载中' : '实时同步' }}</span>
          </header>

          <form class="profile-form" @submit.prevent="saveProfile">
            <div class="field-grid">
              <label class="field">
                <span>昵称</span>
                <input v-model="profileForm.nickname" type="text" maxlength="32" placeholder="给自己起一个更好记的名字" />
              </label>

              <label class="field">
                <span>生日</span>
                <input v-model="profileForm.birthday" type="date" />
              </label>
            </div>

            <label class="field">
              <span>头像地址</span>
              <input
                v-model="profileForm.avatar_url"
                type="url"
                maxlength="512"
                placeholder="https://example.com/avatar.png"
              />
            </label>

            <label class="field">
              <span>个人签名</span>
              <textarea
                v-model="profileForm.bio"
                rows="5"
                maxlength="256"
                placeholder="一句能代表你的话，后面会用于聊天资料卡、联系人摘要和个人资料页。"
              />
            </label>

            <div v-if="errorMessage" class="feedback error">{{ errorMessage }}</div>
            <div v-if="successMessage" class="feedback success">{{ successMessage }}</div>

            <footer class="form-footer">
              <div class="footer-tip">
                <span class="tip-title">填写建议</span>
                <span class="tip-text">头像建议使用稳定的 CDN 地址，生日统一保存为 YYYY-MM-DD。</span>
              </div>

              <button type="submit" class="primary-btn" :disabled="isSaving">
                {{ isSaving ? '保存中...' : '保存资料' }}
              </button>
            </footer>
          </form>
        </section>
      </section>
    </section>
  </main>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');

:global(*) {
  box-sizing: border-box;
}

:global(body) {
  margin: 0;
  background:
    radial-gradient(circle at top right, rgba(59, 130, 246, 0.12), transparent 26%),
    linear-gradient(180deg, #f5f7fb 0%, #eef3f9 100%);
}

.profile-page {
  min-height: 100vh;
  padding: 28px 20px 40px;
  color: #111827;
  font-family: 'Outfit', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

.profile-shell {
  max-width: 1280px;
  margin: 0 auto;
}

.topbar,
.brand,
.topbar-actions,
.hero-panel,
.hero-metrics,
.content-grid,
.section-head,
.form-footer,
.info-row,
.preview-head {
  display: flex;
}

.topbar,
.hero-panel,
.section-head,
.info-row {
  justify-content: space-between;
}

.topbar,
.brand,
.topbar-actions,
.hero-panel,
.preview-head,
.section-head,
.form-footer {
  align-items: center;
}

.topbar {
  margin-bottom: 20px;
  padding: 18px 22px;
  border: 1px solid #e5ebf3;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 8px 30px rgba(15, 23, 42, 0.05);
}

.brand {
  gap: 14px;
}

.brand-mark {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #1677ff, #4f8cff);
  color: #fff;
  font-weight: 800;
}

.brand-label,
.section-label,
.hero-tag {
  margin: 0 0 6px;
  color: #1677ff;
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.topbar h1,
.hero-copy h2,
.section-head h3,
.identity-block h3 {
  margin: 0;
}

.topbar h1 {
  font-size: 1.55rem;
}

.topbar-actions {
  gap: 12px;
}

.hero-panel {
  gap: 20px;
  margin-bottom: 20px;
  padding: 26px 28px;
  border-radius: 24px;
  background: linear-gradient(135deg, #0f3a7a 0%, #1957ad 65%, #2e73d2 100%);
  color: #fff;
  box-shadow: 0 22px 50px rgba(16, 58, 122, 0.22);
}

.hero-copy {
  flex: 1.5;
}

.hero-copy h2 {
  max-width: 760px;
  font-size: clamp(1.7rem, 3vw, 2.5rem);
  line-height: 1.3;
}

.hero-desc {
  max-width: 720px;
  margin: 14px 0 0;
  color: rgba(255, 255, 255, 0.82);
  line-height: 1.75;
}

.hero-metrics {
  gap: 14px;
  flex: 1;
  min-width: 320px;
}

.metric-card {
  flex: 1;
  min-height: 112px;
  padding: 18px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(10px);
}

.metric-card.primary {
  background: rgba(255, 255, 255, 0.22);
}

.metric-card span {
  display: block;
  color: rgba(255, 255, 255, 0.72);
  font-size: 0.88rem;
}

.metric-card strong {
  display: block;
  margin-top: 14px;
  font-size: 1.45rem;
}

.content-grid {
  gap: 20px;
  align-items: start;
}

.summary-panel {
  width: 340px;
  display: grid;
  gap: 16px;
}

.summary-card,
.editor-panel {
  border: 1px solid #e6edf6;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 14px 40px rgba(15, 23, 42, 0.06);
}

.summary-card {
  padding: 22px;
}

.profile-card {
  display: flex;
  align-items: center;
  gap: 16px;
}

.avatar-wrap {
  width: 78px;
  height: 78px;
  border-radius: 24px;
  overflow: hidden;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #ff9a1f, #ff6f7d);
  color: #fff;
  font-size: 1.9rem;
  font-weight: 800;
  box-shadow: 0 14px 26px rgba(255, 122, 69, 0.2);
}

.avatar-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.identity-block p {
  margin: 6px 0 0;
  color: #64748b;
}

.info-card {
  display: grid;
  gap: 14px;
}

.info-row span {
  color: #64748b;
}

.info-row strong {
  color: #0f172a;
}

.info-row .online {
  color: #15803d;
}

.preview-card {
  background: linear-gradient(180deg, #f8fbff 0%, #f2f7ff 100%);
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: #1677ff;
}

.preview-name {
  margin: 18px 0 8px;
  font-size: 1.1rem;
  font-weight: 700;
}

.preview-bio {
  margin: 0;
  color: #475569;
  line-height: 1.7;
}

.editor-panel {
  flex: 1;
  padding: 24px 26px;
}

.section-status {
  height: 30px;
  padding: 0 12px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  background: #eef6ff;
  color: #1677ff;
  font-size: 0.86rem;
  font-weight: 700;
}

.profile-form {
  margin-top: 20px;
}

.field-grid {
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 16px;
}

.field {
  display: grid;
  gap: 8px;
  margin-bottom: 16px;
}

.field span {
  color: #1f2937;
  font-size: 0.95rem;
  font-weight: 600;
}

.field input,
.field textarea {
  width: 100%;
  padding: 14px 16px;
  border: 1px solid #d8e2ee;
  border-radius: 16px;
  background: #fbfdff;
  color: #0f172a;
  font: inherit;
  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease,
    background 0.18s ease;
}

.field input:focus,
.field textarea:focus {
  outline: none;
  border-color: #1677ff;
  box-shadow: 0 0 0 4px rgba(22, 119, 255, 0.12);
  background: #fff;
}

.feedback {
  margin-bottom: 14px;
  padding: 12px 14px;
  border-radius: 14px;
  font-size: 0.94rem;
}

.feedback.error {
  background: #fff1f0;
  color: #cf1322;
  border: 1px solid #ffccc7;
}

.feedback.success {
  background: #f6ffed;
  color: #389e0d;
  border: 1px solid #d9f7be;
}

.form-footer {
  gap: 16px;
  margin-top: 6px;
}

.footer-tip {
  display: grid;
  gap: 4px;
}

.tip-title {
  color: #0f172a;
  font-weight: 700;
}

.tip-text {
  color: #64748b;
  font-size: 0.92rem;
}

.primary-btn,
.secondary-btn,
.ghost-btn {
  height: 42px;
  padding: 0 18px;
  border: 0;
  border-radius: 12px;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
  transition:
    transform 0.16s ease,
    box-shadow 0.16s ease,
    opacity 0.16s ease;
}

.primary-btn {
  background: #1677ff;
  color: #fff;
  box-shadow: 0 10px 20px rgba(22, 119, 255, 0.2);
}

.secondary-btn {
  background: rgba(255, 255, 255, 0.14);
  color: #fff;
}

.ghost-btn {
  background: #f3f6fb;
  color: #334155;
}

.primary-btn:hover,
.secondary-btn:hover,
.ghost-btn:hover {
  transform: translateY(-1px);
}

.primary-btn:disabled {
  opacity: 0.72;
  cursor: wait;
}

@media (max-width: 1120px) {
  .hero-panel,
  .content-grid {
    flex-direction: column;
  }

  .summary-panel {
    width: 100%;
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 860px) {
  .hero-metrics,
  .summary-panel,
  .field-grid {
    grid-template-columns: 1fr;
  }

  .topbar,
  .hero-panel,
  .form-footer {
    flex-direction: column;
    align-items: stretch;
  }

  .topbar-actions {
    width: 100%;
  }

  .topbar-actions button,
  .form-footer button {
    width: 100%;
  }
}
</style>
