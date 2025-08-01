# 聊天功能安装和使用说明

## 🚀 快速开始

### 1. 安装依赖

```bash
# 安装Socket.IO
npm install socket.io

# 安装开发依赖（可选）
npm install nodemon --save-dev
```

### 2. 启动服务器

```bash
# 生产模式
npm start

# 开发模式（自动重启）
npm run dev
```

### 3. 测试聊天功能

1. 打开浏览器访问 `http://localhost:3000/test-client.html`
2. 或者直接打开项目根目录下的 `test-client.html` 文件

## 📁 项目结构

```
hou/
├── app.js                    # 主应用文件
├── bin/www                   # 服务器启动文件
├── db/
│   ├── database.js          # 数据库连接
│   └── model.js             # 数据模型（已更新）
├── routes/
│   └── chat.js              # 聊天API路由
├── websocket/
│   └── chatServer.js        # WebSocket服务器
├── test-client.html         # 测试客户端
├── README_CHAT_API.md       # API文档
└── package.json             # 项目配置
```

## 🔧 功能特性

### ✅ 已实现功能

1. **实时消息传递**
   - WebSocket实时通信
   - 消息发送和接收
   - 消息状态跟踪（发送中、已送达、已读）

2. **用户管理**
   - 用户在线状态
   - 用户信息管理
   - 在线用户列表

3. **会话管理**
   - 私聊会话创建
   - 会话历史记录
   - 会话列表管理

4. **消息功能**
   - 文本消息发送
   - 消息历史查询
   - 消息已读状态
   - 消息搜索
   - 消息删除

5. **实时状态**
   - 用户在线/离线状态
   - 正在输入提示
   - 未读消息计数

6. **REST API**
   - 完整的REST API接口
   - 用户管理API
   - 消息管理API
   - 会话管理API
   - 统计信息API

## 🎯 使用场景

### 前端应用集成

```javascript
// 连接WebSocket
const socket = io('http://localhost:3000');

// 用户加入
socket.emit('user:join', {
  id: '用户ID',
  username: '用户名',
  realName: '真实姓名',
  avatar: '头像URL',
  role: '用户角色'
});

// 发送消息
socket.emit('message:send', {
  sessionId: '会话ID',
  senderId: '发送者ID',
  receiverId: '接收者ID',
  content: '消息内容',
  messageType: 'text'
});

// 监听消息
socket.on('message:receive', (data) => {
  console.log('收到新消息:', data.message);
});
```

### 后台管理系统集成

```javascript
// 获取在线用户
fetch('/api/chat/users/online')
  .then(response => response.json())
  .then(data => {
    console.log('在线用户:', data.data);
  });

// 获取聊天统计
fetch('/api/chat/stats/用户ID')
  .then(response => response.json())
  .then(data => {
    console.log('聊天统计:', data.data);
  });
```

## 🔌 API接口

### WebSocket事件

| 事件 | 方向 | 描述 |
|------|------|------|
| `user:join` | 客户端→服务器 | 用户加入聊天 |
| `message:send` | 客户端→服务器 | 发送消息 |
| `users:online` | 客户端→服务器 | 获取在线用户 |
| `chat:history` | 客户端→服务器 | 获取聊天历史 |
| `user:status:update` | 客户端→服务器 | 更新用户状态 |
| `message:read` | 客户端→服务器 | 标记消息已读 |
| `typing:start/stop` | 客户端→服务器 | 正在输入状态 |
| `message:receive` | 服务器→客户端 | 接收新消息 |
| `user:status` | 服务器→客户端 | 用户状态更新 |
| `users:online` | 服务器→客户端 | 在线用户列表 |

