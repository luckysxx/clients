<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { normalizeInternalPath } from '@clients/shared'

import { loginBySso, refreshBySso } from '@/api/sso'
import { useAuthStore } from '@/stores/auth'

const loginForm = reactive({
  username: '',
  password: '',
})

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const isSubmitting = ref(false)
const isRedirecting = ref(false)
const showAccountPicker = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const DEFAULT_APP_CODE = import.meta.env.VITE_DEFAULT_APP_CODE?.trim() || 'go-note'

/**
 * 客户端 JWT 过期检查（仅解码 payload 读 exp，不做签名校验）
 * bufferSeconds: 提前多少秒判定过期，避免在传输过程中刚好过期
 */
function isTokenExpired(token: string, bufferSeconds = 30): boolean {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return true
    const payloadPart = parts[1]
    if (!payloadPart) return true
    const payload = JSON.parse(atob(payloadPart))
    if (!payload.exp) return true
    return payload.exp * 1000 < Date.now() + bufferSeconds * 1000
  } catch {
    return true
  }
}

function getSingleQueryValue(value: unknown): string {
  if (Array.isArray(value)) {
    return typeof value[0] === 'string' ? value[0] : ''
  }
  return typeof value === 'string' ? value : ''
}

function isSafeRedirectUri(uri: string): boolean {
  try {
    const parsed = new URL(uri)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

const ssoContext = computed(() => {
  const clientId = getSingleQueryValue(route.query.client_id).trim()
  const appCode = getSingleQueryValue(route.query.app_code).trim() || clientId || DEFAULT_APP_CODE
  const redirectUri = getSingleQueryValue(route.query.redirect_uri).trim()
  const state = getSingleQueryValue(route.query.state).trim()
  const effectiveAppCode = appCode
  const hasAppContext = effectiveAppCode.length > 0 && redirectUri.length > 0 && isSafeRedirectUri(redirectUri)

  return {
    clientId,
    appCode,
    effectiveAppCode,
    redirectUri,
    state,
    hasAppContext,
    canRedirect: hasAppContext,
    canSubmit: effectiveAppCode.length > 0,
  }
})

const postLoginRedirect = computed(() => normalizeInternalPath(getSingleQueryValue(route.query.redirect), '/account'))

function createDeviceId(): string {
  if (typeof globalThis !== 'undefined' && globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID()
  }

  const timePart = Date.now().toString(36)
  const randomPart = Math.random().toString(36).slice(2, 12)
  return `device-${timePart}-${randomPart}`
}

function buildRedirectTarget(payload: {
  userId: number
  username: string
  accessToken: string
  refreshToken: string
}): string {
  const callbackUrl = new URL(ssoContext.value.redirectUri)
  callbackUrl.searchParams.set('result', 'logged_in')
  callbackUrl.searchParams.set('user_id', String(payload.userId))
  callbackUrl.searchParams.set('username', payload.username)

  if (ssoContext.value.clientId) {
    callbackUrl.searchParams.set('client_id', ssoContext.value.clientId)
  }
  if (ssoContext.value.effectiveAppCode) {
    callbackUrl.searchParams.set('app_code', ssoContext.value.effectiveAppCode)
  }
  if (ssoContext.value.state) {
    callbackUrl.searchParams.set('state', ssoContext.value.state)
  }

  const hashParams = new URLSearchParams({
    access_token: payload.accessToken,
    refresh_token: payload.refreshToken,
    token_type: 'Bearer',
  })
  callbackUrl.hash = hashParams.toString()

  return callbackUrl.toString()
}

const handleLogin = async () => {
  if (isSubmitting.value) {
    return
  }

  if (!ssoContext.value.canSubmit) {
    errorMessage.value = '缺少应用标识，暂时无法完成登录'
    return
  }

  errorMessage.value = ''
  successMessage.value = ''
  isSubmitting.value = true

  try {
    // 生成或复用浏览器端的设备指纹，作为 device_id
    let deviceId = localStorage.getItem('device_id')
    if (!deviceId) {
      deviceId = createDeviceId()
      localStorage.setItem('device_id', deviceId)
    }

    const result = await loginBySso({
      username: loginForm.username,
      password: loginForm.password,
      app_code: ssoContext.value.effectiveAppCode,
      device_id: deviceId,
    })

    authStore.setAuth(result.access_token, result.refresh_token, {
      id: result.user_id,
      username: result.username,
      email: '',
    })

    successMessage.value = '登录成功'

    if (ssoContext.value.canRedirect) {
      const target = buildRedirectTarget({
        userId: result.user_id,
        username: result.username,
        accessToken: result.access_token,
        refreshToken: result.refresh_token,
      })
      window.location.replace(target)
      return
    }

    await router.replace(postLoginRedirect.value)
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '登录失败，请稍后重试'
  } finally {
    isSubmitting.value = false
  }
}

/**
 * 以当前已登录账号继续：确保 access token 有效后跳回下游应用
 */
const handleContinueAsCurrentUser = async () => {
  if (!authStore.user) return

  isRedirecting.value = true
  errorMessage.value = ''

  let accessToken = authStore.token
  let refreshToken = authStore.refreshToken

  // 如果 access token 已过期，尝试用 refresh token 续签
  if (isTokenExpired(accessToken)) {
    if (!refreshToken) {
      authStore.clearAuth()
      showAccountPicker.value = false
      isRedirecting.value = false
      return
    }

    try {
      const result = await refreshBySso(refreshToken)
      accessToken = result.access_token
      refreshToken = result.refresh_token
      authStore.updateTokens(accessToken, refreshToken)
    } catch {
      // refresh 失败，清除登录态，切换到登录表单
      authStore.clearAuth()
      showAccountPicker.value = false
      isRedirecting.value = false
      errorMessage.value = '登录态已失效，请重新登录'
      return
    }
  }

  const target = buildRedirectTarget({
    userId: authStore.user.id,
    username: authStore.user.username,
    accessToken,
    refreshToken,
  })
  window.location.replace(target)
}

/**
 * 切换到登录表单（使用其他账号）
 * 不清除当前登录态 — 用户登录新账号时 setAuth 会覆盖
 */
const handleSwitchAccount = () => {
  showAccountPicker.value = false
}

onMounted(() => {
  authStore.initFromStorage()

  if (!authStore.isAuthenticated || !authStore.user) {
    return
  }

  // 已登录 + 有 SSO 上下文 → 显示账号选择，不自动跳转
  if (ssoContext.value.canRedirect) {
    showAccountPicker.value = true
    return
  }
})

const goToAccountCenter = () => {
  router.push('/account')
}
</script>

<template>
  <main class="register-page">
    <section class="surface">
      <header class="top-bar">
        <div class="top-left">
          <div class="logo-mark" aria-hidden="true">L</div>
          <strong class="logo-text">luckys</strong>
        </div>

        <div class="top-right">
          <button v-if="authStore.isAuthenticated" type="button" class="text-btn" @click="goToAccountCenter">
            账号中心
          </button>
          <button type="button" class="text-btn">简体中文</button>
        </div>
      </header>

      <div class="hero-bg" aria-hidden="true">
        <span class="sweep" />
        <span class="cloud cloud-back" />
        <span class="cloud cloud-mid" />
        <span class="cloud cloud-front" />
        <span class="flow flow-a" />
        <span class="flow flow-b" />
        <span class="flow flow-c" />
        <span class="flow flow-d" />
        <span class="mist mist-a" />
        <span class="mist mist-b" />
      </div>

      <!-- 账号选择卡片：已登录 + SSO 上下文时显示 -->
      <section v-if="showAccountPicker" class="auth-card">
        <h1>选择账号</h1>
        <p class="sub-title">继续前往 {{ ssoContext.effectiveAppCode }}</p>

        <div class="account-picker">
          <div class="account-grid">
            <button
              type="button"
              class="account-card"
              :disabled="isRedirecting"
              @click="handleContinueAsCurrentUser"
            >
              <div class="account-avatar">{{ authStore.user?.username?.slice(0, 1).toUpperCase() }}</div>
              <p class="account-name">{{ authStore.user?.username }}</p>
            </button>
          </div>

          <p v-if="isRedirecting" class="form-message success">跳转中...</p>
          <p v-if="errorMessage" class="form-message error">{{ errorMessage }}</p>

          <p class="switch-auth">
            <button type="button" class="switch-link-btn" @click="handleSwitchAccount">
              使用其他账号登录
            </button>
          </p>
        </div>
      </section>

      <!-- 登录表单：未登录或选择切换账号时显示 -->
      <section v-else class="auth-card">
        <h1>欢迎登录 luckys</h1>
        <p class="sub-title">账号中心与统一身份入口</p>

        <form class="auth-form" @submit.prevent="handleLogin">
          <label class="form-item">
            <input v-model="loginForm.username" type="text" placeholder="用户名" required />
          </label>

          <label class="form-item">
            <input v-model="loginForm.password" type="password" placeholder="密码" required />
          </label>

          <p v-if="errorMessage" class="form-message error">{{ errorMessage }}</p>
          <p v-if="successMessage" class="form-message success">
            {{ successMessage }}
            <span v-if="!ssoContext.canRedirect">，你可以返回应用继续操作</span>
          </p>

          <button type="submit" class="primary-btn" :disabled="isSubmitting || !ssoContext.canSubmit">
            {{ isSubmitting ? '登录中...' : '立即登录' }}
          </button>

          <p class="switch-auth">
            没有账号？
            <RouterLink class="switch-link" :to="{ name: 'sso-register', query: route.query }">去注册</RouterLink>
          </p>

          <!-- 已登录账号快捷入口 -->
          <p v-if="ssoContext.canRedirect" class="switch-auth account-switch-hint">
            <button
              v-if="authStore.isAuthenticated"
              type="button"
              class="switch-link-btn"
              @click="showAccountPicker = true"
            >
              使用已登录账号
            </button>
            <span v-else class="no-account-hint">目前没有已登录账号</span>
          </p>
        </form>
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
}

.register-page {
  --bg-top: #b7d8ea;
  --bg-bottom: #d9e6ef;
  --input-line: rgba(173, 193, 209, 0.72);
  --text: #111827;

  min-height: 100vh;
  padding: 0;
  color: var(--text);
  font-family: 'Outfit', 'Avenir Next', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  background: linear-gradient(180deg, var(--bg-top) 0%, var(--bg-bottom) 100%);
}


.surface {
  position: relative;
  width: 100%;
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 104px 16px 84px;
  overflow: hidden;
}

.top-bar {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 3;
  width: 100%;
  height: 68px;
  padding: 0 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(184, 214, 232, 0.58);
  border-bottom: 1px solid rgba(112, 151, 181, 0.14);
}

.top-bar::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.58), transparent);
}

