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
        <div class="passport-card">
          <h1>欢迎使用 GoNote</h1>
          <p class="card-desc">通过统一通行证登录后，继续进入你的文档、云盘与知识库。</p>

          <div class="cta-group">
            <button type="button" class="cta-btn cta-btn--primary" @click="handleLogin">
              <svg class="cta-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 3v14M3 10h14"/></svg>
              登录 / 注册
            </button>
          </div>

          <p class="card-hint">点击按钮后将跳转到统一认证页面，登录后自动返回。</p>
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
          <div class="tree tree--left">
            <div class="tree-crown"></div>
            <div class="tree-shadow"></div>
          </div>
          <div class="ground-bump"></div>
          <div class="tree tree--right">
            <div class="tree-crown"></div>
            <div class="tree-shadow"></div>
          </div>

          <svg class="house-outline" viewBox="0 0 340 300" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M170 18 L325 126 L325 290 L15 290 L15 126 Z"
                  stroke="rgba(255,255,255,0.85)" stroke-width="3" fill="rgba(255,255,255,0.12)" />
          </svg>

          <div class="house-interior">
            <div class="geo-silo">
              <div class="geo-silo-dome"></div>
              <div class="geo-silo-body"></div>
            </div>
            <div class="geo-circle"></div>
            <div class="geo-triangle"></div>
            <div class="geo-arch-block">
              <div class="geo-arch-cutout"></div>
            </div>
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
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { buildAuthAppLoginPath } from '@clients/shared'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const handleLogin = () => {
  authStore.clearSsoSuppression()
  window.location.replace(buildAuthAppLoginPath({
    appCode: 'go-note',
    redirectPath: typeof route.query.redirect === 'string' ? route.query.redirect : '/workspace',
  }))
}

onMounted(() => {
  authStore.initFromStorage()
  if (authStore.isAuthenticated) {
    router.replace('/workspace')
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

/* ── Passport Card ── */

.passport-card {
  width: min(100%, 420px);
  padding: 48px 40px;
  border-radius: 12px;
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow:
    rgba(0,0,0,0.04) 0px 4px 18px,
    rgba(0,0,0,0.027) 0px 2px 7.8px,
    rgba(0,0,0,0.02) 0px 0.8px 2.9px,
    rgba(0,0,0,0.01) 0px 0.175px 1px;
  text-align: center;
}

.passport-card h1 {
  margin: 0 0 12px;
  font-size: 22px;
  line-height: 1.27;
  font-weight: 700;
  letter-spacing: -0.25px;
  color: rgba(0, 0, 0, 0.95);
}

.card-desc {
  margin: 0 0 32px;
  color: #615d59;
  font-size: 14px;
  line-height: 1.7;
}

.cta-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.cta-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  height: 52px;
  border: none;
  border-radius: 4px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.cta-btn:hover {
  transform: translateY(-1px);
}

.cta-btn--primary {
  color: #fff;
  background: #0075de;
  box-shadow: none;
}

.cta-btn--primary:hover {
  background: #005bab;
  box-shadow: none;
}

.cta-icon {
  width: 18px;
  height: 18px;
}

.card-hint {
  margin: 20px 0 0;
  color: #a39e98;
  font-size: 12px;
  line-height: 1.5;
}

/* ── Locale Row ── */

.locale-row {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #615d59;
  font-size: 13px;
}

.locale-globe {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2px solid #a39e98;
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
  border: 1px solid #a39e98;
}

.locale-globe::before {
  width: 8px;
  height: 18px;
}

.locale-globe::after {
  width: 18px;
  height: 8px;
}

/* ── Visual Panel ── */

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

.house-interior {
  position: absolute;
  left: 50%;
  bottom: 10px;
  width: 310px;
  height: 170px;
  transform: translateX(-50%);
  z-index: 5;
}

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

.bar-1 { height: 78px; background: #cde534; }
.bar-2 { height: 130px; background: #a8d840; }
.bar-3 { height: 158px; background: #5dbd3e; }
.bar-4 { height: 118px; background: #3da534; }

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

/* ── Responsive ── */

@media (max-width: 1320px) {
  .auth-page {
    grid-template-columns: minmax(560px, 6.5fr) minmax(320px, 3.5fr);
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
}

@media (max-width: 640px) {
  .passport-card {
    padding: 36px 24px;
  }

  .passport-card h1 {
    font-size: 22px;
  }
}
</style>
