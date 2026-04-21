<template>
  <DialogRoot :open="state.open" @update:open="handleOpenChange">
    <DialogPortal>
      <DialogOverlay class="dialog-overlay" />
      <DialogContent class="dialog-content max-w-lg">
        <DialogTitle class="text-lg font-[600] text-[rgba(0,0,0,0.95)]">{{ state.title }}</DialogTitle>
        <DialogDescription class="mt-2 text-sm leading-6 text-[#615d59]">
          {{ state.description }}
        </DialogDescription>
        <div class="mt-6 flex justify-end gap-2">
          <button type="button" class="ui-button ui-button-secondary" @click="settleConfirm(false)">{{ state.cancelText }}</button>
          <button
            type="button"
            class="ui-button"
            :class="state.tone === 'danger' ? 'ui-button-danger' : 'ui-button-primary'"
            @click="settleConfirm(true)"
          >
            {{ state.confirmText }}
          </button>
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>

<script setup lang="ts">
import {
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
} from 'radix-vue'
import { settleConfirm, useConfirmDialogState } from '@/composables/useConfirmDialog'

const state = useConfirmDialogState()

const handleOpenChange = (open: boolean) => {
  if (!open) {
    settleConfirm(false)
  }
}
</script>
