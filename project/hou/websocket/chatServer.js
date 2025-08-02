const socketIo = require('socket.io');
const { userModel, chatSessionModel, messageModel, onlineUserModel } = require('../db/model');

class ChatServer {
  constructor(server) {
    this.io = socketIo(server, {
      cors: {
        origin: "*", // 在生产环境中应该设置具体的域名
        methods: ["GET", "POST"]
      }
    });
    
    this.onlineUsers = new Map(); // socketId -> userInfo
    this.userSockets = new Map(); // userId -> socketId
    
    this.init();
  }
  
  init() {
    this.io.on('connection', (socket) => {
      console.log('用户连接:', socket.id);
      
      // 用户加入
      socket.on('user:join', async (userData) => {
        await this.handleUserJoin(socket, userData);
      });
      
      // 发送消息
      socket.on('message:send', async (messageData) => {
        await this.handleMessageSend(socket, messageData);
      });
      
      // 获取在线用户
      socket.on('users:online', async (callback) => {
        await this.handleGetOnlineUsers(socket, callback);
      });
      
      // 获取聊天历史
      socket.on('chat:history', async (data) => {
        await this.handleGetChatHistory(socket, data);
      });
      
      // 用户状态更新
      socket.on('user:status:update', async (status) => {
        await this.handleUserStatusUpdate(socket, status);
      });
      
      // 标记消息已读
      socket.on('message:read', async (data) => {
        await this.handleMessageRead(socket, data);
      });
      
      // 获取未读消息数量
      socket.on('unread:count', async (userId) => {
        await this.handleGetUnreadCount(socket, userId);
      });
      
      // 用户正在输入
      socket.on('typing:start', (data) => {
        this.handleTypingStart(socket, data);
      });
      
      socket.on('typing:stop', (data) => {
        this.handleTypingStop(socket, data);
      });
      
      // 断开连接
      socket.on('disconnect', async () => {
        await this.handleUserDisconnect(socket);
      });
      
      // 错误处理
      socket.on('error', (error) => {
        console.error('Socket错误:', error);
      });
    });
  }
  
  // 处理用户加入
  async handleUserJoin(socket, userData) {
    try {
      console.log('用户加入:', userData);
      
      // 验证用户是否存在
      const user = await userModel.findById(userData.id);
      if (!user) {
        socket.emit('error', { message: '用户不存在' });
        return;
      }
      
      // 更新用户状态为在线
      await userModel.findByIdAndUpdate(userData.id, {
        status: 'online',
        lastSeen: new Date()
      });
      
      // 存储用户信息到内存
      this.onlineUsers.set(socket.id, {
        ...userData,
        socketId: socket.id,
        lastSeen: new Date().toISOString(),
        status: 'online'
      });
      
      this.userSockets.set(userData.id, socket.id);
      
      // 更新或创建在线用户记录
      await onlineUserModel.findOneAndUpdate(
        { userId: userData.id },
        {
          userId: userData.id,
          socketId: socket.id,
          status: 'online',
          lastSeen: new Date(),
          userAgent: socket.handshake.headers['user-agent'] || '',
          ipAddress: socket.handshake.address
        },
        { upsert: true, new: true }
      );
      
      // 广播用户状态
      this.io.emit('user:status', {
        userId: userData.id,
        status: 'online',
        lastSeen: new Date().toISOString()
      });
      
      // 发送在线用户列表
      const onlineUsers = await this.getOnlineUsersList();
      socket.emit('users:online', onlineUsers);
      
      // 发送用户自己的信息
      socket.emit('user:joined', {
        success: true,
        user: {
          id: user._id,
          username: user.username,
          realName: user.realName,
          avatar: user.avatar,
          role: user.role,
          status: 'online'
        }
      });
      
    } catch (error) {
      console.error('用户加入失败:', error);
      socket.emit('error', { message: '用户加入失败', error: error.message });
    }
  }
  
