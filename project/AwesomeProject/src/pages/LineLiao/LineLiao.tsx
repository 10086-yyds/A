import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
  StatusBar,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AvatarUtils } from '../../utils/avatarUtils';
import { websocketManager, ConnectionStatus, ChatMessage } from '../../utils/websocketManager';

const { width, height } = Dimensions.get('window');

// {{ AURA-X: Modify - 使用WebSocket管理器的消息类型定义. Approval: 统一消息接口. }}
// 消息类型定义 - 使用WebSocket管理器的ChatMessage接口
type Message = ChatMessage;

// 用户信息类型定义
interface UserInfo {
  userName: string;
  userAvatar?: string;
}

const LineLiao = ({ route, navigation }: any) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [userInfo, setUserInfo] = useState<UserInfo>({ userName: '患者' });
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [currentChatId, setCurrentChatId] = useState<string>('');

  // 从路由参数获取医生信息，如果没有则使用默认值
  const getDoctorInfo = () => {
    const doctorData = route?.params?.item;
    if (doctorData) {
      return {
        name: doctorData.realName || '张医生',
        title: doctorData.title || '主治医师',
        department: doctorData.specialty || '内科',
        hospital: doctorData.hospital || '医院',
        avatar: doctorData.avatar || 'https://via.placeholder.com/40/2E86C1/FFFFFF?text=医',
        consultations: doctorData.consultations || 0,
        rating: doctorData.rating || 4.9
      };
    }
    // 默认医生信息
    return {
      name: '张医生',
      title: '主治医师',
      department: '内科',
      hospital: '医院',
      avatar: 'https://via.placeholder.com/40/2E86C1/FFFFFF?text=张',
      consultations: 1280,
      rating: 4.9
    };
  };

  const [doctorInfo] = useState(getDoctorInfo());

  const flatListRef = useRef<FlatList>(null);

  // {{ AURA-X: Modify - 使用WebSocket进行真实的聊天初始化. Approval: 替换模拟聊天为真实WebSocket通信. }}
  // 组件挂载时获取用户信息和初始化WebSocket连接
  useEffect(() => {
    initializeWebSocketChat();

    // 组件卸载时断开连接
    return () => {
      websocketManager.disconnect();
    };
  }, []);

  // 初始化WebSocket聊天
  const initializeWebSocketChat = async () => {
    try {
      // 从AsyncStorage获取用户信息
      await loadUserInfo();

      // 生成用户ID（实际项目中应该从用户登录信息获取）
      const userId = await generateOrGetUserId();
      const doctorId = doctorInfo.name; // 使用医生名称作为ID，实际项目中应该使用真实的医生ID
      const chatId = `chat_${userId}_${doctorId}`;

      setCurrentChatId(chatId);

      // 设置WebSocket事件监听器
      websocketManager.setEventListeners({
        onConnect: () => {

          setIsConnected(true);
          setConnectionStatus('connected');
        },
        onDisconnect: () => {

          setIsConnected(false);
          setConnectionStatus('disconnected');
        },
        onMessage: (message: ChatMessage) => {

          setMessages(prev => [...prev, message]);
          // 自动滚动到底部
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }, 100);
        },
        onError: (error: string) => {
          console.error('WebSocket错误:', error);
          Alert.alert('连接错误', error);
        },
        onStatusChange: (status: ConnectionStatus) => {
          setConnectionStatus(status);
          setIsConnected(status === 'connected');
        },
        onDoctorStatusChange: (doctorId: string, isOnline: boolean) => {
          console.log(`医生${doctorId}状态变更:`, isOnline ? '在线' : '离线');
        }
      });

      // 建立WebSocket连接
      await websocketManager.connect(userId, doctorId, userInfo.userName);

    } catch (error) {
      console.error('初始化WebSocket聊天失败:', error);
      Alert.alert('连接失败', '无法连接到服务器，请检查网络');
    }
  };

  // 生成或获取用户ID
  const generateOrGetUserId = async (): Promise<string> => {
    try {
      let userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await AsyncStorage.setItem('userId', userId);
      }
      return userId;
    } catch (error) {
      console.error('获取用户ID失败:', error);
      return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
  };

  // 从导航参数或AsyncStorage加载用户信息
  const loadUserInfo = async () => {
    try {
      // 优先使用从导航传递的参数
      const navParams = route?.params;
      console.log('导航参数:', navParams);

      let userName = '';
      let userAvatar = '';

      if (navParams?.username) {
        userName = navParams.username;

        // 处理头像参数
        if (navParams.userAvatar) {
          // 如果传递的是require对象（本地图片），转换为local_default标识符
          if (typeof navParams.userAvatar === 'object' && navParams.userAvatar !== null) {
            userAvatar = AvatarUtils.getDefaultAvatarIdentifier();
          } else if (typeof navParams.userAvatar === 'string') {
            userAvatar = navParams.userAvatar;
          } else {
            userAvatar = AvatarUtils.getDefaultAvatarIdentifier();
          }
        } else {
          userAvatar = AvatarUtils.getDefaultAvatarIdentifier();
        }

        // 保存到AsyncStorage供后续使用
        await AsyncStorage.setItem('userName', userName);
        await AsyncStorage.setItem('userAvatar', userAvatar);

        setUserInfo({ userName, userAvatar });
        return;
      }

      // 如果没有导航参数，从AsyncStorage获取
      const storedUserName = await AsyncStorage.getItem('userName');
      const storedUserAvatar = await AsyncStorage.getItem('userAvatar');

      if (storedUserName) {
        setUserInfo({
          userName: storedUserName,
          userAvatar: storedUserAvatar || AvatarUtils.getDefaultAvatarIdentifier(),
        });
      } else {
        // 如果都没有，设置默认值并存储
        const defaultUser = {
          userName: '甜甜',
          userAvatar: AvatarUtils.getDefaultAvatarIdentifier(),
        };

        await AsyncStorage.setItem('userName', defaultUser.userName);
        await AsyncStorage.setItem('userAvatar', defaultUser.userAvatar);

        setUserInfo(defaultUser);
      }
    } catch (error) {
      console.error('加载用户信息失败:', error);
      setUserInfo({
        userName: '甜甜',
        userAvatar: AvatarUtils.getDefaultAvatarIdentifier()
      });
    }
  };

  // {{ AURA-X: Modify - 使用WebSocket发送真实消息. Approval: 替换模拟发送为真实WebSocket通信. }}
  // 发送消息
  const sendMessage = async () => {
    if (inputText.trim() === '' || !websocketManager.isConnected()) {
      if (!websocketManager.isConnected()) {
        Alert.alert('连接失败', '请等待连接建立后再发送消息');
      }
      return;
    }

    const messageText = inputText.trim();
    const tempMessageId = `temp_${Date.now()}`;

    // 创建临时消息显示在界面
    const tempMessage: Message = {
      id: tempMessageId,
      text: messageText,
      timestamp: new Date(),
      isFromUser: true,
      userName: userInfo.userName,
      userAvatar: userInfo.userAvatar,
      status: 'sending',
      chatId: currentChatId,
    };

    // 清空输入框
    setInputText('');

    // 添加临时消息到界面
    setMessages(prev => [...prev, tempMessage]);

    // 滚动到底部
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      // 通过WebSocket发送消息
      const realMessageId = await websocketManager.sendChatMessage(messageText, userInfo.userName);

      // 更新消息状态为已发送，并使用真实的消息ID
      setMessages(prev =>
        prev.map(msg =>
          msg.id === tempMessageId
            ? { ...msg, id: realMessageId, status: 'sent' }
            : msg
        )
      );

      console.log('消息发送成功:', realMessageId);

    } catch (error) {
      console.error('发送消息失败:', error);

      // 更新消息状态为失败
      setMessages(prev =>
        prev.map(msg =>
          msg.id === tempMessageId
            ? { ...msg, status: 'failed' }
            : msg
        )
      );

      Alert.alert('发送失败', '消息发送失败，请重试');
    }
  };

  // {{ AURA-X: Add - 重试发送失败的消息. Approval: 错误处理机制需求. }}
  const retryFailedMessage = async (failedMessage: Message) => {
    if (!websocketManager.isConnected()) {
      Alert.alert('连接失败', '请等待连接建立后再重试');
      return;
    }

    // 更新消息状态为发送中
    setMessages(prev =>
      prev.map(msg =>
        msg.id === failedMessage.id
          ? { ...msg, status: 'sending' }
          : msg
      )
    );

    try {
      // 重新发送消息
      const newMessageId = await websocketManager.sendChatMessage(failedMessage.text, failedMessage.userName);

      // 更新消息状态为已发送，并使用新的消息ID
      setMessages(prev =>
        prev.map(msg =>
          msg.id === failedMessage.id
            ? { ...msg, id: newMessageId, status: 'sent' }
            : msg
        )
      );

      console.log('消息重发成功:', newMessageId);

    } catch (error) {
      console.error('消息重发失败:', error);

      // 恢复失败状态
      setMessages(prev =>
        prev.map(msg =>
          msg.id === failedMessage.id
            ? { ...msg, status: 'failed' }
            : msg
        )
      );

      Alert.alert('重发失败', '消息重发失败，请稍后再试');
    }
  };

  // 格式化时间
  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 60000) { // 1分钟内
      return '刚刚';
    } else if (diff < 3600000) { // 1小时内
      return `${Math.floor(diff / 60000)}分钟前`;
    } else if (diff < 86400000) { // 24小时内
      return `${Math.floor(diff / 3600000)}小时前`;
    } else {
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString().slice(0, 5);
    }
  };

  // 渲染消息项
  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[
      styles.messageContainer,
      item.isFromUser ? styles.userMessageContainer : styles.doctorMessageContainer
    ]}>
      {!item.isFromUser && (
        <View style={styles.doctorHeader}>
          {doctorInfo.avatar && doctorInfo.avatar.startsWith('http') ? (
            <Image
              source={{ uri: doctorInfo.avatar }}
              style={styles.avatar}
            />
          ) : (
            <View style={[styles.avatar, styles.emojiAvatar]}>
              <Text style={styles.emojiText}>{doctorInfo.avatar || '👨‍⚕️'}</Text>
            </View>
          )}
          <View style={styles.doctorInfo}>
            <Text style={styles.doctorName}>{doctorInfo.name}</Text>
            <Text style={styles.doctorTitle}>
              {doctorInfo.title} · {doctorInfo.department}
              {doctorInfo.hospital && doctorInfo.hospital !== '医院' && (
                <Text> · {doctorInfo.hospital}</Text>
              )}
            </Text>
            {(doctorInfo.consultations > 0 || doctorInfo.rating > 0) && (
              <Text style={styles.doctorStats}>
                已接诊{doctorInfo.consultations}次 · ⭐{doctorInfo.rating}分
              </Text>
            )}
          </View>
        </View>
      )}

      <View style={[
        styles.messageBubble,
        item.isFromUser ? styles.userBubble : styles.doctorBubble
      ]}>
        <Text style={[
          styles.messageText,
          item.isFromUser ? styles.userText : styles.doctorText
        ]}>
          {item.text}
        </Text>

        <View style={styles.messageFooter}>
          <Text style={[
            styles.timeText,
            item.isFromUser ? styles.userTimeText : styles.doctorTimeText
          ]}>
            {formatTime(item.timestamp)}
          </Text>

          {item.isFromUser && (
            <View style={styles.statusContainer}>
              {item.status === 'sending' && (
                <Text style={styles.statusText}>发送中...</Text>
              )}
              {item.status === 'sent' && (
                <Text style={styles.statusText}>已发送</Text>
              )}
              {item.status === 'failed' && (
                <TouchableOpacity onPress={() => retryFailedMessage(item)}>
                  <Text style={styles.failedText}>发送失败 - 点击重试</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </View>

      {item.isFromUser && (
        <Image
          source={AvatarUtils.getAvatarSource(userInfo.userAvatar)}
          style={[styles.avatar, styles.userAvatar]}
        />
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
    >
      <StatusBar barStyle="light-content" backgroundColor="#2E86C1" />

      {/* 头部导航 */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>在线问诊</Text>
          <Text style={styles.headerSubtitle}>
            {connectionStatus === 'connected' && '医生在线'}
            {connectionStatus === 'connecting' && '连接中...'}
            {connectionStatus === 'reconnecting' && '重新连接中...'}
            {connectionStatus === 'disconnected' && '连接已断开'}
            {connectionStatus === 'error' && '连接失败'}
          </Text>
        </View>

        <TouchableOpacity style={styles.moreButton}>
          <Text style={styles.moreButtonText}>⋮</Text>
        </TouchableOpacity>
      </View>

      {/* {{ AURA-X: Modify - 根据WebSocket连接状态显示不同提示信息. Approval: 优化用户体验. }} */}
      {/* 连接状态提示 */}
      {connectionStatus !== 'connected' && (
        <View style={[
          styles.connectionBanner,
          connectionStatus === 'error' && styles.errorBanner,
          connectionStatus === 'connecting' && styles.connectingBanner
        ]}>
          <Text style={[
            styles.connectionText,
            connectionStatus === 'error' && styles.errorText
          ]}>
            {connectionStatus === 'connecting' && '正在连接到医生...'}
            {connectionStatus === 'reconnecting' && '网络连接不稳定，正在重新连接...'}
            {connectionStatus === 'disconnected' && '连接已断开，请检查网络'}
            {connectionStatus === 'error' && '连接失败，请重试'}
          </Text>
          {connectionStatus === 'error' && (
            <TouchableOpacity
              style={styles.retryButton}
              onPress={initializeWebSocketChat}
            >
              <Text style={styles.retryButtonText}>重试连接</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* 消息列表 */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {/* 输入区域 */}
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="请描述您的症状..."
            placeholderTextColor="#999"
            multiline
            maxLength={500}
            returnKeyType="send"
            onSubmitEditing={sendMessage}
            blurOnSubmit={false}
          />

          <TouchableOpacity
            style={[
              styles.sendButton,
              (inputText.trim() === '' || !isConnected) ? styles.sendButtonDisabled : styles.sendButtonActive
            ]}
            onPress={sendMessage}
            disabled={inputText.trim() === '' || !isConnected}
          >
            <Text style={[
              styles.sendButtonText,
              (inputText.trim() === '' || !isConnected) ? styles.sendButtonTextDisabled : styles.sendButtonTextActive
            ]}>
              发送
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.inputHint}>
          {connectionStatus === 'connected' && '医生在线，为您提供专业医疗建议'}
          {connectionStatus === 'connecting' && '正在连接到医生...'}
          {connectionStatus === 'reconnecting' && '网络重连中，请稍候...'}
          {connectionStatus === 'disconnected' && '连接已断开，无法发送消息'}
          {connectionStatus === 'error' && '连接失败，请点击上方重试'}
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFE',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2E86C1',
    paddingTop: Platform.OS === 'ios' ? 44 : 25,
    paddingBottom: 12,
    paddingHorizontal: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#E8F4FD',
    fontSize: 12,
    marginTop: 2,
  },
  moreButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  connectionBanner: {
    backgroundColor: '#FFF3CD',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#FFEAA7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorBanner: {
    backgroundColor: '#F8D7DA',
    borderBottomColor: '#F5C6CB',
  },
  connectingBanner: {
    backgroundColor: '#D1ECF1',
    borderBottomColor: '#BEE5EB',
  },
  connectionText: {
    color: '#856404',
    fontSize: 14,
    textAlign: 'center',
    flex: 1,
  },
  errorText: {
    color: '#721C24',
  },
  retryButton: {
    backgroundColor: '#DC3545',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 8,
  },
  messageContainer: {
    marginBottom: 16,
  },
  userMessageContainer: {
    alignItems: 'flex-end',
  },
  doctorMessageContainer: {
    alignItems: 'flex-start',
  },
  doctorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
  },
  userAvatar: {
    marginRight: 0,
    marginLeft: 8,
  },
  emojiAvatar: {
    backgroundColor: '#E8F4FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiText: {
    fontSize: 20,
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E86C1',
  },
  doctorTitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  doctorStats: {
    fontSize: 11,
    color: '#27AE60',
    marginTop: 2,
    fontWeight: '500',
  },
  messageBubble: {
    maxWidth: width * 0.75,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  userBubble: {
    backgroundColor: '#2E86C1',
    borderBottomRightRadius: 4,
  },
  doctorBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#E8F4FD',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: '#FFFFFF',
  },
  doctorText: {
    color: '#333',
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  timeText: {
    fontSize: 12,
  },
  userTimeText: {
    color: '#E8F4FD',
  },
  doctorTimeText: {
    color: '#999',
  },
  statusContainer: {
    marginLeft: 8,
  },
  statusText: {
    fontSize: 12,
    color: '#E8F4FD',
  },
  failedText: {
    fontSize: 12,
    color: '#FF6B6B',
  },
  inputContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 34 : 12,
    borderTopWidth: 1,
    borderTopColor: '#E8F4FD',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#F8FAFE',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    maxHeight: 100,
    minHeight: 36,
    textAlignVertical: 'center',
  },
  sendButton: {
    marginLeft: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  sendButtonActive: {
    backgroundColor: '#2E86C1',
  },
  sendButtonDisabled: {
    backgroundColor: '#BDC3C7',
  },
  sendButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  sendButtonTextActive: {
    color: '#FFFFFF',
  },
  sendButtonTextDisabled: {
    color: '#7F8C8D',
  },
  inputHint: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
});

export default LineLiao; 