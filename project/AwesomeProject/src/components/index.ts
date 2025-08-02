// {{ AURA-X: Add - 公共组件统一导出. Approval: 组件化架构设计需求. }}

export { default as HomeCarousel, type CarouselItem } from './HomeCarousel';
export { default as DoctorCard, type Doctor } from './DoctorCard';
export { default as ServiceGrid, type ServiceItem } from './ServiceGrid';
export { default as QACard, type QAItem } from './QACard';
export { default as HomeSkeletonLoader, Skeleton } from './SkeletonLoader';
export { default as AiChatWebView } from './AiChatWebView';

// {{ AURA-X: Add - 组件使用说明注释. Approval: 开发文档化需求. }}
/**
 * 首页轮播图组件
 * @param data - 轮播数据数组
 * @param autoPlay - 是否自动播放，默认true
 * @param interval - 轮播间隔时间(毫秒)，默认4000
 * @param onItemPress - 点击轮播项回调
 */

/**
 * 医生卡片组件
 * @param doctor - 医生信息对象
 * @param onConsultPress - 点击问诊按钮回调
 * @param onAppointmentPress - 点击预约按钮回调
 * @param onCardPress - 点击卡片回调
 */


/**
 * 服务网格组件
 * @param services - 服务列表数组
 * @param columns - 每行显示的列数，默认3
 * @param onServicePress - 点击服务项回调
 */

/**
 * 问答卡片组件
 * @param qaItem - 问答信息对象
 * @param onCardPress - 点击卡片回调
 * @param onDoctorPress - 点击医生信息回调
 * @param onLikePress - 点击点赞按钮回调
 * @param showFullAnswer - 是否显示完整答案，默认false
 */

/**
 * 骨架屏加载组件
 * @param Skeleton - 基础骨架元素，支持自定义宽度、高度、圆角
 * @param HomeSkeletonLoader - 首页专用骨架屏，包含完整页面布局结构
 * 特性：呼吸动画效果、与实际内容布局一致、提升加载体验
 */

/**
 * 敲敲云AI聊天WebView组件
 * @param appId - 敲敲云应用ID，必填
 * @param iconPosition - 聊天图标位置，可选：'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
 * @param onMessage - 消息回调函数，接收WebView发送的消息
 * @param style - 组件样式
 * 特性：完整WebView集成、消息通信、错误处理、加载状态
 */ 