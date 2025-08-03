<template>
  <div class="message-page">
    <div class="page-header">
      <h1>消息管理</h1>
      <p>与前端用户实时聊天</p>
    </div>

    <div class="message-container">
      <!-- 连接状态栏 -->
      <div class="connection-status">
        <div class="status-indicator" :class="{ connected: isWebSocketConnected }">
          <el-icon :class="{ 'status-icon': true, connected: isWebSocketConnected }">
            <Check v-if="isWebSocketConnected" />
          </el-icon>
          <span>{{ isWebSocketConnected ? '已连接' : '连接中...' }}</span>
        </div>
        <el-button v-if="!isWebSocketConnected" type="text" size="small" @click="reconnectWebSocket">
          重连
        </el-button>
      </div>

      <!-- 左侧消息列表 -->
      <div class="message-list">
        <div class="list-header">
          <h3>在线用户 ({{ onlineUsers.length }})</h3>
          <el-button type="primary" size="small" @click="refreshOnlineUsers" :icon="Plus">
            刷新
          </el-button>
        </div>

        <!-- 搜索框 -->
        <div class="search-box">
          <el-input v-model="searchKeyword" placeholder="搜索用户..." clearable :prefix-icon="Search" />
        </div>

        <!-- 用户列表 -->
        <div class="user-list">
          <div v-for="user in filteredUsers" :key="user.id" class="user-item"
            :class="{ active: selectedUser?.id === user.id }" @click="selectUser(user)">
            <div class="avatar">
              <el-avatar :size="40" :src="user.avatar">
                {{ user.name.charAt(0) }}
              </el-avatar>
              <div class="status" :class="user.status"></div>
            </div>
            <div class="user-info">
              <div class="user-header">
                <span class="name">{{ user.name }}</span>
                <span class="time">{{ formatTime(user.lastSeen) }}</span>
              </div>
              <div class="last-message">
                <span class="message-text">{{ user.lastMessage || '暂无消息' }}</span>
                <el-badge v-if="getUnreadCount(user.id) > 0" :value="getUnreadCount(user.id)" class="unread-badge" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧聊天区域 -->
      <div class="chat-area">
        <div v-if="selectedUser" class="chat-header">
          <div class="chat-user-info">
            <el-avatar :size="32" :src="selectedUser.avatar">
              {{ selectedUser.name.charAt(0) }}
            </el-avatar>
            <div class="user-details">
              <span class="name">{{ selectedUser.name }}</span>
              <span class="status-text">{{ getStatusText(selectedUser.status) }}</span>
            </div>
          </div>
          <div class="chat-actions">
            <el-button type="text" :icon="Phone" @click="handleCall">通话</el-button>
            <el-button type="text" :icon="VideoCamera" @click="handleVideoCall">视频</el-button>
            <el-button type="text" :icon="More" @click="handleMoreActions">更多</el-button>
          </div>
        </div>

        <div v-else class="no-chat-selected">
          <el-empty description="选择一个用户开始聊天" />
        </div>

        <!-- 聊天消息区域 -->
        <div v-if="selectedUser" class="messages-container" ref="messagesContainer">
          <div class="messages-list">
            <div v-for="message in getChatMessages(selectedUser.id)" :key="message.id" class="message-item" :class="{
              'message-mine': message.sender.type === 'admin',
              'message-other': message.sender.type === 'user',
            }">
              <div class="message-avatar">
                <el-avatar :size="32" :src="message.sender.avatar">
                  {{ message.sender.name.charAt(0) }}
                </el-avatar>
              </div>
              <div class="message-content">
                <div class="message-bubble">
                  <div class="message-text">{{ message.content }}</div>
                  <div class="message-time">{{ formatTime(message.timestamp) }}</div>
                </div>
                <div class="message-status" v-if="message.sender.type === 'admin'">
                  <el-icon v-if="message.status === 'sent'">
                    <Check />
                  </el-icon>
                  <el-icon v-else-if="message.status === 'delivered'">
                    <Check />
                  </el-icon>
                  <el-icon v-else-if="message.status === 'read'">
                    <Check />
                  </el-icon>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 输入区域 -->
        <div v-if="selectedUser" class="input-area">
          <div class="input-toolbar">
            <el-button type="text" :icon="Paperclip" @click="handleAttach">附件</el-button>
            <el-button type="text" :icon="Picture" @click="handleImage">图片</el-button>
            <el-button type="text" :icon="Microphone" @click="handleVoice">语音</el-button>
          </div>
          <div class="input-container">
            <el-input v-model="newMessage" type="textarea" :rows="3" placeholder="输入消息..." resize="none"
              @keydown.enter.prevent="handleSendMessage" />
            <el-button type="primary" :icon="Position" @click="handleSendMessage" :disabled="!newMessage.trim()">
              发送
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus,
  Search,
  Phone,
  VideoCamera,
  More,
  Paperclip,
  Picture,
  Microphone,
  Position,
  Check,
} from '@element-plus/icons-vue'
import webSocketService, { type WebSocketMessage } from '../utils/websocket'

