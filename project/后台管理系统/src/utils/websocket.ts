import { io, Socket } from 'socket.io-client'
import { ElMessage } from 'element-plus'
import { getWebSocketUrl, getConnectionConfig } from '../config/websocket'

// WebSocket事件类型
export interface WebSocketMessage {
  id: string
  type: 'text' | 'image' | 'file' | 'system'
  content: string
  sender: {
    id: string
    name: string
    type: 'admin' | 'user' // admin: 后台管理员, user: 前端用户
    avatar?: string
  }
  receiver: {
    id: string
    name: string
    type: 'admin' | 'user'
  }
  timestamp: string
  status: 'sending' | 'sent' | 'delivered' | 'read'
}

// 聊天会话接口
export interface ChatSession {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
  status: 'online' | 'offline' | 'away'
  messages: WebSocketMessage[]
}

// WebSocket服务类
class WebSocketService {
  private socket: Socket | null = null
  private isConnected = false
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectInterval = 3000

  // 事件回调
  private messageCallbacks: ((message: WebSocketMessage) => void)[] = []
  private connectionCallbacks: ((connected: boolean) => void)[] = []
  private userStatusCallbacks: ((userId: string, status: 'online' | 'offline' | 'away') => void)[] =
    []

  // 当前用户信息
  private currentUser = {
    id: 'admin_001',
    name: '管理员',
    type: 'admin' as const,
    avatar: '',
  }

  // 连接WebSocket服务器
  connect(serverUrl?: string) {
    try {
      const url = serverUrl || getWebSocketUrl()
      const config = getConnectionConfig()

      this.socket = io(url, {
        ...config,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectInterval,
      })

      this.setupEventListeners()
      console.log('WebSocket连接已建立')
    } catch (error) {
      console.error('WebSocket连接失败:', error)
      ElMessage.error('WebSocket连接失败')
    }
  }

  // 设置事件监听器
  private setupEventListeners() {
    if (!this.socket) return

    // 连接成功
    this.socket.on('connect', () => {
      console.log('WebSocket已连接')
      this.isConnected = true
      this.reconnectAttempts = 0
      this.notifyConnectionChange(true)

      // 发送用户信息
      this.socket?.emit('user:join', this.currentUser)
    })

    // 连接断开
    this.socket.on('disconnect', (reason: string) => {
      console.log('WebSocket连接断开:', reason)
      this.isConnected = false
      this.notifyConnectionChange(false)

      if (reason === 'io server disconnect') {
        // 服务器主动断开，尝试重连
        this.socket?.connect()
      }
    })

    // 重连尝试
    this.socket.on('reconnect_attempt', (attemptNumber: number) => {
      console.log(`WebSocket重连尝试 ${attemptNumber}/${this.maxReconnectAttempts}`)
      this.reconnectAttempts = attemptNumber
    })

    // 重连成功
    this.socket.on('reconnect', (attemptNumber: number) => {
      console.log(`WebSocket重连成功，尝试次数: ${attemptNumber}`)
      this.isConnected = true
      this.reconnectAttempts = 0
      this.notifyConnectionChange(true)

      // 重新发送用户信息
      this.socket?.emit('user:join', this.currentUser)
    })

    // 重连失败
    this.socket.on('reconnect_failed', () => {
      console.log('WebSocket重连失败')
      ElMessage.error('WebSocket重连失败，请刷新页面重试')
    })

    // 接收消息
    this.socket.on('message:receive', (message: WebSocketMessage) => {
      console.log('收到消息:', message)
      this.notifyMessageReceived(message)
    })

    // 用户状态变化
    this.socket.on(
      'user:status',
      (data: { userId: string; status: 'online' | 'offline' | 'away' }) => {
        console.log('用户状态变化:', data)
        this.notifyUserStatusChange(data.userId, data.status)
      }
    )

    // 消息状态更新
    this.socket.on(
      'message:status',
      (data: { messageId: string; status: 'delivered' | 'read' }) => {
        console.log('消息状态更新:', data)
        // 这里可以更新消息状态
      }
    )

    // 错误处理
    this.socket.on('connect_error', (error: Error) => {
      console.error('WebSocket连接错误:', error)
      ElMessage.error('WebSocket连接错误')
    })
  }

  // 发送消息
  sendMessage(
    receiverId: string,
    receiverName: string,
    content: string,
    type: 'text' | 'image' | 'file' = 'text'
  ) {
    if (!this.socket || !this.isConnected) {
      ElMessage.error('WebSocket未连接')
      return null
    }

    const message: WebSocketMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      content,
      sender: this.currentUser,
      receiver: {
        id: receiverId,
        name: receiverName,
        type: 'user',
      },
      timestamp: new Date().toISOString(),
      status: 'sending',
    }

    // 发送消息
    this.socket.emit('message:send', message)

    // 更新消息状态
    setTimeout(() => {
      message.status = 'sent'
    }, 1000)

    return message
  }

  // 获取在线用户列表
  getOnlineUsers(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.isConnected) {
        reject(new Error('WebSocket未连接'))
        return
      }

      this.socket.emit('users:online', (users: any[]) => {
        resolve(users)
      })
    })
  }

  // 断开连接
  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.isConnected = false
    }
  }

  // 检查连接状态
  isSocketConnected(): boolean {
    return this.isConnected && this.socket?.connected === true
  }

  // 添加消息接收回调
  onMessageReceived(callback: (message: WebSocketMessage) => void) {
    this.messageCallbacks.push(callback)
  }

  // 添加连接状态变化回调
  onConnectionChange(callback: (connected: boolean) => void) {
    this.connectionCallbacks.push(callback)
  }

  // 添加用户状态变化回调
  onUserStatusChange(callback: (userId: string, status: 'online' | 'offline' | 'away') => void) {
    this.userStatusCallbacks.push(callback)
  }

  // 移除回调
  removeCallback(callback: Function) {
    this.messageCallbacks = this.messageCallbacks.filter(cb => cb !== callback)
    this.connectionCallbacks = this.connectionCallbacks.filter(cb => cb !== callback)
    this.userStatusCallbacks = this.userStatusCallbacks.filter(cb => cb !== callback)
  }

  // 通知消息接收
  private notifyMessageReceived(message: WebSocketMessage) {
    this.messageCallbacks.forEach(callback => {
      try {
        callback(message)
      } catch (error) {
        console.error('消息回调执行错误:', error)
      }
    })
  }

  // 通知连接状态变化
  private notifyConnectionChange(connected: boolean) {
    this.connectionCallbacks.forEach(callback => {
      try {
        callback(connected)
      } catch (error) {
        console.error('连接状态回调执行错误:', error)
      }
    })
  }

  // 通知用户状态变化
  private notifyUserStatusChange(userId: string, status: 'online' | 'offline' | 'away') {
    this.userStatusCallbacks.forEach(callback => {
      try {
        callback(userId, status)
      } catch (error) {
        console.error('用户状态回调执行错误:', error)
      }
    })
  }

  // 设置当前用户信息
  setCurrentUser(user: { id: string; name: string; avatar?: string }) {
    this.currentUser = {
      ...this.currentUser,
      ...user,
    }
  }

  // 获取当前用户信息
  getCurrentUser() {
    return { ...this.currentUser }
  }
}

// 创建单例实例
const webSocketService = new WebSocketService()

export default webSocketService
export type { WebSocketMessage, ChatSession }
