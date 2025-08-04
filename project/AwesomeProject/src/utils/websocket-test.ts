import { Platform } from 'react-native';

// 简单的WebSocket连接测试
export class WebSocketTest {
  private ws: WebSocket | null = null;

  // 测试连接
  async testConnection(): Promise<{ success: boolean; error?: string; url?: string }> {
    return new Promise((resolve) => {
      try {
        // 确定连接地址
        let wsHost;
        if (Platform.OS === 'android') {
          // Android模拟器尝试多种地址
          wsHost = '192.168.33.60'; // 使用宿主机的实际IP地址
        } else {
          // iOS模拟器
          wsHost = 'localhost';
        }
        const wsPort = 8082;
        const url = `ws://${wsHost}:${wsPort}/chat?test=true`;
        
        console.log('测试WebSocket连接:', url);
        
        this.ws = new WebSocket(url);
        
        // 设置超时
        const timeout = setTimeout(() => {
          this.ws?.close();
          resolve({ success: false, error: '连接超时', url });
        }, 5000);
        
        this.ws.onopen = () => {
          clearTimeout(timeout);
          console.log('✅ WebSocket连接成功:', url);
          this.ws?.close();
          resolve({ success: true, url });
        };
        
        this.ws.onerror = (error) => {
          clearTimeout(timeout);
          console.log('❌ WebSocket连接失败:', error);
          resolve({ success: false, error: '连接失败', url });
        };
        
        this.ws.onclose = (event) => {
          clearTimeout(timeout);
          console.log('WebSocket连接关闭:', event.code, event.reason);
          resolve({ success: false, error: `连接关闭: ${event.code}`, url });
        };
        
      } catch (error) {
        resolve({ success: false, error: `连接异常: ${error}`, url: 'unknown' });
      }
    });
  }

  // 检查网络连接
  async checkNetwork(): Promise<{ success: boolean; error?: string }> {
    return new Promise((resolve) => {
      try {
        const testUrl = Platform.OS === 'android' ? 'http://192.168.33.60:3000' : 'http://localhost:3000';
        console.log('检查网络连接:', testUrl);
        
        fetch(testUrl, { method: 'HEAD' })
          .then(() => {
            console.log('✅ 网络连接正常');
            resolve({ success: true });
          })
          .catch((error) => {
            console.log('❌ 网络连接失败:', error.message);
            resolve({ success: false, error: error.message });
          });
      } catch (error) {
        resolve({ success: false, error: `网络检查异常: ${error}` });
      }
    });
  }

  // 获取系统信息
  getSystemInfo() {
    return {
      platform: Platform.OS,
      version: Platform.Version,
    };
  }
}

// 创建单例实例
const webSocketTest = new WebSocketTest();
export default webSocketTest; 