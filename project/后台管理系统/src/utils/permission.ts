import { useUserStore } from '../stores/user'

// 角色信息接口
interface RoleInfo {
  _id: string
  name: string
  permission: string[]
  __v: number
}

// 超级管理员角色名称列表
const SUPER_ADMIN_ROLES = ['超级管理员', 'super_admin', 'admin', 'administrator']

/**
 * 检查用户是否为超级管理员
 */
export function isSuperAdmin(): boolean {
  const userStore = useUserStore()
  const roleID = userStore.userInfo?.roleID

  // 如果 roleID 是对象，获取 name 属性
  if (roleID && typeof roleID === 'object' && 'name' in roleID) {
    const roleName = (roleID as RoleInfo).name
    return SUPER_ADMIN_ROLES.includes(roleName)
  }

  // 如果 roleID 是字符串，直接使用
  if (typeof roleID === 'string') {
    return SUPER_ADMIN_ROLES.includes(roleID)
  }

  return false
}

/**
 * 检查用户是否有指定权限
 * 超级管理员拥有所有权限
 */
export function hasPermission(permission: string): boolean {
  const userStore = useUserStore()

  // 如果是超级管理员，拥有所有权限
  if (isSuperAdmin()) {
    return true
  }

  // 其他角色使用原有的权限检查逻辑
  return userStore.hasPermission(permission)
}

/**
 * 检查用户是否有指定角色
 */
export function hasRole(roleName: string): boolean {
  const userStore = useUserStore()
  const userRole = userStore.userInfo?.roleID || ''
  return userRole === roleName
}

/**
 * 检查用户是否有指定角色中的任意一个
 */
export function hasAnyRole(roleNames: string[]): boolean {
  const userStore = useUserStore()
  const userRole = userStore.userInfo?.roleID || ''
  return roleNames.includes(userRole)
}
