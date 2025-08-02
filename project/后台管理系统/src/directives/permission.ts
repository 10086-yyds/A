import type { App, Directive, DirectiveBinding } from 'vue'
import { useUserStore } from '../stores/user'
import { hasPermission } from '../utils/permission'

// 权限指令
const permission: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const { value } = binding

    // 如果没有传入权限值，直接显示
    if (!value) {
      return
    }

    // 使用权限工具函数
    const hasPerm = hasPermission(value)

    // 如果没有权限，隐藏元素
    if (!hasPerm) {
      el.style.display = 'none'
      // 或者直接移除元素
      // el.parentNode?.removeChild(el)
    }
  },

  updated(el: HTMLElement, binding: DirectiveBinding) {
    const { value } = binding

    if (!value) {
      el.style.display = ''
      return
    }

    // 使用权限工具函数
    const hasPerm = hasPermission(value)

    if (hasPerm) {
      el.style.display = ''
    } else {
      el.style.display = 'none'
    }
  },
}

// 注册权限指令
export function setupPermissionDirective(app: App) {
  app.directive('permission', permission)
}

export default permission
