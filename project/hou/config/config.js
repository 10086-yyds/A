// 环境变量配置
const config = {
  // {{ AURA-X: Modify - 移除硬编码数据库连接字符串. Approved: 安全修复. }}
  // 数据库配置
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/medical'
  },

  // 服务器配置
  server: {
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development'
  },

  // {{ AURA-X: Modify - 强化JWT密钥配置. Approved: 安全修复. }}
  // JWT配置
  jwt: {
    secret: process.env.JWT_SECRET || (() => {
      const crypto = require('crypto');
      return crypto.randomBytes(32).toString('hex');
    })()
  },

  // {{ AURA-X: Modify - 强化API密钥配置. Approved: 安全修复. }}
  // API配置
  api: {
    key: process.env.API_KEY || (() => {
      const crypto = require('crypto');
      return crypto.randomBytes(16).toString('hex');
    })()
  }
};

module.exports = config; 