  // 处理消息发送
  async handleMessageSend(socket, messageData) {
    try {
      console.log('收到消息:', messageData);
      
      const { sessionId, senderId, receiverId, content, messageType = 'text', fileUrl = '', fileName = '', fileSize = 0 } = messageData;
      
      // 创建新消息
      const message = new messageModel({
        sessionId,
        sender: senderId,
        receiver: receiverId,
        content,
        messageType,
        fileUrl,
        fileName,
        fileSize
      });
      
      await message.save();
      
      // 更新会话的最后消息
      await chatSessionModel.findByIdAndUpdate(sessionId, {
        lastMessage: message._id,
        lastMessageTime: new Date()
      });
      
      // 填充发送者和接收者信息
      await message.populate('sender', 'username realName avatar role');
      await message.populate('receiver', 'username realName avatar role');
      
      // 发送给接收者
      const receiverSocketId = this.userSockets.get(receiverId);
      if (receiverSocketId) {
        this.io.to(receiverSocketId).emit('message:receive', {
          success: true,
          message: message
        });
        
        // 发送消息状态更新
        setTimeout(() => {
          socket.emit('message:status', {
            messageId: message._id,
            status: 'delivered'
          });
        }, 1000);
      }
      
      // 发送给发送者（确认消息已发送）
      socket.emit('message:sent', {
        success: true,
        message: message
      });
      
      // 广播消息到会话中的所有参与者
      const session = await chatSessionModel.findById(sessionId).populate('participants');
      if (session) {
        session.participants.forEach(participant => {
          if (participant._id.toString() !== senderId) {
            const participantSocketId = this.userSockets.get(participant._id.toString());
            if (participantSocketId) {
              this.io.to(participantSocketId).emit('message:receive', {
                success: true,
                message: message
              });
            }
          }
        });
      }
      
    } catch (error) {
      console.error('发送消息失败:', error);
      socket.emit('error', { message: '发送消息失败', error: error.message });
    }
  }
  
  // 处理获取在线用户
  async handleGetOnlineUsers(socket, callback) {
    try {
      const users = await this.getOnlineUsersList();
      if (typeof callback === 'function') {
        callback(users);
      } else {
        socket.emit('users:online', users);
      }
    } catch (error) {
      console.error('获取在线用户失败:', error);
      socket.emit('error', { message: '获取在线用户失败', error: error.message });
    }
  }
  
