<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import type {
  PhonePasswordLoginRequest,
  PhonePasswordLoginResponse,
} from '../unified-account-contract'

const props = defineProps<{
  appCode: string
  deviceId: string
  phonePasswordLoginFn: (req: PhonePasswordLoginRequest) => Promise<PhonePasswordLoginResponse>
}>()

const emit = defineEmits<{
  success: [response: PhonePasswordLoginResponse]
  error: [message: string]
}>()

const form = reactive({
  phone: '',
  password: '',
})

const submitting = ref(false)
const statusMessage = ref('')
const PHONE_REGEX = /^1[3-9]\d{9}$/

const canSubmit = computed(() => {
  return PHONE_REGEX.test(form.phone) && form.password.trim().length >= 8 && !submitting.value
})

const handleSubmit = async () => {
  if (!canSubmit.value) return

  submitting.value = true
  statusMessage.value = ''

  try {
    const res = await props.phonePasswordLoginFn({
      phone: form.phone,
      password: form.password,
      app_code: props.appCode,
      device_id: props.deviceId,
    })
    emit('success', res)
  } catch (error) {
    const msg = error instanceof Error ? error.message : '登录失败，请稍后重试'
    statusMessage.value = msg
    emit('error', msg)
  } finally {
    submitting.value = false
  }
}
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
      </div>

      <div class="input-wrapper">
        <span class="input-prefix label-prefix">密码</span>
        <div class="input-divider"></div>
        <input
          v-model="form.password"
          class="input-field"
          type="password"
          placeholder="请输入密码"
          autocomplete="current-password"
        />
      </div>
    </div>

    <p class="hint-text">适用于已设置过密码的手机号账号</p>

    <div class="status-wrap" v-if="statusMessage">
      <p class="status-msg status-msg--error">
        <svg viewBox="0 0 20 20" fill="currentColor" class="status-icon"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>
        {{ statusMessage }}
      </p>
    </div>

    <button type="submit" class="submit-btn" :disabled="!canSubmit || submitting">
      <template v-if="submitting">
        <span class="spinner spinner--white"></span>
        登录中...
      </template>
      <template v-else>
        密码登录
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

.status-msg--error {
  color: #d92d20;
}

.submit-btn {
  margin-top: 18px;
  height: 48px;
  border: none;
  border-radius: 14px;
  background: linear-gradient(180deg, var(--passport-accent) 0%, var(--passport-accent-deep) 100%);
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.18s ease, box-shadow 0.18s ease, opacity 0.18s ease;
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.12);
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
  display: inline-block;
  width: 14px;
  height: 14px;
  border-radius: 999px;
  border: 2px solid rgba(255, 255, 255, 0.35);
  border-top-color: #fff;
  animation: spin 0.8s linear infinite;
}

.spinner--white {
  border-color: rgba(255, 255, 255, 0.35);
  border-top-color: #fff;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
