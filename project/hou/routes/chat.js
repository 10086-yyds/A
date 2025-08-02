const express = require('express');
const router = express.Router();
const { userModel, chatSessionModel, messageModel, onlineUserModel } = require('../db/model');

// 获取所有用户列表
router.get('/users', async (req, res) => {
  try {
    const users = await userModel.find({ isActive: true })
      .select('username realName email phone avatar role status lastSeen')
      .sort({ lastSeen: -1 });
    
    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('获取用户列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取用户列表失败',
      error: error.message
    });
  }
});

// 获取在线用户列表
router.get('/users/online', async (req, res) => {
  try {
    const onlineUsers = await onlineUserModel.find({ status: 'online' })
      .populate('userId', 'username realName avatar role')
      .sort({ lastSeen: -1 });
    
    res.json({
      success: true,
      data: onlineUsers
    });
  } catch (error) {
    console.error('获取在线用户失败:', error);
    res.status(500).json({
      success: false,
      message: '获取在线用户失败',
      error: error.message
    });
  }
});

// 获取用户聊天会话列表
router.get('/sessions/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    const sessions = await chatSessionModel.find({
      participants: userId
    })
    .populate('participants', 'username realName avatar role')
    .populate('lastMessage')
    .sort({ lastMessageTime: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);
    
    const total = await chatSessionModel.countDocuments({
      participants: userId
    });
    
    res.json({
      success: true,
      data: sessions,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        totalCount: total
      }
    });
  } catch (error) {
    console.error('获取聊天会话失败:', error);
    res.status(500).json({
      success: false,
      message: '获取聊天会话失败',
      error: error.message
    });
  }
});

// 创建或获取私聊会话
router.post('/sessions/private', async (req, res) => {
  try {
    const { userId1, userId2 } = req.body;
    
    if (!userId1 || !userId2) {
      return res.status(400).json({
        success: false,
        message: '需要提供两个用户ID'
      });
    }
    
    // 查找是否已存在会话
    let session = await chatSessionModel.findOne({
      participants: { $all: [userId1, userId2] },
      sessionType: 'private'
    });
    
    if (!session) {
      // 创建新会话
      session = new chatSessionModel({
        participants: [userId1, userId2],
        sessionType: 'private'
      });
      await session.save();
    }
    
    // 填充用户信息
    await session.populate('participants', 'username realName avatar role');
    
    res.json({
      success: true,
      data: session
    });
  } catch (error) {
    console.error('创建私聊会话失败:', error);
    res.status(500).json({
      success: false,
      message: '创建私聊会话失败',
      error: error.message
    });
  }
});

// 获取聊天消息历史
router.get('/messages/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    
    const messages = await messageModel.find({ sessionId })
      .populate('sender', 'username realName avatar role')
      .populate('receiver', 'username realName avatar role')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await messageModel.countDocuments({ sessionId });
    
    res.json({
      success: true,
      data: messages.reverse(), // 返回时按时间正序
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        totalCount: total
      }
    });
  } catch (error) {
    console.error('获取消息历史失败:', error);
    res.status(500).json({
      success: false,
      message: '获取消息历史失败',
      error: error.message
    });
  }
});

// 发送消息
router.post('/messages', async (req, res) => {
  try {
    const { sessionId, senderId, receiverId, content, messageType = 'text', fileUrl = '', fileName = '', fileSize = 0 } = req.body;
    
    if (!sessionId || !senderId || !receiverId || !content) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数'
      });
    }
    
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
    
    res.json({
      success: true,
      data: message
    });
  } catch (error) {
    console.error('发送消息失败:', error);
    res.status(500).json({
      success: false,
      message: '发送消息失败',
      error: error.message
    });
  }
});

// 标记消息为已读
router.put('/messages/:messageId/read', async (req, res) => {
  try {
    const { messageId } = req.params;
    const { userId } = req.body;
    
    const message = await messageModel.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: '消息不存在'
      });
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
    }
    
    res.json({
      success: true,
      data: message
    });
  } catch (error) {
    console.error('标记消息已读失败:', error);
    res.status(500).json({
      success: false,
      message: '标记消息已读失败',
      error: error.message
    });
  }
});

// 获取未读消息数量
router.get('/messages/unread/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
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
    
    res.json({
      success: true,
      data: {
        unreadCount
      }
    });
  } catch (error) {
    console.error('获取未读消息数量失败:', error);
    res.status(500).json({
      success: false,
      message: '获取未读消息数量失败',
      error: error.message
    });
  }
});

// 删除消息
router.delete('/messages/:messageId', async (req, res) => {
  try {
    const { messageId } = req.params;
    const { userId } = req.body;
    
    const message = await messageModel.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: '消息不存在'
      });
    }
    
    // 只有发送者可以删除消息
    if (message.sender.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: '只有发送者可以删除消息'
      });
    }
    
    await messageModel.findByIdAndDelete(messageId);
    
    res.json({
      success: true,
      message: '消息删除成功'
    });
  } catch (error) {
    console.error('删除消息失败:', error);
    res.status(500).json({
      success: false,
      message: '删除消息失败',
      error: error.message
    });
  }
});

// 搜索消息
router.get('/messages/search', async (req, res) => {
  try {
    const { userId, keyword, sessionId } = req.query;
    const { page = 1, limit = 20 } = req.query;
    
    let query = {
      $or: [
        { sender: userId },
        { receiver: userId }
      ]
    };
    
    if (sessionId) {
      query.sessionId = sessionId;
    }
    
    if (keyword) {
      query.content = { $regex: keyword, $options: 'i' };
    }
    
    const messages = await messageModel.find(query)
      .populate('sender', 'username realName avatar role')
      .populate('receiver', 'username realName avatar role')
      .populate('sessionId')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await messageModel.countDocuments(query);
    
    res.json({
      success: true,
      data: messages,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        totalCount: total
      }
    });
  } catch (error) {
    console.error('搜索消息失败:', error);
    res.status(500).json({
      success: false,
      message: '搜索消息失败',
      error: error.message
    });
  }
});

// 获取聊天统计信息
router.get('/stats/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // 获取用户参与的所有会话
    const sessions = await chatSessionModel.find({
      participants: userId
    });
    
    const sessionIds = sessions.map(session => session._id);
    
    // 统计各种数据
    const totalMessages = await messageModel.countDocuments({
      sessionId: { $in: sessionIds }
    });
    
    const sentMessages = await messageModel.countDocuments({
      sender: userId
    });
    
    const receivedMessages = await messageModel.countDocuments({
      receiver: userId
    });
    
    const unreadMessages = await messageModel.countDocuments({
      sessionId: { $in: sessionIds },
      receiver: userId,
      'readBy.user': { $ne: userId }
    });
    
    const onlineUsers = await onlineUserModel.countDocuments({
      status: 'online'
    });
    
    res.json({
      success: true,
      data: {
        totalSessions: sessions.length,
        totalMessages,
        sentMessages,
        receivedMessages,
        unreadMessages,
        onlineUsers
      }
    });
  } catch (error) {
    console.error('获取聊天统计失败:', error);
    res.status(500).json({
      success: false,
      message: '获取聊天统计失败',
      error: error.message
    });
  }
});

module.exports = router; 