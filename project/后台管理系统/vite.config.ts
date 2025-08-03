import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueJsx(), vueDevTools()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    proxy: {
      '/api': {
        // {{ AURA-X: Modify - 更新为用户IPv4地址. Approved: 网络配置修复. }}
        target: 'http://198.18.0.1:3000',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api/, '/api'),
      },
    },
  },
})
