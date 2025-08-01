# 聊天功能API文档

## 概述

这是一个完整的实时聊天系统，支持前端和后台管理系统之间的通信。系统包含WebSocket实时通信和REST API接口。

## 技术栈

- **后端**: Node.js + Express + Socket.IO
- **数据库**: MongoDB + Mongoose
- **实时通信**: WebSocket (Socket.IO)

## 安装和运行

```bash
# 安装依赖
npm install

# 启动服务器
npm start

# 开发模式（自动重启）
npm run dev
```

## WebSocket事件

### 客户端到服务器

#### 1. 用户加入
```javascript
socket.emit('user:join', {
  id: '用户ID',
  username: '用户名',
  realName: '真实姓名',
  avatar: '头像URL',
  role: '用户角色'
});
```

#### 2. 发送消息
```javascript
socket.emit('message:send', {
  sessionId: '会话ID',
  senderId: '发送者ID',
  receiverId: '接收者ID',
  content: '消息内容',
  messageType: 'text', // text, image, file, voice
  fileUrl: '', // 文件URL（可选）
  fileName: '', // 文件名（可选）
  fileSize: 0 // 文件大小（可选）
});
```

#### 3. 获取在线用户
```javascript
socket.emit('users:online', (users) => {
  console.log('在线用户:', users);
});
```

#### 4. 获取聊天历史
```javascript
socket.emit('chat:history', {
  sessionId: '会话ID',
  page: 1,
  limit: 50
});
```

#### 5. 更新用户状态
```javascript
socket.emit('user:status:update', 'online'); // online, offline, away
```

#### 6. 标记消息已读
```javascript
socket.emit('message:read', {
  messageId: '消息ID',
  userId: '用户ID'
});
```

#### 7. 获取未读消息数量
```javascript
socket.emit('unread:count', '用户ID');
```

#### 8. 正在输入状态
```javascript
// 开始输入
socket.emit('typing:start', {
  sessionId: '会话ID',
  userId: '用户ID',
  receiverId: '接收者ID'
});

// 停止输入
socket.emit('typing:stop', {
  sessionId: '会话ID',
  userId: '用户ID',
  receiverId: '接收者ID'
});
```

### 服务器到客户端

#### 1. 用户加入成功
```javascript
socket.on('user:joined', (data) => {
  console.log('用户加入成功:', data.user);
});
```

#### 2. 接收消息
```javascript
socket.on('message:receive', (data) => {
  console.log('收到新消息:', data.message);
});
```

#### 3. 消息发送成功
```javascript
socket.on('message:sent', (data) => {
  console.log('消息发送成功:', data.message);
});
```

#### 4. 消息状态更新
```javascript
socket.on('message:status', (data) => {
  console.log('消息状态:', data.status); // sent, delivered, read
});
```

#### 5. 用户状态更新
```javascript
socket.on('user:status', (data) => {
  console.log('用户状态更新:', data);
});
```

#### 6. 在线用户列表
```javascript
socket.on('users:online', (users) => {
  console.log('在线用户列表:', users);
});
```

#### 7. 聊天历史
```javascript
socket.on('chat:history', (data) => {
  console.log('聊天历史:', data.data);
  console.log('分页信息:', data.pagination);
});
```

#### 8. 消息已读通知
```javascript
socket.on('message:read', (data) => {
  console.log('消息已读:', data);
});
```

#### 9. 未读消息数量
```javascript
socket.on('unread:count', (data) => {
  console.log('未读消息数量:', data.data.unreadCount);
});
```

#### 10. 正在输入状态
```javascript
socket.on('typing:start', (data) => {
  console.log('用户正在输入:', data);
});

socket.on('typing:stop', (data) => {
  console.log('用户停止输入:', data);
});
```

## REST API接口

### 用户管理

#### 1. 获取所有用户
```
GET /api/chat/users
```

响应：
```json
{
  "success": true,
  "data": [
    {
      "_id": "用户ID",
      "username": "用户名",
      "realName": "真实姓名",
      "email": "邮箱",
      "phone": "电话",
      "avatar": "头像URL",
      "role": "用户角色",
      "status": "在线状态",
      "lastSeen": "最后在线时间"
    }
  ]
}
```

#### 2. 获取在线用户
```
GET /api/chat/users/online
```

### 会话管理

#### 1. 获取用户会话列表
```
GET /api/chat/sessions/:userId?page=1&limit=20
```

#### 2. 创建私聊会话
```
POST /api/chat/sessions/private
Content-Type: application/json

{
  "userId1": "用户1ID",
  "userId2": "用户2ID"
}
```

### 消息管理

#### 1. 获取聊天历史
```
GET /api/chat/messages/:sessionId?page=1&limit=50
```

#### 2. 发送消息
```
POST /api/chat/messages
Content-Type: application/json

{
  "sessionId": "会话ID",
  "senderId": "发送者ID",
  "receiverId": "接收者ID",
  "content": "消息内容",
  "messageType": "text",
  "fileUrl": "",
  "fileName": "",
  "fileSize": 0
}
```

#### 3. 标记消息已读
```
PUT /api/chat/messages/:messageId/read
Content-Type: application/json

{
  "userId": "用户ID"
}
```

#### 4. 获取未读消息数量
```
GET /api/chat/messages/unread/:userId
```

#### 5. 删除消息
```
DELETE /api/chat/messages/:messageId
Content-Type: application/json

{
  "userId": "用户ID"
}
```

