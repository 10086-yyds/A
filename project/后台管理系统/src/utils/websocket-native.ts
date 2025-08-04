import { ElMessage } from 'element-plus'

// WebSocket消息接口
export interface WebSocketMessage {
  type: string
  data: any
}

// 聊天消息接口
export interface ChatMessage {
  messageId: string
  userId: string
  doctorId: string
  userName: string
  doctorName: string
  message: string
  chatId: string
  timestamp: string
}

// 原生WebSocket服务类
class NativeWebSocketService {
  private ws: WebSocket | null = null
  private isConnected = false
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectInterval = 3000
  private reconnectTimer: NodeJS.Timeout | null = null

  // 事件回调
  private messageCallbacks: ((message: any) => void)[] = []
  private connectionCallbacks: ((connected: boolean) => void)[] = []
  private errorCallbacks: ((error: string) => void)[] = []

  // 连接参数
  private connectionParams = {
    userId: 'admin_001',
    doctorId: 'doctor_001',
    userName: '管理员'
  }

  // 连接WebSocket服务器
  connect(params?: { userId?: string; doctorId?: string; userName?: string }) {
    try {
      // 更新连接参数
      if (params) {
        this.connectionParams = { ...this.connectionParams, ...params }
      }

      const url = `ws://localhost:8082/chat?userId=${this.connectionParams.userId}&doctorId=${this.connectionParams.doctorId}&userName=${encodeURIComponent(this.connectionParams.userName)}`

      console.log('正在连接WebSocket:', url)

      this.ws = new WebSocket(url)
      this.setupEventListeners()
    } catch (error) {
      console.error('WebSocket连接失败:', error)
      ElMessage.error('WebSocket连接失败')
      this.handleError('连接失败')
    }
  }

  // 设置事件监听器
  private setupEventListeners() {
    if (!this.ws) return

    // 连接打开
    this.ws.onopen = () => {
      console.log('WebSocket连接已建立')
      this.isConnected = true
      this.reconnectAttempts = 0
      this.notifyConnectionChange(true)
    }

    // 接收消息
    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data)
        console.log('收到WebSocket消息:', message)
        this.handleMessage(message)
      } catch (error) {
        console.error('解析WebSocket消息失败:', error)
      }
    }

    // 连接关闭
    this.ws.onclose = (event) => {
      console.log('WebSocket连接关闭:', event.code, event.reason)
      this.isConnected = false
      this.notifyConnectionChange(false)

      // 如果不是正常关闭，尝试重连
      if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
        this.scheduleReconnect()
      }
    }

    // 连接错误
    this.ws.onerror = (error) => {
      console.error('WebSocket错误:', error)
      this.handleError('连接错误')
    }
  }

  // 处理接收到的消息
  private handleMessage(message: any) {
    const { type, data } = message

    switch (type) {
      case 'connect':
        console.log('WebSocket连接成功:', data)
        break

      case 'message':
        console.log('收到聊天消息:', data)
        this.notifyMessageReceived(data)
        break

      case 'doctor_online':
        console.log('医生上线:', data)
        break

      case 'message_ack':
        console.log('消息确认:', data)
        break

      case 'error':
        console.error('服务器错误:', data)
        this.handleError(data.error || '服务器错误')
        break

      default:
        console.log('未处理的消息类型:', type, data)
    }
  }

  // 发送消息
  sendMessage(message: string) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      ElMessage.error('WebSocket未连接')
      return false
    }

    const chatMessage = {
      type: 'message',
      data: {
        userId: this.connectionParams.userId,
        doctorId: this.connectionParams.doctorId,
        userName: this.connectionParams.userName,
        message: message,
        chatId: `chat_patient_001_doctor_001`, // 使用固定的chatId，与WebSocket服务器匹配
        messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }
    }

    try {
      this.ws.send(JSON.stringify(chatMessage))
      console.log('发送消息:', chatMessage)
      return true
    } catch (error) {
      console.error('发送消息失败:', error)
      ElMessage.error('发送消息失败')
      return false
    }
  }

  // 发送心跳
  sendHeartbeat() {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return

    const heartbeat = {
      type: 'heartbeat',
      data: {
        timestamp: new Date().toISOString()
      }
    }

    try {
      this.ws.send(JSON.stringify(heartbeat))
    } catch (error) {
      console.error('发送心跳失败:', error)
    }
  }

  // 安排重连
  private scheduleReconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
    }

    this.reconnectAttempts++
    const delay = this.reconnectInterval * this.reconnectAttempts

    console.log(`${delay}ms后进行第${this.reconnectAttempts}次重连...`)

    this.reconnectTimer = setTimeout(() => {
      console.log('尝试重连WebSocket...')
      this.connect()
    }, delay)
  }

  // 断开连接
  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }

    if (this.ws) {
      this.ws.close(1000, '用户主动断开')
      this.ws = null
    }

    this.isConnected = false
    this.reconnectAttempts = 0
    this.notifyConnectionChange(false)
  }

  // 检查连接状态
  isSocketConnected(): boolean {
    return this.isConnected && this.ws?.readyState === WebSocket.OPEN
  }

  // 添加消息接收回调
  onMessageReceived(callback: (message: any) => void) {
    this.messageCallbacks.push(callback)
  }

  // 添加连接状态变化回调
  onConnectionChange(callback: (connected: boolean) => void) {
    this.connectionCallbacks.push(callback)
  }

  // 添加错误回调
  onError(callback: (error: string) => void) {
    this.errorCallbacks.push(callback)
  }

  // 移除回调
  removeCallback(callback: Function) {
    this.messageCallbacks = this.messageCallbacks.filter(cb => cb !== callback)
    this.connectionCallbacks = this.connectionCallbacks.filter(cb => cb !== callback)
    this.errorCallbacks = this.errorCallbacks.filter(cb => cb !== callback)
  }

  // 通知消息接收
  private notifyMessageReceived(message: any) {
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

  // 处理错误
  private handleError(error: string) {
    console.error('WebSocket错误:', error)
    this.errorCallbacks.forEach(callback => {
      try {
        callback(error)
      } catch (err) {
        console.error('错误回调执行错误:', err)
      }
    })
  }

  // 设置连接参数
  setConnectionParams(params: { userId?: string; doctorId?: string; userName?: string }) {
    this.connectionParams = { ...this.connectionParams, ...params }
  }

  // 获取连接参数
  getConnectionParams() {
    return { ...this.connectionParams }
  }
}

// 创建单例实例
const nativeWebSocketService = new NativeWebSocketService()

export default nativeWebSocketService 