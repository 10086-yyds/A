# 妙医在线 - 医疗健康服务APP

## 项目概述

妙医在线是一款专业的医疗健康服务移动应用，为用户提供便捷的在线医疗咨询、药品购买、健康资讯等服务。本项目基于React Native框架开发，支持iOS和Android双平台。

## 主要功能

### 1. 首页 (Shou) - 现代化医疗服务界面
- **顶部导航**: 城市选择（可下拉切换）+ APP标题"妙医在线" + 消息中心
- **智能搜索**: 支持搜索医生、医院、药品、疾病、医学文章，带搜索图标的简洁设计
- **核心服务入口**: 6个主要功能模块，简洁图标+文字展示
  - 极速问诊（AI秒回）- 智能AI快速响应
  - 在线问诊（医生坐诊开方）- 专业医生在线诊疗
  - 找医生（覆盖全国医生资源）- 全国优质医生搜索
  - 免费问诊 - 限时免费咨询服务
  - 预约挂号 - 快速预约就医
  - 线上购药 - 送药到家服务
- **轮播展示**: 自动轮播(4秒切换) + 手动滑动，展示健康活动、科普内容
- **医生推荐模块**: 
  - Tab切换: "优选医生" / "本地好医生"
  - 科室分类: 内科、外科、产科、儿科、皮肤科、心理科
  - 医生信息: 头像、姓名、职称、医院、擅长、接诊量、评分
  - 操作按钮: "在线问诊" / "预约挂号"
- **问诊动态**: 展示最新免费问诊，包含问题、回答、医生、时间、回复数
- **热门文章**: 按健康主题Tab切换（女性健康、心理健康、科学备孕、科学育儿）
- **骨架屏加载**: 数据加载时显示优雅的骨架屏动画，提升用户体验

### 2. AI极速问诊 (AiConsult) - 双AI模式
- **混合AI架构**: 支持本地AI和敲敲云AI两种模式
  - **本地AI模式**: 基于预设规则的症状分析，离线可用
  - **敲敲云AI模式**: 接入敲敲云AI平台，更智能的对话体验
- **智能对话**: AI健康助手，支持症状描述和智能回复
- **快速选择**: 常见症状快速选择按钮（头痛、发烧、咳嗽、腹痛、失眠、皮疹）
- **专业建议**: 基于症状提供初步诊断建议和就医指导
- **交互体验**: 
  - 聊天界面设计，支持文字输入和快速选择
  - AI思考状态显示，模拟真实对话体验
  - 一键切换AI模式，实时状态指示
  - 语音输入（开发中）、模式切换、清空聊天等功能
- **第三方集成**: 
  - WebView嵌入敲敲云AI服务
  - 消息双向通信机制
  - 完整的错误处理和加载状态
- **安全提醒**: AI建议仅供参考，严重症状建议及时就医

### 3. 药品 (Drug)
- 药品搜索和浏览
- 药品详情和用药指导
- 处方药和非处方药分类

### 3. 购物车 (Cart)
- 药品购物车管理
- 订单确认和支付

### 4. 我的 (Mine)
- 用户个人信息管理
- 问诊记录和处方记录
- 收藏和关注管理

## 技术架构

### 前端技术栈
- **React Native**: 0.80.2 - 跨平台移动应用开发框架
- **TypeScript**: 5.0.4 - 静态类型检查
- **React Navigation**: ^7.1.16 - 路由导航管理
  - Stack Navigator: 页面堆栈导航
  - Bottom Tabs Navigator: 底部标签导航
- **React Native Reanimated**: ^4.0.1 - 动画处理
- **React Native WebView**: ^13.6.4 - WebView组件，用于嵌入第三方AI服务
- **Axios**: ^1.11.0 - HTTP请求库

