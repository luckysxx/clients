import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { fetchAppConfig } from '@clients/shared'

import App from './App.vue'
import router from './router'

fetchAppConfig().then(() => {
  const app = createApp(App)

  app.use(createPinia())
  app.use(router)

  app.mount('#app')
})
