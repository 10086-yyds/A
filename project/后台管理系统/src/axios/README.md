# API 使用说明

## 概述

本项目使用 axios 进行 HTTP 请求，并提供了统一的 API 接口管理。

## 主要功能

### 1. 用户相关 API
- 登录认证
- 获取用户信息
- 更新用户信息
- 上传头像

### 2. 文章相关 API
- 获取文章列表
- 获取文章详情
- 创建文章
- 更新文章
- 删除文章

### 3. 医生相关 API (新增)
- 通过职位列表接口获取医生列表
- 获取医生详情
- 创建医生
- 更新医生
- 删除医生

## 医生 API 详细说明

### 获取医生列表

通过调用职位列表接口 `/positionList` 然后筛选出医生：

```typescript
import { doctorApi } from './api'

// 获取医生列表
const getDoctors = async () => {
  try {
    const response = await doctorApi.getDoctorsFromPositions({
      page: 1,
      pageSize: 10,
      keyword: '内科' // 可选，搜索关键词
    })
    
    if (response.code === 200) {
      console.log('医生列表:', response.data)
      console.log('总数:', response.total)
    }
  } catch (error) {
    console.error('获取医生列表失败:', error)
  }
}
```

### 医生筛选逻辑

系统会自动筛选出医生职位，筛选条件包括：
1. `position.roleID._id === '688b5a2043564643c1fdd7b7'` - 医生角色ID
2. `position.roleID.name?.includes('医生')` - 角色名称包含"医生"
3. `position.realName?.includes('医生')` - 真实姓名包含"医生"
4. `position.username?.includes('doctor')` - 用户名包含"doctor"

**注意**: 系统同时支持 `roleID` 为字符串或对象的情况，确保向后兼容。

### 创建医生

```typescript
const createDoctor = async () => {
  try {
    const doctorData = {
      name: '张医生',
      department: '内科',
      title: '主治医师',
      phone: '13800138000',
      email: 'zhang@hospital.com',
      status: 'active'
    }
    
    const response = await doctorApi.create(doctorData)
    console.log('创建成功:', response.data)
  } catch (error) {
    console.error('创建失败:', error)
  }
}
```

### 更新医生

```typescript
const updateDoctor = async (id: string) => {
  try {
    const updateData = {
      title: '副主任医师',
      status: 'active'
    }
    
    const response = await doctorApi.update(id, updateData)
    console.log('更新成功:', response.data)
  } catch (error) {
    console.error('更新失败:', error)
  }
}
```

### 删除医生

```typescript
const deleteDoctor = async (id: string) => {
  try {
    await doctorApi.delete(id)
    console.log('删除成功')
  } catch (error) {
    console.error('删除失败:', error)
  }
}
```

## 数据接口定义

### Doctor 接口

```typescript
interface Doctor {
  id: string
  name: string
  department: string
  title: string
  phone: string
  email: string
  status: 'active' | 'inactive'
  createTime: string
}
```

### Position 接口

```typescript
interface Position {
  _id: string
  username: string
  password: string
  realName: string
  email: string
  phone: string
  roleID: string | { _id: string; name: string; [key: string]: any } // 可能是字符串或对象
  _v: number
  // 可选字段，用于医生信息
  department?: string
  title?: string
  status?: string
  createTime?: string
}
```

## 使用示例

完整的使用示例请参考 `apiExample` 和 `doctorApiExample` 对象。

## 错误处理

所有 API 调用都包含错误处理，建议使用 try-catch 包装：

```typescript
try {
  const response = await doctorApi.getDoctorsFromPositions(params)
  // 处理成功响应
} catch (error) {
  // 处理错误
  console.error('API 调用失败:', error)
}
```

## 注意事项

1. 医生 API 通过职位列表接口获取数据，确保后端 `/lz/positionList` 接口正常工作，并使用 `populate("roleID")` 关联角色信息
2. 筛选逻辑基于 `roleID` 字段，现在支持对象格式（包含 `_id` 和 `name` 属性）
3. 所有 API 都支持分页和搜索功能
4. 状态字段使用 'active' 和 'inactive' 表示在职和离职状态
5. 需要根据实际的医生roleID来修改筛选条件
6. 系统同时支持 `roleID` 为字符串或对象的情况，确保向后兼容
