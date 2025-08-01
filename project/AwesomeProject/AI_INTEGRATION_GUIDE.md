# 敲敲云AI集成指南

## 📖 概述

本指南详细介绍如何在"妙医在线"APP中集成敲敲云AI聊天服务，实现本地AI和云端AI的混合问诊模式。

## 🚀 功能特性

### 双AI模式
- **本地AI模式**: 基于预设规则的症状分析和建议
- **敲敲云AI模式**: 接入敲敲云AI平台的智能对话服务

### 智能切换
- 一键切换AI模式
- 保持会话连续性
- 实时状态指示

### 完整集成
- WebView无缝嵌入
- 消息双向通信
- 错误处理机制
- 加载状态展示

## 🔧 技术实现

### 1. 依赖安装
```bash
npm install react-native-webview
```

### 2. 核心组件

#### AiChatWebView 组件
```typescript
import { AiChatWebView } from '../components';

<AiChatWebView
  appId="1942970055310536706"
  iconPosition="bottom-right"
  onMessage={handleMessage}
  style={{ flex: 1 }}
/>
```

#### 混合AI页面结构
```typescript
// AI模式状态
const [aiMode, setAiMode] = useState<'local' | 'qiaoqiao'>('local');

// 根据模式显示不同界面
{aiMode === 'local' ? (
  // 本地AI聊天界面
  <LocalAiInterface />
) : (
  // 敲敲云AI WebView界面
  <AiChatWebView />
)}
```

## ⚙️ 配置说明

### 敲敲云AI配置
```typescript
const QIAOQIAO_AI_CONFIG = {
  appId: "1942970055310536706", // 您的应用ID
  iconPosition: "bottom-right" as const, // 图标位置
};
```

### 图标位置选项
- `"top-left"` - 左上角
- `"top-right"` - 右上角
- `"bottom-left"` - 左下角
- `"bottom-right"` - 右下角（推荐）

## 🎯 使用方法

### 1. 基础集成
```typescript
// 1. 导入组件
import { AiChatWebView } from '../../components';

// 2. 添加配置
const QIAOQIAO_AI_CONFIG = {
  appId: "YOUR_APP_ID", // 替换为您的应用ID
  iconPosition: "bottom-right" as const,
};

// 3. 使用组件
<AiChatWebView
  appId={QIAOQIAO_AI_CONFIG.appId}
  iconPosition={QIAOQIAO_AI_CONFIG.iconPosition}
  onMessage={(message) => {
    console.log('收到AI消息:', message);
  }}
/>
```

### 2. 消息处理
```typescript
const handleQiaoQiaoMessage = (message: any) => {
  switch (message.type) {
    case 'user_message':
      console.log('用户发送:', message.text);
      break;
    case 'ai_response':
      console.log('AI回复:', message.text);
      break;
    case 'session_start':
      console.log('会话开始');
      break;
    case 'session_end':
      console.log('会话结束');
      break;
    default:
      console.log('未知消息类型:', message);
  }
};
```

### 3. 错误处理
```typescript
const handleError = (error: any) => {
  console.error('AI服务错误:', error);
  Alert.alert(
    'AI服务不可用',
    '请检查网络连接或稍后重试',
    [
      { text: '重试', onPress: () => reloadAI() },
      { text: '切换到本地AI', onPress: () => switchToLocal() }
    ]
  );
};
```

## 🌐 HTML集成代码

### 生成的HTML模板
```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI智能助手</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, sans-serif;
            background-color: #F8FAFE;
            margin: 0;
            padding: 0;
        }
    </style>
</head>
<body>
    <!-- 敲敲云AI脚本 -->
    <script src="https://app.qiaoqiaoyun.com/chat/chat.js"></script>
    <script>
        createAiChat({
            appId: "YOUR_APP_ID",
            iconPosition: "bottom-right"
        });
    </script>
</body>
</html>
```

## 🔄 消息通信机制

