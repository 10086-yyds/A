/// <reference types="vite/client" />

// {{ AURA-X: Modify - 简化Vue模块类型声明. Approved: 代码质量修复. }}
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}
