<template>
  <div class="auth-page">
    <section class="auth-panel auth-panel--form">
      <header class="panel-brand">
        <button type="button" class="brand-link" @click="router.push('/')">
          <span class="brand-mark">
            <span class="brand-mark__leaf"></span>
          </span>
          <span class="brand-name">GoNote</span>
        </button>
      </header>

      <div class="form-stage">
        <div class="login-card">
          <div class="card-corner">
            <span></span>
            <span></span>
            <span></span>
            <span></span>
          </div>

          <div class="card-body">
            <h1>欢迎使用 GoNote</h1>

            <div class="login-tabs" role="tablist" aria-label="登录方式">
              <button
                v-for="tab in loginTabs"
                :key="tab.value"
                type="button"
                class="login-tab"
                :class="{ 'is-active': activeTab === tab.value }"
                @click="activeTab = tab.value"
              >
                {{ tab.label }}
              </button>
            </div>

            <el-form :model="loginForm" class="login-form" @submit.prevent>
              <el-form-item class="form-item">
                <el-input
                  v-model="loginForm.account"
                  :placeholder="activeTab === 'email' ? '请输入你的邮箱 / 用户名' : '请输入你的用户名'"
                  size="large"
                />
              </el-form-item>

              <el-form-item class="form-item">
                <el-input
                  v-model="loginForm.password"
                  type="password"
                  placeholder="请输入密码"
                  size="large"
                  show-password
                  @keyup.enter="handleDirectLogin"
                />
              </el-form-item>

              <el-button
                type="primary"
                class="submit-button"
                size="large"
                :loading="loginLoading"
                :disabled="!canSubmit"
                @click="handleDirectLogin"
              >
                登录
              </el-button>
            </el-form>

            <label class="agreement">
              <input v-model="agreedToTerms" type="checkbox" />
              <span class="agreement-box"></span>
              <span class="agreement-copy">
                我已阅读并同意
                <button type="button" class="text-link" @click="handlePlaceholderAction('服务协议')">
                  服务协议
                </button>
                和
                <button type="button" class="text-link" @click="handlePlaceholderAction('隐私政策')">
                  隐私政策
                </button>
              </span>
            </label>

            <button type="button" class="switch-link" @click="handlePlaceholderAction('Lark 登录')">
              切换至 Lark 登录
            </button>

            <div class="more-login">
              <span class="divider-line"></span>
              <span>更多登录方式</span>
              <span class="divider-line"></span>
            </div>

            <button type="button" class="sso-button" @click="handleSsoLogin">
              <span class="sso-icon">
                <span></span>
              </span>
              <span>使用 SSO 登录</span>
            </button>
          </div>
        </div>

        <div class="register-row">
          <span>还没有账号？</span>
          <button type="button" class="text-link strong" @click="goToRegister">立即注册</button>
        </div>
      </div>

      <div class="locale-row">
        <span class="locale-globe"></span>
        <span>简体中文</span>
      </div>
    </section>

    <section class="auth-panel auth-panel--visual">
      <div class="visual-stage">
        <div class="visual-halo"></div>
        <div class="visual-cloud visual-cloud--1"></div>
        <div class="visual-cloud visual-cloud--2"></div>

        <div class="illustration">
          <!-- Left round tree -->
          <div class="tree tree--left">
            <div class="tree-crown"></div>
            <div class="tree-shadow"></div>
          </div>

          <!-- Ground bump under left tree -->
          <div class="ground-bump"></div>

          <!-- Right tall tree -->
          <div class="tree tree--right">
            <div class="tree-crown"></div>
            <div class="tree-shadow"></div>
          </div>

          <!-- House outline -->
          <svg class="house-outline" viewBox="0 0 340 300" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M170 18 L325 126 L325 290 L15 290 L15 126 Z"
                  stroke="rgba(255,255,255,0.85)" stroke-width="3" fill="rgba(255,255,255,0.12)" />
          </svg>

          <!-- Interior elements -->
          <div class="house-interior">
            <!-- Dome + silo -->
            <div class="geo-silo">
              <div class="geo-silo-dome"></div>
              <div class="geo-silo-body"></div>
            </div>

            <!-- Blue circle -->
            <div class="geo-circle"></div>

            <!-- Light blue triangle -->
            <div class="geo-triangle"></div>

            <!-- Arch block -->
            <div class="geo-arch-block">
              <div class="geo-arch-cutout"></div>
            </div>

            <!-- Bar chart -->
            <div class="geo-bars">
              <div class="geo-bar bar-1"></div>
              <div class="geo-bar bar-2"></div>
              <div class="geo-bar bar-3"></div>
              <div class="geo-bar bar-4"></div>
            </div>
          </div>
        </div>

        <div class="visual-copy">
          <h2>先进入团队 再写你的文档</h2>
          <p>统一账号、统一权限、统一协作入口</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import { getOrCreateDeviceID, login } from '@/api/user'
