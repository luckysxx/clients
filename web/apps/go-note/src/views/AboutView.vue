<template>
  <PageShell label="About GoNote" title="把代码片段升级成可阅读、可沉淀、可协作的知识文档。" description="GoNote 是一个基于 Go 和 Vue 3 构建的代码知识工具，已经接入统一认证体系。" body-class="px-8 py-6">
    <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div class="space-y-6">
        <div class="grid gap-4 md:grid-cols-2">
          <article class="rounded-[12px] border border-[rgba(0,0,0,0.1)] bg-[#f6f5f4] p-5">
            <p class="text-[11px] font-[600] uppercase tracking-[0.05em] text-[#a39e98]">Design Direction</p>
            <ul class="mt-4 space-y-3 text-[14px] leading-6 text-[#615d59]">
              <li>侧栏采用更紧凑的深色工作台风格，支持分组树和标签快速过滤。</li>
              <li>主内容区去卡片化，标题更大、留白更足，阅读优先。</li>
              <li>弹窗和表单统一回到黑白灰加 1px 细边框的几何表达。</li>
            </ul>
          </article>

          <article class="rounded-[12px] border border-[rgba(0,0,0,0.1)] bg-[#f6f5f4] p-5">
            <p class="text-[11px] font-[600] uppercase tracking-[0.05em] text-[#a39e98]">Product Intent</p>
            <ul class="mt-4 space-y-3 text-[14px] leading-6 text-[#615d59]">
              <li>让代码片段不仅能贴，还能带上上下文沉淀为知识。</li>
              <li>保留分组、标签和筛选 API，持续兼容现有后端能力。</li>
              <li>为后续模板库、全局搜索和共享协作预留统一的 UI 基座。</li>
            </ul>
          </article>
        </div>
      </div>

      <aside class="surface-panel p-5">
        <p class="text-[11px] font-[600] uppercase tracking-[0.05em] text-[#a39e98]">Tech Stack</p>
        <div class="mt-4 space-y-4 text-[14px] text-[#615d59]">
          <div>
            <p class="text-[#a39e98]">Frontend</p>
            <p class="mt-1 font-[500] text-[rgba(0,0,0,0.95)]">Vue 3, TypeScript, Vite, Tailwind CSS 4, Radix Vue, Pinia</p>
          </div>
          <div>
            <p class="text-[#a39e98]">Backend</p>
            <p class="mt-1 font-[500] text-[rgba(0,0,0,0.95)]">Go, Gin, PostgreSQL, Redis, Ent ORM</p>
          </div>
          <div>
            <p class="text-[#a39e98]">Authentication</p>
            <p class="mt-1 font-[500] text-[rgba(0,0,0,0.95)]">SSO 统一登录能力，前端路由守卫逻辑保持不变</p>
          </div>
        </div>
      </aside>
    </div>
  </PageShell>
</template>

<script setup lang="ts">
import PageShell from '@/components/layout/PageShell.vue'
</script>