.top-left,
.top-right {
  display: flex;
  align-items: center;
}

.top-right {
  gap: 14px;
}

.logo-mark {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  display: grid;
  place-items: center;
  font-size: 1.05rem;
  font-weight: 700;
  color: #ffffff;
  background: #111827;
}

.logo-text {
  margin-left: 10px;
  font-size: 1.28rem;
  letter-spacing: 0.02em;
}

.text-btn {
  border: none;
  background: transparent;
  color: #1f2f43;
  font-size: 1rem;
  cursor: pointer;
  transition: color 0.2s ease;
}

.text-link {
  color: #1f2f43;
  font-size: 1rem;
  text-decoration: none;
  transition: color 0.2s ease;
}

.text-btn:hover,
.text-link:hover {
  color: #103b63;
}

.hero-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  background:
    radial-gradient(58% 42% at 86% 20%, rgba(92, 183, 236, 0.52), transparent 74%),
    radial-gradient(120% 58% at 14% 40%, rgba(232, 245, 252, 0.62), transparent 60%),
    linear-gradient(180deg, rgba(170, 205, 227, 0.2), rgba(216, 229, 239, 0.08));
}

.hero-bg::before {
  content: '';
  position: absolute;
  inset: -8% -4% auto -4%;
  height: 46%;
  background:
    radial-gradient(110% 58% at 56% 10%, rgba(255, 255, 255, 0.42), transparent 66%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.26), transparent 72%);
  opacity: 0.92;
  animation: shimmer 16s ease-in-out infinite;
}

