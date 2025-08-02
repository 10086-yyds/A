<template>
  <div class="home-page">
    <div class="welcome-section">
      <div class="header-controls">
        <button @click="themeStore.toggleTheme" class="theme-toggle">
          {{ themeStore.isDarkMode ? '🌙 深色模式' : '☀️ 浅色模式' }}
        </button>
      </div>
      <h1>{{ pageTitle }}</h1>
      <p>今天是 {{ currentDate }}，祝您工作愉快！</p>
    </div>

    <div class="quick-stats">
      <div class="stat-item" v-loading="loading">
        <div class="stat-number">{{ stats.totalUsers }}</div>
        <div class="stat-label">总用户数</div>
      </div>
      <div class="stat-item" v-loading="loading">
        <div class="stat-number">{{ stats.totalDrugs }}</div>
        <div class="stat-label">药品数量</div>
      </div>
      <div class="stat-item" v-loading="loading">
        <div class="stat-number">{{ stats.todayOrders }}</div>
        <div class="stat-label">今日订单</div>
      </div>
      <div class="stat-item" v-loading="loading">
        <div class="stat-number">¥{{ stats.todayRevenue }}</div>
        <div class="stat-label">今日收入</div>
      </div>
    </div>

    <div class="charts-section">
      <div class="chart-row">
        <div class="chart-card">
          <h3>用户增长趋势</h3>
          <div ref="userChartRef" class="chart-container">
            <div class="chart-placeholder">
              <el-icon :size="48" color="#667eea"><TrendCharts /></el-icon>
              <p>用户增长趋势图表</p>
              <p class="chart-desc">显示用户注册数量随时间的变化趋势</p>
            </div>
          </div>
        </div>
        <div class="chart-card">
          <h3>订单统计</h3>
          <div ref="orderChartRef" class="chart-container">
            <div class="chart-placeholder">
              <el-icon :size="48" color="#667eea"><PieChart /></el-icon>
              <p>订单统计图表</p>
              <p class="chart-desc">显示不同状态订单的分布情况</p>
            </div>
          </div>
        </div>
      </div>
      <div class="chart-row">
        <div class="chart-card">
          <h3>收入分析</h3>
          <div ref="revenueChartRef" class="chart-container">
            <div class="chart-placeholder">
              <el-icon :size="48" color="#667eea"><Histogram /></el-icon>
              <p>收入分析图表</p>
              <p class="chart-desc">显示每日收入变化情况</p>
            </div>
          </div>
        </div>
        <div class="chart-card">
          <h3>药品分类</h3>
          <div ref="drugChartRef" class="chart-container">
            <div class="chart-placeholder">
              <el-icon :size="48" color="#667eea"><DataAnalysis /></el-icon>
              <p>药品分类图表</p>
              <p class="chart-desc">显示不同类别药品的销售占比</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useThemeStore } from '../stores/theme'
import http from '../axios/axios'
import {
  User,
  FirstAidKit,
  Document,
  Wallet,
  Setting,
  TrendCharts,
  PieChart,
  Histogram,
  DataAnalysis,
} from '@element-plus/icons-vue'
import * as echarts from 'echarts'

const route = useRoute()
const themeStore = useThemeStore()

const currentDate = computed(() => {
  return new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  })
})

// 统计数据接口
interface DashboardStats {
  totalUsers: number
  totalDrugs: number
  todayOrders: number
  todayRevenue: number
}

// 活动记录接口
interface ActivityRecord {
  id: string
  icon: string // Element Plus图标组件名称
  title: string
  time: string
}

const stats = ref<DashboardStats>({
  totalUsers: 0,
  totalDrugs: 0,
  todayOrders: 0,
  todayRevenue: 0,
})

const recentActivities = ref<ActivityRecord[]>([])

// 图表引用
const userChartRef = ref<HTMLElement>()
const orderChartRef = ref<HTMLElement>()
const revenueChartRef = ref<HTMLElement>()
const drugChartRef = ref<HTMLElement>()

