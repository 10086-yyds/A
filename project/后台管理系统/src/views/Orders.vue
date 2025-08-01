<template>
  <div class="orders-page">
    <div class="page-header">
      <h1>订单管理</h1>
      <p>管理系统中的订单信息</p>
    </div>

    <!-- 搜索筛选区域 -->
    <div class="search-section">
      <el-form :model="searchForm" inline>
        <el-form-item label="订单号">
          <el-input
            v-model="searchForm.orderNumber"
            placeholder="请输入订单号"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="客户姓名">
          <el-input
            v-model="searchForm.customerName"
            placeholder="请输入客户姓名"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="订单状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" style="width: 150px">
            <el-option label="全部" value="" />
            <el-option label="待付款" value="pending" />
            <el-option label="已付款" value="paid" />
            <el-option label="已发货" value="shipped" />
            <el-option label="已完成" value="completed" />
            <el-option label="已取消" value="cancelled" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch" :icon="Search">查询</el-button>
          <el-button @click="handleReset" :icon="Refresh">重置</el-button>
          <el-button @click="handleExport" :icon="Download">导出数据</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 订单列表 -->
    <div class="table-section">
      <el-table :data="filteredOrders" v-loading="loading" style="width: 100%" border stripe>
        <el-table-column prop="index" label="序号" width="60" />
        <el-table-column prop="orderNumber" label="订单号" width="180" />
        <el-table-column prop="customerName" label="客户姓名" width="120" />
        <el-table-column prop="phone" label="联系电话" width="140" />
        <el-table-column prop="totalAmount" label="订单金额" width="120">
          <template #default="{ row }"> ¥{{ row.totalAmount }} </template>
        </el-table-column>
        <el-table-column prop="status" label="订单状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="下单时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleView(row)" :icon="View">
              查看
            </el-button>
            <el-button
              v-if="row.status === 'pending'"
              type="success"
              size="small"
              @click="handleConfirmPayment(row)"
            >
              确认付款
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页 -->
    <div class="pagination-wrapper">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Refresh, View, Download } from '@element-plus/icons-vue'
import { exportData, formatters } from '../utils/export'

// 订单接口
interface Order {
  id: string
  index: number
  orderNumber: string
  customerName: string
  phone: string
  totalAmount: number
  status: 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled'
  createTime: string
}

// 搜索表单
interface SearchForm {
  orderNumber: string
  customerName: string
  status: string
}

// 响应式数据
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const orders = ref<Order[]>([])

// 搜索表单
const searchForm = reactive<SearchForm>({
  orderNumber: '',
  customerName: '',
  status: '',
})

// 模拟数据
const mockOrders: Order[] = [
  {
    id: '1',
    index: 1,
    orderNumber: 'DD202401001',
    customerName: '张三',
    phone: '13800138001',
    totalAmount: 299.0,
    status: 'pending',
    createTime: '2024-01-15 10:30:00',
  },
  {
    id: '2',
    index: 2,
    orderNumber: 'DD202401002',
    customerName: '李四',
    phone: '13800138002',
    totalAmount: 568.0,
    status: 'paid',
    createTime: '2024-01-15 14:20:00',
  },
  {
    id: '3',
    index: 3,
    orderNumber: 'DD202401003',
    customerName: '王五',
    phone: '13800138003',
    totalAmount: 1250.0,
    status: 'shipped',
    createTime: '2024-01-16 09:15:00',
  },
  {
    id: '4',
    index: 4,
    orderNumber: 'DD202401004',
    customerName: '赵六',
    phone: '13800138004',
    totalAmount: 89.0,
    status: 'completed',
    createTime: '2024-01-17 16:45:00',
  },
  {
    id: '5',
    index: 5,
    orderNumber: 'DD202401005',
    customerName: '钱七',
    phone: '13800138005',
    totalAmount: 456.0,
    status: 'cancelled',
    createTime: '2024-01-18 11:20:00',
  },
]

