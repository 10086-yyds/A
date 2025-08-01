# React Native 组件引用指南

## 📱 组件来源说明

所有这些组件都来自 **React Native 官方核心库**，通过以下方式引用：

```javascript
import { 组件名 } from 'react-native';
```

## 🔧 组件详细说明

### 1. **View** - 容器组件
```javascript
import { View } from 'react-native';
```
- **作用**: 相当于HTML中的 `<div>`，是最基础的容器组件
- **用途**: 布局、包装其他组件、设置样式
- **官方文档**: https://reactnative.dev/docs/view

### 2. **Text** - 文本组件
```javascript
import { Text } from 'react-native';
```
- **作用**: 显示文本内容，相当于HTML中的 `<p>`, `<span>`, `<h1>` 等
- **用途**: 显示所有文本内容（RN中所有文本都必须包在Text组件内）
- **官方文档**: https://reactnative.dev/docs/text

### 3. **StyleSheet** - 样式创建工具
```javascript
import { StyleSheet } from 'react-native';
```
- **作用**: 创建优化的样式对象
- **用途**: 
  ```javascript
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
    }
  });
  ```
- **官方文档**: https://reactnative.dev/docs/stylesheet

### 4. **ScrollView** - 滚动容器
```javascript
import { ScrollView } from 'react-native';
```
- **作用**: 创建可滚动的内容区域
- **用途**: 当内容超出屏幕时提供滚动功能
- **官方文档**: https://reactnative.dev/docs/scrollview

### 5. **TextInput** - 文本输入框
```javascript
import { TextInput } from 'react-native';
```
- **作用**: 相当于HTML中的 `<input>` 标签
- **用途**: 用户文本输入、搜索框、表单字段
- **官方文档**: https://reactnative.dev/docs/textinput

### 6. **TouchableOpacity** - 可点击组件
```javascript
import { TouchableOpacity } from 'react-native';
```
- **作用**: 创建可点击的区域，相当于HTML中的 `<button>`
- **用途**: 按钮、链接、任何需要点击交互的元素
- **官方文档**: https://reactnative.dev/docs/touchableopacity

### 7. **FlatList** - 高性能列表
```javascript
import { FlatList } from 'react-native';
```
- **作用**: 渲染大量数据的高性能列表组件
- **用途**: 替代简单的map渲染，支持虚拟化，性能更好
- **官方文档**: https://reactnative.dev/docs/flatlist

### 8. **Dimensions** - 屏幕尺寸工具
```javascript
import { Dimensions } from 'react-native';
const { width, height } = Dimensions.get('window');
```
- **作用**: 获取设备屏幕尺寸信息
- **用途**: 响应式布局、动态计算组件尺寸
- **官方文档**: https://reactnative.dev/docs/dimensions

### 9. **SafeAreaView** - 安全区域组件
```javascript
import { SafeAreaView } from 'react-native';
```
- **作用**: 确保内容在设备的安全区域内显示
- **用途**: 避免内容被刘海屏、状态栏、底部指示器遮挡
- **官方文档**: https://reactnative.dev/docs/safeareaview

## 🌐 官方文档资源

### 主要文档地址：
1. **React Native 官方文档**: https://reactnative.dev/
2. **组件文档**: https://reactnative.dev/docs/components-and-apis
3. **API 参考**: https://reactnative.dev/docs/accessibilityinfo

### 中文文档资源：
1. **React Native 中文网**: https://www.react-native.cn/
2. **中文文档**: https://www.react-native.cn/docs/getting-started

## 📚 使用示例对比

### HTML vs React Native

```html
<!-- HTML -->
<div class="container">
  <p>Hello World</p>
  <input type="text" placeholder="输入内容">
  <button onclick="handleClick()">点击</button>
</div>
```

```javascript
// React Native
<View style={styles.container}>
  <Text>Hello World</Text>
  <TextInput placeholder="输入内容" />
  <TouchableOpacity onPress={handleClick}>
    <Text>点击</Text>
  </TouchableOpacity>
</View>
```

## 🔍 如何查找更多组件

1. **官方组件列表**: https://reactnative.dev/docs/components-and-apis
2. **社区组件**: https://github.com/jondot/awesome-react-native
3. **UI库推荐**:
   - React Native Elements: https://reactnativeelements.com/
   - NativeBase: https://nativebase.io/
   - React Native Paper: https://reactnativepaper.com/

## ⚡ 快速查阅技巧

1. **VS Code 扩展**: 安装 "React Native Tools" 扩展
2. **自动补全**: 输入组件名时会有智能提示
3. **文档快速访问**: Ctrl/Cmd + 点击组件名跳转到定义
4. **官方示例**: 每个组件文档页面都有完整示例代码

## 🎯 学习建议

1. **从基础组件开始**: View、Text、StyleSheet
2. **逐步学习交互**: TouchableOpacity、TextInput
3. **掌握布局**: Flexbox 在 React Native 中的应用
4. **性能优化**: 了解 FlatList、VirtualizedList
5. **平台适配**: Platform API 的使用

记住：React Native 的所有核心组件都有详细的官方文档和示例，遇到问题时优先查阅官方文档！ 