import { buildSsoLoginUrl } from '@/router'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const loginLoading = ref(false)
const activeTab = ref<'account' | 'email'>('email')
const agreedToTerms = ref(true)

const loginTabs = [
  { label: '账号', value: 'account' as const },
  { label: '邮箱', value: 'email' as const },
]

const loginForm = reactive({
  account: '',
  password: '',
})

const canSubmit = computed(() => {
  return Boolean(loginForm.account.trim() && loginForm.password.trim() && agreedToTerms.value)
})

const USER_PLATFORM_URL = import.meta.env.VITE_USER_PLATFORM_URL || 'http://localhost:5173'

const handlePlaceholderAction = (label: string) => {
  ElMessage.info(`${label} 页面暂未接入`)
}

const handleDirectLogin = async () => {
  if (!agreedToTerms.value) {
    ElMessage.warning('请先同意服务协议和隐私政策')
    return
  }

  if (!loginForm.account || !loginForm.password) {
    ElMessage.warning('请填写完整的登录信息')
    return
  }

  loginLoading.value = true
  try {
    const res = await login({
      username: loginForm.account,
      password: loginForm.password,
      app_code: 'go-note',
      device_id: getOrCreateDeviceID(),
    })

    authStore.setAuth(res.access_token, res.refresh_token, {
      id: res.user_id,
      username: res.username,
      email: '',
    })

    ElMessage.success('登录成功！')
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/'
    router.push(redirect)
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : '登录失败，请检查用户名和密码'
    ElMessage.error(msg)
  } finally {
    loginLoading.value = false
  }
}

const handleSsoLogin = () => {
  if (!agreedToTerms.value) {
    ElMessage.warning('请先同意服务协议和隐私政策')
    return
  }

  const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/'
  window.location.href = buildSsoLoginUrl(redirect)
}

const goToRegister = () => {
  window.open(`${USER_PLATFORM_URL}/register?app_code=go-note`, '_blank')
}

onMounted(() => {
  authStore.initFromStorage()
  if (authStore.isAuthenticated) {
    router.replace('/')
  }
})
</script>

<style scoped lang="scss">
.auth-page {
  min-height: 100vh;
  display: grid;
  grid-template-columns: minmax(680px, 6.5fr) minmax(360px, 3.5fr);
  background: #fff;
}

.auth-panel {
  min-width: 0;
}

