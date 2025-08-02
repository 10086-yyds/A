# 医生管理页面权限控制

## 权限定义

### 1. 基于角色的权限控制
- **超级管理员**：拥有所有医生管理功能的权限
- **其他角色**：根据具体权限配置决定

### 2. 超级管理员角色名称
支持以下角色名称作为超级管理员：
- `超级管理员`
- `super_admin`
- `admin`
- `administrator`

### 3. 按钮级权限（非超级管理员使用）
- `doctor_add` - 添加医生权限
- `doctor_edit` - 编辑医生权限
- `doctor_delete` - 删除医生权限
- `doctor_view` - 查看医生详情权限
- `doctor_import` - 批量导入权限
- `doctor_export` - 导出数据权限

## 权限控制实现

### 1. 权限检查函数
```typescript
// 在组件中使用
import { hasPermission, isSuperAdmin } from '../utils/permission'

// 检查是否有指定权限（超级管理员自动拥有所有权限）
const canAddDoctor = hasPermission('doctor_add')

// 检查是否为超级管理员
const isAdmin = isSuperAdmin()
```

### 2. 按钮权限控制
```vue
<!-- 添加医生按钮 -->
<el-button 
  v-if="hasPermission('doctor_add')"
  type="primary" 
  @click="showAddDialog = true"
>
  添加医生
</el-button>

<!-- 编辑按钮 -->
<el-button 
  v-if="hasPermission('doctor_edit')"
  type="warning" 
  @click="handleEdit(row)"
>
  编辑
</el-button>

<!-- 删除按钮 -->
<el-button 
  v-if="hasPermission('doctor_delete')"
  type="danger" 
  @click="handleDelete(row)"
>
  删除
</el-button>
```

## 后端权限配置

### 1. 角色权限配置示例
```javascript
// 超级管理员角色
{
  roleName: "超级管理员",
  permissions: [
    "doctor_manage",
    "doctor_add",
    "doctor_edit", 
    "doctor_delete",
    "doctor_view",
    "doctor_import",
    "doctor_export"
  ]
}

// 医生管理员角色
{
  roleName: "医生管理员",
  permissions: [
    "doctor_manage",
    "doctor_add",
    "doctor_edit",
    "doctor_view"
  ]
}

// 普通用户角色
{
  roleName: "普通用户",
  permissions: [
    "doctor_manage",
    "doctor_view"
  ]
}
```

### 2. 权限验证逻辑
```javascript
// 后端权限验证中间件
const checkPermission = (requiredPermission) => {
  return (req, res, next) => {
    const userPermissions = req.user.permissions || []
    
    if (userPermissions.includes(requiredPermission)) {
      next()
    } else {
      res.status(403).json({
        code: 403,
        msg: "权限不足"
      })
    }
  }
}

// 路由中使用
router.post('/doctors', checkPermission('doctor_add'), createDoctor)
router.put('/doctors/:id', checkPermission('doctor_edit'), updateDoctor)
router.delete('/doctors/:id', checkPermission('doctor_delete'), deleteDoctor)
```

## 前端权限管理

### 1. 用户 Store 中的权限检查
```typescript
// src/stores/user.ts
const hasPermission = computed(() => {
  return (permission: string) => {
    if (!userInfo.value?.permissions) return false
    return userInfo.value.permissions.includes(permission)
  }
})
```

### 2. 组件中的使用
```typescript
// 在 Doctor.vue 中
import { useUserStore } from '../stores/user'

const userStore = useUserStore()

const hasPermission = (permission: string) => {
  return userStore.hasPermission(permission)
}
```

## 权限测试场景

### 1. 超级管理员
- ✅ 可以访问医生管理页面
- ✅ 可以添加医生
- ✅ 可以编辑医生
- ✅ 可以删除医生
- ✅ 可以查看医生详情
- ✅ 可以批量导入
- ✅ 可以导出数据

### 2. 医生管理员
- ✅ 可以访问医生管理页面
- ✅ 可以添加医生
- ✅ 可以编辑医生
- ✅ 可以查看医生详情
- ❌ 不能删除医生
- ❌ 不能批量导入
- ❌ 不能导出数据

### 3. 普通用户
- ✅ 可以访问医生管理页面
- ✅ 可以查看医生详情
- ❌ 不能添加医生
- ❌ 不能编辑医生
- ❌ 不能删除医生
- ❌ 不能批量导入
- ❌ 不能导出数据

## 安全考虑

### 1. 前端权限控制
- 仅用于用户体验优化
- 不能作为安全防护手段
- 所有敏感操作都需要后端验证

### 2. 后端权限验证
- 所有API接口都需要权限验证
- 使用中间件统一处理权限检查
- 记录权限验证失败的日志

### 3. 权限粒度
- 可以根据业务需求调整权限粒度
- 支持动态权限配置
- 权限变更需要重新登录生效

## 扩展功能

### 1. 权限指令
```typescript
// 自定义权限指令
app.directive('permission', {
  mounted(el, binding) {
    const { value } = binding
    const userStore = useUserStore()
    
    if (!userStore.hasPermission(value)) {
      el.parentNode?.removeChild(el)
    }
  }
})

// 使用方式
<el-button v-permission="'doctor_add'">添加医生</el-button>
```

### 2. 权限组件
```vue
<!-- 权限包装组件 -->
<template>
  <div v-if="hasPermission">
    <slot />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useUserStore } from '../stores/user'

const props = defineProps({
  permission: {
    type: String,
    required: true
  }
})

const userStore = useUserStore()
const hasPermission = computed(() => {
  return userStore.hasPermission(props.permission)
})
</script>

<!-- 使用方式 -->
<PermissionWrapper permission="doctor_add">
  <el-button type="primary">添加医生</el-button>
</PermissionWrapper>
```

这样的权限管理系统提供了灵活的按钮级别权限控制，可以根据不同角色的需求进行精确的权限分配。 