  // 处理获取聊天历史
  async handleGetChatHistory(socket, data) {
    try {
      const { sessionId, page = 1, limit = 50 } = data;
      
      const messages = await messageModel.find({ sessionId })
        .populate('sender', 'username realName avatar role')
        .populate('receiver', 'username realName avatar role')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);
      
      const total = await messageModel.countDocuments({ sessionId });
      
      socket.emit('chat:history', {
        success: true,
        data: messages.reverse(), // 返回时按时间正序
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / limit),
          totalCount: total
        }
      });
      
    } catch (error) {
      console.error('获取聊天历史失败:', error);
      socket.emit('error', { message: '获取聊天历史失败', error: error.message });
    }
  }
  
  // 处理用户状态更新
  async handleUserStatusUpdate(socket, status) {
    try {
      const user = this.onlineUsers.get(socket.id);
      if (user) {
        user.status = status;
        user.lastSeen = new Date().toISOString();
        
        // 更新数据库中的用户状态
        await userModel.findByIdAndUpdate(user.id, {
          status: status,
          lastSeen: new Date()
        });
        
        // 更新在线用户记录
        await onlineUserModel.findOneAndUpdate(
          { userId: user.id },
          { status: status, lastSeen: new Date() }
        );
        
        // 广播用户状态
        this.io.emit('user:status', {
          userId: user.id,
          status: status,
          lastSeen: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('更新用户状态失败:', error);
      socket.emit('error', { message: '更新用户状态失败', error: error.message });
    }
  }
  
  // 处理消息已读
  async handleMessageRead(socket, data) {
    try {
      const { messageId, userId } = data;
      
      const message = await messageModel.findById(messageId);
      if (!message) {
        socket.emit('error', { message: '消息不存在' });
        return;
      }
      
      // 检查是否已经标记为已读
      const alreadyRead = message.readBy.find(read => read.user.toString() === userId);
      if (!alreadyRead) {
        message.readBy.push({
          user: userId,
          readAt: new Date()
        });
        message.status = 'read';
        await message.save();
        
        // 通知发送者消息已读
        const senderSocketId = this.userSockets.get(message.sender.toString());
        if (senderSocketId) {
          this.io.to(senderSocketId).emit('message:read', {
            messageId: messageId,
            readBy: userId,
            readAt: new Date()
          });
        }
      }
      
      socket.emit('message:read:success', {
        success: true,
        messageId: messageId
      });
      
    } catch (error) {
      console.error('标记消息已读失败:', error);
      socket.emit('error', { message: '标记消息已读失败', error: error.message });
    }
  }
  
  // 处理获取未读消息数量
  async handleGetUnreadCount(socket, userId) {
    try {
      // 获取用户参与的所有会话
      const sessions = await chatSessionModel.find({
        participants: userId
      });
      
      const sessionIds = sessions.map(session => session._id);
      
      // 统计未读消息
      const unreadCount = await messageModel.countDocuments({
        sessionId: { $in: sessionIds },
        receiver: userId,
        'readBy.user': { $ne: userId }
      });
      
      socket.emit('unread:count', {
        success: true,
        data: { unreadCount }
      });
      
    } catch (error) {
      console.error('获取未读消息数量失败:', error);
      socket.emit('error', { message: '获取未读消息数量失败', error: error.message });
    }
  }
  
  // 处理用户正在输入
  handleTypingStart(socket, data) {
    const { sessionId, userId, receiverId } = data;
    const receiverSocketId = this.userSockets.get(receiverId);
    
    if (receiverSocketId) {
      this.io.to(receiverSocketId).emit('typing:start', {
        sessionId,
        userId,
        isTyping: true
      });
    }
  }
  
  handleTypingStop(socket, data) {
    const { sessionId, userId, receiverId } = data;
    const receiverSocketId = this.userSockets.get(receiverId);
    
    if (receiverSocketId) {
      this.io.to(receiverSocketId).emit('typing:stop', {
        sessionId,
        userId,
        isTyping: false
      });
    }
  }
  
  // 处理用户断开连接
  async handleUserDisconnect(socket) {
    try {
      console.log('用户断开连接:', socket.id);
      
      const user = this.onlineUsers.get(socket.id);
      if (user) {
        // 更新用户状态为离线
        await userModel.findByIdAndUpdate(user.id, {
          status: 'offline',
          lastSeen: new Date()
        });
        
        // 更新在线用户记录
        await onlineUserModel.findOneAndUpdate(
          { userId: user.id },
          { status: 'offline', lastSeen: new Date() }
        );
        
        // 广播用户离线状态
        this.io.emit('user:status', {
          userId: user.id,
          status: 'offline',
          lastSeen: new Date().toISOString()
        });
        
        // 从内存中移除
        this.onlineUsers.delete(socket.id);
        this.userSockets.delete(user.id);
      }
      
    } catch (error) {
      console.error('处理用户断开连接失败:', error);
    }
  }
  
  // 获取在线用户列表
  async getOnlineUsersList() {
    try {
      const onlineUsers = await onlineUserModel.find({ status: 'online' })
        .populate('userId', 'username realName avatar role')
        .sort({ lastSeen: -1 });
      
      return onlineUsers.map(onlineUser => ({
        id: onlineUser.userId._id,
        username: onlineUser.userId.username,
        realName: onlineUser.userId.realName,
        avatar: onlineUser.userId.avatar,
        role: onlineUser.userId.role,
        status: onlineUser.status,
        lastSeen: onlineUser.lastSeen,
        socketId: onlineUser.socketId
      }));
    } catch (error) {
      console.error('获取在线用户列表失败:', error);
      return [];
    }
  }
  
  // 获取IO实例
  getIO() {
    return this.io;
  }
  
  // 获取在线用户数量
  getOnlineUserCount() {
    return this.onlineUsers.size;
  }
  
  // 广播消息给所有用户
  broadcastToAll(event, data) {
    this.io.emit(event, data);
  }
  
  // 发送消息给特定用户
  sendToUser(userId, event, data) {
    const socketId = this.userSockets.get(userId);
    if (socketId) {
      this.io.to(socketId).emit(event, data);
    }
  }
  
  // 发送消息给多个用户
  sendToUsers(userIds, event, data) {
    userIds.forEach(userId => {
      this.sendToUser(userId, event, data);
    });
  }
}

module.exports = ChatServer; 