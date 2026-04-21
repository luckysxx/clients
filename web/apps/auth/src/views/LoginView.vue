<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  getAppConfig,
  PhoneLoginCard,
  PhonePasswordLoginCard,
  resolvePassportBrand,
  type PhoneAuthEntryResponse,
  type PhonePasswordLoginResponse,
} from '@clients/shared'

import { sendPhoneCode, phoneEntry, phonePasswordLogin } from '@/api/sso'
import { useAuthStore } from '@/stores/auth'
import { exchangeAppSession, type AppSessionPayload } from '@clients/auth'
import { getOrCreateDeviceId } from '@/utils/auth-session'
import {
  buildAppNavigationTarget,
  buildAuthLandingTarget,
  buildPreservedSsoQuery,
  buildSsoRedirectTarget,
  resolvePostAuthRedirect,
  resolveSsoRouteContext,
} from '@/utils/sso-route'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const errorMessage = ref('')
const successMessage = ref('')
const loginMode = ref<'code' | 'password'>('code')
const isLoadingSso = ref(true)
const ssoPayload = ref<AppSessionPayload | null>(null)

const handleSsoContinue = () => {
  if (!ssoPayload.value) return
  successMessage.value = 'SSO 验证成功，正在进入...'
  handleLoginSuccess({
    access_token: ssoPayload.value.access_token,
    refresh_token: ssoPayload.value.refresh_token,
    user_id: ssoPayload.value.user_id,
    username: ssoPayload.value.username,
  })
}

const ssoContext = computed(() => resolveSsoRouteContext(route.query, 'default'))
const brand = computed(() => resolvePassportBrand(ssoContext.value.appId || ssoContext.value.appCode, 'default'))
const postLoginRedirect = computed(() => resolvePostAuthRedirect(route.query, '/'))
const deviceId = getOrCreateDeviceId()

const effectiveAppCode = computed(() => ssoContext.value.appCode || brand.value.appCode)

const entryTitle = computed(() => `欢迎使用 ${brand.value.productName}`)
const entryDescription = computed(() => brand.value.authDescription)

const resolveAppBaseUrl = (appCode: string) => {
  const config = getAppConfig()
  if (appCode === 'go-note') {
    return config.go_note_url
  }

  if (appCode === 'go-chat') {
    return config.go_chat_url
  }

  return config.go_chat_url
}

const buildAppLandingTarget = (payload?: {
  accessToken: string
  refreshToken: string
  userId: number
  username: string
}) => {
  const target = buildAppNavigationTarget(resolveAppBaseUrl(effectiveAppCode.value), postLoginRedirect.value)
  if (!payload) {
    return target
  }
  return buildAuthLandingTarget(target, payload)
}

const themeVars = computed(() => ({
  '--passport-accent': brand.value.accent,
  '--passport-accent-deep': brand.value.accentDeep,
  '--passport-accent-soft': brand.value.accentSoft,
  '--passport-hero-glow': brand.value.heroGlow,
}))


const handleLoginSuccess = (result: {
  access_token: string
  refresh_token: string
  user_id: number
  username: string
}) => {
  authStore.setAuth(result.access_token, result.refresh_token, {
    id: result.user_id,
    username: result.username,
    email: '',
  })
  successMessage.value = '登录成功，正在跳转...'

  if (ssoContext.value.hasRedirect) {
    window.location.replace(buildSsoRedirectTarget(ssoContext.value, {
      userId: result.user_id,
      username: result.username,
      accessToken: result.access_token,
      refreshToken: result.refresh_token,
    }))
    return
  }

  window.location.replace(buildAppLandingTarget({
    accessToken: result.access_token,
    refreshToken: result.refresh_token,
    userId: result.user_id,
    username: result.username,
  }))
}

const handlePhoneSuccess = (res: PhoneAuthEntryResponse) => {
  handleLoginSuccess({
    access_token: res.access_token!,
    refresh_token: res.refresh_token!,
    user_id: res.user_id!,
    username: res.username!,
  })
}

const handlePhonePasswordSuccess = (res: PhonePasswordLoginResponse) => {
  handleLoginSuccess({
    access_token: res.access_token!,
    refresh_token: res.refresh_token!,
    user_id: res.user_id!,
    username: res.username!,
  })
}


const handleProviderClick = (providerId: string, providerLabel: string) => {
  successMessage.value = `${providerLabel} 已预留 OAuth2 接入位，后续接入回调即可启用。`
  errorMessage.value = ''
}

const providerIconText = (providerId: string) => {
  if (providerId === 'google') return 'G'
  if (providerId === 'apple') return 'Apple'
  return 'SSO'
}


onMounted(async () => {
  authStore.initFromStorage()
  
  try {
    const res = await exchangeAppSession({ app_code: effectiveAppCode.value, device_id: deviceId })
    ssoPayload.value = res
  } catch (error) {
    ssoPayload.value = null
  } finally {
    isLoadingSso.value = false
  }
})
</script>

