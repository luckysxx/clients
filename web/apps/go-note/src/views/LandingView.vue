<template>
  <div class="landing-root">
    <!-- ═══════════════════════════════════════════════════════
         Navigation (Notion Style)
         ═══════════════════════════════════════════════════════ -->
    <nav class="landing-nav">
      <div class="nav-inner">
        <div class="nav-left">
          <div class="nav-logo" @click="router.push('/')">
            <div class="nav-logo-icon">
              <!-- Simple monochrome fill for Notion style -->
              <svg viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5"><path d="M4 4h16v16H4V4z"/></svg>
            </div>
            <span class="nav-logo-text">GoNote</span>
          </div>
          <div class="nav-links">
            <a href="#features" class="nav-link">功能</a>
            <a href="#ai" class="nav-link">AI</a>
            <a href="#deploy" class="nav-link">部署</a>
            <a href="https://github.com/luckysxx/gonote" target="_blank" rel="noopener" class="nav-link">
              GitHub
            </a>
          </div>
        </div>
        <div class="nav-right">
          <template v-if="isAuthenticated">
            <button type="button" class="nav-btn-ghost" @click="router.push(redirectTarget)">
              {{ authStore.user?.username }}
            </button>
            <button type="button" class="nav-btn-primary" @click="router.push(redirectTarget)">
              返回工作台
            </button>
          </template>
          <template v-else>
            <button type="button" class="nav-btn-ghost" @click="handleLogin">登录</button>
            <button type="button" class="nav-btn-primary" @click="handleRegister">
              免费开始
            </button>
          </template>
        </div>
      </div>
    </nav>

    <!-- ═══════════════════════════════════════════════════════
         Section 1 — Hero (Notion Style)
         ═══════════════════════════════════════════════════════ -->
    <section class="hero-section">
      <div class="hero-content reveal-on-scroll">
        <div class="hero-badge">即将发布 v2.0</div>
        
        <h1 class="hero-title">
          属于你的<br />第二大脑
        </h1>

        <p class="hero-subtitle">
          面向开发者的个人知识引擎。AI 自动整理标签和摘要，语义搜索找回任何笔记。所有数据默认私有，纯粹、快速、无广告。
        </p>

        <div class="hero-cta">
          <button type="button" class="btn-primary" @click="handleRegister">
            免费开始使用
          </button>
          <a href="https://github.com/luckysxx/gonote" target="_blank" rel="noopener" class="btn-secondary">
            前往 GitHub
          </a>
        </div>
      </div>

      <!-- Hero product screenshot: Notion whisper skeleton -->
      <div class="hero-screenshot-wrapper reveal-on-scroll">
        <div class="screenshot-pane">
          <div class="pane-sidebar">
            <div class="pane-skeleton-line" style="width: 40%; margin-bottom: 24px;"></div>
            <div class="pane-skeleton-box"></div>
            <div class="pane-skeleton-box" style="opacity: 0.6"></div>
            <div class="pane-skeleton-box" style="opacity: 0.4"></div>
          </div>
          <div class="pane-main">
            <div class="pane-header">
              <div class="pane-skeleton-line" style="width: 25%; height: 24px;"></div>
            </div>
            <div class="pane-body">
              <div class="pane-skeleton-line" style="width: 80%"></div>
              <div class="pane-skeleton-line" style="width: 60%"></div>
              <div class="pane-skeleton-line" style="width: 75%"></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════════════════
         Section 2 — Features (Notion Style)
         ═══════════════════════════════════════════════════════ -->
    <section id="features" class="features-section">
      <div class="section-container">
        <div class="section-header reveal-on-scroll">
          <h2 class="section-heading">为知识沉淀而生</h2>
          <p class="section-sub">不是临时粘贴板，是能用十年的个人知识库。</p>
        </div>

        <div class="features-grid">
          <div v-for="feat in features" :key="feat.title" class="feature-card reveal-on-scroll">
            <div class="feature-icon-box">
              <component :is="feat.icon" class="h-4 w-4" />
            </div>
            <h3 class="feature-title">{{ feat.title }}</h3>
            <p class="feature-desc">{{ feat.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════════════════
         Section 3 — AI Deep Dive (Supabase Dark Style)
         ═══════════════════════════════════════════════════════ -->
    <section id="ai" class="ai-section">
      <div class="section-container">
        <div class="dark-section-header reveal-on-scroll">
          <p class="mono-label">AGENT CAPABILITIES</p>
          <h2 class="dark-title">保存触发 AI,<br />机器替你整理</h2>
          <p class="dark-desc">
            摒弃手动归类的低效。每次保存文档，AI 引擎自动分析内容语义，提取关键摘要与行动点。
          </p>
        </div>

        <div class="ai-grid">
          <div v-for="ai in aiFeatures" :key="ai.title" class="dark-card reveal-on-scroll">
            <h3 class="dark-card-title">{{ ai.title }}</h3>
            <p class="dark-card-desc">{{ ai.desc }}</p>
          </div>
        </div>

        <!-- AI screenshot: Supabase terminal feeling -->
        <div class="ai-terminal-wrapper reveal-on-scroll">
          <div class="terminal-pane">
            <div class="terminal-header">
              <div class="terminal-dots"><span></span><span></span><span></span></div>
              <div class="terminal-title">~/worker/ai-agent</div>
            </div>
            <div class="terminal-body">
              <div class="code-line"><span class="code-prompt">$</span> gonote analyze --doc_id=94a2b</div>
              <div class="code-line code-muted">>> Extracting semantic vectors... [OK]</div>
              <div class="code-line code-muted">>> Matching existing labels... [Found: "Architecture", "Draft"]</div>
              <div class="code-line code-highlight">> Summary generated in 240ms</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════════════════
         Section 4 — Deploy Anywhere (Supabase Dark Style)
         ═══════════════════════════════════════════════════════ -->
    <section id="deploy" class="deploy-section">
      <div class="section-container">
        <div class="dark-section-header reveal-on-scroll">
          <p class="mono-label">INFRASTRUCTURE</p>
          <h2 class="dark-title">一套代码，五种形态</h2>
          <p class="dark-desc">支持离线桌面端、NAS 自托管或云端 SaaS 部署。永远掌握你的数据所有权。</p>
        </div>

        <div class="deploy-grid">
          <div v-for="d in deployModes" :key="d.title" class="dark-card deploy-card reveal-on-scroll">
            <h3 class="dark-card-title">{{ d.title }}</h3>
            <p class="dark-card-desc">{{ d.desc }}</p>
            <div class="deploy-tags">
              <span v-for="tag in d.tags" :key="tag" class="dark-tag">{{ tag }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════════════════
         Footer (Supabase Dark Style)
         ═══════════════════════════════════════════════════════ -->
    <footer class="dark-footer">
      <div class="section-container">
        <div class="cta-block reveal-on-scroll">
          <h2 class="dark-title" style="margin-bottom: 0;">准备好构建第二大脑了吗？</h2>
          <div class="cta-actions">
            <button type="button" class="btn-pill-primary" @click="handleRegister">
              开始构建项目
            </button>
            <a href="https://github.com/luckysxx/gonote" target="_blank" rel="noopener" class="btn-pill-secondary">
              查看开源代码
            </a>
          </div>
        </div>
        
        <div class="footer-divider"></div>

        <div class="footer-grid">
          <div class="footer-brand">
            <span class="footer-logo-text">GoNote</span>
            <p class="footer-tagline">Open source personal knowledge agent.</p>
          </div>
          <div class="footer-col">
            <h4 class="footer-col-title">产品</h4>
            <a href="#features" class="footer-link">核心特性</a>
            <a href="#ai" class="footer-link">AI 系统</a>
            <a href="#deploy" class="footer-link">自托管部署</a>
          </div>
          <div class="footer-col">
            <h4 class="footer-col-title">资源</h4>
            <a href="https://github.com/luckysxx/gonote" class="footer-link">GitHub</a>
            <a href="#" class="footer-link">项目规范文档</a>
          </div>
        </div>
        <div class="footer-bottom">
          <p>© {{ new Date().getFullYear() }} GoNote</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  FolderTree, PenTool, Link, Lock,
} from 'lucide-vue-next'
import { buildAuthAppLoginPath, normalizeInternalPath } from '@clients/shared'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
authStore.initFromStorage()

const isAuthenticated = computed(() => authStore.isAuthenticated)
const defaultRedirect = '/workspace'
const redirectTarget = computed(() => {
  const rawRedirect = typeof route.query.redirect === 'string' ? route.query.redirect : defaultRedirect
  return normalizeInternalPath(rawRedirect, defaultRedirect)
})

const handleLogin = () => {
  window.location.assign(buildAuthAppLoginPath({ appCode: 'go-note', intent: 'login', redirectPath: redirectTarget.value }))
}
const handleRegister = () => {
  window.location.assign(buildAuthAppLoginPath({ appCode: 'go-note', intent: 'register', redirectPath: redirectTarget.value }))
}

// Reveal animations
onMounted(() => {
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed')
          observer.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.1, rootMargin: '0px 0px 0px 0px' }
  )
  document.querySelectorAll('.reveal-on-scroll').forEach(el => observer.observe(el))
})

