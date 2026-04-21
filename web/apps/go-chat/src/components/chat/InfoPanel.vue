<template>
  <aside class="info-panel">
    <section class="info-card">
      <div class="info-card__head">
        <h3>群公告</h3>
        <ArrowIcon />
      </div>
      <p>减少下头言论，共创绿色网络环境</p>
    </section>

    <section class="info-card info-card--members">
      <div class="info-card__head">
        <h3>群聊成员 {{ memberCount }}</h3>
        <SearchIcon />
      </div>
      <div class="member-list">
        <div v-for="member in members" :key="member.name" class="member-item">
          <img :src="member.avatar" :alt="member.name">
          <span>{{ member.name }}</span>
          <em v-if="member.role">{{ member.role }}</em>
        </div>
      </div>
    </section>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ArrowIcon, SearchIcon } from '@/utils/icons'
import type { Member } from '@/utils/mock'

const props = defineProps<{
  members: Member[]
}>()

const memberCount = computed(() => {
  // 当前先根据活跃成员数模拟一个总人数。
  return props.members.length > 0 ? 24 : 0
})
</script>