<template>
  <main class="passport-page" :style="themeVars">
    <section class="passport-shell">

      <section class="shell-panel">
          <div class="panel-head">
            <h1>{{ entryTitle }}</h1>
            <p>
              {{ entryDescription }}
              <template v-if="ssoContext.isSsoMode">
                当前将继续前往 <strong class="hero-highlight">{{ brand.productName }}</strong>
              </template>
            </p>
          </div>
          <div class="panel-body">
            
            <div v-if="isLoadingSso" class="sso-loading-layer">
              <div class="spinner spinner--accent"></div>
              <span>正在验证身份信息...</span>
            </div>

            <template v-else>
              <div v-if="ssoPayload" class="sso-continue-card">
                <div class="sso-profile">
                  <div class="sso-avatar">{{ ssoPayload.username.substring(0, 1).toUpperCase() }}</div>
                  <div class="sso-info">
                    <strong>{{ ssoPayload.username }}</strong>
                    <span>已在当前设备授权登录</span>
                  </div>
                </div>
                <button type="button" class="sso-continue-btn" @click="handleSsoContinue">
                  继续以 {{ ssoPayload.username }} 身份进入
                </button>
                <button type="button" class="sso-switch-btn" @click="ssoPayload = null">
                  使用其他账号登录
                </button>
              </div>

              <div v-else class="panel-form">
                <div class="login-mode-switch" role="tablist" aria-label="登录方式切换">
                  <button
                    type="button"
                    class="mode-chip"
                    :class="{ 'mode-chip--active': loginMode === 'code' }"
                    @click="loginMode = 'code'"
                  >
                    验证码登录
                  </button>
                  <button
                    type="button"
                    class="mode-chip"
                    :class="{ 'mode-chip--active': loginMode === 'password' }"
                    @click="loginMode = 'password'"
                  >
                    密码登录
                  </button>
                </div>
                <div class="form-transition-wrapper">
                  <div class="form-panel" :class="{ 'form-panel--hidden': loginMode !== 'code' }">
                    <PhoneLoginCard
                      :app-code="effectiveAppCode"
                      :device-id="deviceId"
                      :send-code-fn="sendPhoneCode"
                      :phone-entry-fn="phoneEntry"
                      @success="handlePhoneSuccess"
                    />
                  </div>
                  <div class="form-panel" :class="{ 'form-panel--hidden': loginMode !== 'password' }">
                    <PhonePasswordLoginCard
                      :app-code="effectiveAppCode"
                      :device-id="deviceId"
                      :phone-password-login-fn="phonePasswordLogin"
                      @success="handlePhonePasswordSuccess"
                    />
                  </div>
                </div>

                <div class="status-wrap" v-if="errorMessage || successMessage">
                  <p v-if="errorMessage" class="status-msg status-msg--error">{{ errorMessage }}</p>
                  <p v-if="successMessage" class="status-msg status-msg--success">{{ successMessage }}</p>
                </div>
              </div>
            </template>

            <div class="oauth-section" v-show="!ssoPayload && !isLoadingSso">
              <div class="oauth-divider">
                <span>更多登录方式</span>
              </div>

              <div class="oauth-grid">
                <button
                  v-for="provider in brand.oauthProviders"
                  :key="provider.id"
                  type="button"
                  class="oauth-button"
                  @click="handleProviderClick(provider.id, provider.label)"
                >
                  <span class="oauth-button__icon" :class="`oauth-button__icon--${provider.id}`">
                    {{ providerIconText(provider.id) }}
                  </span>
                  <span class="oauth-button__text">{{ provider.label }}</span>
                </button>
              </div>


            </div>
          </div>
      </section>
    </section>
  </main>
</template>

<style scoped>
:global(*) {
  box-sizing: border-box;
}

:global(body) {
  margin: 0;
}

