# React Native vs React 开发指南

## 📱 基础组件对应关系

### 核心组件对照表
| React (Web) | React Native | 说明 |
|-------------|--------------|------|
| `<div>` | `<View>` | 容器组件，相当于HTML的div |
| `<p>`, `<span>`, `<h1>~<h6>` | `<Text>` | 所有文本都必须包在Text组件内 |
| `<button>` | `<TouchableOpacity>`, `<Pressable>` | 可点击组件 |
| `<input>` | `<TextInput>` | 文本输入框 |
| `<img>` | `<Image>` | 图片组件 |
| `<a>` | `<TouchableOpacity>` + 导航 | 链接功能通过导航实现 |
| `<ul>`, `<ol>` | `<FlatList>`, `<SectionList>` | 列表组件 |
| `<iframe>` | `<WebView>` | 网页视图（需额外安装） |

## 🎨 样式系统差异

### 1. CSS vs StyleSheet
```javascript
// React (Web) - CSS
const MyComponent = () => (
  <div className="container">
    <p className="title">Hello World</p>
  </div>
);

// React Native - StyleSheet
import { View, Text, StyleSheet } from 'react-native';

const MyComponent = () => (
  <View style={styles.container}>
    <Text style={styles.title}>Hello World</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
```

### 2. 样式属性差异
| Web CSS | React Native | 说明 |
|---------|--------------|------|
| `display: flex` | `flex: 1` 或默认 | RN默认使用Flexbox |
| `background-color` | `backgroundColor` | 驼峰命名 |
| `margin-top` | `marginTop` | 驼峰命名 |
| `font-size` | `fontSize` | 驼峰命名 |
| `text-align` | `textAlign` | 驼峰命名 |
| `box-shadow` | `shadowColor`, `shadowOffset`, `shadowOpacity`, `shadowRadius` | 多个属性组合 |
| `border` | `borderWidth`, `borderColor`, `borderRadius` | 分别设置 |

### 3. 布局差异
```javascript
// React Native 默认使用 Flexbox，主轴是垂直方向
<View style={{
  flexDirection: 'column', // 默认值，垂直排列
  justifyContent: 'center', // 主轴对齐
  alignItems: 'center',     // 交叉轴对齐
}}>
  <Text>Item 1</Text>
  <Text>Item 2</Text>
</View>

// 水平排列需要明确设置
<View style={{
  flexDirection: 'row', // 水平排列
}}>
  <Text>Left</Text>
  <Text>Right</Text>
</View>
```

## 🔧 事件处理差异

### 1. 点击事件
```javascript
// React (Web)
<button onClick={handleClick}>点击我</button>

// React Native - TouchableOpacity
<TouchableOpacity onPress={handlePress}>
  <Text>点击我</Text>
</TouchableOpacity>

// React Native - Pressable (推荐)
<Pressable onPress={handlePress}>
  <Text>点击我</Text>
</Pressable>
```

### 2. 常用事件对照
| Web | React Native | 组件 |
|-----|-------------|------|
| `onClick` | `onPress` | TouchableOpacity, Pressable |
| `onChange` | `onChangeText` | TextInput |
| `onSubmit` | `onSubmitEditing` | TextInput |
| `onFocus` | `onFocus` | TextInput |
| `onBlur` | `onBlur` | TextInput |
| `onScroll` | `onScroll` | ScrollView, FlatList |

## 📱 移动端特有组件

### 1. 导航组件
```javascript
// 需要安装 @react-navigation/native
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Details" component={DetailsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

### 2. 列表组件
```javascript
// FlatList - 高性能列表
<FlatList
  data={data}
  renderItem={({ item }) => (
    <View>
      <Text>{item.title}</Text>
    </View>
  )}
  keyExtractor={item => item.id}
/>

// SectionList - 分组列表
<SectionList
  sections={sections}
  renderItem={({ item }) => <Text>{item}</Text>}
  renderSectionHeader={({ section }) => <Text>{section.title}</Text>}
  keyExtractor={(item, index) => item + index}
/>
```

### 3. 安全区域
```javascript
import { SafeAreaView } from 'react-native-safe-area-context';

// 确保内容不被刘海屏等遮挡
<SafeAreaView style={{ flex: 1 }}>
  <View>
    <Text>内容</Text>
  </View>
