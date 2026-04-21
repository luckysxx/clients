<template>
  <section class="landing-shell">
    <div class="background-mesh">
      <div class="mesh-blob mesh-1"></div>
      <div class="mesh-blob mesh-2"></div>
      <div class="mesh-blob mesh-3"></div>
      <div class="grid-overlay"></div>
    </div>

    <div class="landing-content">
      <LandingNavBar 
        :is-authenticated="isAuthenticated"
        :user-name="authStore.user?.username"
        :workspace-path="redirectTarget"
        @login="handleLogin"
        @register="handleRegister"
      >
        <template #logo>
          <div class="logo-mark"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg></div>
          <span class="logo-text">GoChat</span>
        </template>
      </LandingNavBar>

      <div class="hero-split">
        <div class="hero-left">
          <div class="eyebrow-wrap">
            <span class="eyebrow">
              <span class="pulse-dot"></span> Next-gen Enterprise Messenger
            </span>
          </div>
          
          <h1>把沟通变成协作，<br/><span class="text-gradient">把消息沉淀为资产</span></h1>
          <p class="description">
            GoChat 提供极其流畅的即时通讯体验与高度集成的应用生态。无论是日常交流、项目推进还是企业协作，都在弹指间完成。
          </p>

          <div class="cta-row">
            <button type="button" class="primary-btn glow-btn" @click="handleLogin">
              <span>免费开始体验</span>
              <svg class="arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </button>
            <button
              v-if="isAuthenticated"
              type="button"
              class="ghost-btn"
              @click="router.push(defaultRedirect)"
            >
              进入工作台
            </button>
          </div>
          
          <div class="hero-users">
            <div class="avatars">
              <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Liam&backgroundColor=eef0fe" alt="User" />
              <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Emma&backgroundColor=e6f6eb" alt="User" />
              <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Noah&backgroundColor=fff0e5" alt="User" />
            </div>
            <span>超过 <strong>50,000+</strong> 极客团队的选择</span>
          </div>
        </div>

        <div class="hero-right">
          <div class="mockup-container">
            <div class="mockup-window">
              <div class="mockup-header">
                <div class="dots"><span/><span/><span/></div>
                <div class="header-title">产品研发内部群</div>
              </div>
              <div class="mockup-body">
                <div class="mockup-sidebar">
                  <div class="chat-list-item active"><div class="avatar avatar-1"></div><div class="lines"><div class="w-100"></div><div class="w-60"></div></div></div>
                  <div class="chat-list-item"><div class="avatar avatar-2"></div><div class="lines"><div class="w-80"></div><div class="w-40"></div></div></div>
                  <div class="chat-list-item"><div class="avatar avatar-3"></div><div class="lines"><div class="w-100"></div><div class="w-50"></div></div></div>
                </div>
                <div class="mockup-content">
                  <div class="chat-stream">
                    <!-- Chat bubbles -->
                    <div class="message msg-left">
                      <div class="msg-avatar"></div>
                      <div class="msg-bubble bubble-left">
                        <div class="msg-line w-80"></div><div class="msg-line w-60"></div>
                      </div>
                    </div>
                    
                    <div class="message msg-right">
                      <div class="msg-bubble bubble-right">
                        <div class="msg-line w-100"></div>
                      </div>
                    </div>

                    <div class="message msg-left">
                      <div class="msg-avatar"></div>
                      <div class="msg-bubble bubble-left">
                        <div class="msg-card">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                          <div class="card-info"><div class="w-100"></div><div class="w-40"></div></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="chat-input-area">
                    <div class="chat-input-box">
                       <span class="placeholder">输入消息...</span>
                       <div class="send-btn-mock"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <!-- Floating Elements -->
            <div class="float-widget float-message">
              <div class="notify-dot"></div>
              <div class="block-text">@Alex 提到了你</div>
            </div>
            <div class="float-widget float-reaction">
              <div class="block-icon">🎉</div>
              <div class="block-icon">🚀</div>
              <div class="block-text">+12</div>
            </div>
          </div>
        </div>
      </div>

      <div class="feature-grid">
        <article class="feature-card">
          <div class="card-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg></div>
          <strong>全域 SSO 身份隔离</strong>
          <p>依托底层统一通行证体系，消息端可支持复杂的企业级租户隔离及一键组织切换体验。</p>
        </article>
        <article class="feature-card">
          <div class="card-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg></div>
          <strong>毫秒级实时通讯</strong>
          <p>基于全新的长链接网关架构，实现消息的毫秒级触达、端到端加密与离线可靠重传。</p>
        </article>
        <article class="feature-card">
          <div class="card-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg></div>
          <strong>高度可扩展面板</strong>
          <p>右侧内置了高度可定制的应用集成面板，随时打开群日历、代办看板或调用第三方工作流。</p>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { buildAuthAppLoginPath, normalizeInternalPath } from '@clients/shared'
import { LandingNavBar } from '@clients/shared'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
authStore.initFromStorage()

