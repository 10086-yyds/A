<template>
  <div class="message-page">
    <div class="page-header">
      <h1>医生聊天室</h1>
      <p>与患者进行实时医疗咨询</p>
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
        <div class="doctor-info">
          <span>医生: {{ currentDoctor.name }}</span>
          <el-button v-if="!isWebSocketConnected" type="text" size="small" @click="reconnectWebSocket">
            重连
          </el-button>
        </div>
      </div>

      <div class="chat-layout">
        <!-- 左侧患者列表 -->
        <div class="patient-list">
          <div class="list-header">
            <h3>在线患者 ({{ patients.length }})</h3>
            <el-button type="primary" size="small" @click="refreshPatients" :icon="Refresh">
              刷新
            </el-button>
          </div>

          <!-- 搜索框 -->
          <div class="search-box">
            <el-input v-model="searchKeyword" placeholder="搜索患者..." clearable :prefix-icon="Search" />
          </div>

          <!-- 患者列表 -->
          <div class="patients">
            <div v-for="patient in filteredPatients" :key="patient.userId" class="patient-item"
              :class="{ active: selectedPatient?.userId === patient.userId }" @click="selectPatient(patient)">
              <div class="patient-avatar">
                <el-avatar :size="40" :src="patient.avatar">
                  {{ patient.userName.charAt(0) }}
                </el-avatar>
                <div class="status" :class="patient.status"></div>
              </div>
              <div class="patient-info">
                <div class="patient-header">
                  <span class="name">{{ patient.userName }}</span>
                  <span class="time">{{ formatTime(patient.lastSeen) }}</span>
                </div>
                <div class="last-message">
                  <span class="message-text">{{ patient.lastMessage || '暂无消息' }}</span>
                  <el-badge v-if="getUnreadCount(patient.userId) > 0" :value="getUnreadCount(patient.userId)" class="unread-badge" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧聊天区域 -->
        <div class="chat-area">
          <div v-if="selectedPatient" class="chat-header">
            <div class="chat-patient-info">
              <el-avatar :size="32" :src="selectedPatient.avatar">
                {{ selectedPatient.userName.charAt(0) }}
              </el-avatar>
              <div class="patient-details">
                <span class="name">{{ selectedPatient.userName }}</span>
                <span class="status-text">{{ getStatusText(selectedPatient.status) }}</span>
              </div>
            </div>
            <div class="chat-actions">
              <el-button type="text" :icon="Phone" @click="handleCall">通话</el-button>
              <el-button type="text" :icon="VideoCamera" @click="handleVideoCall">视频</el-button>
              <el-button type="text" :icon="Document" @click="handlePrescription">开处方</el-button>
            </div>
          </div>

          <div v-else class="no-chat-selected">
            <el-empty description="选择一个患者开始聊天" />
          </div>

          <!-- 聊天消息区域 -->
          <div v-if="selectedPatient" class="messages-container" ref="messagesContainer">
            <div class="messages-list">
              <div v-for="message in getChatMessages(selectedPatient.userId)" :key="message.messageId" class="message-item" :class="{
                'message-mine': message.userId === currentDoctor.userId,
                'message-other': message.userId !== currentDoctor.userId,
              }">
                <div class="message-avatar">
                  <el-avatar :size="32" :src="message.userId === currentDoctor.userId ? currentDoctor.avatar : selectedPatient.avatar">
                    {{ message.userId === currentDoctor.userId ? currentDoctor.name.charAt(0) : selectedPatient.userName.charAt(0) }}
                  </el-avatar>
                </div>
                <div class="message-content">
                  <div class="message-bubble">
                    <div class="message-text">{{ message.message }}</div>
                    <div class="message-time">{{ formatTime(message.timestamp) }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 输入区域 -->
          <div v-if="selectedPatient" class="input-area">
            <div class="input-toolbar">
              <el-button type="text" :icon="Paperclip" @click="handleAttach">附件</el-button>
              <el-button type="text" :icon="Picture" @click="handleImage">图片</el-button>
              <el-button type="text" :icon="Document" @click="handleQuickReply">快捷回复</el-button>
            </div>
            <div class="input-container">
              <el-input v-model="newMessage" type="textarea" :rows="3" placeholder="输入医疗建议..." resize="none"
                @keydown.enter.prevent="sendMessage" />
              <el-button type="primary" :icon="Position" @click="sendMessage" :disabled="!newMessage.trim() || !isWebSocketConnected">
                发送
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 快捷回复对话框 -->
    <el-dialog v-model="quickReplyVisible" title="快捷回复" width="500px">
      <div class="quick-replies">
        <el-button v-for="reply in quickReplies" :key="reply.id" @click="selectQuickReply(reply.text)" class="quick-reply-btn">
          {{ reply.text }}
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Check,
  Refresh,
  Search,
  Phone,
  VideoCamera,
  Document,
  Paperclip,
  Picture,
  Position,
} from '@element-plus/icons-vue'
import nativeWebSocketService, { type ChatMessage } from '../utils/websocket-native'