const features = [
  { icon: FolderTree, title: '结构化组织', desc: '嵌套分组 + 标签 + 智能筛选，让知识不再散落。' },
  { icon: PenTool, title: '所见即所得编辑器', desc: '基于 Milkdown 开发，Markdown 原生与富文本体验结合。' },
  { icon: Link, title: '安全分享', desc: '一键生成分享短链，支持访问密码和失效期设置。' },
  { icon: Lock, title: '默认私有化', desc: '所有文档默认私密状态，不提供任何公开索引通道。' },
]

const aiFeatures = [
  { title: 'Semantic Auto-Tagging', desc: '自动分析长文语义，复用于你现有的知识图谱为您推荐标签。' },
  { title: 'Abstract Extraction', desc: '针对长文档生成总结性 TL;DR，不点开也能知道写了什么。' },
  { title: 'Action Item Discovery', desc: '深度提取你隐藏在文档段落中的 TODO 行动项目，避免遗漏。' },
]

const deployModes = [
  { title: 'Desktop Client', desc: '基于 SQLite，内嵌小模型提供查询，弱网及离线时直接可用。', tags: ['SQLite', 'Local Network'] },
  { title: 'Docker Self-hosted', desc: '针对 NAS 玩家或极客准备的 Compose 文件，完全的数据主权。', tags: ['PostgreSQL', 'MinIO'] },
  { title: 'Managed SaaS', desc: '通过 Cloudflare 边缘计算强力接入，开箱即用的 OpenAI 模型推理。', tags: ['Edge DB', 'OpenAI API'] },
]
</script>