.auth-panel--form {
  display: flex;
  flex-direction: column;
  padding: 18px 28px 22px;
  background:
    radial-gradient(circle at left top, rgba(54, 98, 236, 0.05), transparent 24%),
    linear-gradient(180deg, #ffffff 0%, #fdfdff 100%);
}

.panel-brand {
  display: flex;
  align-items: center;
  min-height: 56px;
}

.brand-link {
  border: 0;
  background: transparent;
  display: inline-flex;
  align-items: center;
  gap: 14px;
  cursor: pointer;
  padding: 0;
}

.brand-mark {
  width: 42px;
  height: 32px;
  border-radius: 16px 16px 12px 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #4f7cff 0%, #2f6df5 52%, #14b8a6 100%);
  box-shadow: 0 10px 30px rgba(47, 109, 245, 0.24);
}

.brand-mark__leaf {
  width: 22px;
  height: 18px;
  border-radius: 6px 12px 6px 14px;
  background: rgba(255, 255, 255, 0.95);
  transform: rotate(28deg) translateY(-1px);
}

.brand-name {
  font-size: 20px;
  font-weight: 800;
  letter-spacing: 0.02em;
  color: #111827;
}

.form-stage {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 22px;
}

.login-card {
  width: min(100%, 468px);
  min-height: 586px;
  border-radius: 16px;
  background: #fff;
  border: 1px solid #dde4ef;
  box-shadow:
    0 18px 42px rgba(17, 24, 39, 0.07),
    0 2px 6px rgba(17, 24, 39, 0.04);
  position: relative;
  overflow: hidden;
}

.card-corner {
  position: absolute;
  top: 0;
  right: 0;
  width: 86px;
  height: 86px;
  background: linear-gradient(135deg, #7fa4ff 0%, #5c87f6 100%);
  clip-path: polygon(100% 0, 0 0, 100% 100%);
  display: grid;
  grid-template-columns: repeat(2, 10px);
  gap: 6px;
  justify-content: end;
  align-content: start;
  padding: 14px 10px 0 0;
}

.card-corner span {
  width: 10px;
  height: 10px;
  border: 2px solid rgba(255, 255, 255, 0.92);
  border-radius: 3px;
}

.card-body {
  display: flex;
  flex-direction: column;
  padding: 38px 34px 26px;
}

.card-body h1 {
  margin: 0 0 18px;
  font-size: 22px;
  line-height: 1.2;
  font-weight: 800;
  color: #1f2937;
}

.login-tabs {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 16px;
}

.login-tab {
  border: 0;
  background: transparent;
  padding: 0 0 8px;
  color: #6b7280;
  font-size: 15px;
  font-weight: 700;
  border-bottom: 3px solid transparent;
  cursor: pointer;
}

.login-tab.is-active {
  color: #306cff;
  border-bottom-color: #306cff;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-item {
  margin-bottom: 0;
}

.login-form :deep(.el-input__wrapper) {
  min-height: 46px;
  border-radius: 10px;
  padding: 0 14px;
  box-shadow: inset 0 0 0 1px #d8e1ef;
}

.login-form :deep(.el-input__wrapper.is-focus) {
  box-shadow: inset 0 0 0 1px #3b6cf6;
}

.login-form :deep(.el-input__inner) {
  font-size: 15px;
}

.submit-button {
  width: 100%;
  height: 47px;
  margin-top: 4px;
  border-radius: 10px;
  border: 0;
  background: linear-gradient(180deg, #4e83ff 0%, #306cff 100%);
  font-size: 17px;
  font-weight: 700;
}

.submit-button.is-disabled,
.submit-button:disabled {
  background: #c5cad3;
  color: rgba(255, 255, 255, 0.92);
}

.agreement {
  margin-top: 16px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  cursor: pointer;
  user-select: none;
}

.agreement input {
  display: none;
}

.agreement-box {
  width: 22px;
  height: 22px;
  margin-top: 1px;
  border-radius: 6px;
  background: #fff;
  box-shadow: inset 0 0 0 1px #c7d2e3;
  position: relative;
  flex-shrink: 0;
}

.agreement input:checked + .agreement-box {
  background: #3b6cf6;
  box-shadow: inset 0 0 0 1px #3b6cf6;
}

.agreement input:checked + .agreement-box::after {
  content: '';
  position: absolute;
  left: 7px;
  top: 4px;
  width: 5px;
  height: 9px;
  border: solid #fff;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.agreement-copy {
  color: #586174;
  font-size: 13px;
  line-height: 1.65;
}

.text-link {
  border: 0;
  background: transparent;
  padding: 0;
  color: #306cff;
  font: inherit;
  cursor: pointer;
}

.text-link.strong {
  font-weight: 700;
}

.switch-link {
  margin-top: 8px;
  align-self: flex-start;
  border: 0;
  background: transparent;
  padding: 0;
  color: #306cff;
  font-size: 13px;
  cursor: pointer;
}

.more-login {
  margin-top: 106px;
  display: flex;
  align-items: center;
  gap: 16px;
  color: #8a94a8;
  font-size: 13px;
  white-space: nowrap;
}

.divider-line {
  flex: 1;
  height: 1px;
  background: #e7eaf0;
}

.sso-button {
  margin-top: 14px;
  width: 100%;
  height: 47px;
  border-radius: 10px;
  border: 1px solid #d7dfec;
  background: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  font-size: 16px;
  font-weight: 700;
  color: #1f2937;
  cursor: pointer;
  transition:
    border-color 0.18s ease,
    transform 0.18s ease,
    box-shadow 0.18s ease;
}

.sso-button:hover {
  border-color: #9acb91;
  transform: translateY(-1px);
  box-shadow: 0 14px 24px rgba(35, 145, 51, 0.08);
}

.sso-icon {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: 2px solid #39a845;
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.sso-icon span {
  width: 13px;
  height: 10px;
  border-radius: 10px 10px 8px 8px;
  border: 2px solid #39a845;
  border-top-color: transparent;
}

.register-row {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #677184;
  font-size: 14px;
}

.locale-row {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #667085;
  font-size: 13px;
}

.locale-globe {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2px solid #98a2b3;
  position: relative;
}

.locale-globe::before,
.locale-globe::after {
  content: '';
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  border-radius: 999px;
  border: 1px solid #98a2b3;
}

.locale-globe::before {
  width: 8px;
  height: 18px;
}

.locale-globe::after {
  width: 18px;
  height: 8px;
}

.auth-panel--visual {
  background: linear-gradient(180deg, #e8ecf8 0%, #dfe4f4 40%, #e4e8f6 100%);
  position: relative;
  overflow: hidden;
}

.visual-stage {
  height: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 42px 40px;
  position: relative;
}

.visual-cloud--1 {
  position: absolute;
  top: 22%;
  left: 30%;
  width: 200px;
  height: 50px;
  background: rgba(255, 255, 255, 0.92);
  border-radius: 999px;
  filter: blur(0.5px);
  z-index: 3;
}

.visual-cloud--2 {
  position: absolute;
  top: 28%;
  right: 8%;
  width: 120px;
  height: 36px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 999px;
  filter: blur(0.5px);
  z-index: 3;
}

.visual-halo {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at 50% 40%, rgba(255, 255, 255, 0.5) 0%, transparent 50%);
  pointer-events: none;
}

.illustration {
  width: min(100%, 480px);
  height: 400px;
  position: relative;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

/* ── Trees ── */
.tree {
  position: absolute;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 4;
}

.tree--left {
  left: 6px;
  bottom: 18px;
}

.tree--left .tree-crown {
  width: 94px;
  height: 94px;
  border-radius: 50%;
  background: #c8cdd5;
}

.tree--left .tree-shadow {
  width: 70px;
  height: 14px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.06);
  margin-top: -4px;
}

.tree--right {
  right: 0;
  bottom: 0;
}

.tree--right .tree-crown {
  width: 115px;
  height: 248px;
  border-radius: 58px;
  background: #c8cdd5;
}

.tree--right .tree-shadow {
  width: 80px;
  height: 16px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.06);
  margin-top: -4px;
}

/* ── Ground ── */
.ground-bump {
  position: absolute;
  left: -10px;
  bottom: 0;
  width: 160px;
  height: 36px;
  border-radius: 80px 80px 0 0;
  background: #bec5cf;
  z-index: 3;
}

/* ── House outline (SVG) ── */
.house-outline {
  position: absolute;
  left: 50%;
  bottom: 10px;
  width: 340px;
  height: 300px;
  transform: translateX(-50%);
  z-index: 5;
  pointer-events: none;
}

/* ── House interior elements ── */
.house-interior {
  position: absolute;
  left: 50%;
  bottom: 10px;
  width: 310px;
  height: 170px;
  transform: translateX(-50%);
  z-index: 5;
}

/* Silo (dome + rectangular body) */
.geo-silo {
  position: absolute;
  left: 50%;
  bottom: 0;
  transform: translateX(-55%);
  width: 90px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.geo-silo-dome {
  width: 90px;
  height: 48px;
  border-radius: 45px 45px 0 0;
  background: #a3aab5;
}

.geo-silo-body {
  width: 90px;
  height: 52px;
  background: #bcc2cc;
}

/* Blue circle */
.geo-circle {
  position: absolute;
  left: 50px;
  bottom: 108px;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: #3366f5;
  z-index: 1;
}

/* Light blue triangle */
.geo-triangle {
  position: absolute;
  left: 30px;
  bottom: 50px;
  width: 0;
  height: 0;
  border-left: 42px solid transparent;
  border-right: 42px solid transparent;
  border-bottom: 70px solid #b8cbfc;
  z-index: 1;
}

/* Arch block (castle-like block with arch cutout) */
.geo-arch-block {
  position: absolute;
  left: 18px;
  bottom: 0;
  width: 140px;
  height: 82px;
  background: #b5bbc7;
  z-index: 2;
}

.geo-arch-cutout {
  position: absolute;
  left: 50%;
  bottom: 0;
  transform: translateX(-50%);
  width: 62px;
  height: 50px;
  border-radius: 31px 31px 0 0;
  background: #dfe4f0;
}

/* Bar chart */
.geo-bars {
  position: absolute;
  right: 16px;
  bottom: 0;
  display: flex;
  align-items: flex-end;
  gap: 3px;
  z-index: 2;
}

.geo-bar {
  width: 30px;
  border-radius: 1px;
}

.bar-1 {
  height: 78px;
  background: #cde534;
}

.bar-2 {
  height: 130px;
  background: #a8d840;
}

.bar-3 {
  height: 158px;
  background: #5dbd3e;
}

.bar-4 {
  height: 118px;
  background: #3da534;
}

.visual-copy {
  margin-top: 24px;
  text-align: center;
  color: #1f2937;
}

.visual-copy h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 800;
}

.visual-copy p {
  margin: 14px 0 0;
  color: #70798c;
  font-size: 15px;
}

@media (max-width: 1320px) {
  .auth-page {
    grid-template-columns: minmax(560px, 6.5fr) minmax(320px, 3.5fr);
  }

  .login-card {
    width: min(100%, 450px);
    min-height: 560px;
  }

  .card-body {
    padding: 34px 28px 24px;
  }

  .illustration {
    width: min(100%, 380px);
    height: 332px;
    transform: scale(0.85);
    transform-origin: bottom center;
  }
}

@media (max-width: 1080px) {
  .auth-page {
    grid-template-columns: 1fr;
  }

  .auth-panel--visual {
    display: none;
  }

  .auth-panel--form {
    padding: 24px 18px 20px;
  }

  .login-card {
    min-height: auto;
    width: min(100%, 520px);
  }

  .more-login {
    margin-top: 72px;
  }
}

@media (max-width: 640px) {
  .card-body {
    padding: 36px 22px 28px;
  }

  .card-body h1 {
    font-size: 22px;
  }

  .login-tabs {
    gap: 20px;
  }

  .login-tab {
    font-size: 16px;
  }

  .submit-button,
  .sso-button {
    height: 48px;
    font-size: 16px;
  }

  .register-row,
  .locale-row {
    font-size: 15px;
  }

  .more-login {
    margin-top: 56px;
  }
}
</style>
