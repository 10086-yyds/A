# WebSocket 在线聊天功能使用指南

## 功能概述

基于 WebSocket 的医生-患者实时聊天系统，支持：
- **精准匹配**：通过医生ID和用户ID建立专属聊天通道
- **实时通信**：WebSocket长连接，消息实时推送
- **自动重连**：网络异常时自动重连机制
- **状态管理**：连接状态实时显示和处理
- **消息重试**：失败消息支持点击重试

## 核心架构

### 前端架构
```
LineLiao组件 → WebSocketManager → WebSocket连接 → 后端服务器
```

### 关键文件
- `src/utils/websocketManager.ts` - WebSocket连接管理器
- `src/pages/LineLiao/LineLiao.tsx` - 聊天界面组件
- `project/hou/websocket-server.js` - 测试WebSocket服务器

## 启动步骤

### 1. 启动WebSocket服务器

```bash
# 进入后端目录
cd project/hou

# 安装依赖（首次需要）
npm install

# 启动WebSocket服务器
npm run websocket
```

服务器将在 `ws://localhost:8080/chat` 启动

### 2. 启动移动端应用

```bash
# 进入移动端目录
cd project/AwesomeProject

# 启动React Native应用
npm start
# 或
yarn start
```

### 3. 测试聊天功能

1. 在首页点击**在线问诊**按钮（医生卡片中的蓝色按钮）
2. 系统将自动：
   - 生成用户ID并存储到AsyncStorage
   - 使用医生信息建立WebSocket连接
   - 显示连接状态和欢迎消息

## 连接参数说明

WebSocket连接URL格式：
```
ws://[服务器IP]:8080/chat?userId=[用户ID]&doctorId=[医生ID]&userName=[用户名称]
```

### 参数详解
- `userId`: 自动生成的唯一用户标识符
- `doctorId`: 来自医生数据的ID（当前使用医生姓名）
- `userName`: 来自AsyncStorage的用户名称

## 消息格式

### 发送消息格式
```typescript
{
  type: 'message',
  data: {
    messageId: string,      // 消息唯一ID
    userId: string,         // 发送方用户ID
    doctorId: string,       // 目标医生ID
    userName: string,       // 发送方用户名
    message: string,        // 消息内容
    chatId: string,         // 聊天室ID
    timestamp: string       // 时间戳
  }
}
```

### 接收消息格式
```typescript
{
  type: 'message',
  data: {
    messageId: string,      // 消息ID
    userId: string,         // 发送方ID（医生系统ID）
    doctorId: string,       // 医生ID
    userName: string,       // 发送方名称
    doctorName: string,     // 医生名称
    message: string,        // 消息内容
    chatId: string,         // 聊天室ID
    timestamp: string       // 时间戳
  }
}
```

## 连接状态说明

| 状态 | 说明 | 界面提示 |
|------|------|----------|
| connecting | 正在建立连接 | "正在连接到医生..." |
| connected | 连接成功 | "医生在线" |
| reconnecting | 自动重连中 | "网络重连中，请稍候..." |
| disconnected | 连接断开 | "连接已断开，请检查网络" |
| error | 连接失败 | "连接失败，请重试" |

## 错误处理机制

### 自动重连
- 最大重连次数：10次
- 重连间隔：5秒
- 心跳检测：30秒间隔

### 消息重试
- 失败消息显示"发送失败 - 点击重试"
- 点击可重新发送
- 自动更新消息状态

### 网络异常处理
- 连接断开时显示状态提示
- 错误状态时提供重试按钮
- 发送按钮根据连接状态自动禁用

## 开发调试

### 查看日志
```bash
# 移动端日志（React Native Debugger或Metro）
console.log('WebSocket连接状态:', status);

# 服务器日志
npm run websocket
# 查看控制台输出的连接和消息日志
```

### 测试连接
```javascript
// 在浏览器控制台测试WebSocket连接
const ws = new WebSocket('ws://192.168.182.146:8080/chat?userId=test123&doctorId=doctor456&userName=测试用户');

ws.onopen = () => console.log('连接成功');
ws.onmessage = (event) => console.log('收到消息:', JSON.parse(event.data));
ws.onerror = (error) => console.error('连接错误:', error);

// 发送测试消息
ws.send(JSON.stringify({
  type: 'message',
  data: {
    messageId: 'test_' + Date.now(),
    userId: 'test123',
    doctorId: 'doctor456',
    userName: '测试用户',
    message: '这是一条测试消息',
    chatId: 'chat_test123_doctor456',
    timestamp: new Date().toISOString()
  }
}));
```

## 生产环境配置

### 服务器配置
1. 修改 `websocketManager.ts` 中的服务器地址
2. 配置SSL证书（wss://）
3. 设置负载均衡和集群支持

### 安全考虑
- 添加用户身份验证
- 实现医生资质验证
- 消息内容加密
- 防止跨域攻击

## 常见问题

### Q: 连接失败怎么办？
A: 
1. 确认WebSocket服务器已启动
2. 检查IP地址是否正确
3. 确认防火墙设置
4. 查看控制台错误日志

### Q: 消息发送失败？
A: 
1. 检查网络连接状态
2. 点击失败消息重试
3. 重启应用重新连接

### Q: 收不到医生回复？
A: 
1. 确认WebSocket服务器正常运行
2. 检查聊天室ID是否匹配
3. 查看服务器日志确认消息处理

## 扩展功能

当前实现是基础版本，可扩展：
- 消息持久化存储
- 多媒体消息支持（图片、语音）
- 群聊功能
- 消息加密
- 离线消息推送
- 医生状态管理（在线/离线/忙碌）

---

**注意**：当前的WebSocket服务器是用于测试的简化版本。生产环境需要考虑更多的安全性、可扩展性和稳定性因素。 