// 用户接口
interface User {
  id: string
  name: string
  avatar?: string
  status: 'online' | 'offline' | 'away'
  lastSeen: string
  lastMessage?: string
}

// 响应式数据
const searchKeyword = ref('')
const selectedUser = ref<User | null>(null)
const newMessage = ref('')
const messagesContainer = ref<HTMLElement>()

// WebSocket相关
const isWebSocketConnected = ref(false)
const onlineUsers = ref<User[]>([])
const chatMessages = ref<Map<string, WebSocketMessage[]>>(new Map())
const unreadCounts = ref<Map<string, number>>(new Map())

// 当前管理员信息
const currentAdmin = reactive({
  id: 'admin_001',
  name: '管理员',
  avatar: '',
})

// 计算属性：过滤后的用户列表
const filteredUsers = computed(() => {
  if (!searchKeyword.value) {
    return onlineUsers.value
  }
  return onlineUsers.value.filter(user =>
    user.name.toLowerCase().includes(searchKeyword.value.toLowerCase())
  )
})

// 获取用户的聊天消息
const getChatMessages = (userId: string): WebSocketMessage[] => {
  return chatMessages.value.get(userId) || []
}

// 获取用户未读消息数量
const getUnreadCount = (userId: string): number => {
  return unreadCounts.value.get(userId) || 0
}

// 选择用户
const selectUser = (user: User) => {
  selectedUser.value = user
  // 清除未读消息
  unreadCounts.value.set(user.id, 0)
  // 滚动到底部
  nextTick(() => {
    scrollToBottom()
  })
}

// 发送消息
const handleSendMessage = async () => {
  if (!newMessage.value.trim() || !selectedUser.value) return

  const message = webSocketService.sendMessage(
    selectedUser.value.id,
    selectedUser.value.name,
    newMessage.value
  )

  if (message) {
    // 添加到聊天记录
    const userId = selectedUser.value.id
    const messages = chatMessages.value.get(userId) || []
    messages.push(message)
    chatMessages.value.set(userId, messages)

    // 更新用户最后消息
    selectedUser.value.lastMessage = newMessage.value

    // 清空输入框
    newMessage.value = ''

    // 滚动到底部
    nextTick(() => {
      scrollToBottom()
    })
  }
}

// 滚动到底部
const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

// 格式化时间
const formatTime = (time: string) => {
  const date = new Date(time)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  } else if (days === 1) {
    return '昨天'
  } else if (days < 7) {
    return `${days}天前`
  } else {
    return date.toLocaleDateString('zh-CN')
  }
}

// 获取状态文本
const getStatusText = (status: string) => {
  switch (status) {
    case 'online':
      return '在线'
    case 'away':
      return '离开'
    case 'offline':
      return '离线'
    default:
      return '未知'
  }
}

// 刷新在线用户
const refreshOnlineUsers = async () => {
  try {
    const users = await webSocketService.getOnlineUsers()
    onlineUsers.value = users.map(user => ({
      id: user.id,
      name: user.name,
      avatar: user.avatar,
      status: user.status,
      lastSeen: user.lastSeen,
      lastMessage: user.lastMessage,
    }))
    ElMessage.success('用户列表已刷新')
  } catch (error) {
    console.error('获取在线用户失败:', error)
    ElMessage.error('获取在线用户失败')
  }
}

// 重连WebSocket
const reconnectWebSocket = () => {
  webSocketService.disconnect()
  setTimeout(() => {
    initWebSocket()
  }, 1000)
}

// 初始化WebSocket
const initWebSocket = () => {
  // 设置当前用户信息
  webSocketService.setCurrentUser(currentAdmin)

  // 连接WebSocket服务器
  webSocketService.connect()

  // 监听连接状态变化
  webSocketService.onConnectionChange(connected => {
    isWebSocketConnected.value = connected
    if (connected) {
      ElMessage.success('WebSocket连接成功')
      refreshOnlineUsers()
    } else {
      ElMessage.warning('WebSocket连接断开')
    }
  })

  // 监听消息接收
  webSocketService.onMessageReceived(message => {


    // 确定是哪个用户的消息
    const userId = message.sender.type === 'admin' ? message.receiver.id : message.sender.id

    // 添加到聊天记录
    const messages = chatMessages.value.get(userId) || []
    messages.push(message)
    chatMessages.value.set(userId, messages)

    // 如果不是当前选中的用户，增加未读数量
    if (selectedUser.value?.id !== userId) {
      const currentUnread = unreadCounts.value.get(userId) || 0
      unreadCounts.value.set(userId, currentUnread + 1)
    }

    // 更新用户最后消息
    const user = onlineUsers.value.find(u => u.id === userId)
    if (user) {
      user.lastMessage = message.content
    }

    // 如果是当前聊天，滚动到底部
    if (selectedUser.value?.id === userId) {
      nextTick(() => {
        scrollToBottom()
      })
    }
  })

  // 监听用户状态变化
  webSocketService.onUserStatusChange((userId, status) => {
    const user = onlineUsers.value.find(u => u.id === userId)
    if (user) {
      user.status = status
      user.lastSeen = new Date().toISOString()
    }
  })
}