### 项目结构
```
src/
├── navigation/           # 导航配置
│   └── AppNavigator.tsx # 主导航器
├── pages/               # 页面组件
│   ├── Login/          # 登录页面
│   ├── Shou/           # 首页 - 现代化医疗服务界面
│   ├── AiConsult/      # AI极速问诊页面
│   ├── Drug/           # 药品页面
│   ├── Cart/           # 购物车页面
│   └── Mine/           # 我的页面
├── components/         # 公共组件
│   ├── HomeCarousel.tsx    # 首页轮播图组件
│   ├── DoctorCard.tsx      # 医生卡片组件
│   ├── ServiceGrid.tsx     # 服务图标网格组件
│   ├── QACard.tsx          # 问答卡片组件
│   ├── SkeletonLoader.tsx  # 骨架屏加载组件
│   └── index.ts            # 组件统一导出
├── utils/             # 工具函数
├── api/               # API接口
└── assets/            # 静态资源
```

## 核心组件说明

### 1. 首页轮播图组件 (HomeCarousel)
- **功能**: 自动轮播展示医疗服务、健康活动、科普内容等
- **特性**: 自动轮播(4秒间隔) + 手动滑动 + 点击指示器跳转
- **参数**: 
  - `data`: 轮播数据数组 (CarouselItem[])
  - `autoPlay`: 是否自动播放，默认true
  - `interval`: 轮播间隔时间(毫秒)，默认4000
  - `onItemPress`: 点击轮播项回调函数
- **使用方法**: 
```tsx
<HomeCarousel 
  data={carouselData} 
  autoPlay={true} 
  interval={4000}
  onItemPress={(item) => navigateToDetail(item.url)}
/>
```

### 2. 医生卡片组件 (DoctorCard)
- **功能**: 展示医生详细信息，包含在线状态、评分、操作按钮等
- **特性**: 医生头像、职业信息、擅长领域、接诊统计、在线问诊/预约挂号
- **参数**:
  - `doctor`: 医生信息对象 (Doctor)
  - `onConsultPress`: 点击问诊按钮回调
  - `onAppointmentPress`: 点击预约按钮回调
  - `onCardPress`: 点击卡片回调
- **使用方法**:
```tsx
<DoctorCard 
  doctor={doctorInfo} 
  onConsultPress={(doctor) => startConsultation(doctor)}
  onAppointmentPress={(doctor) => makeAppointment(doctor)}
  onCardPress={(doctor) => viewDoctorProfile(doctor)}
/>
```

### 3. 服务图标网格 (ServiceGrid)
- **功能**: 展示6个核心医疗服务入口，支持彩色图标和徽章提示
- **特性**: 3列网格布局、彩色图标背景、服务徽章、禁用状态
- **参数**:
  - `services`: 服务列表数组 (ServiceItem[])
  - `columns`: 每行显示的列数，默认3
  - `onServicePress`: 点击服务项回调
- **使用方法**:
```tsx
<ServiceGrid 
  services={serviceList} 
  columns={3}
  onServicePress={(service) => navigateToService(service.id)}
/>
```

### 4. 问答卡片组件 (QACard)
- **功能**: 展示用户问答内容，支持问题分类、医生信息、互动统计
- **特性**: 问题标签、答案展开、医生信息、时间显示、点赞互动
- **参数**:
  - `qaItem`: 问答信息对象 (QAItem)
  - `onCardPress`: 点击卡片回调
  - `onDoctorPress`: 点击医生信息回调
  - `onLikePress`: 点击点赞按钮回调
  - `showFullAnswer`: 是否显示完整答案，默认false
- **使用方法**:
```tsx
<QACard 
  qaItem={qaInfo} 
  onCardPress={(qa) => viewFullQA(qa.id)}
  onDoctorPress={(doctorName) => viewDoctorProfile(doctorName)}
  onLikePress={(qa) => toggleLike(qa.id)}
/>
```

### 5. 骨架屏加载组件 (SkeletonLoader)
- **功能**: 在数据加载时提供优雅的加载状态展示，提升用户体验
- **特性**: 呼吸灯动画效果、完整页面结构展示、与实际内容布局一致
- **组件类型**:
  - `Skeleton`: 基础骨架元素，支持自定义尺寸和样式
  - `HomeSkeletonLoader`: 首页专用骨架屏，包含完整页面结构
