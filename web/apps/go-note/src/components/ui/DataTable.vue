<template>
  <div class="overflow-hidden rounded-[12px] border border-[rgba(0,0,0,0.1)] bg-white shadow-[rgba(0,0,0,0.04)_0px_4px_18px,rgba(0,0,0,0.027)_0px_2px_7.85px,rgba(0,0,0,0.02)_0px_0.8px_2.93px,rgba(0,0,0,0.01)_0px_0.175px_1.04px]">
    <table class="w-full text-left text-[14px]">
      <thead class="border-b border-[rgba(0,0,0,0.1)] bg-[#f6f5f4]">
        <tr>
          <th
            v-for="col in columns"
            :key="col.key"
            class="px-6 py-3 text-[12px] font-[600] tracking-[0.125px] text-[#615d59]"
            :class="col.class"
          >
            {{ col.label }}
          </th>
        </tr>
      </thead>
      <tbody class="divide-y divide-[rgba(0,0,0,0.06)]">
        <slot />
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
export interface DataTableColumn {
  key: string
  label?: string
  class?: string
}

defineProps<{ columns: DataTableColumn[] }>()
</script>