.hero-bg::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: radial-gradient(circle at 1px 1px, rgba(181, 212, 231, 0.22) 1px, transparent 0);
  background-size: 22px 22px;
  opacity: 0.24;
}

.cloud {
  position: absolute;
  border-radius: 44% 56% 54% 46% / 56% 48% 52% 44%;
  background:
    radial-gradient(32% 34% at 26% 28%, rgba(255, 255, 255, 0.88), rgba(255, 255, 255, 0.08) 72%, transparent 100%),
    radial-gradient(30% 32% at 76% 30%, rgba(255, 255, 255, 0.78), rgba(255, 255, 255, 0.06) 74%, transparent 100%),
    radial-gradient(72% 68% at 50% 62%, rgba(236, 246, 252, 0.76), rgba(173, 209, 231, 0.28) 68%, rgba(132, 181, 213, 0.12) 92%, transparent 100%);
  box-shadow:
    inset 0 18px 30px rgba(255, 255, 255, 0.34),
    inset 0 -24px 30px rgba(137, 184, 213, 0.2),
    0 24px 42px rgba(118, 165, 196, 0.22);
  opacity: 0.8;
  will-change: transform;
}

.cloud-back {
  width: 44vw;
  height: 22vw;
  min-width: 520px;
  min-height: 250px;
  right: -10vw;
  top: -4vh;
  opacity: 0.62;
  animation: cloud-drift-a 30s ease-in-out infinite;
}

