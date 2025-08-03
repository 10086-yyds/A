import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import App from './App.vue'
import router from './router'
import { useThemeStore } from './stores/theme'
import { useUserStore } from './stores/user'
import { setupPermissionDirective } from './directives/permission'

const app = createApp(App)
const pinia = createPinia()

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(pinia)
app.use(router)
app.use(ElementPlus)

// 注册权限指令
setupPermissionDirective(app)

// 初始化主题和用户信息
const themeStore = useThemeStore()
const userStore = useUserStore()
themeStore.initTheme()
userStore.initUserInfo()

app.mount('#app')
