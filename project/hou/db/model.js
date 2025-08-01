let mongoose = require("./database");

let userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  realName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  avatar: {
    type: String,
    default: ""
  },
  role: {
    type: String,
    enum: ['admin', 'user', 'doctor', 'nurse'],
    default: 'user'
  },
  status: {
    type: String,
    enum: ['online', 'offline', 'away'],
    default: 'offline'
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

let userModel = mongoose.model("user", userSchema, "user");

// 聊天会话模型
let chatSessionSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  }],
  sessionType: {
    type: String,
    enum: ['private', 'group'],
    default: 'private'
  },
  sessionName: {
    type: String,
    default: ""
  },
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'message'
  },
  lastMessageTime: {
    type: Date,
    default: Date.now
  },
  unreadCount: {
    type: Map,
    of: Number,
    default: new Map()
  }
}, {
  timestamps: true
});

let chatSessionModel = mongoose.model("chatSession", chatSessionSchema, "chatSession");

// 消息模型
let messageSchema = new mongoose.Schema({
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'chatSession',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'file', 'voice'],
    default: 'text'
  },
  fileUrl: {
    type: String,
    default: ""
  },
  fileName: {
    type: String,
    default: ""
  },
  fileSize: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read'],
    default: 'sent'
  },
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

let messageModel = mongoose.model("message", messageSchema, "message");

// 在线用户模型（用于WebSocket连接管理）
let onlineUserSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  socketId: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['online', 'away', 'offline'],
    default: 'online'
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  userAgent: {
    type: String,
    default: ""
  },
  ipAddress: {
    type: String,
    default: ""
  }
}, {
  timestamps: true
});

let onlineUserModel = mongoose.model("onlineUser", onlineUserSchema, "onlineUser");

let drugSchema = new mongoose.Schema({});

let drugModel = mongoose.model("drug", drugSchema, "drug");

let roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  }, //角色名称
  permission: {
    type: Array,
    required: true,
  }, //权限
});

let roleModel = mongoose.model("role", roleSchema, "role");

let positionSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  realName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  roleID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "role",
  },
});

let positionModel = mongoose.model("position", positionSchema, "position");

let orderSchema = new mongoose.Schema({});

let orderModel = mongoose.model("order", orderSchema, "order");

module.exports = {
  userModel,
  drugModel,
  roleModel,
  positionModel,
  orderModel,
  chatSessionModel,
  messageModel,
  onlineUserModel,
};
