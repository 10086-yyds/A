import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  FlatList,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import webSocketService, { ChatMessage } from '../../utils/websocket';

const PatientChat = ({ navigation }: any) => {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentPatient] = useState({
    userId: 'patient_001',
    userName: '李患者',
    doctorId: 'doctor_001',
  });

  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    initWebSocket();
    return () => {
      webSocketService.disconnect();
    };
  }, []);

  const initWebSocket = () => {
    // 设置连接参数
    webSocketService.setConnectionParams({
      userId: currentPatient.userId,
      doctorId: currentPatient.doctorId,
      userName: currentPatient.userName,
    });

    // 连接WebSocket服务器
    webSocketService.connect();

    // 监听连接状态变化
    webSocketService.onConnectionChange((connected) => {
      setIsConnected(connected);
      if (connected) {
        console.log('WebSocket连接成功');
      } else {
        console.log('WebSocket连接断开');
      }
    });

    // 监听消息接收
    webSocketService.onMessageReceived((message) => {
      console.log('收到消息:', message);
      setMessages(prev => [...prev, message]);
    });

    // 监听错误
    webSocketService.onError((error) => {
      console.error('WebSocket错误:', error);
      Alert.alert('连接错误', error);
    });
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !isConnected) return;

    const success = webSocketService.sendMessage(newMessage);
    
    if (success) {
      // 添加到本地消息列表
      const newChatMessage: ChatMessage = {
        messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: currentPatient.userId,
        doctorId: currentPatient.doctorId,
        userName: currentPatient.userName,
        doctorName: '张医生',
        message: newMessage,
        chatId: `chat_patient_001_doctor_001`, // 使用固定的chatId，与WebSocket服务器匹配
        timestamp: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, newChatMessage]);
      setNewMessage('');
    } else {
      Alert.alert('发送失败', '消息发送失败，请检查网络连接');
    }
  };

  const reconnect = () => {
    webSocketService.disconnect();
    setTimeout(() => {
      initWebSocket();
    }, 1000);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isMyMessage = item.userId === currentPatient.userId;
    
    return (
      <View style={[styles.messageContainer, isMyMessage ? styles.myMessage : styles.otherMessage]}>
        <View style={[styles.messageBubble, isMyMessage ? styles.myBubble : styles.otherBubble]}>
          <Text style={[styles.messageText, isMyMessage ? styles.myText : styles.otherText]}>
            {item.message}
          </Text>
          <Text style={[styles.messageTime, isMyMessage ? styles.myTime : styles.otherTime]}>
            {formatTime(item.timestamp)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFE" />
      
      {/* 顶部导航栏 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← 返回</Text>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>张医生</Text>
          <View style={styles.connectionStatus}>
            <View style={[styles.statusDot, isConnected ? styles.connected : styles.disconnected]} />
            <Text style={styles.statusText}>
              {isConnected ? '已连接' : '连接中...'}
            </Text>
          </View>
        </View>
        <TouchableOpacity onPress={reconnect} style={styles.reconnectButton}>
          <Text style={styles.reconnectText}>重连</Text>
        </TouchableOpacity>
      </View>

      {/* 消息列表 */}
      <KeyboardAvoidingView 
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.messageId}
          style={styles.messageList}
          contentContainerStyle={styles.messageListContent}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          showsVerticalScrollIndicator={false}
        />

        {/* 输入区域 */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="输入消息..."
            placeholderTextColor="#999"
            multiline
            maxLength={500}
            editable={isConnected}
          />
          <TouchableOpacity
            style={[styles.sendButton, (!newMessage.trim() || !isConnected) && styles.sendButtonDisabled]}
            onPress={sendMessage}
            disabled={!newMessage.trim() || !isConnected}
          >
            <Text style={[styles.sendButtonText, (!newMessage.trim() || !isConnected) && styles.sendButtonTextDisabled]}>
              发送
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  backText: {
    fontSize: 16,
    color: '#3B82F6',
  },
  headerInfo: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  connected: {
    backgroundColor: '#10B981',
  },
  disconnected: {
    backgroundColor: '#EF4444',
  },
  statusText: {
    fontSize: 12,
    color: '#6B7280',
  },
  reconnectButton: {
    padding: 8,
  },
  reconnectText: {
    fontSize: 14,
    color: '#3B82F6',
  },
  chatContainer: {
    flex: 1,
  },
  messageList: {
    flex: 1,
  },
  messageListContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  messageContainer: {
    marginVertical: 4,
  },
  myMessage: {
    alignItems: 'flex-end',
  },
  otherMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  myBubble: {
    backgroundColor: '#3B82F6',
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  myText: {
    color: '#fff',
  },
  otherText: {
    color: '#1F2937',
  },
  messageTime: {
    fontSize: 12,
    marginTop: 4,
  },
  myTime: {
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'right',
  },
  otherTime: {
    color: '#9CA3AF',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  textInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    fontSize: 16,
    color: '#1F2937',
    marginRight: 12,
  },
  sendButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
  },
  sendButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  sendButtonTextDisabled: {
    color: '#9CA3AF',
  },
});

export default PatientChat; 