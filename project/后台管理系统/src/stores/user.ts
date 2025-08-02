import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// 角色信息接口
interface RoleInfo {
  _id: string
  name: string
  permission: string[]
  __v: number
}

// 用户信息接口
interface UserInfo {
  _id: string
  username: string
  realName: string
  email: string
  phone: string
  roleID: string | RoleInfo
  permissions: string[]
}

// 菜单项接口
interface MenuItem {
  index: string
  title: string
  icon: string
  children?: MenuItem[]
  permission?: string
}

export const useUserStore = defineStore('user', () => {
  // 状态
  const userInfo = ref<UserInfo | null>(null)
  const isLoggedIn = ref(false)

  // 计算属性
  const hasPermission = computed(() => {
    return (permission: string) => {
      if (!userInfo.value?.permissions) return false
      return userInfo.value.permissions.includes(permission)
    }
  })

  // 菜单配置 - 根据权限过滤
  const menuItems = computed(() => {
    const allMenus: MenuItem[] = [
      {
        index: '/home',
        title: '首页',
        icon: 'HomeFilled',
        permission: 'home_access',
      },
      {
        index: 'user-management',
        title: '用户管理',
        icon: 'UserFilled',
        children: [
          {
            index: '/doctors',
            title: '医生管理',
            icon: 'UserFilled',
            permission: 'doctor_manage',
          },
          {
            index: '/users',
            title: '用户管理',
            icon: 'Avatar',
            permission: 'user_manage',
          },
        ],
      },
      {
        index: 'business-management',
        title: '业务管理',
        icon: 'Document',
        children: [
          {
            index: '/prescriptions',
            title: '处方管理',
            icon: 'Document',
            permission: 'prescription_manage',
          },
          {
            index: '/orders',
            title: '订单管理',
            icon: 'ShoppingCart',
            permission: 'order_manage',
          },
          {
            index: '/products',
            title: '商品管理',
            icon: 'Goods',
            permission: 'medicine_manage',
          },
        ],
      },
      {
        index: '/message',
        title: '消息列表',
        icon: 'Message',
      },
      {
        index: 'content-management',
        title: '内容管理',
        icon: 'Edit',
        children: [
          {
            index: '/content',
            title: '内容管理',
            icon: 'Edit',
          },
          {
            index: '/statistics',
            title: '统计管理',
            icon: 'TrendCharts',
            permission: 'report_view',
          },
        ],
      },
      {
        index: '/system',
        title: '系统设置',
        icon: 'Tools',
        permission: 'system_manage',
      },
    ]

    // 过滤菜单项
    return filterMenusByPermission(allMenus, hasPermission.value)
  })

  // 递归过滤菜单项
  const filterMenusByPermission = (
    menus: MenuItem[],
    hasPerm: (permission: string) => boolean
  ): MenuItem[] => {
    return menus.filter(menu => {
      // 如果没有权限要求，直接显示
      if (!menu.permission) {
        // 如果有子菜单，递归过滤
        if (menu.children) {
          menu.children = filterMenusByPermission(menu.children, hasPerm)
          // 如果子菜单都被过滤掉了，也不显示父菜单
          return menu.children.length > 0
        }
        return true
      }

      // 检查权限
      if (!hasPerm(menu.permission)) {
        return false
      }

      // 如果有子菜单，递归过滤
      if (menu.children) {
        menu.children = filterMenusByPermission(menu.children, hasPerm)
      }

      return true
    })
  }

  // 动作
  const setUserInfo = (info: UserInfo) => {
    userInfo.value = info
    isLoggedIn.value = true
    localStorage.setItem('userInfo', JSON.stringify(info))
    localStorage.setItem('isLoggedIn', 'true')
  }

  const clearUserInfo = () => {
    userInfo.value = null
    isLoggedIn.value = false
    localStorage.removeItem('userInfo')
    localStorage.removeItem('isLoggedIn')
  }

  const initUserInfo = () => {
    const storedUserInfo = localStorage.getItem('userInfo')
    const storedIsLoggedIn = localStorage.getItem('isLoggedIn')

    if (storedUserInfo && storedIsLoggedIn === 'true') {
      try {
        userInfo.value = JSON.parse(storedUserInfo)
        isLoggedIn.value = true
      } catch (error) {
        console.error('解析用户信息失败:', error)
        clearUserInfo()
      }
    }
  }

  return {
    userInfo,
    isLoggedIn,
    hasPermission,
    menuItems,
    setUserInfo,
    clearUserInfo,
    initUserInfo,
  }
})
