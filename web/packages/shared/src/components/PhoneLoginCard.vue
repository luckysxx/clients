<script setup lang="ts">
import { computed, onUnmounted, reactive, ref } from 'vue'
import type {
  PhoneAuthSendCodeRequest,
  PhoneAuthSendCodeResponse,
  PhoneAuthEntryRequest,
  PhoneAuthEntryResponse,
} from '../unified-account-contract'

const props = defineProps<{
  appCode: string
  deviceId: string
  sendCodeFn: (req: PhoneAuthSendCodeRequest) => Promise<PhoneAuthSendCodeResponse>
  phoneEntryFn: (req: PhoneAuthEntryRequest) => Promise<PhoneAuthEntryResponse>
}>()

const emit = defineEmits<{
  success: [response: PhoneAuthEntryResponse]
  error: [message: string]
}>()

const form = reactive({
  phone: '',
  code: '',
})

const sendingCode = ref(false)
const submitting = ref(false)
const codeCooldown = ref(0)
const statusMessage = ref('')
const statusType = ref<'success' | 'error'>('success')
let cooldownTimer: ReturnType<typeof setInterval> | null = null

const PHONE_REGEX = /^1[3-9]\d{9}$/

const canSendCode = computed(() => PHONE_REGEX.test(form.phone) && !sendingCode.value && codeCooldown.value <= 0)

const canSubmit = computed(() => PHONE_REGEX.test(form.phone) && form.code.trim().length === 6 && !submitting.value)

const maskedPhone = computed(() => {
  if (!PHONE_REGEX.test(form.phone)) {
    return ''
  }

  return `${form.phone.slice(0, 3)}****${form.phone.slice(-4)}`
})

const showStatus = (msg: string, type: 'success' | 'error') => {
  statusMessage.value = msg
  statusType.value = type
}

const clearStatus = () => {
  statusMessage.value = ''
}

const startCooldown = (seconds: number) => {
  codeCooldown.value = seconds
  if (cooldownTimer) clearInterval(cooldownTimer)
  cooldownTimer = setInterval(() => {
    codeCooldown.value--
    if (codeCooldown.value <= 0) {
      if (cooldownTimer) clearInterval(cooldownTimer)
      cooldownTimer = null
    }
  }, 1000)
}

const handleSendCode = async () => {
  if (!canSendCode.value) return

  if (!PHONE_REGEX.test(form.phone)) {
    showStatus('请输入正确的手机号', 'error')
    return
  }

  clearStatus()
  sendingCode.value = true

  try {
    const res = await props.sendCodeFn({
      phone: form.phone,
      scene: 'login',
    })

    if (res.action === 'rate_limited') {
      showStatus(res.message || '发送过于频繁，请稍后再试', 'error')
      if (res.cooldown_seconds) {
        startCooldown(res.cooldown_seconds)
      }
      return
    }

    showStatus(`验证码已发送至 ${maskedPhone.value}`, 'success')
    startCooldown(res.cooldown_seconds || 60)
  } catch (error) {
    const msg = error instanceof Error ? error.message : '验证码发送失败'
    showStatus(msg, 'error')
  } finally {
    sendingCode.value = false
  }
}

const handleSubmit = async () => {
  if (!canSubmit.value) return

  clearStatus()
  submitting.value = true

  try {
    const res = await props.phoneEntryFn({
      phone: form.phone,
      verification_code: form.code,
      app_code: props.appCode,
      device_id: props.deviceId,
    })

    if (res.action === 'invalid_code') {
      showStatus(res.message || '验证码错误或已过期', 'error')
      return
    }

    if (res.action === 'rate_limited') {
      showStatus(res.message || '操作过于频繁', 'error')
      return
    }

    emit('success', res)
  } catch (error) {
    const msg = error instanceof Error ? error.message : '登录失败，请稍后重试'
    showStatus(msg, 'error')
    emit('error', msg)
  } finally {
    submitting.value = false
  }
}

onUnmounted(() => {
  if (cooldownTimer) clearInterval(cooldownTimer)
})
</script>