### WebView → React Native
```javascript
// 在WebView中发送消息到RN
window.ReactNativeWebView.postMessage(JSON.stringify({
  type: 'ai_chat_event',
  data: eventData
}));
```

### React Native → WebView
```typescript
// 在RN中向WebView发送消息
webViewRef.current?.postMessage(JSON.stringify({
  type: 'command',
  action: 'clear_chat'
}));
```

## 🎨 界面定制

### 样式定制
```typescript
const styles = StyleSheet.create({
  webviewContainer: {
    flex: 1,
    backgroundColor: '#F8FAFE', // 医疗主题背景色
  },
  aiWebView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#F8FAFE',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
```

### 图标定制
```typescript
// 根据AI模式显示不同图标
const getAiModeIcon = (mode: 'local' | 'qiaoqiao') => {
  return mode === 'local' ? '🤖' : '☁️';
};
```

## 🔒 安全注意事项

### 1. 应用ID保护
```typescript
// 建议将敏感配置放在环境变量中
const QIAOQIAO_AI_CONFIG = {
  appId: process.env.QIAOQIAO_APP_ID || "1942970055310536706",
  iconPosition: "bottom-right" as const,
};
```

### 2. 网络安全
- 确保HTTPS连接
- 验证消息来源
- 过滤敏感信息

### 3. 用户隐私
- 明确告知用户数据使用方式
- 提供隐私设置选项
- 支持数据清除功能

## 🚨 常见问题

### Q1: WebView加载失败
**解决方案:**
```typescript
// 检查网络连接
const checkNetworkConnection = async () => {
  try {
    const response = await fetch('https://app.qiaoqiaoyun.com');
    return response.ok;
  } catch (error) {
    return false;
  }
};
```

### Q2: 消息通信失败
**解决方案:**
```typescript
// 添加消息验证
const validateMessage = (message: any) => {
  try {
    const parsed = JSON.parse(message);
    return parsed && parsed.type && parsed.data;
  } catch (error) {
    return false;
  }
};
```

### Q3: 界面适配问题
**解决方案:**
```typescript
// 动态调整WebView尺寸
const getWebViewStyle = () => {
  const { width, height } = Dimensions.get('window');
  return {
    width: width,
    height: height - 120, // 减去导航栏和底部按钮高度
  };
};
```

## 📱 最佳实践

### 1. 用户体验
- 提供明确的模式切换提示
- 显示加载状态和错误信息
- 保持界面响应性

### 2. 性能优化
- 懒加载WebView组件
- 及时清理无用资源
- 优化网络请求

### 3. 错误处理
- 提供降级方案（本地AI）
- 记录错误日志
- 用户友好的错误提示

## 🔄 未来扩展

### 计划功能
- [ ] 语音输入支持
- [ ] 多语言适配
- [ ] 个性化设置
- [ ] 会话历史同步
- [ ] 智能推荐

### 技术升级
- [ ] React Native新架构支持
- [ ] TypeScript完全类型覆盖
- [ ] 单元测试覆盖
- [ ] CI/CD集成

## 📞 技术支持

如果您在集成过程中遇到问题，可以：

1. **查看日志**: 检查控制台输出的详细错误信息
2. **网络检查**: 确认设备网络连接正常
3. **配置验证**: 确认应用ID和配置参数正确
4. **版本兼容**: 检查React Native WebView版本兼容性

---

## 📋 检查清单

集成完成后，请确认以下项目：

- [ ] 依赖包安装成功 (`react-native-webview`)
- [ ] 敲敲云应用ID配置正确
- [ ] 本地AI和敲敲云AI模式切换正常
- [ ] WebView加载显示正常
- [ ] 消息通信功能正常
- [ ] 错误处理机制完整
- [ ] 界面样式符合应用主题
- [ ] Android和iOS平台测试通过

🎉 **恭喜！您已成功集成敲敲云AI服务！** 