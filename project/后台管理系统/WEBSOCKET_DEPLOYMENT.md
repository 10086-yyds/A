# WebSocket 实时聊天部署指南

## 🚀 端口配置建议

### 开发环境端口分配

```
前端开发服务器 (React Native): 3000
WebSocket服务器: 3001
后端API服务器: 8080
后台管理系统: 5173
```

### 生产环境端口分配

```
前端应用: 80/443 (HTTP/HTTPS)
WebSocket服务器: 3001
后端API服务器: 8080
后台管理系统: 80/443 (子域名)
```

## 📋 部署步骤

### 1. WebSocket服务器部署

#### 安装依赖

```bash
npm install express socket.io cors
```

#### 启动服务器

```bash
# 开发环境
node websocket-server.js

# 生产环境 (使用PM2)
pm2 start websocket-server.js --name "websocket-server"
```

#### 环境变量配置

```bash
# .env
PORT=3001
NODE_ENV=production
CORS_ORIGIN=https://your-domain.com
```

### 2. 前端应用配置 (React Native)

#### 安装Socket.IO客户端

```bash
npm install socket.io-client
```

#### 连接配置

```javascript
// 开发环境
const SOCKET_URL = 'http://localhost:3001'

// 生产环境
const SOCKET_URL = 'https://your-domain.com:3001'
```

### 3. 后台管理系统配置

#### 更新WebSocket配置

```typescript
// src/config/websocket.ts
export const WebSocketConfig = {
  development: {
    serverUrl: 'http://localhost:3001',
  },
  production: {
    serverUrl: 'https://your-domain.com:3001',
  },
}
```

## 🔧 Nginx 配置示例

### WebSocket代理配置

```nginx
# /etc/nginx/sites-available/websocket
server {
    listen 80;
    server_name your-domain.com;

    # WebSocket代理
    location /socket.io/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # 前端应用
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 🔒 安全配置

### 1. CORS配置

```javascript
// WebSocket服务器
const io = socketIo(server, {
  cors: {
    origin: ['https://your-domain.com', 'http://localhost:3000'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
```

### 2. 身份验证

```javascript
// 添加JWT验证中间件
io.use((socket, next) => {
  const token = socket.handshake.auth.token
  if (verifyToken(token)) {
    next()
  } else {
    next(new Error('Authentication error'))
  }
})
```

### 3. 速率限制

```javascript
const rateLimit = require('express-rate-limit')

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 限制每个IP 15分钟内最多100个请求
})

app.use('/api/', limiter)
```

## 📊 监控和日志

### 1. 健康检查

```bash
# 检查WebSocket服务器状态
curl http://localhost:3001/api/health

# 检查在线用户
curl http://localhost:3001/api/users/online
```

### 2. 日志配置

```javascript
const winston = require('winston')

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
})
```

## 🚨 故障排除

### 常见问题

1. **连接失败**

   - 检查端口是否被占用
   - 确认防火墙设置
   - 验证CORS配置

2. **消息发送失败**

   - 检查用户是否在线
   - 验证消息格式
   - 查看服务器日志

3. **性能问题**
   - 监控内存使用
   - 检查连接数限制
   - 优化消息存储

### 调试命令

```bash
# 检查端口占用
netstat -tulpn | grep :3001

# 查看WebSocket连接
ss -tulpn | grep :3001

# 监控日志
tail -f /var/log/websocket.log
```

## 📈 性能优化

### 1. 连接池管理

```javascript
// 限制最大连接数
const MAX_CONNECTIONS = 1000
io.sockets.setMaxListeners(MAX_CONNECTIONS)
```

### 2. 消息压缩

```javascript
// 启用消息压缩
const io = socketIo(server, {
  transports: ['websocket'],
  allowEIO3: true,
  cors: {
    origin: '*',
  },
})
```

### 3. 数据库集成

```javascript
// 使用Redis存储聊天记录
const redis = require('redis')
const client = redis.createClient()

// 存储消息
client.setex(`chat:${chatId}`, 86400, JSON.stringify(message))
```

## 🔄 更新和维护

### 1. 热重载

```bash
# 使用nodemon开发
npm install -g nodemon
nodemon websocket-server.js
```

### 2. 版本管理

```bash
# 使用PM2管理进程
pm2 start websocket-server.js --name "websocket-v1"
pm2 reload websocket-v1
```

### 3. 备份策略

```bash
# 备份聊天记录
mongodump --db chat_db --collection messages --out ./backup
```

---

## 📞 技术支持

如有问题，请检查：

1. 服务器日志
2. 网络连接
3. 配置文件
4. 依赖版本

更多信息请参考：[Socket.IO官方文档](https://socket.io/docs/)
