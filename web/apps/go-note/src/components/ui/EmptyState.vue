<template>
  <div :class="wrapperClass">
    <div v-if="icon" :class="iconWrapperClass">
      <component :is="icon" :class="iconClass" />
    </div>
    <h3 v-if="title" class="mt-5 text-[16px] font-[600] text-[rgba(0,0,0,0.95)]">{{ title }}</h3>
    <p v-if="description" class="mt-1 text-[14px] text-[#615d59] max-w-sm mx-auto">{{ description }}</p>
    <slot name="actions">
      <button
        v-if="ctaText"
        type="button"
        class="ui-button ui-button-primary mt-6"
        @click="emit('cta')"
      >
        {{ ctaText }}
      </button>
    </slot>
  </div>
</template>

<script setup lang="ts">
import { computed, type Component } from 'vue'

const props = withDefaults(defineProps<{
  icon?: Component
  title?: string
  description?: string
  ctaText?: string
  /** 'card' = 方形边框图标框（HomeView 风格）；'circle' = 圆形浅底（DraftsView 风格） */
  variant?: 'card' | 'circle'
  padded?: boolean
}>(), {
  variant: 'card',
  padded: true,
})

const emit = defineEmits<{ cta: [] }>()

const wrapperClass = computed(() =>
  props.padded ? 'py-16 text-center' : 'text-center'
)

const iconWrapperClass = computed(() =>
  props.variant === 'circle'
    ? 'mx-auto mb-4 inline-flex rounded-full bg-[rgba(0,0,0,0.04)] p-4 text-[#a39e98]'
    : 'mx-auto flex h-12 w-12 items-center justify-center rounded border border-[rgba(0,0,0,0.1)] bg-white shadow-soft'
)

const iconClass = computed(() =>
  props.variant === 'circle' ? 'h-8 w-8' : 'h-5 w-5 text-[#615d59]'
)
</script>
