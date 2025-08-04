import { Platform } from 'react-native';

// WebSocket调试工具
export class WebSocketDebugger {
  private ws: WebSocket | null = null;
  private isConnected = false;
  private debugLogs: string[] = [];

  // 添加调试日志
  private addLog(message: string) {
    const timestamp = new Date().toLocaleTimeString();
    const log = `[${timestamp}] ${message}`;
    this.debugLogs.push(log);
    console.log(log);
  }

  // 获取调试日志
  getLogs(): string[] {
    return [...this.debugLogs];
  }

  // 清空日志
  clearLogs() {
    this.debugLogs = [];
  }

  // 测试连接
  async testConnection(): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        // 尝试多种连接地址
        const hosts = [
          '10.0.2.2',    // Android模拟器默认
          'localhost',   // iOS模拟器
          '127.0.0.1',   // 本地回环
        ];

        let currentHostIndex = 0;
        let testNextHost = () => {
          if (currentHostIndex >= hosts.length) {
            this.addLog('所有连接地址都测试失败');
            resolve(false);
            return;
          }

          const host = hosts[currentHostIndex];
          const url = `ws://${host}:8080/chat?test=true`;
          
          this.addLog(`尝试连接: ${url}`);
          
          this.ws = new WebSocket(url);
          
          // 设置超时
          const timeout = setTimeout(() => {
            this.addLog(`连接超时: ${host}`);
            this.ws?.close();
            currentHostIndex++;
            testNextHost();
          }, 5000);

          this.ws.onopen = () => {
            clearTimeout(timeout);
            this.addLog(`✅ 连接成功: ${host}`);
            this.isConnected = true;
            this.ws?.close();
            resolve(true);
          };

          this.ws.onerror = (error) => {
            clearTimeout(timeout);
            this.addLog(`❌ 连接失败: ${host} - ${error}`);
            currentHostIndex++;
            testNextHost();
          };

          this.ws.onclose = () => {
            clearTimeout(timeout);
            if (!this.isConnected) {
              this.addLog(`连接关闭: ${host}`);
              currentHostIndex++;
              testNextHost();
            }
          };
        };

        testNextHost();
      } catch (error) {
        this.addLog(`连接异常: ${error}`);
        resolve(false);
      }
    });
  }

  // 检查网络连接
  async checkNetworkConnectivity(): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        // 尝试HTTP连接来检查网络
        const testUrl = 'http://10.0.2.2:3000';
        this.addLog(`检查网络连接: ${testUrl}`);
        
        fetch(testUrl, { method: 'HEAD' })
          .then(() => {
            this.addLog('✅ 网络连接正常');
            resolve(true);
          })
          .catch((error) => {
            this.addLog(`❌ 网络连接失败: ${error.message}`);
            resolve(false);
          });
      } catch (error) {
        this.addLog(`网络检查异常: ${error}`);
        resolve(false);
      }
    });
  }

  // 获取系统信息
  getSystemInfo() {
    return {
      platform: Platform.OS,
      version: Platform.Version,
      isConnected: this.isConnected,
      logs: this.debugLogs,
    };
  }
}

// 创建单例实例
const webSocketDebugger = new WebSocketDebugger();
export default webSocketDebugger; 