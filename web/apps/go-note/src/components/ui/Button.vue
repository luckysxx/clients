<template>
  <component
    :is="as"
    :type="as === 'button' ? type : undefined"
    :disabled="disabled"
    :class="[
      'ui-button',
      variantClass,
      sizeClass,
      disabled ? 'ui-button-disabled' : '',
    ]"
  >
    <slot name="leading" />
    <slot />
    <slot name="trailing" />
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md'

const props = withDefaults(
  defineProps<{
    variant?: Variant
    size?: Size
    type?: 'button' | 'submit' | 'reset'
    as?: string
    disabled?: boolean
  }>(),
  {
    variant: 'primary',
    size: 'md',
    type: 'button',
    as: 'button',
    disabled: false,
  },
)

const variantClass = computed(() => {
  switch (props.variant) {
    case 'secondary': return 'ui-button-secondary'
    case 'ghost': return 'ui-button-ghost'
    case 'danger': return 'ui-button-danger'
    default: return 'ui-button-primary'
  }
})

const sizeClass = computed(() => (props.size === 'sm' ? 'h-8 px-2.5 text-[13px]' : ''))
</script>