// 患者接口
interface Patient {
  userId: string
  userName: string
  avatar?: string
  status: 'online' | 'offline' | 'away'
  lastSeen: string
  lastMessage?: string
}

// 响应式数据
const searchKeyword = ref('')
const selectedPatient = ref<Patient | null>(null)
const isWebSocketConnected = ref(false)
const messages = ref<Map<string, ChatMessage[]>>(new Map())
const unreadCounts = ref<Map<string, number>>(new Map())
const newMessage = ref('')
const messagesContainer = ref<HTMLElement>()
const quickReplyVisible = ref(false)

// 当前医生信息
const currentDoctor = reactive({
  userId: 'admin_001', // 修改为admin_001，与WebSocket服务器逻辑匹配
  name: '张医生',
  avatar: '',
})

// 模拟患者数据 - 与React Native应用匹配
const patients = ref<Patient[]>([
  {
    userId: 'patient_001', // 与React Native应用的userId匹配
    userName: '李患者',
    status: 'online',
    lastSeen: new Date().toISOString(),
    lastMessage: '医生，我最近感觉头痛'
  },
  {
    userId: 'patient_002',
    userName: '王患者',
    status: 'online',
    lastSeen: new Date().toISOString(),
    lastMessage: '谢谢医生的建议'
  },
  {
    userId: 'patient_003',
    userName: '刘患者',
    status: 'away',
    lastSeen: new Date(Date.now() - 300000).toISOString(),
    lastMessage: '我需要预约复查'
  }
])

// 快捷回复
const quickReplies = [
  { id: 1, text: '请详细描述您的症状' },
  { id: 2, text: '建议您先观察几天' },
  { id: 3, text: '请到医院做进一步检查' },
  { id: 4, text: '按时服药，注意休息' },
  { id: 5, text: '保持良好的生活习惯' },
  { id: 6, text: '如有加重请及时就医' }
]

// 计算属性：过滤后的患者列表
const filteredPatients = computed(() => {
  if (!searchKeyword.value) {
    return patients.value
  }
  return patients.value.filter(patient =>
    patient.userName.toLowerCase().includes(searchKeyword.value.toLowerCase())
  )
})

// 获取患者的聊天消息
const getChatMessages = (userId: string): ChatMessage[] => {
  return messages.value.get(userId) || []
}

// 获取患者未读消息数量
const getUnreadCount = (userId: string): number => {
  return unreadCounts.value.get(userId) || 0
}

// 选择患者
const selectPatient = (patient: Patient) => {
  selectedPatient.value = patient
  // 清除未读消息
  unreadCounts.value.set(patient.userId, 0)
  // 滚动到底部
  nextTick(() => {
    scrollToBottom()
  })
}

// 发送消息
const sendMessage = () => {
  if (!newMessage.value.trim() || !selectedPatient.value || !isWebSocketConnected.value) return

  const success = nativeWebSocketService.sendMessage(newMessage.value)
  
  if (success) {
    // 添加到本地消息列表
    const patientMessages = messages.value.get(selectedPatient.value.userId) || []
    const newChatMessage: ChatMessage = {
      messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: currentDoctor.userId, // admin_001
      doctorId: 'doctor_001', // 与React Native应用匹配
      userName: currentDoctor.name,
      doctorName: currentDoctor.name,
      message: newMessage.value,
      chatId: `chat_patient_001_doctor_001`, // 使用固定的chatId，与WebSocket服务器匹配
      timestamp: new Date().toISOString()
    }
    patientMessages.push(newChatMessage)
    messages.value.set(selectedPatient.value.userId, patientMessages)

    // 更新患者最后消息
    selectedPatient.value.lastMessage = newMessage.value

    // 清空输入框
    newMessage.value = ''

    // 滚动到底部
    setTimeout(() => {
      scrollToBottom()
    }, 100)
  }
}

