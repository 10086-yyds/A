// 环境变量配置
const config = {
  // 数据库配置
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb+srv://2732849023:kV2y2TU4cYPq6Y9C@cluster0.plvxg2d.mongodb.net/medical'
  },
  
  // 服务器配置
  server: {
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development'
  },
  
  // JWT配置
  jwt: {
    secret: process.env.JWT_SECRET || 'your_jwt_secret_key_here'
  },
  
  // API配置
  api: {
    key: process.env.API_KEY || 'your_api_key_here'
  }
};

module.exports = config; 