### REST API

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/api/chat/users` | 获取所有用户 |
| GET | `/api/chat/users/online` | 获取在线用户 |
| GET | `/api/chat/sessions/:userId` | 获取用户会话 |
| POST | `/api/chat/sessions/private` | 创建私聊会话 |
| GET | `/api/chat/messages/:sessionId` | 获取聊天历史 |
| POST | `/api/chat/messages` | 发送消息 |
| PUT | `/api/chat/messages/:messageId/read` | 标记消息已读 |
| GET | `/api/chat/messages/unread/:userId` | 获取未读消息数 |
| DELETE | `/api/chat/messages/:messageId` | 删除消息 |
| GET | `/api/chat/messages/search` | 搜索消息 |
| GET | `/api/chat/stats/:userId` | 获取聊天统计 |
| GET | `/api/health` | 健康检查 |

## 🗄️ 数据库模型

### 用户模型 (User)
- `username`: 用户名
- `password`: 密码
- `realName`: 真实姓名
- `email`: 邮箱
- `phone`: 电话
- `avatar`: 头像URL
- `role`: 角色 (admin, user, doctor, nurse)
- `status`: 状态 (online, offline, away)
- `lastSeen`: 最后在线时间

### 聊天会话模型 (ChatSession)
- `participants`: 参与者用户ID数组
- `sessionType`: 会话类型 (private, group)
- `sessionName`: 会话名称
- `lastMessage`: 最后一条消息ID
- `lastMessageTime`: 最后消息时间
- `unreadCount`: 未读消息数量映射

### 消息模型 (Message)
- `sessionId`: 会话ID
- `sender`: 发送者ID
- `receiver`: 接收者ID
- `content`: 消息内容
- `messageType`: 消息类型 (text, image, file, voice)
- `fileUrl`: 文件URL
- `fileName`: 文件名
- `fileSize`: 文件大小
- `status`: 消息状态 (sent, delivered, read)
- `readBy`: 已读用户列表

### 在线用户模型 (OnlineUser)
- `userId`: 用户ID
- `socketId`: Socket连接ID
- `status`: 状态 (online, away, offline)
- `lastSeen`: 最后在线时间
- `userAgent`: 用户代理
- `ipAddress`: IP地址

## 🧪 测试方法

### 1. 使用测试客户端

1. 启动服务器：`npm start`
2. 打开 `test-client.html` 文件
3. 输入用户信息并点击"加入"
4. 选择聊天对象开始聊天

### 2. 多用户测试

1. 打开多个浏览器窗口
2. 每个窗口使用不同的用户ID
3. 测试用户之间的消息传递

### 3. API测试

使用Postman或curl测试REST API：

```bash
# 获取在线用户
curl http://localhost:3000/api/chat/users/online

# 创建会话
curl -X POST http://localhost:3000/api/chat/sessions/private \
  -H "Content-Type: application/json" \
  -d '{"userId1":"user1","userId2":"user2"}'

# 发送消息
curl -X POST http://localhost:3000/api/chat/messages \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"会话ID","senderId":"user1","receiverId":"user2","content":"Hello!"}'
```

## 🔒 安全考虑

1. **CORS配置**: 生产环境中应设置具体域名
2. **用户验证**: 建议添加JWT token验证
3. **输入验证**: 所有用户输入都应进行验证
4. **文件上传**: 限制文件大小和类型
5. **速率限制**: 添加API速率限制

## 🚀 部署建议

1. **环境变量**: 使用环境变量管理配置
2. **日志记录**: 添加详细日志记录
3. **监控**: 添加服务器监控
4. **备份**: 定期备份数据库
5. **SSL**: 生产环境使用HTTPS/WSS

## 📞 技术支持

如果遇到问题，请检查：

1. 数据库连接是否正常
2. WebSocket连接是否成功
3. 用户ID是否有效
4. 会话ID是否正确
5. 网络连接是否稳定

## 🔄 扩展功能

未来可以添加的功能：

1. **群聊功能**: 支持多人聊天
2. **文件传输**: 支持图片、文档传输
3. **消息撤回**: 支持消息撤回
4. **消息转发**: 支持消息转发
5. **消息加密**: 端到端加密
6. **推送通知**: 离线推送通知
7. **消息统计**: 消息统计和分析
8. **表情包**: 支持表情包发送 