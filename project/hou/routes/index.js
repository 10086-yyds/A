var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* 健康检查API */
router.get('/health', function(req, res, next) {
  const dbStatus = mongoose.connection.readyState === 1 ? '连接正常' : '连接异常';
  res.json({
    status: 'success',
    message: '后端服务运行正常',
    timestamp: new Date().toISOString(),
    database: dbStatus,
    port: process.env.PORT || 3000
  });
});

/* 测试API */
router.get('/api/test', function(req, res, next) {
  res.json({
    success: true,
    message: '后端API连接成功！',
    data: {
      server: '医疗健康应用后端',
      version: '1.0.0',
      time: new Date().toLocaleString('zh-CN')
    }
  });
});

module.exports = router;