// 通话功能
const handleCall = () => {
  ElMessage.info('通话功能开发中...')
}

// 视频通话功能
const handleVideoCall = () => {
  ElMessage.info('视频通话功能开发中...')
}

// 更多操作
const handleMoreActions = () => {
  ElMessage.info('更多操作功能开发中...')
}

// 附件功能
const handleAttach = () => {
  ElMessage.info('附件功能开发中...')
}

// 图片功能
const handleImage = () => {
  ElMessage.info('图片功能开发中...')
}

// 语音功能
const handleVoice = () => {
  ElMessage.info('语音功能开发中...')
}

// 组件挂载时初始化
onMounted(() => {
  initWebSocket()
})

// 组件卸载时清理
onUnmounted(() => {
  webSocketService.disconnect()
})
</script>

<style scoped>
.message-page {
  padding: 20px;
  height: calc(100vh - 120px);
}

.page-header {
  margin-bottom: 20px;
}

.page-header h1 {
  margin: 0 0 8px 0;
  color: var(--color-heading);
  font-size: 24px;
  font-weight: 600;
}

.page-header p {
  margin: 0;
  color: var(--text-muted);
  font-size: 14px;
}

.message-container {
  display: flex;
  height: calc(100vh - 200px);
  background: var(--card-background);
  border-radius: 8px;
  box-shadow: var(--card-shadow);
  border: 1px solid var(--color-border);
  overflow: hidden;
}

/* 连接状态栏 */
.connection-status {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.95);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 10;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--text-muted);
}

.status-indicator.connected {
  color: #67c23a;
}

.status-icon {
  font-size: 14px;
}

.status-icon.connected {
  color: #67c23a;
}

/* 左侧用户列表 */
.message-list {
  width: 300px;
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  margin-top: 40px;
}

.list-header {
  padding: 16px;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.list-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.search-box {
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-border);
}

.user-list {
  flex: 1;
  overflow-y: auto;
}

.user-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.2s;
  border-bottom: 1px solid var(--color-border-light);
}

.user-item:hover {
  background-color: var(--color-fill-light);
}

.user-item.active {
  background-color: var(--color-primary-light-9);
}

.avatar {
  position: relative;
  margin-right: 12px;
}

.status {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid white;
}

.status.online {
  background-color: #67c23a;
}

.status.away {
  background-color: #e6a23c;
}

.status.offline {
  background-color: #909399;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.name {
  font-weight: 600;
  font-size: 14px;
  color: var(--color-text);
}

.time {
  font-size: 12px;
  color: var(--text-muted);
}

.last-message {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.message-text {
  font-size: 13px;
  color: var(--text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  margin-right: 8px;
}

.unread-badge {
  flex-shrink: 0;
}

/* 右侧聊天区域 */
.chat-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-top: 40px;
}

.chat-header {
  padding: 16px;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chat-user-info {
  display: flex;
  align-items: center;
}

.user-details {
  margin-left: 12px;
}

.user-details .name {
  font-weight: 600;
  font-size: 16px;
  display: block;
}

.status-text {
  font-size: 12px;
  color: var(--text-muted);
}

.chat-actions {
  display: flex;
  gap: 8px;
}

.no-chat-selected {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 消息区域 */
.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background-color: #f5f5f5;
}

.messages-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.message-mine {
  flex-direction: row-reverse;
}

.message-avatar {
  flex-shrink: 0;
}

.message-content {
  display: flex;
  align-items: flex-end;
  gap: 4px;
  max-width: 70%;
}

.message-mine .message-content {
  flex-direction: row-reverse;
}

.message-bubble {
  background-color: white;
  padding: 12px 16px;
  border-radius: 18px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  position: relative;
}

.message-mine .message-bubble {
  background-color: var(--color-primary);
  color: white;
}

.message-text {
  font-size: 14px;
  line-height: 1.4;
  margin-bottom: 4px;
}

.message-time {
  font-size: 11px;
  opacity: 0.7;
}

.message-status {
  display: flex;
  align-items: center;
  font-size: 12px;
  opacity: 0.7;
}

/* 输入区域 */
.input-area {
  border-top: 1px solid var(--color-border);
  background-color: white;
}

.input-toolbar {
  padding: 8px 16px;
  border-bottom: 1px solid var(--color-border-light);
  display: flex;
  gap: 8px;
}

.input-container {
  padding: 16px;
  display: flex;
  gap: 12px;
  align-items: flex-end;
}

.input-container .el-textarea {
  flex: 1;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .message-container {
    flex-direction: column;
  }

  .message-list {
    width: 100%;
    height: 200px;
  }

  .chat-area {
    height: calc(100vh - 400px);
  }
}
</style>