<style scoped>
/* ═══════════════════════════════════════════════════════════
   Landing Page — Notion (Light) & Supabase (Dark)
   ═══════════════════════════════════════════════════════════ */
.landing-root {
  font-family: "Inter", -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif;
  overflow-x: hidden;
  background: #ffffff;
  color: rgba(0,0,0,0.95);
  -webkit-font-smoothing: antialiased;
}

.section-container {
  max-width: 1080px;
  margin: 0 auto;
  padding: 0 24px;
}

/* ── Utilities ── */
.reveal-on-scroll {
  opacity: 0;
  transform: translateY(16px);
  transition: opacity 0.6s cubic-bezier(0.16,1,0.3,1), transform 0.6s cubic-bezier(0.16,1,0.3,1);
}
.reveal-on-scroll.revealed { opacity: 1; transform: translateY(0); }

/* ═══════════════════════════════════════════
   Navigation (Notion Style)
   ═══════════════════════════════════════════ */
.landing-nav {
  position: absolute; top: 0; left: 0; right: 0; z-index: 100;
  background: transparent;
}
.nav-inner {
  max-width: 1080px; margin: 0 auto; padding: 0 24px;
  height: 80px; display: flex; align-items: center; justify-content: space-between;
}
.nav-left { display: flex; align-items: center; gap: 32px; }
.nav-logo { display: flex; align-items: center; gap: 8px; cursor: pointer; }
.nav-logo-icon { color: rgba(0,0,0,0.95); display: flex; align-items: center; justify-content: center; width: 24px; height: 24px; }
.nav-logo-text { font-size: 16px; font-weight: 600; letter-spacing: -0.4px; }
.nav-links { display: none; gap: 20px; }
@media (min-width: 768px) { .nav-links { display: flex; } }
.nav-link { font-size: 15px; font-weight: 500; color: #615d59; text-decoration: none; transition: color 0.15s; }
.nav-link:hover { color: rgba(0,0,0,0.95); }

.nav-right { display: flex; align-items: center; gap: 12px; }
.nav-btn-ghost { font-size: 14px; font-weight: 500; font-family: inherit; color: rgba(0,0,0,0.95); background: transparent; border: none; cursor: pointer; }
.nav-btn-ghost:hover { color: #000; text-decoration: underline; }
.nav-btn-primary {
  font-size: 14px; font-weight: 500; font-family: inherit; color: #fff;
  background: rgba(0,0,0,0.95); border: none; padding: 6px 14px; border-radius: 4px;
  cursor: pointer; transition: transform 0.15s;
}
.nav-btn-primary:hover { transform: scale(1.02); }

/* ═══════════════════════════════════════════
   Hero (Notion Style)
   ═══════════════════════════════════════════ */
.hero-section {
  padding: 160px 0 80px; background: #ffffff;
  text-align: center; display: flex; flex-direction: column; align-items: center;
}
.hero-badge {
  display: inline-block; padding: 4px 10px; border-radius: 9999px;
  background: #f2f9ff; color: #097fe8; font-size: 12px; font-weight: 600;
  letter-spacing: 0.125px; margin-bottom: 24px;
}
.hero-title {
  font-size: clamp(3.5rem, 8vw, 5.5rem); font-weight: 700; line-height: 1.0;
  letter-spacing: -3.5px; color: rgba(0,0,0,0.95); margin-bottom: 24px;
}
.hero-subtitle {
  max-width: 580px; margin: 0 auto 40px; font-size: 20px; font-weight: 400;
  line-height: 1.4; color: #615d59; letter-spacing: -0.125px;
}
.hero-cta { display: flex; gap: 12px; justify-content: center; }
.btn-primary {
  font-size: 15px; font-weight: 500; font-family: inherit; color: #fff;
  background: #0075de; border: none; padding: 10px 20px; border-radius: 4px;
  cursor: pointer; transition: background 0.15s;
}
.btn-primary:hover { background: #005bab; }
.btn-secondary {
  font-size: 15px; font-weight: 500; font-family: inherit; color: rgba(0,0,0,0.95);
  background: rgba(0,0,0,0.05); border: none; padding: 10px 20px; border-radius: 4px;
  text-decoration: none; cursor: pointer; transition: background 0.15s;
}
.btn-secondary:hover { background: rgba(0,0,0,0.08); }

/* Notion skeleton */
.hero-screenshot-wrapper { margin-top: 80px; width: 100%; max-width: 960px; padding: 0 24px; }
.screenshot-pane {
  background: #ffffff; border-radius: 12px;
  border: 1px solid rgba(0,0,0,0.1);
  box-shadow: rgba(0,0,0,0.01) 0px 1px 3px, rgba(0,0,0,0.02) 0px 3px 7px, rgba(0,0,0,0.02) 0px 7px 15px, rgba(0,0,0,0.04) 0px 14px 28px, rgba(0,0,0,0.05) 0px 23px 52px;
  display: flex; height: 500px; overflow: hidden; text-align: left;
}
.pane-sidebar { width: 220px; background: #f6f5f4; border-right: 1px solid rgba(0,0,0,0.05); padding: 20px; display: flex; flex-direction: column; gap: 12px; }
.pane-main { flex: 1; display: flex; flex-direction: column; }
.pane-header { height: 60px; padding: 0 24px; display: flex; align-items: center; border-bottom: 1px solid rgba(0,0,0,0.05); }
.pane-body { padding: 40px 60px; display: flex; flex-direction: column; gap: 16px; }
.pane-skeleton-line { height: 12px; background: rgba(0,0,0,0.06); border-radius: 4px; }
.pane-skeleton-box { height: 28px; background: rgba(0,0,0,0.06); border-radius: 6px; width: 100%; }

/* ═══════════════════════════════════════════
   Features (Notion Style)
   ═══════════════════════════════════════════ */
.features-section { padding: 80px 0; background: #f6f5f4; padding-bottom: 120px; border-top: 1px solid rgba(0,0,0,0.05); }
.section-heading { font-size: 40px; font-weight: 700; letter-spacing: -1.0px; color: rgba(0,0,0,0.95); margin-bottom: 16px; text-align: center; }
.section-sub { font-size: 20px; color: #615d59; margin-bottom: 64px; text-align: center; }
.features-grid { display: grid; gap: 24px; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); }
.feature-card {
  background: #ffffff; border-radius: 12px; padding: 24px;
  border: 1px solid rgba(0,0,0,0.1);
  box-shadow: rgba(0,0,0,0.04) 0px 4px 18px, rgba(0,0,0,0.02) 0px 1px 3px;
}
.feature-icon-box { margin-bottom: 16px; color: #615d59; }
.feature-title { font-size: 18px; font-weight: 600; margin-bottom: 8px; color: rgba(0,0,0,0.95); letter-spacing: -0.25px;}
.feature-desc { font-size: 15px; color: #615d59; line-height: 1.5; }

/* ═══════════════════════════════════════════
   AI Section (Supabase Dark Style)
   ═══════════════════════════════════════════ */
.ai-section { background: #171717; padding: 120px 0; color: #fafafa; }
.dark-section-header { text-align: center; margin-bottom: 64px; }
.mono-label {
  font-family: "Source Code Pro", ui-monospace, monospace; font-size: 12px;
  letter-spacing: 1.2px; color: #898989; text-transform: uppercase; margin-bottom: 16px;
}
.dark-title { font-size: 48px; font-weight: 400; line-height: 1.0; letter-spacing: -0.4px; color: #fafafa; margin-bottom: 24px; }
.dark-desc { font-size: 18px; color: #b4b4b4; line-height: 1.5; max-width: 600px; margin: 0 auto; }

.ai-grid { display: grid; gap: 16px; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); }
.dark-card { background: #171717; border: 1px solid #2e2e2e; border-radius: 8px; padding: 24px; }
.dark-card-title { font-size: 20px; font-weight: 400; color: #fafafa; margin-bottom: 12px; letter-spacing: -0.16px;}
.dark-card-desc { font-size: 15px; color: #898989; line-height: 1.5; }

.ai-terminal-wrapper { margin-top: 64px; }
.terminal-pane {
  background: #0f0f0f; border-radius: 8px; border: 1px solid #2e2e2e;
  overflow: hidden; text-align: left; max-width: 800px; margin: 0 auto;
}
.terminal-header {
  height: 40px; border-bottom: 1px solid #2e2e2e; display: flex; align-items: center; padding: 0 16px; gap: 12px;
}
.terminal-dots { display: flex; gap: 6px; }
.terminal-dots span { width: 10px; height: 10px; border-radius: 50%; background: #363636; }
.terminal-title { font-family: "Source Code Pro", monospace; font-size: 12px; color: #898989; }
.terminal-body { padding: 24px; font-family: "Source Code Pro", monospace; font-size: 13px; line-height: 1.6; }
.code-line { color: #fafafa; }
.code-prompt { color: #3ecf8e; margin-right: 8px; }
.code-muted { color: #898989; }
.code-highlight { color: #3ecf8e; margin-top: 8px; }

/* ═══════════════════════════════════════════
   Deploy Section (Supabase Style)
   ═══════════════════════════════════════════ */
.deploy-section { background: #0f0f0f; padding: 120px 0; color: #fafafa; border-top: 1px solid #242424; }
.deploy-grid { display: grid; gap: 16px; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); }
.deploy-card { background: #171717; }
.deploy-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 24px; }
.dark-tag { font-family: "Source Code Pro", monospace; font-size: 11px; padding: 4px 8px; border: 1px solid #363636; color: #898989; border-radius: 4px; }

/* ═══════════════════════════════════════════
   Footer (Supabase Style)
   ═══════════════════════════════════════════ */
.dark-footer { background: #171717; padding: 100px 0 40px; color: #fafafa; border-top: 1px solid #242424; }
.cta-block { text-align: center; margin-bottom: 80px; }
.cta-actions { display: flex; justify-content: center; gap: 16px; margin-top: 32px; flex-wrap: wrap; }
.btn-pill-primary {
  background: #fafafa; color: #0f0f0f; font-family: inherit; font-size: 14px; font-weight: 500;
  padding: 10px 24px; border-radius: 9999px; border: none; cursor: pointer; transition: opacity 0.15s;
}
.btn-pill-primary:hover { opacity: 0.9; }
.btn-pill-secondary {
  background: transparent; color: #fafafa; font-family: inherit; font-size: 14px; font-weight: 500;
  padding: 10px 24px; border-radius: 9999px; border: 1px solid #393939; text-decoration: none; cursor: pointer;
  transition: border-color 0.15s;
}
.btn-pill-secondary:hover { border-color: #fafafa; }

.footer-divider { height: 1px; background: #2e2e2e; margin-bottom: 60px; }
.footer-grid { display: grid; gap: 40px; grid-template-columns: 1fr; margin-bottom: 60px; }
@media (min-width: 768px) { .footer-grid { grid-template-columns: 2fr 1fr 1fr; } }
.footer-brand .footer-logo-text { font-size: 16px; font-weight: 500; }
.footer-tagline { font-size: 14px; color: #898989; margin-top: 8px; }
.footer-col-title { font-size: 12px; color: #fafafa; font-weight: 500; margin-bottom: 16px; }
.footer-col { display: flex; flex-direction: column; gap: 12px; }
.footer-link { font-size: 14px; color: #898989; text-decoration: none; transition: color 0.15s; }
.footer-link:hover { color: #fafafa; }
.footer-bottom { font-size: 12px; color: #4d4d4d; border-top: 1px solid #2e2e2e; padding-top: 24px; }
</style>
