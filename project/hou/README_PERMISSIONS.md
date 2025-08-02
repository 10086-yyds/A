# 权限系统使用说明

## 概述

本系统实现了基于角色的权限控制（RBAC），用户通过角色关联权限，在登录时会自动传递权限信息。

## 数据模型

### 用户表 (position)
- `username`: 用户名
- `password`: 密码
- `realName`: 真实姓名
- `email`: 邮箱
- `phone`: 电话
- `roleID`: 角色ID（关联到role表）

### 角色表 (role)
- `name`: 角色名称
- `permission`: 权限数组

## 登录接口

### POST /lz/login
用户登录时会自动获取并返回权限信息。

**请求参数：**
```json
{
  "username": "用户名",
  "password": "密码"
}
```

**返回数据：**
```json
{
  "code": 200,
  "msg": "登录成功",
  "data": {
    "_id": "用户ID",
    "username": "用户名",
    "realName": "真实姓名",
    "email": "邮箱",
    "phone": "电话",
    "roleID": {
      "_id": "角色ID",
      "name": "角色名称",
      "permission": ["权限1", "权限2", ...]
    },
    "permissions": ["权限1", "权限2", ...]
  }
}
```

## 权限验证接口

### GET /lz/permissions/:userId
获取指定用户的权限信息。

**返回数据：**
```json
{
  "code": 200,
  "msg": "获取权限成功",
  "data": {
    "permissions": ["权限1", "权限2", ...],
    "roleInfo": {
      "_id": "角色ID",
      "name": "角色名称"
    },
    "userId": "用户ID",
    "username": "用户名"
  }
}
```

## 权限中间件使用

### 1. 单个权限验证
```javascript
const { checkPermission } = require("../middleware/auth");

// 需要 "create_user" 权限
router.post("/add", checkPermission("create_user"), async function (req, res) {
  // 路由逻辑
});
```

### 2. 多个权限验证（需要所有权限）
```javascript
const { checkMultiplePermissions } = require("../middleware/auth");

// 需要同时拥有 "create_user" 和 "edit_user" 权限
router.post("/add", checkMultiplePermissions(["create_user", "edit_user"]), async function (req, res) {
  // 路由逻辑
});
```

### 3. 任一权限验证（需要至少一个权限）
```javascript
const { checkAnyPermission } = require("../middleware/auth");

// 需要拥有 "create_user" 或 "edit_user" 权限之一
router.post("/add", checkAnyPermission(["create_user", "edit_user"]), async function (req, res) {
  // 路由逻辑
});
```

## 权限传递方式

权限验证中间件支持两种方式获取用户ID：

1. **请求头方式**：在请求头中添加 `user-id`
   ```
   headers: {
     'user-id': '用户ID'
   }
   ```

2. **查询参数方式**：在URL中添加 `userId` 参数
   ```
   GET /api/users?userId=用户ID
   ```

## 常用权限示例

建议的权限命名规范：

- `create_user` - 创建用户
- `edit_user` - 编辑用户
- `delete_user` - 删除用户
- `view_users` - 查看用户列表
- `create_role` - 创建角色
- `edit_role` - 编辑角色
- `delete_role` - 删除角色
- `view_roles` - 查看角色列表
- `manage_drugs` - 管理药品
- `view_orders` - 查看订单
- `manage_orders` - 管理订单

## 前端使用示例

### 登录后保存权限信息
```javascript
// 登录请求
const loginResponse = await fetch('/lz/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    username: 'admin',
    password: 'password'
  })
});

const result = await loginResponse.json();
if (result.code === 200) {
  // 保存用户信息和权限
  localStorage.setItem('user', JSON.stringify(result.data));
  localStorage.setItem('permissions', JSON.stringify(result.data.permissions));
}
```

### 检查权限
```javascript
// 检查是否有某个权限
function hasPermission(permission) {
  const permissions = JSON.parse(localStorage.getItem('permissions') || '[]');
  return permissions.includes(permission);
}

// 使用示例
if (hasPermission('create_user')) {
  // 显示创建用户按钮
  showCreateUserButton();
}
```

### 发送带用户ID的请求
```javascript
// 方式1：通过请求头
const response = await fetch('/lz/add', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'user-id': userId
  },
  body: JSON.stringify(userData)
});

// 方式2：通过查询参数
const response = await fetch(`/lz/add?userId=${userId}`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(userData)
});
```

## 注意事项

1. 权限验证失败会返回相应的错误码和消息
2. 用户没有分配角色时会返回权限不足错误
3. 建议在前端和后端都进行权限验证
4. 权限名称应该具有描述性，便于管理和维护
5. 定期检查和更新用户权限，确保安全性 