</SafeAreaView>
```

## ⚠️ 重要注意事项

### 1. 文本必须包装在Text组件内
```javascript
// ❌ 错误 - RN中不能直接写文本
<View>
  Hello World
</View>

// ✅ 正确 - 必须使用Text组件
<View>
  <Text>Hello World</Text>
</View>
```

### 2. 样式不能继承
```javascript
// ❌ 错误 - 子组件不会继承父组件样式
<View style={{ color: 'red' }}>
  <Text>这段文字不会是红色</Text>
</View>

// ✅ 正确 - 每个Text组件需要单独设置样式
<View>
  <Text style={{ color: 'red' }}>这段文字是红色</Text>
</View>
```

### 3. 尺寸单位
```javascript
// React Native 不需要单位，数字即为密度无关像素(dp)
const styles = StyleSheet.create({
  container: {
    width: 100,        // 不是100px，而是100dp
    height: 50,
    fontSize: 16,
  },
});
```

### 4. 图片处理
```javascript
// 本地图片
<Image source={require('./assets/image.png')} />

// 网络图片 - 必须设置宽高
<Image 
  source={{ uri: 'https://example.com/image.jpg' }}
  style={{ width: 100, height: 100 }}
/>
```

### 5. 平台差异处理
```javascript
import { Platform } from 'react-native';

const styles = StyleSheet.create({
  container: {
    paddingTop: Platform.OS === 'ios' ? 44 : 24, // iOS和Android不同的状态栏高度
    ...Platform.select({
      ios: {
        backgroundColor: 'red',
      },
      android: {
        backgroundColor: 'blue',
      },
    }),
  },
});
```

## 🚀 性能优化建议

### 1. 使用FlatList替代ScrollView
```javascript
// ❌ 大量数据时性能差
<ScrollView>
  {data.map(item => <ItemComponent key={item.id} item={item} />)}
</ScrollView>

// ✅ 虚拟化列表，性能更好
<FlatList
  data={data}
  renderItem={({ item }) => <ItemComponent item={item} />}
  keyExtractor={item => item.id}
  getItemLayout={(data, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  })}
/>
```

### 2. 图片优化
```javascript
// 使用 resizeMode 优化图片显示
<Image
  source={{ uri: imageUrl }}
  style={{ width: 100, height: 100 }}
  resizeMode="cover"           // cover, contain, stretch, repeat, center
  defaultSource={require('./placeholder.png')} // 加载时显示占位图
/>
```

### 3. 避免在render中创建新对象
```javascript
// ❌ 错误 - 每次render都创建新的样式对象
<View style={{ backgroundColor: 'red', margin: 10 }}>

// ✅ 正确 - 使用StyleSheet创建样式
<View style={styles.container}>
```

## 🔗 常用第三方库

### 导航
- `@react-navigation/native` - 导航库
- `@react-navigation/stack` - 堆栈导航
- `@react-navigation/bottom-tabs` - 底部标签导航

### UI组件
- `react-native-elements` - UI组件库
- `react-native-vector-icons` - 图标库
- `react-native-paper` - Material Design组件

### 功能库
- `react-native-async-storage` - 本地存储
- `react-native-permissions` - 权限管理
- `react-native-image-picker` - 图片选择
- `react-native-camera` - 相机功能

## 📋 开发调试差异

### 1. 调试工具
- **React**: 浏览器开发者工具
- **React Native**: 
  - Flipper (推荐)
  - React Native Debugger
  - Chrome DevTools (通过Metro)

### 2. 热重载
```javascript
// React Native 支持热重载和快速刷新
// 在模拟器中：
// iOS: Cmd + R 刷新，Cmd + D 打开开发菜单
// Android: R + R 刷新，Ctrl + M 打开开发菜单
```

## 🎯 你的项目分析

基于你的项目代码，我发现：

1. ✅ **正确使用了基础组件**：`View`, `Text`, `TouchableOpacity`
2. ✅ **正确使用了StyleSheet**：创建了样式对象
3. ✅ **正确的导航结构**：使用了React Navigation
4. ✅ **合理的文件结构**：按页面组织组件

### 建议改进的地方：
1. 可以添加SafeAreaView确保在刘海屏设备上的显示效果
2. 可以考虑使用Pressable替代TouchableOpacity（更现代的API）
3. 可以添加图标库来替代emoji图标

这份指南涵盖了React Native与React的主要差异，希望对你的开发有帮助！ 