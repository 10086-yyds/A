# Axios 二次封装使用说明

## 概述

这是一个基于 Axios 的二次封装，提供了统一的请求处理、错误处理、加载状态管理等功能。

## 特性

- ✅ 统一的请求/响应拦截器
- ✅ 自动 token 管理
- ✅ 错误处理和提示
- ✅ 加载状态管理
- ✅ 文件上传/下载
- ✅ TypeScript 类型支持
- ✅ 可配置的请求选项

## 基础使用

### 1. 导入并使用

```typescript
import http from '@/axios/axios'

// GET 请求
const response = await http.get('/api/users')

// POST 请求
const response = await http.post('/api/users', {
  name: '张三',
  email: 'zhangsan@example.com',
})

// PUT 请求
const response = await http.put('/api/users/1', {
  name: '李四',
})

// DELETE 请求
const response = await http.delete('/api/users/1')
```

### 2. 带参数的请求

```typescript
// 查询参数
const response = await http.get('/api/articles', {
  params: {
    page: 1,
    pageSize: 10,
    keyword: 'Vue',
  },
})

// 自定义配置
const response = await http.post('/api/upload', data, {
  timeout: 30000,
  headers: {
    'Custom-Header': 'value',
  },
})
```

### 3. 文件操作

```typescript
// 上传文件
const file = document.querySelector('input[type="file"]').files[0]
const response = await http.upload('/api/upload', file)

// 下载文件
await http.download('/api/download/file.pdf', 'document.pdf')
```

## 高级配置

### 1. 静默请求

```typescript
// 不显示加载状态和错误提示
const response = await http.get('/api/silent', {
  showLoading: false,
  showError: false,
})
```

### 2. 自定义错误处理

```typescript
try {
  const response = await http.get('/api/data')
  console.log('成功:', response.data)
} catch (error) {
  console.error('错误:', error.message)
  // 自定义错误处理逻辑
}
```

## API 接口定义

### 响应数据格式

```typescript
interface ApiResponse<T = any> {
  code: number // 状态码
  message: string // 消息
  data: T // 数据
  success: boolean // 是否成功
}
```

### 请求配置

```typescript
interface RequestConfig extends AxiosRequestConfig {
  showLoading?: boolean // 是否显示加载状态
  showError?: boolean // 是否显示错误提示
}
```

## 环境配置

### 1. 基础 URL 配置

在 `axios.ts` 中修改 `baseURL`：

```typescript
this.baseURL = '/api' // 开发环境
// this.baseURL = 'https://api.example.com'  // 生产环境
```

### 2. 超时时间配置

```typescript
this.timeout = 10000 // 10秒
```

## 拦截器功能

### 请求拦截器

- 自动添加 Authorization token
- 显示/隐藏加载状态
- 请求日志记录

### 响应拦截器

- 统一响应数据格式处理
- 业务错误处理
- HTTP 状态码错误处理
- 自动处理 401 未授权情况

## 错误处理

### HTTP 状态码错误

- `401`: 未授权，自动跳转登录页
- `403`: 拒绝访问
- `404`: 请求地址不存在
- `500`: 服务器内部错误

### 业务错误

根据响应中的 `code` 字段判断业务是否成功：

```typescript
if (data.code === 200 || data.success) {
  // 业务成功
  return data
} else {
  // 业务失败
  throw new Error(data.message)
}
```

## 集成 UI 组件

### 1. 加载状态集成

在 `showLoading()` 和 `hideLoading()` 方法中集成您的 UI 组件：

```typescript
private showLoading(): void {
  // 集成 Element Plus Loading
  // ElLoading.service({ fullscreen: true })

  // 集成 Ant Design Vue Loading
  // message.loading('加载中...', 0)
}

private hideLoading(): void {
  // 隐藏加载状态
}
```

### 2. 错误提示集成

在 `showError()` 方法中集成您的消息提示组件：

```typescript
private showError(message: string): void {
  // 集成 Element Plus Message
  // ElMessage.error(message)

  // 集成 Ant Design Vue Message
  // message.error(message)
}
```

## 最佳实践

### 1. API 模块化

```typescript
// api/user.ts
import http from '@/axios/axios'

export const userApi = {
  login: (data: LoginParams) => http.post<LoginResponse>('/auth/login', data),
  getUserInfo: () => http.get<User>('/user/info'),
  updateUserInfo: (data: Partial<User>) => http.put<User>('/user/info', data),
}
```

### 2. 类型安全

```typescript
interface User {
  id: number
  name: string
  email: string
}

// 使用泛型确保类型安全
const response = await http.get<User>('/api/user/1')
const user: User = response.data
```

### 3. 错误处理

```typescript
try {
  const response = await userApi.login(loginData)
  // 处理成功响应
} catch (error) {
  // 错误已经被拦截器处理，这里可以添加额外逻辑
  console.error('登录失败:', error)
}
```

## 注意事项

1. **Token 存储**: 默认从 `localStorage` 和 `sessionStorage` 中获取 token
2. **错误处理**: 大部分错误已在拦截器中处理，无需重复处理
3. **加载状态**: 默认显示加载状态，可通过配置关闭
4. **文件上传**: 自动设置正确的 Content-Type
5. **类型安全**: 建议使用 TypeScript 泛型确保类型安全

## 扩展功能

如需添加更多功能，可以在 `HttpRequest` 类中添加：

- 请求重试机制
- 请求缓存
- 请求队列管理
- 请求取消功能
- 请求进度监控
