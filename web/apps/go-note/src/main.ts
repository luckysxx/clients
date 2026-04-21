import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'
import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { bootstrapAppSessionFromUrlHash } from '@clients/auth'
import { fetchAppConfig } from '@clients/shared'

import App from './App.vue'
import router from './router'
import { useAuthStore } from '@/stores/auth'

// 从 api-gateway 拉取运行时配置后再挂载应用
fetchAppConfig().then(async () => {
  const app = createApp(App)
  const pinia = createPinia()
  const authStore = useAuthStore(pinia)

  authStore.initFromStorage()
  bootstrapAppSessionFromUrlHash(authStore)
  app.use(pinia)
  app.use(router)

  app.mount('#app')
})