// 图表实例
let userChart: any = null
let orderChart: any = null
let revenueChart: any = null
let drugChart: any = null

// 加载状态
const loading = ref(false)

const pageTitle = computed(() => {
  const routeMap: Record<string, string> = {
    '/home': '欢迎使用医疗管理系统',
    '/doctors': '医生管理',
    '/users': '用户管理',
    '/prescriptions': '处方管理',
    '/orders': '订单管理',
    '/message': '消息列表',
    '/finance': '财务管理',
    '/products': '商品管理',
    '/operations': '运营管理',
    '/content': '内容管理',
    '/statistics': '统计管理',
    '/basic-settings': '基础设置',
    '/system-settings': '系统设置',
  }
  return routeMap[route.path] || '页面'
})

// 获取统计数据
const getDashboardStats = async () => {
  try {
    loading.value = true
    const response = await http.get('/lz/dashboard/stats')
    if (response.data) {
      stats.value = {
        totalUsers: response.data.totalUsers || 0,
        totalDrugs: response.data.totalDrugs || 0,
        todayOrders: response.data.todayOrders || 0,
        todayRevenue: response.data.todayRevenue || 0,
      }
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
    // 如果接口不存在，使用默认数据
    stats.value = {
      totalUsers: 0,
      totalDrugs: 0,
      todayOrders: 0,
      todayRevenue: 0,
    }
  } finally {
    loading.value = false
  }
}

// 获取最近活动
const getRecentActivities = async () => {
  try {
    const response = await http.get('/lz/dashboard/activities')
    if (response.data && Array.isArray(response.data)) {
      recentActivities.value = response.data
    } else {
      // 如果接口不存在，使用默认数据
      recentActivities.value = [
        { id: '1', icon: 'User', title: '新用户注册：张三', time: '10分钟前' },
        { id: '2', icon: 'FirstAidKit', title: '添加新药品：感冒灵', time: '30分钟前' },
        { id: '3', icon: 'Document', title: '新订单：ORD2024001', time: '1小时前' },
        { id: '4', icon: 'Wallet', title: '收入统计更新', time: '2小时前' },
        { id: '5', icon: 'Setting', title: '系统设置更新', time: '3小时前' },
      ]
    }
  } catch (error) {
    console.error('获取活动记录失败:', error)
    // 使用默认数据
    recentActivities.value = [
      { id: '1', icon: 'User', title: '新用户注册：张三', time: '10分钟前' },
      { id: '2', icon: 'FirstAidKit', title: '添加新药品：感冒灵', time: '30分钟前' },
      { id: '3', icon: 'Document', title: '新订单：ORD2024001', time: '1小时前' },
      { id: '4', icon: 'Wallet', title: '收入统计更新', time: '2小时前' },
      { id: '5', icon: 'Setting', title: '系统设置更新', time: '3小时前' },
    ]
  }
}

// 初始化图表
const initCharts = async () => {
  await nextTick()

  // 用户增长趋势图
  if (userChartRef.value) {
    userChart = echarts.init(userChartRef.value)
    const userOption = {
      title: { text: '用户增长趋势', left: 'center' },
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        data: ['1月', '2月', '3月', '4月', '5月', '6月'],
      },
      yAxis: { type: 'value' },
      series: [
        {
          data: [120, 200, 150, 80, 70, 110],
          type: 'line',
          smooth: true,
        },
      ],
    }
    userChart.setOption(userOption)
  }

  // 订单统计图
  if (orderChartRef.value) {
    orderChart = echarts.init(orderChartRef.value)
    const orderOption = {
      title: { text: '订单统计', left: 'center' },
      tooltip: { trigger: 'item' },
      series: [
        {
          type: 'pie',
          radius: '50%',
          data: [
            { value: 1048, name: '已完成' },
            { value: 735, name: '处理中' },
            { value: 580, name: '待付款' },
            { value: 484, name: '已取消' },
          ],
        },
      ],
    }
    orderChart.setOption(orderOption)
  }

  // 收入分析图
  if (revenueChartRef.value) {
    revenueChart = echarts.init(revenueChartRef.value)
    const revenueOption = {
      title: { text: '收入分析', left: 'center' },
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
      },
      yAxis: { type: 'value' },
      series: [
        {
          data: [820, 932, 901, 934, 1290, 1330, 1320],
          type: 'bar',
        },
      ],
    }
    revenueChart.setOption(revenueOption)
  }

  // 药品分类图
  if (drugChartRef.value) {
    drugChart = echarts.init(drugChartRef.value)
    const drugOption = {
      title: { text: '药品分类', left: 'center' },
      tooltip: { trigger: 'item' },
      series: [
        {
          type: 'pie',
          radius: ['40%', '70%'],
          data: [
            { value: 1048, name: '感冒药' },
            { value: 735, name: '消炎药' },
            { value: 580, name: '维生素' },
            { value: 484, name: '其他' },
          ],
        },
      ],
    }
    drugChart.setOption(drugOption)
  }
}