.passport-page {
  min-height: 100vh;
  padding: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #101828;
  font-family: 'SF Pro Display', 'PingFang SC', 'Segoe UI', sans-serif;
  background: linear-gradient(180deg, #f5f7fb 0%, #eef2f7 100%);
  overflow: auto;
}

.passport-shell {
  position: relative;
  width: min(100%, 520px);
  padding: 40px 40px 36px;
  background: #ffffff;
  border-radius: 24px;
  box-shadow: 0 18px 56px rgba(15, 23, 42, 0.08);
}

.shell-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.panel-head {
  display: flex;
  flex-direction: column;
  gap: 8px;
}



.panel-head h1 {
  margin: 0;
  font-size: 28px;
  line-height: 1.2;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.panel-head--picker h1 {
  font-size: 26px;
}

.panel-head p {
  margin: 0;
  color: #667085;
  font-size: 14px;
  line-height: 1.6;
}

.hero-highlight {
  color: var(--passport-accent);
}

.login-mode-switch {
  display: inline-flex;
  width: 100%;
  padding: 4px;
  border-radius: 16px;
  background: color-mix(in srgb, var(--passport-accent-soft) 72%, #ffffff 28%);
  box-shadow: inset 0 0 0 1px rgba(15, 23, 42, 0.04);
}

.mode-chip {
  flex: 1;
  height: 40px;
  border: none;
  border-radius: 12px;
  background: transparent;
  color: #667085;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.16s ease, color 0.16s ease, box-shadow 0.16s ease;
}

.mode-chip--active {
  background: linear-gradient(180deg, var(--passport-accent) 0%, var(--passport-accent-deep) 100%);
  color: #ffffff;
  box-shadow: 0 10px 18px rgba(15, 23, 42, 0.12);
}

.panel-topbar {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.line-tabs {
  display: inline-flex;
  gap: 24px;
}

.line-tab {
  position: relative;
  padding: 0 0 10px;
  color: #667085;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  transition: color 0.2s ease;
}

.line-tab::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 3px;
  border-radius: 999px;
  background: transparent;
  transition: background 0.2s ease;
}

.line-tab.is-active {
  color: var(--passport-accent);
}

.line-tab.is-active::after {
  background: var(--passport-accent);
}

.panel-body {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.panel-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.form-transition-wrapper {
  display: grid;
  align-items: start;
}

.form-panel {
  grid-area: 1 / 1;
}

.form-panel--hidden {
  visibility: hidden;
  pointer-events: none;
  opacity: 0;
}

.email-form {
  display: flex;
  flex-direction: column;
}

.input-stack {
  display: flex;
  flex-direction: column;
  gap: 14px;
}



.agreement-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-top: 14px;
  color: #667085;
  font-size: 14px;
  line-height: 1.6;
  cursor: pointer;
}

.agreement-row a {
  color: var(--passport-accent);
  text-decoration: none;
  font-weight: 600;
}

.checkbox-wrapper {
  position: relative;
  width: 24px;
  height: 24px;
  margin-top: 2px;
  flex: none;
}

.custom-checkbox {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
  z-index: 2;
}

.checkbox-box {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #98a2b3;
  border-radius: 8px;
  background: #ffffff;
  transition: all 0.2s ease;
}

.check-icon {
  width: 16px;
  height: 16px;
  color: #ffffff;
  opacity: 0;
  transform: scale(0.5);
  transition: all 0.2s ease;
}

.custom-checkbox:checked + .checkbox-box {
  border-color: var(--passport-accent);
  background: var(--passport-accent);
}

.custom-checkbox:checked + .checkbox-box .check-icon {
  opacity: 1;
  transform: scale(1);
}

.status-wrap {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 8px;
}

.status-msg {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
}

.status-msg--error {
  color: #d92d20;
}

.status-msg--success {
  color: #1570ef;
}

.oauth-section {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.oauth-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #98a2b3;
  font-size: 14px;
  font-weight: 600;
}

.oauth-divider::before,
.oauth-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #eaecf0;
}

.oauth-divider::before {
  margin-right: 18px;
}

.oauth-divider::after {
  margin-left: 18px;
}

.oauth-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.oauth-button {
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  min-height: 52px;
  padding: 0 18px;
  border: 1px solid #e4e7ec;
  border-radius: 14px;
  background: #f9fafb;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
  cursor: pointer;
}

.oauth-button:hover {
  border-color: #bfc7d4;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.05);
  transform: translateY(-1px);
}

.oauth-button__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 36px;
  height: 36px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}

.oauth-button__icon--sso {
  color: #16a34a;
  background: #eaf8ef;
}

.oauth-button__icon--google {
  color: #ea4335;
  background: #fff4f2;
}

.oauth-button__icon--apple {
  color: #101828;
  background: #f2f4f7;
}

.oauth-button__text {
  color: #1d2939;
  font-size: 15px;
  font-weight: 600;
}



.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.spinner--white {
  color: #ffffff;
}

.spinner--accent {
  color: var(--passport-accent);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .passport-page {
    padding: 0;
    background: #ffffff;
    align-items: flex-start;
  }

  .passport-shell {
    width: 100%;
    min-height: 100vh;
    padding: 48px 24px 36px;
    border-radius: 0;
    box-shadow: none;
  }
}

@media (max-width: 480px) {
  .passport-shell {
    padding: 40px 20px 28px;
  }

  .panel-head h1 {
    font-size: 24px;
  }
}

.sso-loading-layer {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 40px 0;
  color: #667085;
  font-size: 15px;
}

.sso-continue-card {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px;
  background: #f9fafb;
  border-radius: 16px;
  border: 1px solid #eaecf0;
}

.sso-profile {
  display: flex;
  align-items: center;
  gap: 14px;
}

.sso-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--passport-accent) 0%, var(--passport-accent-deep) 100%);
  color: #ffffff;
  font-size: 20px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08);
}

.sso-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.sso-info strong {
  font-size: 16px;
  color: #101828;
}

.sso-info span {
  font-size: 13px;
  color: #667085;
}

.sso-continue-btn {
  height: 44px;
  border-radius: 12px;
  background: var(--passport-accent);
  color: #ffffff;
  font-size: 15px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px var(--passport-hero-glow);
}

.sso-continue-btn:hover {
  background: var(--passport-accent-deep);
  transform: translateY(-1px);
}

.sso-switch-btn {
  height: 44px;
  border-radius: 12px;
  background: transparent;
  color: #667085;
  font-size: 15px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.sso-switch-btn:hover {
  background: #f2f4f7;
  color: #344054;
}
</style>
