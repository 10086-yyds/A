import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Alert,
} from 'react-native';
import webSocketTest from '../../utils/websocket-test';

const WebSocketDebug = ({ navigation }: any) => {
  const [logs, setLogs] = useState<string[]>([]);
  const [isTesting, setIsTesting] = useState(false);
  const [systemInfo, setSystemInfo] = useState<any>(null);

  useEffect(() => {
    updateLogs();
    setSystemInfo(webSocketTest.getSystemInfo());
  }, []);

  const updateLogs = () => {
    // 简单测试不需要保存日志
    setLogs([]);
  };

  const testConnection = async () => {
    setIsTesting(true);
    
    try {
      // 检查网络连接
      const networkResult = await webSocketTest.checkNetwork();
      
      if (!networkResult.success) {
        Alert.alert('网络问题', `无法连接到宿主机: ${networkResult.error}`);
        setIsTesting(false);
        return;
      }

      // 测试WebSocket连接
      const wsResult = await webSocketTest.testConnection();
      
      if (wsResult.success) {
        Alert.alert('连接成功', `WebSocket连接测试成功！\n连接地址: ${wsResult.url}`);
      } else {
        Alert.alert('连接失败', `WebSocket连接测试失败: ${wsResult.error}\n尝试地址: ${wsResult.url}`);
      }
    } catch (error) {
      Alert.alert('测试错误', `测试过程中发生错误: ${error}`);
    } finally {
      setIsTesting(false);
    }
  };

  const clearLogs = () => {
    // 简单测试不需要清空日志
    updateLogs();
  };

  const startServer = () => {
    Alert.alert(
      '启动服务器',
      '请在终端中运行以下命令来启动WebSocket服务器：\n\ncd hou\nnode websocket-server.js',
      [{ text: '确定' }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFE" />
      
      {/* 头部 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← 返回</Text>
        </TouchableOpacity>
        <Text style={styles.title}>WebSocket调试</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* 系统信息 */}
      {systemInfo && (
        <View style={styles.systemInfo}>
          <Text style={styles.systemInfoTitle}>系统信息</Text>
          <Text style={styles.systemInfoText}>平台: {systemInfo.platform}</Text>
          <Text style={styles.systemInfoText}>版本: {systemInfo.version}</Text>
          <Text style={styles.systemInfoText}>连接状态: {systemInfo.isConnected ? '已连接' : '未连接'}</Text>
        </View>
      )}

      {/* 控制按钮 */}
      <View style={styles.controls}>
        <TouchableOpacity 
          style={[styles.button, styles.primaryButton]} 
          onPress={testConnection}
          disabled={isTesting}
        >
          <Text style={styles.buttonText}>
            {isTesting ? '测试中...' : '测试连接'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.secondaryButton]} 
          onPress={startServer}
        >
          <Text style={styles.buttonText}>启动服务器</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.clearButton]} 
          onPress={clearLogs}
        >
          <Text style={styles.buttonText}>清空日志</Text>
        </TouchableOpacity>
      </View>

      {/* 日志显示 */}
      <View style={styles.logsContainer}>
        <Text style={styles.logsTitle}>调试日志</Text>
        <ScrollView style={styles.logsScroll} showsVerticalScrollIndicator={false}>
          {logs.length === 0 ? (
            <Text style={styles.emptyLogs}>暂无日志</Text>
          ) : (
            logs.map((log, index) => (
              <View key={index} style={styles.logItem}>
                <Text style={styles.logText}>{log}</Text>
              </View>
            ))
          )}
        </ScrollView>
      </View>

      {/* 帮助信息 */}
      <View style={styles.helpContainer}>
        <Text style={styles.helpTitle}>故障排除</Text>
        <Text style={styles.helpText}>1. 确保WebSocket服务器正在运行</Text>
        <Text style={styles.helpText}>2. 检查端口8080是否被占用</Text>
        <Text style={styles.helpText}>3. 确认防火墙设置</Text>
        <Text style={styles.helpText}>4. 尝试重启模拟器</Text>
      </View>
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
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  systemInfo: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  systemInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  systemInfoText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  controls: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#3B82F6',
  },
  secondaryButton: {
    backgroundColor: '#10B981',
  },
  clearButton: {
    backgroundColor: '#6B7280',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  logsContainer: {
    flex: 1,
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  logsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  logsScroll: {
    flex: 1,
  },
  logItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  logText: {
    fontSize: 12,
    color: '#374151',
    fontFamily: 'monospace',
  },
  emptyLogs: {
    textAlign: 'center',
    color: '#9CA3AF',
    marginTop: 40,
    fontSize: 14,
  },
  helpContainer: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
});

export default WebSocketDebug; 