<template>
  <form class="phone-card" @submit.prevent="handleSubmit">
    <div class="input-group">
      <div class="input-wrapper">
        <div class="phone-country">
          <span class="phone-country__code">+86</span>
          <svg class="phone-country__arrow" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 7l5 5 5-5"/></svg>
        </div>
        <div class="input-divider"></div>
        <input
          v-model="form.phone"
          class="input-field"
          type="tel"
          inputmode="numeric"
          placeholder="请输入手机号"
          autocomplete="tel"
          maxlength="11"
        />
        <div class="input-divider"></div>
        <button
          type="button"
          class="send-btn"
          :class="{ 'is-loading': sendingCode, 'is-cooldown': codeCooldown > 0 }"
          :disabled="!canSendCode"
          @click="handleSendCode"
        >
          <template v-if="sendingCode">
            <span class="spinner"></span>
            发送中
          </template>
          <template v-else-if="codeCooldown > 0">
            {{ codeCooldown }}s
          </template>
          <template v-else>
            获取验证码
          </template>
        </button>
      </div>

      <div class="input-wrapper">
        <span class="input-prefix label-prefix">验证码</span>
        <div class="input-divider"></div>
        <input
          v-model="form.code"
          class="input-field"
          type="text"
          inputmode="numeric"
          placeholder="请输入 6 位验证码"
          autocomplete="one-time-code"
          maxlength="6"
        />
      </div>
    </div>

    <p class="hint-text">
      {{ codeCooldown > 0 && maskedPhone ? `已向 ${maskedPhone} 发送验证码，请注意查收。` : '未注册的手机号验证通过后将自动创建账号' }}
    </p>

    <div class="status-wrap" v-if="statusMessage">
      <p class="status-msg" :class="`status-msg--${statusType}`">
        <svg v-if="statusType === 'success'" viewBox="0 0 20 20" fill="currentColor" class="status-icon"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>
        <svg v-else viewBox="0 0 20 20" fill="currentColor" class="status-icon"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>
        {{ statusMessage }}
      </p>
    </div>

    <button type="submit" class="submit-btn" :disabled="!canSubmit || submitting">
      <template v-if="submitting">
        <span class="spinner spinner--white"></span>
        登录中...
      </template>
      <template v-else>
        登录 / 注册
      </template>
    </button>
  </form>
</template>

<style scoped>
.phone-card {
  width: 100%;
  display: flex;
  flex-direction: column;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  min-height: 56px;
  padding: 0 16px;
  border: 1px solid #e4e7ec;
  border-radius: 14px;
  background: #f9fafb;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}

.input-wrapper:focus-within {
  border-color: var(--passport-accent);
  background: #ffffff;
  box-shadow: 0 0 0 3px var(--passport-accent-soft, rgba(113, 149, 242, 0.15));
}

.phone-country {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  width: 68px;
  flex: none;
  justify-content: center;
  color: #344054;
}

.phone-country__code {
  font-size: 16px;
  font-weight: 600;
}

.phone-country__arrow {
  width: 20px;
  height: 20px;
  color: #6b7280;
}

.input-prefix {
  width: 68px;
  color: #344054;
  font-size: 16px;
  font-weight: 600;
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.label-prefix {
  font-weight: 500;
}

.input-divider {
  width: 1px;
  height: 20px;
  margin: 0 12px;
  background: #d0d5dd;
  flex: none;
}

.input-field {
  flex: 1;
  min-width: 0;
  min-height: 54px;
  border: none;
  outline: none;
  background: transparent;
  color: #101828;
  font-size: 15px;
  font-weight: 500;
}



.input-field::placeholder {
  color: #98a2b3;
}

.input-field:-webkit-autofill {
  -webkit-box-shadow: 0 0 0 50px #fff inset;
  -webkit-text-fill-color: #101828;
}

.send-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 36px;
  background: transparent;
  color: #98a2b3;
  font-size: 15px;
  font-weight: 500;
  white-space: nowrap;
  cursor: pointer;
  transition: color 0.2s ease;
  border: none;
  padding: 0;
}

.send-btn:hover:not(:disabled) {
  color: #1570ef;
}

.send-btn:disabled {
  color: #d0d5dd;
  cursor: not-allowed;
}

.hint-text {
  margin: 12px 0 0 4px;
  color: #667085;
  font-size: 13px;
}

.status-wrap {
  margin-top: 14px;
}

.status-msg {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
}

.status-icon {
  width: 16px;
  height: 16px;
  flex: none;
}

.status-msg--success {
  color: #1570ef;
}

.status-msg--error {
  color: #d92d20;
}

.submit-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  min-height: 48px;
  margin-top: 18px;
  border: none;
  border-radius: 14px;
  background: linear-gradient(180deg, var(--passport-accent) 0%, var(--passport-accent-deep) 100%);
  color: #ffffff;
  font-size: 15px;
  font-weight: 600;
  transition: transform 0.18s ease, box-shadow 0.18s ease, opacity 0.18s ease;
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.12);
  cursor: pointer;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-1px);
}

.submit-btn:disabled {
  background: linear-gradient(180deg, #c7ccd6 0%, #b8beca 100%);
  opacity: 0.5;
  cursor: not-allowed;
  box-shadow: none;
}

.spinner {
  width: 14px;
  height: 14px;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

.spinner--white {
  color: #ffffff;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 480px) {
  .input-wrapper,
  .submit-btn {
    min-height: 50px;
  }

  .phone-country {
    min-width: 112px;
  }
}
</style>