- **使用方法**:
```tsx
// 基础骨架元素
<Skeleton width={100} height={20} borderRadius={10} />

// 首页骨架屏
{isLoading ? <HomeSkeletonLoader /> : <ActualContent />}
```

## 安装和运行

### 环境要求
- Node.js >= 18
- React Native CLI
- Android Studio (Android开发)
- Xcode (iOS开发)

### 安装依赖
```bash
npm install
# 或
yarn install
```

### iOS依赖安装
```bash
cd ios && pod install && cd ..
```

### 运行项目
```bash
# Android
npm run android
# 或
yarn android

# iOS  
npm run ios
# 或
yarn ios
```

### 开发调试
```bash
npm start
# 或
yarn start
```

## API接口说明

### 基础配置
- **基础URL**: 配置在 `api/request.ts` 中
- **请求拦截**: 自动添加认证token和公共参数
- **响应拦截**: 统一处理错误和状态码

### 主要接口
1. **用户认证**
   - `POST /auth/login` - 用户登录
   - `POST /auth/register` - 用户注册
   - `POST /auth/logout` - 用户登出

2. **医生相关**
   - `GET /doctors/featured` - 获取优选医生
   - `GET /doctors/local` - 获取本地医生
   - `GET /doctors/:id` - 获取医生详情

3. **问诊相关**
   - `GET /consultations/free` - 获取免费问诊列表
   - `POST /consultations` - 发起问诊

4. **内容相关**
   - `GET /articles/hot` - 获取热门文章
   - `GET /banners` - 获取轮播图数据

## 开发规范

### 代码规范
- 使用TypeScript进行类型检查
- 遵循ESLint配置的代码规范
- 使用Prettier进行代码格式化

### 组件开发规范
- 使用函数组件和Hooks
- 组件文件使用PascalCase命名
- 样式使用StyleSheet.create创建
- 公共组件放在components目录下

### 状态管理
- 页面级状态使用useState管理
- 全局状态考虑使用Context或Redux

## 设计规范

### UI设计理念
- **现代化审美**: 简洁清新的界面设计，符合现代用户使用习惯
- **专业可靠**: 医疗行业特性，体现专业性和可信度
- **科技感**: 融入科技元素，体现智能化医疗服务

### 色彩搭配
- **主色调**: 浅蓝色系 (#2E86C1, #1B4F72) - 体现医疗专业性和信赖感
- **背景色**: 浅蓝白色 (#F8FAFE, #FAFCFE) - 营造清新舒适的视觉体验  
- **辅助色**: 白色 (#FFFFFF) - 保持界面简洁纯净
- **强调色**: 绿色 (#27AE60) - 健康积极的信号
- **警示色**: 红色 (#E74C3C) - 重要信息提醒
- **中性色**: 灰色系 (#666, #999, #BDC3C7) - 次要信息展示

### 交互体验
- **流畅动画**: 轮播图自动切换、Tab切换无卡顿
- **即时反馈**: 按钮点击有微动画效果，提升用户体验
- **直观操作**: 功能图标直观符合认知，操作路径清晰
- **响应式布局**: 适配不同屏幕尺寸，保持界面美观

### 信息架构
- **层次清晰**: 重要信息突出显示（医生评分、接诊量等）
- **合理间距**: 元素间距统一，保持视觉平衡
- **内容组织**: 按功能模块分组，便于用户快速定位

## 部署说明

### Android打包
```bash
cd android
./gradlew assembleRelease
```

### iOS打包
使用Xcode打开ios项目进行Archive打包

## 版本信息
- 当前版本: 0.0.1
- React Native: 0.80.2
- 最后更新: 2024年

## 集成指南

### 敲敲云AI集成
详细的第三方AI服务集成指南，请参考：[AI_INTEGRATION_GUIDE.md](./AI_INTEGRATION_GUIDE.md)

包含以下内容：
- 敲敲云AI配置和集成步骤
- WebView组件使用方法
- 消息通信机制
- 错误处理和最佳实践
- 常见问题解决方案

## 开发团队
本项目为医疗健康服务APP，专注于提供优质的在线医疗服务体验。

---
> 注意：本项目仅供学习和开发参考使用

