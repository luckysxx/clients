<template>
  <div class="empty-state">
    <div class="empty-state__icon"></div>
    <p>选择一个联系人开始聊天</p>
  </div>
</template>

<style scoped>
.empty-state {
  grid-column: 3 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #8a8a8a;
  background: rgba(255, 255, 255, 0.95);
  height: 100%;
}
.empty-state__icon {
  width: 80px;
  height: 80px;
  background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%23cbd5e1" stroke-width="1.5"><path d="M7 18h6l4 3v-3h.5A3.5 3.5 0 0 0 21 14.5v-7A3.5 3.5 0 0 0 17.5 4h-11A3.5 3.5 0 0 0 3 7.5v7A3.5 3.5 0 0 0 6.5 18H7Z"/></svg>') no-repeat center;
  margin-bottom: 20px;
}
</style>