#### 6. 搜索消息
```
GET /api/chat/messages/search?userId=用户ID&keyword=关键词&sessionId=会话ID&page=1&limit=20
```

### 统计信息

#### 1. 获取聊天统计
```
GET /api/chat/stats/:userId
```

响应：
```json
{
  "success": true,
  "data": {
    "totalSessions": 10,
    "totalMessages": 150,
    "sentMessages": 75,
    "receivedMessages": 75,
    "unreadMessages": 5,
    "onlineUsers": 8
  }
}
```

### 系统状态

#### 1. 健康检查
```
GET /api/health
```

响应：
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "message": "聊天服务器运行正常"
}
```

## 数据模型

### 用户模型 (User)
```javascript
{
  username: String,        // 用户名
  password: String,        // 密码
  realName: String,        // 真实姓名
  email: String,          // 邮箱
  phone: String,          // 电话
  avatar: String,         // 头像URL
  role: String,           // 角色 (admin, user, doctor, nurse)
  status: String,         // 状态 (online, offline, away)
  lastSeen: Date,         // 最后在线时间
  isActive: Boolean,      // 是否激活
  createdAt: Date,        // 创建时间
  updatedAt: Date         // 更新时间
}
```

### 聊天会话模型 (ChatSession)
```javascript
{
  participants: [ObjectId], // 参与者用户ID数组
  sessionType: String,      // 会话类型 (private, group)
  sessionName: String,      // 会话名称
  lastMessage: ObjectId,    // 最后一条消息ID
  lastMessageTime: Date,    // 最后消息时间
  unreadCount: Map,         // 未读消息数量映射
  createdAt: Date,          // 创建时间
  updatedAt: Date           // 更新时间
}
```

### 消息模型 (Message)
```javascript
{
  sessionId: ObjectId,      // 会话ID
  sender: ObjectId,         // 发送者ID
  receiver: ObjectId,       // 接收者ID
  content: String,          // 消息内容
  messageType: String,      // 消息类型 (text, image, file, voice)
  fileUrl: String,          // 文件URL
  fileName: String,         // 文件名
  fileSize: Number,         // 文件大小
  status: String,           // 消息状态 (sent, delivered, read)
  readBy: [{                // 已读用户列表
    user: ObjectId,         // 用户ID
    readAt: Date            // 阅读时间
  }],
  createdAt: Date,          // 创建时间
  updatedAt: Date           // 更新时间
}
```

### 在线用户模型 (OnlineUser)
```javascript
{
  userId: ObjectId,         // 用户ID
  socketId: String,         // Socket连接ID
  status: String,           // 状态 (online, away, offline)
  lastSeen: Date,           // 最后在线时间
  userAgent: String,        // 用户代理
  ipAddress: String,        // IP地址
  createdAt: Date,          // 创建时间
  updatedAt: Date           // 更新时间
}
```

## 前端集成示例

### 连接WebSocket
```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:3000');

// 连接成功
socket.on('connect', () => {
  console.log('WebSocket连接成功');
  
  // 用户加入
  socket.emit('user:join', {
    id: '用户ID',
    username: '用户名',
    realName: '真实姓名',
    avatar: '头像URL',
    role: '用户角色'
  });
});

// 监听消息
socket.on('message:receive', (data) => {
  console.log('收到新消息:', data.message);
  // 更新UI显示新消息
});

// 监听用户状态
socket.on('user:status', (data) => {
  console.log('用户状态更新:', data);
  // 更新用户状态显示
});
```

### 发送消息
```javascript
function sendMessage(sessionId, receiverId, content) {
  socket.emit('message:send', {
    sessionId: sessionId,
    senderId: currentUserId,
    receiverId: receiverId,
    content: content,
    messageType: 'text'
  });
}
```

### 获取聊天历史
```javascript
function getChatHistory(sessionId, page = 1) {
  socket.emit('chat:history', {
    sessionId: sessionId,
    page: page,
    limit: 50
  });
}

socket.on('chat:history', (data) => {
  console.log('聊天历史:', data.data);
  // 显示聊天历史
});
```

## 错误处理

所有API响应都遵循统一的格式：

```json
{
  "success": false,
  "message": "错误描述",
  "error": "详细错误信息"
}
```

WebSocket错误事件：
```javascript
socket.on('error', (error) => {
  console.error('WebSocket错误:', error);
});
```

## 安全考虑

1. **CORS配置**: 在生产环境中应该设置具体的域名而不是 "*"
2. **用户验证**: 建议添加JWT token验证
3. **输入验证**: 所有用户输入都应该进行验证和清理
4. **文件上传**: 文件上传应该限制大小和类型
5. **速率限制**: 建议添加API速率限制

## 部署建议

1. **环境变量**: 使用环境变量管理配置
2. **日志记录**: 添加详细的日志记录
3. **监控**: 添加服务器监控和性能监控
4. **备份**: 定期备份数据库
5. **SSL**: 在生产环境中使用HTTPS/WSS

## 扩展功能

1. **群聊功能**: 支持多人聊天
2. **文件传输**: 支持图片、文档等文件传输
3. **消息撤回**: 支持消息撤回功能
4. **消息转发**: 支持消息转发功能
5. **消息搜索**: 支持消息内容搜索
6. **消息加密**: 支持端到端加密
7. **推送通知**: 支持离线推送通知
8. **消息统计**: 支持消息统计和分析 