// 滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
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

// 刷新患者列表
const refreshPatients = () => {
  ElMessage.success('患者列表已刷新')
}

// 重连WebSocket
const reconnectWebSocket = () => {
  nativeWebSocketService.disconnect()
  setTimeout(() => {
    initWebSocket()
  }, 1000)
}

// 初始化WebSocket
const initWebSocket = () => {
  // 设置连接参数 - 与React Native应用匹配
  nativeWebSocketService.setConnectionParams({
    userId: currentDoctor.userId, // admin_001
    doctorId: 'doctor_001', // 与React Native应用使用相同的doctorId
    userName: currentDoctor.name
  })

  // 连接WebSocket服务器
  nativeWebSocketService.connect()

  // 监听连接状态变化
  nativeWebSocketService.onConnectionChange(connected => {
    isWebSocketConnected.value = connected
    if (connected) {
      ElMessage.success('WebSocket连接成功')
    } else {
      ElMessage.warning('WebSocket连接断开')
    }
  })

  // 监听消息接收
  nativeWebSocketService.onMessageReceived(message => {
    console.log('收到消息:', message)
    
    // 确定是哪个患者的消息 - 处理来自React Native应用的消息
    let patientId = message.userId
    
    // 如果消息来自患者（不是医生自己发送的）
    if (message.userId !== currentDoctor.userId && !message.userId.startsWith('admin_') && !message.userId.startsWith('doctor_')) {
      patientId = message.userId
      
      // 如果是新患者，自动添加到患者列表
      const existingPatient = patients.value.find(p => p.userId === patientId)
      if (!existingPatient) {
        const newPatient: Patient = {
          userId: patientId,
          userName: message.userName || `患者${patientId}`,
          status: 'online',
          lastSeen: new Date().toISOString(),
          lastMessage: message.message
        }
        patients.value.push(newPatient)
        ElMessage.success(`新患者 ${newPatient.userName} 已连接`)
      }
    } else if (message.userId === 'system') {
      // 系统消息，使用doctorId作为患者ID
      patientId = message.doctorId
    }
    
    // 添加到聊天记录
    const patientMessages = messages.value.get(patientId) || []
    patientMessages.push(message)
    messages.value.set(patientId, patientMessages)

    // 如果不是当前选中的患者，增加未读数量
    if (selectedPatient.value?.userId !== patientId) {
      const currentUnread = unreadCounts.value.get(patientId) || 0
      unreadCounts.value.set(patientId, currentUnread + 1)
    }

    // 更新患者最后消息
    const patient = patients.value.find(p => p.userId === patientId)
    if (patient) {
      patient.lastMessage = message.message
      patient.lastSeen = new Date().toISOString()
    }

    // 如果是当前聊天，滚动到底部
    if (selectedPatient.value?.userId === patientId) {
      setTimeout(() => {
        scrollToBottom()
      }, 100)
    }
  })

  // 监听错误
  nativeWebSocketService.onError(error => {
    console.error('WebSocket错误:', error)
    ElMessage.error(`WebSocket错误: ${error}`)
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

// 开处方功能
const handlePrescription = () => {
  ElMessage.info('开处方功能开发中...')
}

// 附件功能
const handleAttach = () => {
  ElMessage.info('附件功能开发中...')
}

// 图片功能
const handleImage = () => {
  ElMessage.info('图片功能开发中...')
}

// 快捷回复功能
const handleQuickReply = () => {
  quickReplyVisible.value = true
}

// 选择快捷回复
const selectQuickReply = (text: string) => {
  newMessage.value = text
  quickReplyVisible.value = false
}

// 组件挂载时初始化
onMounted(() => {
  initWebSocket()
})

// 组件卸载时断开连接
onUnmounted(() => {
  nativeWebSocketService.disconnect()
})
</script>

<style scoped>
.message-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden; /* 防止页面滚动 */
}

.page-header {
  margin-bottom: 20px;
}

.page-header h1 {
  margin: 0 0 8px 0;
  color: var(--el-text-color-primary);
}

.page-header p {
  margin: 0;
  color: var(--el-text-color-regular);
}

.message-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--el-bg-color);
  border-radius: 8px;
  overflow: hidden;
  min-height: 0; /* 允许收缩 */
}

.connection-status {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background: var(--el-bg-color-page);
  border-bottom: 1px solid var(--el-border-color-light);
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--el-text-color-regular);
}