// 计算属性：过滤后的订单列表
const filteredOrders = computed(() => {
  let result = orders.value

  // 按订单号筛选
  if (searchForm.orderNumber) {
    result = result.filter(order =>
      order.orderNumber.toLowerCase().includes(searchForm.orderNumber.toLowerCase())
    )
  }

  // 按客户姓名筛选
  if (searchForm.customerName) {
    result = result.filter(order =>
      order.customerName.toLowerCase().includes(searchForm.customerName.toLowerCase())
    )
  }

  // 按状态筛选
  if (searchForm.status) {
    result = result.filter(order => order.status === searchForm.status)
  }

  return result
})

// 获取状态类型
const getStatusType = (status: string) => {
  switch (status) {
    case 'pending':
      return 'warning'
    case 'paid':
      return 'primary'
    case 'shipped':
      return 'info'
    case 'completed':
      return 'success'
    case 'cancelled':
      return 'danger'
    default:
      return 'info'
  }
}

// 获取状态文本
const getStatusText = (status: string) => {
  switch (status) {
    case 'pending':
      return '待付款'
    case 'paid':
      return '已付款'
    case 'shipped':
      return '已发货'
    case 'completed':
      return '已完成'
    case 'cancelled':
      return '已取消'
    default:
      return '未知'
  }
}

// 搜索处理
const handleSearch = () => {
  currentPage.value = 1
  ElMessage.success('搜索完成')
}

// 重置处理
const handleReset = () => {
  searchForm.orderNumber = ''
  searchForm.customerName = ''
  searchForm.status = ''
  currentPage.value = 1
  ElMessage.success('重置完成')
}

// 导出数据
const handleExport = async () => {
  if (orders.value.length === 0) {
    ElMessage.warning('暂无数据可导出')
    return
  }

  const columns = [
    { key: 'index', title: '序号' },
    { key: 'orderNumber', title: '订单号' },
    { key: 'customerName', title: '客户姓名' },
    { key: 'phone', title: '联系电话' },
    {
      key: 'totalAmount',
      title: '订单金额',
      formatter: formatters.currency,
    },
    {
      key: 'status',
      title: '订单状态',
      formatter: (value: string) =>
        formatters.status(value, {
          pending: '待付款',
          paid: '已付款',
          shipped: '已发货',
          completed: '已完成',
          cancelled: '已取消',
        }),
    },
    {
      key: 'createTime',
      title: '下单时间',
      formatter: formatters.datetime,
    },
  ]

  await exportData(orders.value, columns, {
    filename: '订单列表',
    format: 'xlsx',
    sheetName: '订单数据',
  })
}

// 分页处理
const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
}

const handleCurrentChange = (page: number) => {
  currentPage.value = page
}

// 查看订单详情
const handleView = (order: Order) => {
  ElMessage.info(`查看订单：${order.orderNumber}`)
}

// 确认付款
const handleConfirmPayment = (order: Order) => {
  order.status = 'paid'
  ElMessage.success('付款确认成功')
}

// 初始化数据
const initData = () => {
  loading.value = true
  setTimeout(() => {
    orders.value = [...mockOrders]
    total.value = orders.value.length
    loading.value = false
  }, 500)
}

// 组件挂载时获取数据
onMounted(() => {
  initData()
})
</script>

<style scoped>
.orders-page {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h1 {
  margin: 0 0 8px 0;
  color: var(--color-heading);
  font-size: 24px;
  font-weight: 600;
}

.page-header p {
  margin: 0;
  color: var(--text-muted);
  font-size: 14px;
}

.search-section {
  background: var(--card-background);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: var(--card-shadow);
  border: 1px solid var(--color-border);
}

.table-section {
  background: var(--card-background);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: var(--card-shadow);
  border: 1px solid var(--color-border);
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

@media (max-width: 768px) {
  .search-section .el-form {
    flex-direction: column;
  }

  .search-section .el-form-item {
    margin-right: 0;
    margin-bottom: 16px;
  }
}
</style>
