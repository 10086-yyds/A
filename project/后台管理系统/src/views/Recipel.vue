<template>
  <div class="recipe-page">
    <div class="page-header">
      <h1>处方管理</h1>
      <p>管理系统中的处方信息</p>
    </div>

    <!-- 搜索筛选区域 -->
    <div class="search-section">
      <el-form :model="searchForm" inline>
        <el-form-item label="姓名">
          <el-input
            v-model="searchForm.patientName"
            placeholder="请输入患者姓名"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="处方编号">
          <el-input
            v-model="searchForm.prescriptionNumber"
            placeholder="请输入处方编号"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="处方状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" style="width: 150px">
            <el-option label="全部" value="" />
            <el-option label="未审核" value="pending" />
            <el-option label="已审核" value="approved" />
            <el-option label="审核未通过" value="rejected" />
          </el-select>
        </el-form-item>
        <el-form-item label="选择科室">
          <el-select v-model="searchForm.department" placeholder="请选择科室" style="width: 150px">
            <el-option label="全部" value="" />
            <el-option label="内科" value="内科" />
            <el-option label="外科" value="外科" />
            <el-option label="儿科" value="儿科" />
            <el-option label="妇产科" value="妇产科" />
            <el-option label="眼科" value="眼科" />
            <el-option label="骨科" value="骨科" />
          </el-select>
        </el-form-item>
        <el-form-item label="提交时间">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY/MM/DD"
            value-format="YYYY-MM-DD"
            style="width: 300px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch" :icon="Search">查询</el-button>
          <el-button @click="handleReset" :icon="Refresh">重置</el-button>
          <el-button @click="handleExport" :icon="Download">导出数据</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 统计信息 -->
    <div class="stats-section">
      <el-alert
        :title="`截止当日,已审核${stats.approved}条,待审核${stats.pending}条`"
        type="info"
        :closable="false"
        show-icon
      >
        <template #default>
          <span class="stats-text">
            截止当日,已审核
            <span class="stats-number">{{ stats.approved }}</span>
            条,待审核
            <span class="stats-number">{{ stats.pending }}</span>
            条
          </span>
        </template>
      </el-alert>
    </div>

    <!-- 处方列表 -->
    <div class="table-section">
      <el-table :data="filteredRecipes" v-loading="loading" style="width: 100%" border stripe>
        <el-table-column prop="index" label="序号" width="60" />
        <el-table-column prop="prescriptionNumber" label="处方编号" width="150" />
        <el-table-column prop="patientName" label="患者姓名" width="120" />
        <el-table-column prop="phone" label="电话" width="140" />
        <el-table-column prop="hospital" label="医院" width="120" />
        <el-table-column prop="department" label="科室" width="100" />
        <el-table-column prop="doctor" label="开方医生" width="120" />
        <el-table-column prop="cost" label="费用" width="100">
          <template #default="{ row }"> ¥{{ row.cost }} </template>
        </el-table-column>
        <el-table-column prop="submitTime" label="提交时间" width="180" />
        <el-table-column prop="auditor" label="审核人" width="120" />
        <el-table-column prop="auditTime" label="审核时间" width="180" />
        <el-table-column prop="status" label="审核状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleView(row)" :icon="View">
              查看
            </el-button>
            <el-button
              v-if="row.status === 'rejected'"
              type="danger"
              size="small"
              @click="handleDelete(row)"
              :icon="Delete"
            >
              删除
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

    <!-- 查看处方详情对话框 -->
    <el-dialog v-model="showViewDialog" title="处方详情" width="800px">
      <div v-if="selectedRecipe" class="recipe-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="处方编号">{{
            selectedRecipe.prescriptionNumber
          }}</el-descriptions-item>
          <el-descriptions-item label="患者姓名">{{
            selectedRecipe.patientName
          }}</el-descriptions-item>
          <el-descriptions-item label="联系电话">{{ selectedRecipe.phone }}</el-descriptions-item>
          <el-descriptions-item label="医院">{{ selectedRecipe.hospital }}</el-descriptions-item>
          <el-descriptions-item label="科室">{{ selectedRecipe.department }}</el-descriptions-item>
          <el-descriptions-item label="开方医生">{{ selectedRecipe.doctor }}</el-descriptions-item>
          <el-descriptions-item label="费用">¥{{ selectedRecipe.cost }}</el-descriptions-item>
          <el-descriptions-item label="提交时间">{{
            selectedRecipe.submitTime
          }}</el-descriptions-item>
          <el-descriptions-item label="审核人">{{
            selectedRecipe.auditor || '--'
          }}</el-descriptions-item>
          <el-descriptions-item label="审核时间">{{
            selectedRecipe.auditTime || '--'
          }}</el-descriptions-item>
          <el-descriptions-item label="审核状态">
            <el-tag :type="getStatusType(selectedRecipe.status)">
              {{ getStatusText(selectedRecipe.status) }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>

        <div class="medicine-list">
          <h4>药品清单</h4>
          <el-table :data="selectedRecipe.medicines || []" border>
            <el-table-column prop="name" label="药品名称" />
            <el-table-column prop="specification" label="规格" />
            <el-table-column prop="quantity" label="数量" />
            <el-table-column prop="usage" label="用法用量" />
            <el-table-column prop="price" label="单价">
              <template #default="{ row }"> ¥{{ row.price }} </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Download, View, Delete } from '@element-plus/icons-vue'
import { exportData, formatters } from '../utils/export'

// 处方接口
interface Recipe {
  id: string
  index: number
  prescriptionNumber: string
  patientName: string
  phone: string
  hospital: string
  department: string
  doctor: string
  cost: number
  submitTime: string
  auditor?: string
  auditTime?: string
  status: 'pending' | 'approved' | 'rejected'
  medicines?: Medicine[]
}

// 药品接口
interface Medicine {
  name: string
  specification: string
  quantity: string
  usage: string
  price: number
}

// 搜索表单
interface SearchForm {
  patientName: string
  prescriptionNumber: string
  status: string
  department: string
  dateRange: string[]
}

// 响应式数据
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const recipes = ref<Recipe[]>([])
const showViewDialog = ref(false)
const selectedRecipe = ref<Recipe | null>(null)

// 搜索表单
const searchForm = reactive<SearchForm>({
  patientName: '',
  prescriptionNumber: '',
  status: '',
  department: '',
  dateRange: ['2020-01-01', '2024-12-31'],
})

// 统计数据
const stats = reactive({
  approved: 343334,
  pending: 13334,
})

// 模拟数据
const mockRecipes: Recipe[] = [
  {
    id: '1',
    index: 1,
    prescriptionNumber: 'CF12425235',
    patientName: '秦山',
    phone: '18811112345',
    hospital: '北大医院',
    department: '内科',
    doctor: '纪广',
    cost: 107,
    submitTime: '2020-02-07 21:00:00',
    status: 'pending',
    medicines: [
      {
        name: '阿司匹林肠溶片',
        specification: '100mg*30片',
        quantity: '1盒',
        usage: '口服，一次1片，一日1次',
        price: 25.5,
      },
      {
        name: '维生素C片',
        specification: '100mg*60片',
        quantity: '1盒',
        usage: '口服，一次1片，一日2次',
        price: 15.8,
      },
    ],
  },
  {
    id: '2',
    index: 2,
    prescriptionNumber: 'CF12425235',
    patientName: '张三',
    phone: '18811112345',
    hospital: '北大医院',
    department: '内科',
    doctor: '李书易',
    cost: 932,
    submitTime: '2020-02-07 21:00:00',
    status: 'pending',
    medicines: [
      {
        name: '布洛芬缓释胶囊',
        specification: '0.3g*12粒',
        quantity: '2盒',
        usage: '口服，一次1粒，一日2次',
        price: 28.0,
      },
    ],
  },
  {
    id: '3',
    index: 3,
    prescriptionNumber: 'CF12425235',
    patientName: '秦山',
    phone: '18811112345',
    hospital: '北大医院',
    department: '内科',
    doctor: '丁曼容',
    cost: 534,
    submitTime: '2020-02-07 21:00:00',
    auditor: '秦山',
    auditTime: '2024-01-01 18:00:00',
    status: 'approved',
    medicines: [
      {
        name: '感冒灵颗粒',
        specification: '10g*12袋',
        quantity: '1盒',
        usage: '冲服，一次1袋，一日3次',
        price: 18.5,
      },
    ],
  },
  {
    id: '4',
    index: 4,
    prescriptionNumber: 'CF12425235',
    patientName: '张三',
    phone: '18811112345',
    hospital: '北大医院',
    department: '内科',
    doctor: '李怡悦',
    cost: 295,
    submitTime: '2020-02-07 21:00:00',
    auditor: '张三',
    auditTime: '2024-01-01 18:00:00',
    status: 'approved',
    medicines: [
      {
        name: '板蓝根颗粒',
        specification: '10g*20袋',
        quantity: '1盒',
        usage: '冲服，一次1袋，一日3次',
        price: 12.8,
      },
    ],
  },
  {
    id: '5',
    index: 5,
    prescriptionNumber: 'CF12425235',
    patientName: '秦山',
    phone: '18811112345',
    hospital: '北大医院',
    department: '内科',
    doctor: '周乐心',
    cost: 328,
    submitTime: '2020-02-07 21:00:00',
    auditor: '秦山',
    auditTime: '2024-01-01 18:00:00',
    status: 'approved',
    medicines: [
      {
        name: '银翘解毒片',
        specification: '0.3g*24片',
        quantity: '1盒',
        usage: '口服，一次4片，一日3次',
        price: 22.0,
      },
    ],
  },
  {
    id: '6',
    index: 6,
    prescriptionNumber: 'CF12425235',
    patientName: '张三',
    phone: '18811112345',
    hospital: '北大医院',
    department: '内科',
    doctor: '刘大大',
    cost: 989,
    submitTime: '2020-02-07 21:00:00',
    auditor: '张三',
    auditTime: '2024-01-01 18:00:00',
    status: 'approved',
    medicines: [
      {
        name: '复方氨酚烷胺片',
        specification: '12片',
        quantity: '2盒',
        usage: '口服，一次1片，一日2次',
        price: 15.5,
      },
    ],
  },
  {
    id: '7',
    index: 7,
    prescriptionNumber: 'CF12425235',
    patientName: '秦山',
    phone: '18811112345',
    hospital: '北大医院',
    department: '内科',
    doctor: '赵雨',
    cost: 266,
    submitTime: '2020-02-07 21:00:00',
    auditor: '秦山',
    auditTime: '2024-01-01 18:00:00',
    status: 'approved',
    medicines: [
      {
        name: '藿香正气水',
        specification: '10ml*10支',
        quantity: '1盒',
        usage: '口服，一次1支，一日2次',
        price: 18.0,
      },
    ],
  },
  {
    id: '8',
    index: 8,
    prescriptionNumber: 'CF12425235',
    patientName: '张三',
    phone: '18811112345',
    hospital: '北大医院',
    department: '内科',
    doctor: '杨静云',
    cost: 997,
    submitTime: '2020-02-07 21:00:00',
    auditor: '张三',
    auditTime: '2024-01-01 18:00:00',
    status: 'approved',
    medicines: [
      {
        name: '感冒清热颗粒',
        specification: '12g*10袋',
        quantity: '1盒',
        usage: '冲服，一次1袋，一日3次',
        price: 25.0,
      },
    ],
  },
  {
    id: '9',
    index: 9,
    prescriptionNumber: 'CF12425235',
    patientName: '秦山',
    phone: '18811112345',
    hospital: '北大医院',
    department: '内科',
    doctor: '胡允',
    cost: 765,
    submitTime: '2020-02-07 21:00:00',
    auditor: '秦山',
    auditTime: '2024-01-01 18:00:00',
    status: 'rejected',
    medicines: [
      {
        name: '头孢克肟胶囊',
        specification: '0.1g*12粒',
        quantity: '1盒',
        usage: '口服，一次1粒，一日2次',
        price: 35.0,
      },
    ],
  },
  {
    id: '10',
    index: 10,
    prescriptionNumber: 'CF12425235',
    patientName: '张三',
    phone: '18811112345',
    hospital: '北大医院',
    department: '内科',
    doctor: '王乐康',
    cost: 231,
    submitTime: '2020-02-07 21:00:00',
    auditor: '张三',
    auditTime: '2024-01-01 18:00:00',
    status: 'rejected',
    medicines: [
      {
        name: '阿莫西林胶囊',
        specification: '0.25g*24粒',
        quantity: '1盒',
        usage: '口服，一次1粒，一日3次',
        price: 28.0,
      },
    ],
  },
]

// 计算属性：过滤后的处方列表
const filteredRecipes = computed(() => {
  let result = recipes.value

  // 按患者姓名筛选
  if (searchForm.patientName) {
    result = result.filter(recipe =>
      recipe.patientName.toLowerCase().includes(searchForm.patientName.toLowerCase())
    )
  }

  // 按处方编号筛选
  if (searchForm.prescriptionNumber) {
    result = result.filter(recipe =>
      recipe.prescriptionNumber.toLowerCase().includes(searchForm.prescriptionNumber.toLowerCase())
    )
  }

  // 按状态筛选
  if (searchForm.status) {
    result = result.filter(recipe => recipe.status === searchForm.status)
  }

  // 按科室筛选
  if (searchForm.department) {
    result = result.filter(recipe => recipe.department === searchForm.department)
  }

  // 按日期范围筛选
  if (searchForm.dateRange && searchForm.dateRange.length === 2) {
    const [startDate, endDate] = searchForm.dateRange
    result = result.filter(recipe => {
      const submitDate = recipe.submitTime.split(' ')[0]
      return submitDate >= startDate && submitDate <= endDate
    })
  }

  return result
})

// 获取状态类型
const getStatusType = (status: string) => {
  switch (status) {
    case 'pending':
      return 'warning'
    case 'approved':
      return 'success'
    case 'rejected':
      return 'danger'
    default:
      return 'info'
  }
}

// 获取状态文本
const getStatusText = (status: string) => {
  switch (status) {
    case 'pending':
      return '未审核'
    case 'approved':
      return '已审核'
    case 'rejected':
      return '审核未通过'
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
  searchForm.patientName = ''
  searchForm.prescriptionNumber = ''
  searchForm.status = ''
  searchForm.department = ''
  searchForm.dateRange = ['2020-01-01', '2024-12-31']
  currentPage.value = 1
  ElMessage.success('重置完成')
}

// 导出数据
const handleExport = async () => {
  if (recipes.value.length === 0) {
    ElMessage.warning('暂无数据可导出')
    return
  }

  const columns = [
    { key: 'index', title: '序号' },
    { key: 'prescriptionNumber', title: '处方编号' },
    { key: 'patientName', title: '患者姓名' },
    { key: 'phone', title: '电话' },
    { key: 'hospital', title: '医院' },
    { key: 'department', title: '科室' },
    { key: 'doctor', title: '开方医生' },
    {
      key: 'cost',
      title: '费用',
      formatter: formatters.currency,
    },
    {
      key: 'submitTime',
      title: '提交时间',
      formatter: formatters.datetime,
    },
    { key: 'auditor', title: '审核人' },
    {
      key: 'auditTime',
      title: '审核时间',
      formatter: formatters.datetime,
    },
    {
      key: 'status',
      title: '状态',
      formatter: (value: string) =>
        formatters.status(value, {
          pending: '未审核',
          approved: '已审核',
          rejected: '审核未通过',
        }),
    },
  ]

  await exportData(recipes.value, columns, {
    filename: '处方列表',
    format: 'xlsx',
    sheetName: '处方数据',
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

// 查看处方详情
const handleView = (recipe: Recipe) => {
  selectedRecipe.value = recipe
  showViewDialog.value = true
}

// 删除处方
const handleDelete = async (recipe: Recipe) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除处方"${recipe.prescriptionNumber}"吗？此操作不可恢复！`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    // 从列表中移除
    const index = recipes.value.findIndex(r => r.id === recipe.id)
    if (index > -1) {
      recipes.value.splice(index, 1)
      // 重新计算序号
      recipes.value.forEach((r, i) => {
        r.index = i + 1
      })
      total.value = recipes.value.length
    }

    ElMessage.success('删除成功')
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除处方失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 初始化数据
const initData = () => {
  recipes.value = [...mockRecipes]
  total.value = recipes.value.length
}

// 组件挂载时获取数据
onMounted(() => {
  initData()
  console.log(recipes.value)
})
</script>

<style scoped>
.recipe-page {
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

.stats-section {
  margin-bottom: 20px;
}

.stats-text {
  font-size: 14px;
}

.stats-number {
  color: #f56c6c;
  font-weight: bold;
  font-size: 16px;
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

.recipe-detail {
  padding: 20px;
}

.medicine-list {
  margin-top: 20px;
}

.medicine-list h4 {
  margin: 0 0 16px 0;
  color: var(--color-heading);
  font-size: 16px;
  font-weight: 600;
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
