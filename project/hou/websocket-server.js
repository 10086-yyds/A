// {{ AURA-X: Add - WebSocket服务器实现，支持医生-用户精准匹配通信. Approval: 为移动端WebSocket功能提供测试服务器. }}

const WebSocket = require('ws');
const url = require('url');

// 创建WebSocket服务器
const wss = new WebSocket.Server({ 
  port: 8080,
  path: '/chat'
});

// 存储连接的映射表
const connections = new Map(); // userId -> WebSocket连接
const doctorConnections = new Map(); // doctorId -> WebSocket连接
const chatRooms = new Map(); // chatId -> { userId, doctorId, userWs, doctorWs }

console.log('WebSocket服务器启动，监听端口 8080');
console.log('WebSocket路径: ws://localhost:8080/chat');

wss.on('connection', (ws, request) => {
  // 解析连接参数
  const query = url.parse(request.url, true).query;
  const userId = query.userId;
  const doctorId = query.doctorId;
  const userName = query.userName || '用户';
  
  console.log(`新连接: userId=${userId}, doctorId=${doctorId}, userName=${userName}`);
  
  if (!userId || !doctorId) {
    ws.close(1000, '缺少必要参数');
    return;
  }

  const chatId = `chat_${userId}_${doctorId}`;
  
  // 存储连接信息
  ws.userId = userId;
  ws.doctorId = doctorId;
  ws.userName = userName;
  ws.chatId = chatId;
  ws.isAlive = true;
  
  // 将连接添加到映射表
  connections.set(userId, ws);
  
  // 创建或更新聊天室
  let chatRoom = chatRooms.get(chatId);
  if (!chatRoom) {
    chatRoom = {
      userId,
      doctorId,
      userWs: null,
      doctorWs: null,
      createdAt: new Date()
    };
    chatRooms.set(chatId, chatRoom);
  }
  
  // 根据连接类型设置聊天室
  chatRoom.userWs = ws;
  
  // 发送连接成功消息
  sendMessage(ws, {
    type: 'connect',
    data: {
      chatId,
      message: '连接成功',
      timestamp: new Date().toISOString()
    }
  });
  
  // 如果医生在线，通知用户
  if (chatRoom.doctorWs && chatRoom.doctorWs.readyState === WebSocket.OPEN) {
    sendMessage(ws, {
      type: 'doctor_online',
      data: {
        doctorId,
        message: '医生在线',
        timestamp: new Date().toISOString()
      }
    });
  }

  // 发送欢迎消息（模拟医生发送）
  setTimeout(() => {
    if (ws.readyState === WebSocket.OPEN) {
      sendMessage(ws, {
        type: 'message',
        data: {
          messageId: `welcome_${Date.now()}`,
          userId: 'system',
          doctorId: doctorId,
          userName: '系统',
          doctorName: `医生${doctorId}`,
          message: `您好${userName}！我是您的专属医生，请详细描述您的症状，我会为您提供专业的医疗建议。`,
          chatId,
          timestamp: new Date().toISOString()
        }
      });
    }
  }, 1000);

  // 心跳检测
  ws.on('pong', () => {
    ws.isAlive = true;
  });

  // 处理消息
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      console.log('收到消息:', message);
      
      handleMessage(ws, message);
    } catch (error) {
      console.error('解析消息失败:', error);
      sendError(ws, '消息格式错误');
    }
  });

  // 处理连接关闭
  ws.on('close', () => {
    console.log(`连接关闭: userId=${userId}, doctorId=${doctorId}`);
    
    // 从映射表中移除连接
    connections.delete(userId);
    
    // 更新聊天室状态
    const chatRoom = chatRooms.get(chatId);
    if (chatRoom) {
      chatRoom.userWs = null;
      
      // 如果聊天室没有活跃连接，可以选择删除
      if (!chatRoom.userWs && !chatRoom.doctorWs) {
        chatRooms.delete(chatId);
        console.log `聊天室 ${chatId} 已删除`;
      }
    }
  });

  // 处理连接错误
  ws.on('error', (error) => {
    console.error('WebSocket错误:', error);
  });
});

// 处理消息的核心函数
function handleMessage(ws, message) {
  const { type, data } = message;
  
  switch (type) {
    case 'message':
      handleChatMessage(ws, data);
      break;
      
    case 'heartbeat':
      // 心跳响应
      sendMessage(ws, {
        type: 'heartbeat',
        data: {
          timestamp: new Date().toISOString()
        }
      });
      break;
      
    default:
      console.log('未处理的消息类型:', type);
  }
}

// 处理聊天消息
function handleChatMessage(ws, data) {
  const { userId, doctorId, userName, message, chatId, messageId } = data;
  
  // 确认消息接收
  sendMessage(ws, {
    type: 'message_ack',
    data: {
      messageId,
      status: 'received',
      timestamp: new Date().toISOString()
    }
  });
  
  // 模拟医生回复（实际项目中应该转发给真实的医生连接）
  setTimeout(() => {
    simulateDoctorReply(ws, {
      userId,
      doctorId,
      userName,
      userMessage: message,
      chatId
    });
  }, 1000 + Math.random() * 3000);
}

// 模拟医生回复
function simulateDoctorReply(userWs, { userId, doctorId, userName, userMessage, chatId }) {
  const replies = [
    '根据您描述的症状，我建议您注意休息，多喝温水。',
    '这种情况比较常见，建议您先观察几天，如有加重请及时就医。',
    '从您的描述来看，可能是轻微的炎症，建议配合药物治疗。',
    '您的症状需要进一步检查，建议到医院做相关检查。',
    '这种情况下，建议您调整作息时间，保持良好的生活习惯。',
    '根据症状分析，可能需要配合一些药物治疗，我为您开具处方。',
    '请问这种症状持续多长时间了？有没有其他伴随症状？',
    '建议您到医院做进一步检查，我会为您安排相关的检查项目。'
  ];
  
  const randomReply = replies[Math.floor(Math.random() * replies.length)];
  
  if (userWs && userWs.readyState === WebSocket.OPEN) {
    sendMessage(userWs, {
      type: 'message',
      data: {
        messageId: `doctor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: 'doctor_system',
        doctorId: doctorId,
        userName: 'system',
        doctorName: `医生${doctorId}`,
        message: randomReply,
        chatId,
        timestamp: new Date().toISOString()
      }
    });
  }
}

// 发送消息的辅助函数
function sendMessage(ws, message) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message));
  }
}

// 发送错误消息
function sendError(ws, errorMessage) {
  sendMessage(ws, {
    type: 'error',
    data: {
      error: errorMessage,
      timestamp: new Date().toISOString()
    }
  });
}

// 心跳检测，定期清理失效连接
const heartbeatInterval = setInterval(() => {
  wss.clients.forEach((ws) => {
    if (!ws.isAlive) {
      console.log('清理失效连接:', ws.userId);
      return ws.terminate();
    }
    
    ws.isAlive = false;
    ws.ping();
  });
}, 30000);

// 服务器关闭时清理
wss.on('close', () => {
  clearInterval(heartbeatInterval);
});

// 打印统计信息
setInterval(() => {
  console.log(`
=== WebSocket服务器状态 ===
活跃连接数: ${wss.clients.size}
聊天室数量: ${chatRooms.size}
时间: ${new Date().toLocaleString()}
========================
  `);
}, 60000); // 每分钟打印一次

console.log('WebSocket聊天服务器已启动！');
console.log('测试URL示例: ws://localhost:8080/chat?userId=user123&doctorId=doctor456&userName=测试用户'); 