.cloud-mid {
  width: 58vw;
  height: 28vw;
  min-width: 720px;
  min-height: 340px;
  left: -22vw;
  top: 30vh;
  opacity: 0.74;
  animation: cloud-drift-b 34s ease-in-out infinite;
}

.cloud-front {
  width: 60vw;
  height: 34vw;
  min-width: 760px;
  min-height: 380px;
  left: 18vw;
  bottom: -30vh;
  opacity: 0.84;
  animation: cloud-drift-c 38s ease-in-out infinite;
}

.flow {
  position: absolute;
  border-radius: 50%;
  border: 1px solid rgba(178, 214, 236, 0.54);
  opacity: 0.9;
  box-shadow: 0 14px 30px rgba(120, 173, 204, 0.16);
  will-change: transform;
}

.flow-a {
  width: 122vw;
  height: 58vw;
  left: -66vw;
  top: 34vh;
  background: radial-gradient(ellipse at 62% 48%, rgba(255, 255, 255, 0.72), rgba(213, 234, 247, 0.44) 58%, rgba(161, 201, 225, 0.18) 82%, transparent 100%);
  animation: float-a 24s ease-in-out infinite;
}

.flow-b {
  width: 86vw;
  height: 46vw;
  right: -30vw;
  top: -12vh;
  background: radial-gradient(ellipse at 34% 52%, rgba(255, 255, 255, 0.68), rgba(200, 228, 244, 0.36) 62%, rgba(108, 181, 223, 0.2) 82%, transparent 100%);
  animation: float-b 28s ease-in-out infinite;
}

.flow-c {
  width: 82vw;
  height: 50vw;
  left: 16vw;
  bottom: -36vh;
  background: radial-gradient(ellipse at 44% 40%, rgba(255, 255, 255, 0.66), rgba(192, 222, 240, 0.34) 62%, rgba(108, 179, 221, 0.18) 84%, transparent 100%);
  animation: float-c 32s ease-in-out infinite;
}

.flow-d {
  width: 64vw;
  height: 34vw;
  left: 42vw;
  top: 50vh;
  background: radial-gradient(ellipse at 50% 46%, rgba(255, 255, 255, 0.6), rgba(196, 225, 242, 0.28) 62%, transparent 100%);
  opacity: 0.68;
  animation: float-d 26s ease-in-out infinite;
}

.mist {
  position: absolute;
  border-radius: 50%;
  filter: blur(14px);
  opacity: 0.5;
}

.mist-a {
  width: 32vw;
  height: 18vw;
  left: -6vw;
  top: 10vh;
  background: radial-gradient(ellipse at 52% 50%, rgba(255, 255, 255, 0.56), rgba(202, 227, 242, 0.28) 66%, transparent 100%);
  animation: drift-a 20s ease-in-out infinite;
}

.mist-b {
  width: 28vw;
  height: 16vw;
  right: 6vw;
  bottom: 14vh;
  background: radial-gradient(ellipse at 52% 50%, rgba(255, 255, 255, 0.52), rgba(188, 219, 239, 0.24) 66%, transparent 100%);
  animation: drift-b 24s ease-in-out infinite;
}

.sweep {
  position: absolute;
  top: -18vh;
  left: -38vw;
  width: 28vw;
  height: 140vh;
  transform: rotate(12deg);
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.08) 35%,
    rgba(255, 255, 255, 0.34) 50%,
    rgba(255, 255, 255, 0.1) 65%,
    rgba(255, 255, 255, 0) 100%
  );
  filter: blur(2px);
  opacity: 0.7;
  animation: sweep-pass 14s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}