const isAuthenticated = computed(() => authStore.isAuthenticated)
const defaultRedirect = '/app'
const redirectTarget = computed(() => {
  const rawRedirect = typeof route.query.redirect === 'string' ? route.query.redirect : defaultRedirect
  return normalizeInternalPath(rawRedirect, defaultRedirect)
})

const handleLogin = () => {
  window.location.assign(buildAuthAppLoginPath({
    appCode: 'go-chat',
    intent: 'login',
    redirectPath: redirectTarget.value,
  }))
}

const handleRegister = () => {
  window.location.assign(buildAuthAppLoginPath({
    appCode: 'go-chat',
    intent: 'register',
    redirectPath: redirectTarget.value,
  }))
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Outfit:wght@500;700&display=swap');

.landing-shell {
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #fdfdfd;
  font-family: 'Inter', 'SF Pro Display', 'PingFang SC', sans-serif;
  overflow: hidden;
}

/* Dynamic Background Meshes for GoChat (Blue Theme) */
.background-mesh {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.mesh-blob {
  position: absolute;
  filter: blur(80px);
  border-radius: 50%;
  opacity: 0.65;
  animation: float-blob 20s ease-in-out infinite alternate;
}

.mesh-1 {
  top: -10%;
  left: -5%;
  width: 50vw;
  height: 50vw;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.12) 0%, transparent 70%);
  animation-delay: 0s;
}

.mesh-2 {
  top: 20%;
  right: -10%;
  width: 40vw;
  height: 40vw;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, transparent 70%);
  animation-delay: -5s;
}

.mesh-3 {
  bottom: -20%;
  left: 30%;
  width: 60vw;
  height: 40vw;
  background: radial-gradient(circle, rgba(14, 165, 233, 0.08) 0%, transparent 70%);
  animation-delay: -10s;
}

.grid-overlay {
  position: absolute;
  inset: 0;
  background-image: 
    linear-gradient(to right, rgba(0,0,0,0.02) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(0,0,0,0.02) 1px, transparent 1px);
  background-size: 40px 40px;
  mask-image: radial-gradient(circle at center, black 0%, transparent 80%);
}

@keyframes float-blob {
  0% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
  100% { transform: translate(0, 0) scale(1); }
}

/* Content Container */
.landing-content {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 32px 80px;
}

/* Top Nav */
.top-nav {
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-mark {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
}

.logo-mark svg {
  width: 20px;
  height: 20px;
}

.logo-text {
  font-family: 'Outfit', sans-serif;
  font-size: 22px;
  font-weight: 700;
  color: #111827;
  letter-spacing: -0.02em;
}

/* Hero Section */
.hero-split {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  align-items: center;
  margin-top: 60px;
}

.hero-left {
  padding-right: 40px;
}

.eyebrow-wrap {
  margin-bottom: 24px;
}

.eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border-radius: 999px;
  background: rgba(59, 130, 246, 0.1);
  color: #2563eb;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.02em;
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.pulse-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #3b82f6;
  box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
  70% { box-shadow: 0 0 0 6px rgba(59, 130, 246, 0); }
  100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
}

.hero-left h1 {
  font-size: clamp(3.2rem, 5vw, 4.5rem);
  line-height: 1.1;
  font-weight: 800;
  letter-spacing: -0.04em;
  color: #111827;
  margin: 0;
}

.text-gradient {
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.description {
  margin: 24px 0 40px;
  font-size: 1.15rem;
  line-height: 1.7;
  color: #4b5563;
  max-width: 520px;
}

.cta-row {
  display: flex;
  align-items: center;
  gap: 16px;
}

.primary-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 56px;
  padding: 0 32px;
  border-radius: 14px;
  background: #111827;
  color: white;
  font-size: 16px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.15);
}

.primary-btn .arrow {
  width: 20px;
  height: 20px;
  transition: transform 0.2s ease;
}

.primary-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 20px 30px -10px rgba(0, 0, 0, 0.2);
}

.primary-btn:hover .arrow {
  transform: translateX(4px);
}

.ghost-btn {
  height: 56px;
  padding: 0 32px;
  border-radius: 14px;
  background: white;
  color: #374151;
  font-size: 16px;
  font-weight: 600;
  border: 1px solid #e5e7eb;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
}

.ghost-btn:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}

.hero-users {
  margin-top: 40px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.avatars {
  display: flex;
}

.avatars img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid white;
  margin-left: -12px;
}

.avatars img:first-child {
  margin-left: 0;
}

.hero-users span {
  font-size: 14px;
  color: #6b7280;
}

.hero-users strong {
  color: #111827;
}

