// {{ AURA-X: Add - WebSocket连接管理工具类，实现医生-用户精准匹配通信. Approval: 用户需求实现WebSocket聊天功能. }}

// WebSocket消息类型定义
export interface WebSocketMessage {
  type: 'connect' | 'message' | 'disconnect' | 'error' | 'doctor_online' | 'doctor_offline' | 'heartbeat' | 'message_ack';
  data: {
    userId?: string;
    doctorId?: string;
    userName?: string;
    doctorName?: string;
    message?: string;
    timestamp?: string;
    messageId?: string;
    chatId?: string;
    error?: string;
  };
}

// 连接状态类型
export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'reconnecting' | 'error';

// 消息状态类型
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'failed';

// 聊天消息接口
export interface ChatMessage {
  id: string;
  text: string;
  timestamp: Date;
  isFromUser: boolean;
  userName: string;
  userAvatar?: string;
  isDoctor?: boolean;
  doctorName?: string;
  doctorId?: string;
  status: MessageStatus;
  chatId: string;
}

// WebSocket事件监听器类型
export interface WebSocketEventListeners {
  onConnect?: () => void;
  onDisconnect?: () => void;
  onMessage?: (message: ChatMessage) => void;
  onError?: (error: string) => void;
  onStatusChange?: (status: ConnectionStatus) => void;
  onDoctorStatusChange?: (doctorId: string, isOnline: boolean) => void;
}

class WebSocketManager {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectInterval: number = 5000; // 5秒重连间隔
  private maxReconnectAttempts: number = 10;
  private reconnectAttempts: number = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private heartbeatTimer: number = 30000; // 30秒心跳
  private listeners: WebSocketEventListeners = {};
  private connectionStatus: ConnectionStatus = 'disconnected';
  private currentUserId: string = '';
  private currentDoctorId: string = '';
  private currentChatId: string = '';

  // {{ AURA-X: Modify - 移除硬编码WebSocket地址. Approved: 安全修复. }}
  // {{ AURA-X: Modify - 更新WebSocket地址为用户IPv4. Approved: 网络配置修复. }}
  constructor(serverUrl: string = process.env.WEBSOCKET_URL || 'ws://198.18.0.1:3000') {
    this.url = serverUrl;
  }

  // {{ AURA-X: Add - 初始化WebSocket连接并建立用户-医生聊天通道. Approval: 核心功能需求. }}
  public connect(userId: string, doctorId: string, userName: string = '用户'): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {

          resolve();
          return;
        }

        this.currentUserId = userId;
        this.currentDoctorId = doctorId;
        this.currentChatId = `chat_${userId}_${doctorId}`;

        this.setConnectionStatus('connecting');