.status-indicator.connected {
  color: var(--el-color-success);
}

.status-icon {
  font-size: 16px;
}

.status-icon.connected {
  color: var(--el-color-success);
}

.doctor-info {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--el-text-color-regular);
}

.chat-layout {
  flex: 1;
  display: flex;
  min-height: 0; /* 重要：允许flex子元素收缩 */
}

.patient-list {
  width: 300px;
  min-width: 300px; /* 固定最小宽度 */
  border-right: 1px solid var(--el-border-color-light);
  display: flex;
  flex-direction: column;
}

.list-header {
  padding: 16px;
  border-bottom: 1px solid var(--el-border-color-light);
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
  border-bottom: 1px solid var(--el-border-color-light);
}

.patients {
  flex: 1;
  overflow-y: auto;
  min-height: 0; /* 允许收缩 */
}

.patient-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.2s;
  border-bottom: 1px solid var(--el-border-color-light);
}

.patient-item:hover {
  background-color: var(--el-fill-color-light);
}

.patient-item.active {
  background-color: var(--el-color-primary-light-9);
}

.patient-avatar {
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
  background-color: var(--el-color-success);
}

.status.away {
  background-color: var(--el-color-warning);
}

.status.offline {
  background-color: var(--el-color-info);
}

.patient-info {
  flex: 1;
  min-width: 0;
}

.patient-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.name {
  font-weight: 600;
  font-size: 14px;
  color: var(--el-text-color-primary);
}

.time {
  font-size: 12px;
  color: var(--el-text-color-regular);
}

.last-message {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.message-text {
  font-size: 13px;
  color: var(--el-text-color-regular);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  margin-right: 8px;
}

.unread-badge {
  flex-shrink: 0;
}

.chat-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0; /* 允许收缩 */
  min-height: 0; /* 允许收缩 */
}

.chat-header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--el-border-color-light);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--el-bg-color-page);
}

.chat-patient-info {
  display: flex;
  align-items: center;
}

.patient-details {
  margin-left: 12px;
}

.patient-details .name {
  font-weight: 600;
  font-size: 16px;
  display: block;
}

.status-text {
  font-size: 12px;
  color: var(--el-text-color-regular);
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

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background-color: var(--el-fill-color-lighter);
  min-height: 0; /* 允许收缩 */
  max-height: calc(100vh - 300px); /* 设置最大高度，避免过度拉伸 */
}

.messages-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 100%;
  justify-content: flex-end; /* 消息从底部开始显示 */
}

.message-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.message-item.message-mine {
  flex-direction: row-reverse;
}

.message-avatar {
  flex-shrink: 0;
}

.message-content {
  max-width: 70%;
  word-wrap: break-word; /* 长消息自动换行 */
}

.message-bubble {
  padding: 12px 16px;
  border-radius: 12px;
  background: var(--el-bg-color);
  color: var(--el-text-color-primary);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.message-item.message-mine .message-bubble {
  background: var(--el-color-primary);
  color: white;
}

.message-text {
  margin-bottom: 4px;
  line-height: 1.4;
}

.message-time {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}

.message-item.message-mine .message-time {
  color: rgba(255, 255, 255, 0.8);
}

.input-area {
  border-top: 1px solid var(--el-border-color-light);
  background: var(--el-bg-color-page);
  flex-shrink: 0; /* 防止输入区域被压缩 */
}

.input-toolbar {
  padding: 8px 20px;
  border-bottom: 1px solid var(--el-border-color-light);
  display: flex;
  gap: 8px;
}

.input-container {
  padding: 16px 20px;
  display: flex;
  gap: 12px;
  align-items: flex-end;
  min-height: 80px; /* 确保输入区域有足够高度 */
}

.input-container .el-textarea {
  flex: 1;
  min-height: 60px; /* 确保文本框有足够高度 */
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .patient-list {
    width: 250px;
    min-width: 250px;
  }
}

@media (max-width: 768px) {
  .chat-layout {
    flex-direction: column;
  }
  
  .patient-list {
    width: 100%;
    min-width: 100%;
    max-height: 200px;
  }
  
  .messages-container {
    max-height: calc(100vh - 400px);
  }
}

.quick-replies {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.quick-reply-btn {
  text-align: left;
  white-space: normal;
  height: auto;
  padding: 12px;
  line-height: 1.4;
}
</style>