onMounted(async () => {
  // 初始化主题
  themeStore.initTheme()
  // 获取数据
  await getDashboardStats()
  // await getRecentActivities()
  // 初始化图表
  await initCharts()
})
</script>

<style scoped>
.home-page {
  max-width: 1200px;
}

.welcome-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 40px;
  border-radius: 12px;
  margin-bottom: 30px;
  text-align: center;
  position: relative;
}

.header-controls {
  position: absolute;
  top: 20px;
  right: 20px;
}

.theme-toggle {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.theme-toggle:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
}

.welcome-section h1 {
  margin: 0 0 10px 0;
  font-size: 28px;
  font-weight: 600;
}

.welcome-section p {
  margin: 0;
  font-size: 16px;
  opacity: 0.9;
}

.quick-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-item {
  background: var(--card-background);
  padding: 24px;
  border-radius: 8px;
  box-shadow: var(--card-shadow);
  text-align: center;
  transition: transform 0.3s ease;
  border: 1px solid var(--color-border);
}

.stat-item:hover {
  transform: translateY(-2px);
}

.stat-number {
  font-size: 32px;
  font-weight: 700;
  color: #667eea;
  margin-bottom: 8px;
}

.stat-label {
  color: var(--text-muted);
  font-size: 14px;
  font-weight: 500;
}

.charts-section {
  margin-bottom: 30px;
}

.chart-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.chart-card {
  background: var(--card-background);
  border-radius: 8px;
  padding: 20px;
  box-shadow: var(--card-shadow);
  border: 1px solid var(--color-border);
}

.chart-card h3 {
  margin: 0 0 15px 0;
  color: var(--color-heading);
  font-size: 16px;
  text-align: center;
}

.chart-container {
  width: 100%;
  height: 300px;
  position: relative;
}

.chart-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--text-muted);
  text-align: center;
}

.chart-placeholder p {
  margin: 8px 0 0 0;
  font-size: 14px;
}

.chart-placeholder .chart-desc {
  font-size: 12px;
  opacity: 0.7;
  margin-top: 4px;
}

.recent-activities {
  background: var(--card-background);
  border-radius: 8px;
  padding: 24px;
  box-shadow: var(--card-shadow);
  border: 1px solid var(--color-border);
}

.recent-activities h3 {
  margin: 0 0 20px 0;
  color: var(--color-heading);
  font-size: 18px;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 6px;
  transition: background-color 0.3s;
}

.activity-item:hover {
  background-color: var(--color-background-soft);
}

.activity-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-background-soft);
  border-radius: 8px;
  color: #667eea;
}

.activity-content {
  flex: 1;
}

.activity-title {
  font-weight: 500;
  color: var(--color-text);
  margin-bottom: 4px;
}

.activity-time {
  font-size: 12px;
  color: var(--text-muted);
}

@media (max-width: 768px) {
  .welcome-section {
    padding: 30px 20px;
  }

  .welcome-section h1 {
    font-size: 24px;
  }

  .quick-stats {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
