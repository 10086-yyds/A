var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { userModel } = require('../db/model');
const config = require('../config/config');

// 注册接口
router.post('/register', async (req, res) => {
  // {{ AURA-X: Add - 调试数据库连接和保存问题. Approved: 故障排查. }}
  console.log('📝 开始处理注册请求...');
  console.log('🔌 数据库连接状态:', mongoose.connection.readyState);
  console.log('🗄️ 连接的数据库:', mongoose.connection.name || 'undefined');
  
  try {
    const { username, password, email, phone } = req.body;

    // 基础验证
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: '用户名和密码不能为空'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: '密码至少6位'
      });
    }

    // 检查用户名是否已存在
    const existingUser = await userModel.findOne({ username });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: '用户名已存在'
      });
    }

    // 检查邮箱格式和是否已存在（如果提供了邮箱）
    if (email) {
      // 验证邮箱格式
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: '邮箱格式不正确'
        });
      }

      const existingEmail = await userModel.findOne({ email });
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: '邮箱已被注册'
        });
      }
    }

    // 检查手机号格式和是否已存在（如果提供了手机号）
    if (phone) {
      // 验证手机号格式
      const phoneRegex = /^1[3-9]\d{9}$/;
      if (!phoneRegex.test(phone)) {
        return res.status(400).json({
          success: false,
          message: '手机号格式不正确'
        });
      }

      const existingPhone = await userModel.findOne({ phone });
      if (existingPhone) {
        return res.status(400).json({
          success: false,
          message: '手机号已被注册'
        });
      }
    }

    // 密码加密
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 创建用户
    const userData = {
      username,
      password: hashedPassword
    };

    // 只有提供了email和phone时才添加到用户数据中
    if (email) userData.email = email;
    if (phone) userData.phone = phone;

    const newUser = new userModel(userData);
    
    // {{ AURA-X: Add - 详细保存日志用于调试. Approved: 故障排查. }}
    console.log('准备保存用户数据:', {
      username: userData.username,
      hasEmail: !!userData.email,
      hasPhone: !!userData.phone,
      passwordLength: userData.password ? userData.password.length : 0
    });
    
    console.log('数据库连接状态:', mongoose.connection.readyState); // 1=连接, 0=断开
    console.log('当前数据库名:', mongoose.connection.name);
    console.log('目标集合名:', userModel.collection.name);
    
    try {
      const savedUser = await newUser.save();
      console.log('✅ 用户保存成功:', {
        id: savedUser._id,
        username: savedUser.username,
        createdAt: savedUser.createdAt
      });
      
      // 验证数据是否真的被保存了
      const verifyUser = await userModel.findById(savedUser._id);
      if (verifyUser) {
        console.log('✅ 数据库验证成功 - 用户确实存在于数据库中');
      } else {
        console.error('❌ 数据库验证失败 - 保存的用户在数据库中找不到!');
      }
      
    } catch (saveError) {
      console.error('❌ 用户保存失败:', saveError.message);
      console.error('验证错误详情:', saveError.errors || 'no validation errors');
      console.error('错误堆栈:', saveError.stack);
      throw saveError; // 重新抛出错误
    }

    // 返回成功响应（不包含密码）
    const userResponse = {
      id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      phone: newUser.phone,
      createdAt: newUser.createdAt
    };

    res.status(201).json({
      success: true,
      message: '注册成功',
      data: userResponse
    });

  } catch (error) {
    // {{ AURA-X: Add - 临时添加错误日志用于调试. Approved: 故障排查. }}
    console.error('❌ 用户注册过程中发生错误:');
    console.error('错误类型:', error.constructor.name);
    console.error('错误消息:', error.message);
    console.error('数据库连接状态:', mongoose.connection.readyState);
    console.error('MongoDB错误代码:', error.code || 'none');
    console.error('错误堆栈:', error.stack);
    
    // 检查是否是MongoDB相关错误
    if (error.code === 11000) {
      console.error('重复键错误 - 用户名、邮箱或手机号已存在');
    }
    
    res.status(500).json({
      success: false,
      message: '服务器内部错误: ' + error.message
    });
  }
});

// 登录接口
router.post('/login', async (req, res) => {
  // {{ AURA-X: Add - 添加登录调试日志. Approved: 故障排查. }}
  console.log('🔐 开始处理登录请求...');
  console.log('请求数据:', { username: req.body.username, hasPassword: !!req.body.password });

  try {
    const { username, password } = req.body;

    // 基础验证
    if (!username || !password) {
      console.log('❌ 基础验证失败: 用户名或密码为空');
      return res.status(400).json({
        success: false,
        message: '用户名和密码不能为空'
      });
    }

    // 查找用户 - 需要显式包含密码字段用于验证
    console.log('🔍 查找用户:', username);
    const user = await userModel.findOne({ username }).select('+password');
    if (!user) {
      console.log('❌ 用户不存在:', username);
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误'
      });
    }

    console.log('✅ 找到用户:', {
      id: user._id,
      username: user.username,
      isActive: user.isActive,
      hasPassword: !!user.password
    });

    // {{ AURA-X: Modify - 修复用户状态检查. Approved: 数据一致性修复. }}
    // 检查用户状态
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: '账号已被禁用，请联系管理员'
      });
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误'
      });
    }

    // 更新最后登录时间
    user.lastLoginTime = new Date();
    await user.save();

    // 生成JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        username: user.username
      },
      config.jwt.secret,
      { expiresIn: '7d' }
    );

    // 返回成功响应
    const userResponse = {
      id: user._id,
      username: user.username,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      lastLoginTime: user.lastLoginTime
    };

    res.status(200).json({
      success: true,
      message: '登录成功',
      data: {
        user: userResponse,
        token: token
      }
    });

  } catch (error) {
    // 已移除调试日志
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 获取用户信息接口
router.get('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: '请先登录'
      });
    }

    // 验证token
    const decoded = jwt.verify(token, config.jwt.secret);
    const user = await userModel.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });

  } catch (error) {

    res.status(401).json({
      success: false,
      message: 'token无效'
    });
  }
});

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

module.exports = router;