.auth-card {
  position: relative;
  z-index: 1;
  width: min(360px, 100%);
  transform: translateY(-24px);
  padding: 0;
}

.auth-card h1 {
  margin: 0;
  text-align: center;
  font-size: 2rem;
  font-weight: 700;
}

.sub-title {
  margin: 8px 0 0;
  text-align: center;
  font-size: 0.88rem;
  letter-spacing: 0.08em;
  color: rgba(38, 69, 95, 0.72);
}

.auth-form {
  margin-top: 18px;
  display: grid;
  gap: 16px;
}

.form-item {
  display: grid;
  gap: 0;
}

.auth-form input[type='text'],
.auth-form input[type='password'] {
  width: 100%;
  height: 42px;
  border: 1px solid var(--input-line);
  border-radius: 6px;
  padding: 0 12px;
  color: #26364a;
  background: linear-gradient(180deg, rgba(250, 253, 255, 0.92), rgba(239, 246, 251, 0.74));
  outline: none;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.68);
}

.auth-form input::placeholder {
  color: #9fb0c0;
}

.auth-form input:focus {
  border-color: rgba(20, 146, 236, 0.65);
  background: rgba(250, 253, 255, 0.92);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

.auth-form input:read-only {
  background: linear-gradient(180deg, rgba(242, 248, 253, 0.9), rgba(232, 241, 249, 0.72));
  color: rgba(38, 54, 74, 0.78);
}

.primary-btn {
  margin-top: 2px;
  height: 42px;
  border: none;
  border-radius: 6px;
  font-size: 1.05rem;
  font-weight: 600;
  color: #ffffff;
  background: linear-gradient(180deg, #2aa3f3, #1492ec);
  cursor: pointer;
  box-shadow: 0 8px 18px rgba(20, 146, 236, 0.25);
}

.primary-btn:disabled {
  cursor: not-allowed;
  opacity: 0.72;
}

.primary-btn:hover {
  background: linear-gradient(180deg, #2aa3f3, #1492ec);
  box-shadow: 0 8px 18px rgba(20, 146, 236, 0.25);
}

.form-message {
  margin: 0;
  font-size: 0.82rem;
  line-height: 1.35;
}

.form-message.error {
  color: #b62626;
}

.form-message.success {
  color: #13673a;
}

.switch-auth {
  margin: 2px 0 0;
  text-align: center;
  font-size: 0.84rem;
  color: rgba(26, 53, 74, 0.74);
}

.switch-link {
  color: #116fb4;
  text-decoration: none;
}

/* ── 账号选择器 ── */
.account-picker {
  margin-top: 18px;
  display: grid;
  gap: 16px;
}

.account-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  justify-content: center;
}

.account-card {
  width: 96px;
  padding: 18px 8px 14px;
  border-radius: 14px;
  border: 1.5px solid rgba(173, 193, 209, 0.45);
  background: linear-gradient(180deg, rgba(250, 253, 255, 0.94), rgba(239, 246, 251, 0.76));
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.18s ease;
}

.account-card:hover {
  transform: translateY(-3px);
  border-color: rgba(20, 146, 236, 0.55);
  box-shadow: 0 8px 20px rgba(20, 146, 236, 0.14);
}

.account-card:disabled {
  cursor: wait;
  opacity: 0.65;
  transform: none;
}

.account-card .account-avatar {
  width: 48px;
  height: 48px;
  font-size: 1.2rem;
}

.account-avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-size: 1.1rem;
  font-weight: 700;
  color: #5f2a4a;
  background: linear-gradient(135deg, #ffd8b0 0%, #f8b4d9 100%);
  flex-shrink: 0;
}

.account-card .account-name {
  font-size: 0.82rem;
  text-align: center;
  word-break: break-all;
}



.account-name {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.account-hint {
  margin: 2px 0 0;
  font-size: 0.78rem;
  color: #13673a;
}

.switch-link-btn {
  border: none;
  background: transparent;
  color: #116fb4;
  font: inherit;
  font-size: 0.84rem;
  cursor: pointer;
  padding: 0;
  transition: color 0.2s ease;
}

.switch-link-btn:hover {
  color: #103b63;
}

.account-switch-hint {
  margin-top: 8px;
  padding-top: 10px;
  border-top: 1px solid rgba(173, 193, 209, 0.3);
}

.no-account-hint {
  color: #98a2b3;
  font-size: 0.82rem;
}

@keyframes float-a {
  0% {
    transform: translate3d(0, 0, 0) rotate(0deg);
  }
  50% {
    transform: translate3d(2.2vw, -1vh, 0) rotate(2.5deg);
  }
  100% {
    transform: translate3d(0, 0, 0) rotate(0deg);
  }
}

@keyframes float-b {
  0% {
    transform: translate3d(0, 0, 0) rotate(0deg);
  }
  50% {
    transform: translate3d(-2vw, 1.2vh, 0) rotate(-2.2deg);
  }
  100% {
    transform: translate3d(0, 0, 0) rotate(0deg);
  }
}

@keyframes float-c {
  0% {
    transform: translate3d(0, 0, 0) rotate(0deg);
  }
  50% {
    transform: translate3d(-1.6vw, -1.1vh, 0) rotate(1.8deg);
  }
  100% {
    transform: translate3d(0, 0, 0) rotate(0deg);
  }
}

@keyframes float-d {
  0% {
    transform: translate3d(0, 0, 0) rotate(0deg);
  }
  50% {
    transform: translate3d(1.5vw, -1vh, 0) rotate(-1.6deg);
  }
  100% {
    transform: translate3d(0, 0, 0) rotate(0deg);
  }
}

@keyframes drift-a {
  0% {
    transform: translate3d(0, 0, 0);
  }
  50% {
    transform: translate3d(1.4vw, -0.8vh, 0);
  }
  100% {
    transform: translate3d(0, 0, 0);
  }
}

@keyframes drift-b {
  0% {
    transform: translate3d(0, 0, 0);
  }
  50% {
    transform: translate3d(-1.2vw, 0.7vh, 0);
  }
  100% {
    transform: translate3d(0, 0, 0);
  }
}

@keyframes shimmer {
  0% {
    transform: translate3d(0, 0, 0);
    opacity: 0.74;
  }
  50% {
    transform: translate3d(1vw, -0.5vh, 0);
    opacity: 0.92;
  }
  100% {
    transform: translate3d(0, 0, 0);
    opacity: 0.74;
  }
}

@keyframes sweep-pass {
  0% {
    transform: translate3d(0, 0, 0) rotate(12deg);
    opacity: 0;
  }
  12% {
    opacity: 0.68;
  }
  50% {
    transform: translate3d(88vw, 0, 0) rotate(12deg);
    opacity: 0.68;
  }
  70% {
    opacity: 0;
  }
  100% {
    transform: translate3d(132vw, 0, 0) rotate(12deg);
    opacity: 0;
  }
}

@keyframes cloud-drift-a {
  0% {
    transform: translate3d(0, 0, 0);
  }
  50% {
    transform: translate3d(-1.6vw, 1vh, 0);
  }
  100% {
    transform: translate3d(0, 0, 0);
  }
}

@keyframes cloud-drift-b {
  0% {
    transform: translate3d(0, 0, 0);
  }
  50% {
    transform: translate3d(1.8vw, -1vh, 0);
  }
  100% {
    transform: translate3d(0, 0, 0);
  }
}

@keyframes cloud-drift-c {
  0% {
    transform: translate3d(0, 0, 0);
  }
  50% {
    transform: translate3d(-1.4vw, -0.8vh, 0);
  }
  100% {
    transform: translate3d(0, 0, 0);
  }
}

@media (max-width: 980px) {
  .top-bar {
    padding: 0 16px;
  }

  .top-right {
    gap: 8px;
  }

  .text-btn,
  .text-link {
    font-size: 0.9rem;
  }

  .auth-card h1 {
    font-size: 2.1rem;
  }
}

@media (max-width: 620px) {
  .surface {
    padding: 92px 14px 74px;
  }

  .top-bar {
    height: 60px;
  }

  .logo-mark {
    width: 26px;
    height: 26px;
    border-radius: 7px;
    font-size: 0.92rem;
  }

  .logo-text {
    font-size: 1.1rem;
  }

  .text-link {
    display: none;
  }

  .auth-card h1 {
    font-size: 1.2rem;
  }

  .auth-card {
    transform: translateY(-12px);
  }
}
</style>