        // 构建WebSocket连接URL，包含用户ID和医生ID用于后端匹配
        const wsUrl = `${this.url}/chat?userId=${userId}&doctorId=${doctorId}&userName=${encodeURIComponent(userName)}`;


        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {

          this.setConnectionStatus('connected');
          this.reconnectAttempts = 0;
          this.startHeartbeat();

          // 发送连接确认消息
          this.sendMessage({
            type: 'connect',
            data: {
              userId: this.currentUserId,
              doctorId: this.currentDoctorId,
              userName: userName,
              chatId: this.currentChatId,
              timestamp: new Date().toISOString()
            }
          });

          this.listeners.onConnect?.();
          resolve();
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event.data);
        };

        this.ws.onclose = () => {

          this.setConnectionStatus('disconnected');
          this.stopHeartbeat();
          this.listeners.onDisconnect?.();

          // 如果不是主动断开，则尝试重连
          if (this.connectionStatus !== 'disconnected') {
            this.attemptReconnect();
          }
        };

        this.ws.onerror = (error) => {

          this.setConnectionStatus('error');
          this.listeners.onError?.('连接错误，请检查网络');
          reject(new Error('WebSocket连接失败'));
        };

      } catch (error) {

        this.setConnectionStatus('error');
        reject(error);
      }
    });
  }

  // {{ AURA-X: Add - 处理接收到的WebSocket消息. Approval: 实时消息传递功能需求. }}
  private handleMessage(data: string) {
    try {
      const message: WebSocketMessage = JSON.parse(data);


      switch (message.type) {
        case 'message':
          // 处理聊天消息
          const chatMessage: ChatMessage = {
            id: message.data.messageId || `msg_${Date.now()}`,
            text: message.data.message || '',
            timestamp: new Date(message.data.timestamp || Date.now()),
            isFromUser: message.data.userId === this.currentUserId,
            userName: message.data.userName || '未知用户',
            isDoctor: message.data.doctorId === this.currentDoctorId,
            doctorName: message.data.doctorName,
            doctorId: message.data.doctorId,
            status: 'delivered',
            chatId: message.data.chatId || this.currentChatId
          };
          this.listeners.onMessage?.(chatMessage);
          break;

        case 'doctor_online':
          this.listeners.onDoctorStatusChange?.(message.data.doctorId || '', true);
          break;

        case 'doctor_offline':
          this.listeners.onDoctorStatusChange?.(message.data.doctorId || '', false);
          break;

        case 'error':
          this.listeners.onError?.(message.data.error || '未知错误');
          break;

        default:

      }
    } catch (error) {

      this.listeners.onError?.('消息格式错误');
    }
  }

  // {{ AURA-X: Add - 发送聊天消息给指定医生. Approval: 用户-医生精准匹配通信需求. }}
  public sendChatMessage(text: string, userName: string = '用户'): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.isConnected()) {
        reject(new Error('WebSocket未连接'));
        return;
      }

      const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const message: WebSocketMessage = {
        type: 'message',
        data: {
          messageId,
          userId: this.currentUserId,
          doctorId: this.currentDoctorId,
          userName,
          message: text,
          chatId: this.currentChatId,
          timestamp: new Date().toISOString()
        }
      };

      try {
        this.sendMessage(message);

        resolve(messageId);
      } catch (error) {

        reject(error);
      }
    });
  }

  // {{ AURA-X: Add - 底层WebSocket消息发送方法. Approval: 基础通信功能. }}
  private sendMessage(message: WebSocketMessage) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      throw new Error('WebSocket连接不可用');
    }
  }

  // {{ AURA-X: Add - 自动重连机制. Approval: 连接异常处理需求. }}
  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {

      this.setConnectionStatus('error');
      this.listeners.onError?.('连接失败，请手动重试');
      return;
    }

    this.reconnectAttempts++;
    this.setConnectionStatus('reconnecting');



    this.reconnectTimer = setTimeout(() => {
      this.connect(this.currentUserId, this.currentDoctorId)
        .catch(() => {
          this.attemptReconnect();
        });
    }, this.reconnectInterval);
  }

  // {{ AURA-X: Add - 心跳机制保持连接活跃. Approval: 连接稳定性需求. }}
  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected()) {
        try {
          this.sendMessage({
            type: 'heartbeat',
            data: {
              userId: this.currentUserId,
              timestamp: new Date().toISOString()
            }
          });
        } catch (error) {

        }
      }
    }, this.heartbeatTimer);
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  // {{ AURA-X: Add - 连接状态管理方法. Approval: 状态管理需求. }}
  private setConnectionStatus(status: ConnectionStatus) {
    if (this.connectionStatus !== status) {
      this.connectionStatus = status;
      this.listeners.onStatusChange?.(status);

    }
  }

  public getConnectionStatus(): ConnectionStatus {
    return this.connectionStatus;
  }

  public isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN && this.connectionStatus === 'connected';
  }

  // {{ AURA-X: Add - 事件监听器管理. Approval: 事件处理机制需求. }}
  public setEventListeners(listeners: Partial<WebSocketEventListeners>) {
    this.listeners = { ...this.listeners, ...listeners };
  }

  public removeEventListeners() {
    this.listeners = {};
  }

  // {{ AURA-X: Add - 断开连接和清理资源. Approval: 资源管理需求. }}
  public disconnect() {


    // 清理定时器
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.stopHeartbeat();

    // 设置为断开状态（阻止自动重连）
    this.setConnectionStatus('disconnected');

    // 关闭连接
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    // 重置连接信息
    this.reconnectAttempts = 0;
    this.currentUserId = '';
    this.currentDoctorId = '';
    this.currentChatId = '';
  }

  // {{ AURA-X: Add - 获取当前聊天信息. Approval: 状态查询需求. }}
  public getCurrentChatInfo() {
    return {
      userId: this.currentUserId,
      doctorId: this.currentDoctorId,
      chatId: this.currentChatId,
      isConnected: this.isConnected(),
      status: this.connectionStatus
    };
  }
}

// 导出单例实例
export const websocketManager = new WebSocketManager();
export default WebSocketManager; 