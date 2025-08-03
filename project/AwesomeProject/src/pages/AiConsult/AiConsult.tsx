import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { AiChatWebView } from '../../components';

const AiConsult = ({ navigation }: any) => {
  // {{ AURA-X: Add - 添加聊天状态管理. Approval: 用户体验优化需求. }}
  const [chatStatus, setChatStatus] = useState('loading'); // loading, opened, failed
  const [showLayoutTip, setShowLayoutTip] = useState(false); // 是否显示布局提示
  
  // {{ AURA-X: Modify - 敲敲云AI配置，设置为全屏模式. Approval: 用户要求直接进入敲敲云. }}
  const QIAOQIAO_AI_CONFIG = {
    appId: "1942970055310536706", // 您的敲敲云应用ID
    iconPosition: "hidden" as const, // 隐藏图标，直接全屏显示
  };

  // {{ AURA-X: Modify - 处理敲敲云AI消息，增加状态处理. Approval: AI消息处理需求. }}
  const handleQiaoQiaoMessage = (message: any) => {
    console.log('📨 收到敲敲云AI消息:', message);
    
    try {
      const parsedMessage = typeof message === 'string' ? JSON.parse(message) : message;
      
      switch (parsedMessage.type) {
        case 'chat_opened':
          console.log('✅ 聊天已自动打开');
          setChatStatus('opened');
          // 3秒后显示布局提示（如果用户遇到布局问题）
          setTimeout(() => {
            setShowLayoutTip(true);
          }, 3000);
          break;
        case 'auto_open_failed':
          console.log('❌ 自动打开失败');
          setChatStatus('failed');
          Alert.alert(
            '提示', 
            parsedMessage.message || '请点击右下角图标开始对话',
            [{ text: '知道了' }]
          );
          break;
        case 'page_loaded':
          console.log('📄 页面已加载');
          // 页面加载完成，但聊天可能还未打开
          break;
        default:
          // 处理其他敲敲云消息
          break;
      }
    } catch (error) {
      console.error('消息解析失败:', error);
    }
  };

  // {{ AURA-X: Add - 刷新AI功能. Approval: 用户体验需求. }}
  const refreshAI = () => {
    Alert.alert('刷新AI', '是否重新加载敲敲云AI？', [
      { text: '取消', style: 'cancel' },
      { 
        text: '确定', 
        onPress: () => {
          setChatStatus('loading'); // 重置状态
          // 通过重新渲染组件来刷新WebView
          navigation.replace('AiConsult');
        }
      }
    ]);
  };

  // {{ AURA-X: Add - 获取状态文本. Approval: 用户反馈优化. }}
  const getStatusText = () => {
    switch (chatStatus) {
      case 'loading':
        return '正在连接敲敲云AI...';
      case 'opened':
        return '已连接 - 开始对话吧！';
      case 'failed':
        return '请点击右下角图标开始';
      default:
        return '敲敲云智能助手';
    }
  };

  // {{ AURA-X: Add - 隐藏布局提示. Approval: 用户体验优化. }}
  const hideLayoutTip = () => {
    setShowLayoutTip(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFE" />
      
      {/* {{ AURA-X: Modify - 顶部导航栏，添加状态显示. Approval: 页面导航需求. }} */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>AI极速问诊</Text>
          <Text style={[
            styles.headerSubtitle,
            chatStatus === 'opened' && styles.headerSubtitleSuccess,
            chatStatus === 'failed' && styles.headerSubtitleError
          ]}>
            {getStatusText()}
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.moreButton} 
          activeOpacity={0.7}
          onPress={refreshAI}
        >
          <Text style={styles.moreIcon}>🔄</Text>
        </TouchableOpacity>
      </View>

      {/* {{ AURA-X: Add - 敲敲云AI WebView界面. Approval: 直接使用敲敲云AI. }} */}
      <View style={styles.webviewContainer}>
        <AiChatWebView
          appId={QIAOQIAO_AI_CONFIG.appId}
          iconPosition={QIAOQIAO_AI_CONFIG.iconPosition}
          onMessage={handleQiaoQiaoMessage}
          style={styles.aiWebView}
        />
      </View>
      
      {/* {{ AURA-X: Add - 底部提示区域. Approval: 用户引导需求. }} */}
      {chatStatus === 'failed' && (
        <View style={styles.bottomTip}>
          <Text style={styles.tipIcon}>💡</Text>
          <Text style={styles.tipText}>
            如果无法自动进入，请点击右下角的聊天图标开始对话
          </Text>
        </View>
      )}
      
      {/* {{ AURA-X: Add - 布局问题提示. Approval: 解决输入框超出屏幕问题. }} */}
      {showLayoutTip && (
        <View style={styles.layoutTip}>
          <View style={styles.layoutTipHeader}>
            <Text style={styles.tipIcon}>📱</Text>
            <Text style={styles.layoutTipTitle}>移动端布局优化</Text>
            <TouchableOpacity onPress={hideLayoutTip} style={styles.closeTipButton}>
              <Text style={styles.closeTipText}>×</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.layoutTipText}>
            如果输入框超出屏幕，可以尝试：{'\n'}
            • 横屏使用获得更好体验{'\n'}
            • 刷新页面重新加载{'\n'}
            • 点击输入框时会自动调整
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

// {{ AURA-X: Modify - 简化样式定义，只保留敲敲云AI相关样式. Approval: 代码简化需求. }}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFE',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E8F4FD',
    elevation: 2,
    shadowColor: '#2E86C1',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: '#2E86C1',
    fontWeight: 'bold',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B4F72',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  headerSubtitleSuccess: {
    color: '#4CAF50', // 绿色
  },
  headerSubtitleError: {
    color: '#F44336', // 红色
  },
  moreButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreIcon: {
    fontSize: 20,
    color: '#2E86C1',
    fontWeight: 'bold',
  },
  webviewContainer: {
    flex: 1,
    backgroundColor: '#F8FAFE',
  },
  aiWebView: {
    flex: 1,
  },
  bottomTip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F2F7',
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginTop: 10,
    borderRadius: 8,
    alignSelf: 'center',
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  tipIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#333',
    flexShrink: 1,
  },
  layoutTip: {
    backgroundColor: '#E8F4FD',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    borderWidth: 1,
    borderColor: '#B3D9F2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  layoutTipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  layoutTipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1B4F72',
    flex: 1,
    marginLeft: 8,
  },
  closeTipButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#BDC3C7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeTipText: {
    fontSize: 18,
    color: '#666',
    fontWeight: 'bold',
  },
  layoutTipText: {
    fontSize: 14,
    color: '#2E86C1',
    lineHeight: 20,
  },
});

export default AiConsult; 