/* CSS UI Mockup Right Side */
.hero-right {
  position: relative;
  height: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mockup-container {
  position: relative;
  width: 100%;
  max-width: 580px;
  animation: float-mockup 6s ease-in-out infinite alternate;
}

@keyframes float-mockup {
  0% { transform: translateY(0); }
  100% { transform: translateY(-16px); }
}

.mockup-window {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 20px;
  box-shadow: 
    0 25px 50px -12px rgba(59, 130, 246, 0.15),
    0 0 0 1px rgba(0, 0, 0, 0.02);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 380px;
}

.mockup-header {
  height: 48px;
  border-bottom: 1px solid rgba(229, 231, 235, 0.5);
  display: flex;
  align-items: center;
  padding: 0 16px;
}

.dots {
  display: flex;
  gap: 6px;
  width: 60px;
}

.dots span {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #e5e7eb;
}

.header-title {
  flex: 1;
  text-align: center;
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  padding-right: 60px; /* offset dots */
}

.mockup-body {
  display: flex;
  flex: 1;
}

.mockup-sidebar {
  width: 140px;
  border-right: 1px solid rgba(229, 231, 235, 0.5);
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.chat-list-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  border-radius: 10px;
}

.chat-list-item.active {
  background: rgba(59, 130, 246, 0.1);
}

.avatar {
  width: 28px;
  height: 28px;
  border-radius: 8px;
}

.avatar-1 { background: #3b82f6; }
.avatar-2 { background: #a78bfa; }
.avatar-3 { background: #f43f5e; }

.lines {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.lines div {
  height: 6px;
  border-radius: 3px;
  background: #e5e7eb;
}

.mockup-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.chat-stream {
  flex: 1;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.message {
  display: flex;
  gap: 12px;
  align-items: flex-end;
}

.msg-right {
  flex-direction: row-reverse;
}

.msg-avatar {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  background: #d1d5db;
}

.msg-bubble {
  padding: 12px 14px;
  border-radius: 16px;
  max-width: 70%;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.bubble-left {
  background: #f3f4f6;
  border-bottom-left-radius: 4px;
}

.bubble-right {
  background: #3b82f6;
  border-bottom-right-radius: 4px;
}

.msg-line {
  height: 6px;
  border-radius: 3px;
}

.bubble-left .msg-line { background: #d1d5db; }
.bubble-right .msg-line { background: rgba(255,255,255,0.4); }

.w-100 { width: 100%; }
.w-80 { width: 80%; }
.w-60 { width: 60%; }
.w-50 { width: 50%; }
.w-40 { width: 40%; }

.msg-card {
  margin-top: 8px;
  padding: 12px;
  background: white;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1px solid #e5e7eb;
}

.msg-card svg {
  width: 20px;
  height: 20px;
  color: #3b82f6;
}

.card-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.card-info div { height: 6px; border-radius: 3px; background: #e5e7eb; }

.chat-input-area {
  padding: 16px 24px;
  border-top: 1px solid rgba(229, 231, 235, 0.5);
}

.chat-input-box {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
}

.placeholder {
  font-size: 13px;
  color: #9ca3af;
}

.send-btn-mock {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  background: #3b82f6;
  opacity: 0.8;
}

/* Floating Widgets */
.float-widget {
  position: absolute;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(0, 0, 0, 0.05);
  padding: 8px 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.float-message {
  top: 120px;
  right: -20px;
  animation: float-1 4s ease-in-out infinite;
}

.notify-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ef4444;
}

.float-reaction {
  bottom: 80px;
  left: -30px;
  background: white;
  padding: 10px 16px;
  border-radius: 20px;
  animation: float-2 5s ease-in-out infinite backwards;
  animation-delay: 1s;
}

.block-icon {
  font-size: 16px;
}

.block-text {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

@keyframes float-1 {
  0% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0); }
}

@keyframes float-2 {
  0% { transform: translateY(0) scale(1); }
  50% { transform: translateY(12px) scale(1.05); }
  100% { transform: translateY(0) scale(1); }
}

/* Feature Grid */
.feature-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-top: 80px;
}

.feature-card {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 0, 0, 0.04);
  padding: 32px;
  border-radius: 20px;
  transition: all 0.3s ease;
}

.feature-card:hover {
  background: white;
  box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.05);
  transform: translateY(-4px);
}

.card-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: #eff6ff;
  color: #3b82f6;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.card-icon svg {
  width: 24px;
  height: 24px;
}

.feature-card strong {
  display: block;
  font-size: 18px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 12px;
}

.feature-card p {
  font-size: 15px;
  color: #6b7280;
  line-height: 1.6;
  margin: 0;
}

@media (max-width: 1024px) {
  .hero-split {
    grid-template-columns: 1fr;
    gap: 60px;
  }
  .hero-left {
    padding-right: 0;
    text-align: center;
  }
  .description {
    margin: 24px auto 40px;
  }
  .cta-row {
    justify-content: center;
  }
  .hero-users {
    justify-content: center;
  }
  .feature-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .feature-grid {
    grid-template-columns: 1fr;
  }
  .landing-content {
    padding: 0 20px 60px;
  }
  .hero-left h1 {
    font-size: 2.8rem;
  }
}
</style>
