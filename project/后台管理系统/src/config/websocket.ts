// WebSocket配置文件
export const WebSocketConfig = {
  // 开发环境
  development: {
    serverUrl: 'http://localhost:3001',
    timeout: 20000,
    reconnectionAttempts: 5,
    reconnectionDelay: 3000,
  },

  // 测试环境
  test: {
    serverUrl: 'http://test-server:3001',
    timeout: 20000,
    reconnectionAttempts: 5,
    reconnectionDelay: 3000,
  },

  // 生产环境
  production: {
    serverUrl: 'https://your-domain.com:3001',
    timeout: 30000,
    reconnectionAttempts: 10,
    reconnectionDelay: 5000,
  },
}

// 获取当前环境配置
export function getWebSocketConfig() {
  const env = import.meta.env.MODE || 'development'
  return WebSocketConfig[env as keyof typeof WebSocketConfig] || WebSocketConfig.development
}

// 端口配置说明
export const PortConfig = {
  // 前端开发服务器 (React Native)
  frontendDev: 3000,

  // WebSocket服务器
  websocket: 3001,

  // 后端API服务器
  backendApi: 8080,

  // 后台管理系统
  adminPanel: 5173,
}

// 获取WebSocket服务器URL
export function getWebSocketUrl(): string {
  const config = getWebSocketConfig()
  return config.serverUrl
}

// 检查是否为本地开发环境
export function isLocalDevelopment(): boolean {
  return import.meta.env.MODE === 'development'
}

// 获取连接配置
export function getConnectionConfig() {
  const config = getWebSocketConfig()
  return {
    transports: ['websocket', 'polling'],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: config.reconnectionAttempts,
    reconnectionDelay: config.reconnectionDelay,
    timeout: config.timeout,
  }
}
