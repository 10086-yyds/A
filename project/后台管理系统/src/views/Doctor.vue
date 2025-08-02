<template>
  <div class="doctor-page">
    <div class="page-header">
      <h1>医生管理</h1>
      <p>管理系统中的医生信息</p>
    </div>

    <!-- 操作按钮区域 -->
    <div class="action-bar">
      <div class="left-actions">
        <el-button
          v-permission="showAllButtons ? '' : 'doctor_add'"
          type="primary"
          @click="showAddDialog = true"
          :icon="Plus"
        >
          添加医生
        </el-button>
        <el-button
          v-permission="showAllButtons ? '' : 'doctor_import'"
          type="success"
          @click="handleImport"
          :icon="Upload"
        >
          批量导入
        </el-button>
      </div>

      <div class="right-actions">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索医生姓名、科室或职称"
          style="width: 300px"
          clearable
          @input="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>

        <el-button
          v-permission="showAllButtons ? '' : 'doctor_export'"
          type="info"
          @click="handleExport"
          :icon="Download"
        >
          导出数据
        </el-button>
      </div>
    </div>

    <!-- 医生列表 -->
    <el-table :data="filteredDoctors" v-loading="loading" style="width: 100%" border stripe>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="姓名" width="120" />
      <el-table-column prop="department" label="科室" width="150" />
      <el-table-column prop="title" label="职称" width="120" />
      <el-table-column prop="phone" label="联系电话" width="150" />
      <el-table-column prop="email" label="邮箱" width="200" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 'active' ? 'success' : 'danger'">
            {{ row.status === 'active' ? '在职' : '离职' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="180" />

      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button
            v-permission="showAllButtons ? '' : 'doctor_view'"
            type="primary"
            size="small"
            @click="handleView(row)"
            :icon="View"
          >
            查看
          </el-button>
          <el-button
            v-permission="showAllButtons ? '' : 'doctor_edit'"
            type="warning"
            size="small"
            @click="handleEdit(row)"
            :icon="Edit"
          >
            编辑
          </el-button>
          <el-button
            v-permission="showAllButtons ? '' : 'doctor_delete'"
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

    <!-- 添加/编辑医生对话框 -->
    <el-dialog
      v-model="showAddDialog"
      :title="isEdit ? '编辑医生' : '添加医生'"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form ref="doctorFormRef" :model="doctorForm" :rules="doctorRules" label-width="100px">
        <el-form-item label="姓名" prop="name">
          <el-input v-model="doctorForm.name" placeholder="请输入医生姓名" />
        </el-form-item>

        <el-form-item label="科室" prop="department">
          <el-select v-model="doctorForm.department" placeholder="请选择科室" style="width: 100%">
            <el-option label="内科" value="内科" />
            <el-option label="外科" value="外科" />
            <el-option label="儿科" value="儿科" />
            <el-option label="妇产科" value="妇产科" />
            <el-option label="眼科" value="眼科" />
            <el-option label="骨科" value="骨科" />
            <el-option label="神经科" value="神经科" />
            <el-option label="皮肤科" value="皮肤科" />
          </el-select>
        </el-form-item>

        <el-form-item label="职称" prop="title">
          <el-select v-model="doctorForm.title" placeholder="请选择职称" style="width: 100%">
            <el-option label="主任医师" value="主任医师" />
            <el-option label="副主任医师" value="副主任医师" />
            <el-option label="主治医师" value="主治医师" />
            <el-option label="住院医师" value="住院医师" />
          </el-select>
        </el-form-item>

        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="doctorForm.phone" placeholder="请输入联系电话" />
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
          <el-input v-model="doctorForm.email" placeholder="请输入邮箱" />
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="doctorForm.status">
            <el-radio label="active">在职</el-radio>
            <el-radio label="inactive">离职</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showAddDialog = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitLoading">
            {{ isEdit ? '更新' : '添加' }}
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 查看医生详情对话框 -->
    <el-dialog v-model="showViewDialog" title="医生详情" width="500px">
      <div v-if="selectedDoctor" class="doctor-detail">
        <div class="detail-item">
          <span class="label">姓名：</span>
          <span class="value">{{ selectedDoctor.name }}</span>
        </div>
        <div class="detail-item">
          <span class="label">科室：</span>
          <span class="value">{{ selectedDoctor.department }}</span>
        </div>
        <div class="detail-item">
          <span class="label">职称：</span>
          <span class="value">{{ selectedDoctor.title }}</span>
        </div>
        <div class="detail-item">
          <span class="label">联系电话：</span>
          <span class="value">{{ selectedDoctor.phone }}</span>
        </div>
        <div class="detail-item">
          <span class="label">邮箱：</span>
          <span class="value">{{ selectedDoctor.email }}</span>
        </div>
        <div class="detail-item">
          <span class="label">状态：</span>
          <el-tag :type="selectedDoctor.status === 'active' ? 'success' : 'danger'">
            {{ selectedDoctor.status === 'active' ? '在职' : '离职' }}
          </el-tag>
        </div>
        <div class="detail-item">
          <span class="label">创建时间：</span>
          <span class="value">{{ selectedDoctor.createTime }}</span>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete, View, Search, Upload, Download } from '@element-plus/icons-vue'
import { useUserStore } from '../stores/user'
import { hasPermission, isSuperAdmin } from '../utils/permission'
import { doctorApi, type Doctor } from '../axios/api'
import { exportData, formatters } from '../utils/export'

// 用户权限 store
const userStore = useUserStore()

// 使用导入的权限检查函数

// 获取角色名称的辅助函数
const getRoleName = (roleID: string | any) => {
  if (typeof roleID === 'object' && roleID?.name) {
    return roleID.name
  }
  return roleID || '未知角色'
}

// 使用从API导入的Doctor接口类型

// 表单接口
interface DoctorForm {
  name: string
  department: string
  title: string
  phone: string
  email: string
  status: 'active' | 'inactive'
}

// 响应式数据
const loading = ref(false)
const submitLoading = ref(false)
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const doctors = ref<Doctor[]>([])
const showAddDialog = ref(false)
const showViewDialog = ref(false)
const isEdit = ref(false)
const selectedDoctor = ref<Doctor | null>(null)
const showAllButtons = ref(false) // 新增：临时开关

// 表单数据
const doctorFormRef = ref()
const doctorForm = reactive<DoctorForm>({
  name: '',
  department: '',
  title: '',
  phone: '',
  email: '',
  status: 'active',
})

// 表单验证规则
const doctorRules = {
  name: [
    { required: true, message: '请输入医生姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '姓名长度在 2 到 20 个字符', trigger: 'blur' },
  ],
  department: [{ required: true, message: '请选择科室', trigger: 'change' }],
  title: [{ required: true, message: '请选择职称', trigger: 'change' }],
  phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' },
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' },
  ],
}

// 计算属性：过滤后的医生列表
const filteredDoctors = computed(() => {
  if (!searchKeyword.value) {
    return doctors.value
  }

  const keyword = searchKeyword.value.toLowerCase()
  return doctors.value.filter(
    doctor =>
      doctor.name.toLowerCase().includes(keyword) ||
      doctor.department.toLowerCase().includes(keyword) ||
      doctor.title.toLowerCase().includes(keyword)
  )
})

// 获取医生列表
const getDoctors = async () => {
  try {
    loading.value = true
    console.log('开始获取医生列表...')

    // 使用新的API通过职位列表获取医生
    const response = await doctorApi.getDoctorsFromPositions()

    console.log(response, 314)

    if (response.code === 200) {
      doctors.value = response.data
      total.value = response.total
      console.log('医生数据:', doctors.value)
      console.log('总数:', total.value)
    } else {
      console.log('API返回错误，使用模拟数据')
      // API返回错误时使用模拟数据
      doctors.value = [
        {
          id: '1',
          name: '张医生',
          department: '内科',
          title: '主任医师',
          phone: '13800138001',
          email: 'zhang@hospital.com',
          status: 'active',
          createTime: '2024-01-15 10:30:00',
        },
        {
          id: '2',
          name: '李医生',
          department: '外科',
          title: '副主任医师',
          phone: '13800138002',
          email: 'li@hospital.com',
          status: 'active',
          createTime: '2024-01-16 14:20:00',
        },
        {
          id: '3',
          name: '王医生',
          department: '儿科',
          title: '主治医师',
          phone: '13800138003',
          email: 'wang@hospital.com',
          status: 'inactive',
          createTime: '2024-01-17 09:15:00',
        },
      ]
      total.value = doctors.value.length
    }
  } catch (error) {
    console.error('获取医生列表失败:', error)
    // 使用模拟数据
    doctors.value = [
      {
        id: '1',
        name: '张医生',
        department: '内科',
        title: '主任医师',
        phone: '13800138001',
        email: 'zhang@hospital.com',
        status: 'active',
        createTime: '2024-01-15 10:30:00',
      },
      {
        id: '2',
        name: '李医生',
        department: '外科',
        title: '副主任医师',
        phone: '13800138002',
        email: 'li@hospital.com',
        status: 'active',
        createTime: '2024-01-16 14:20:00',
      },
      {
        id: '3',
        name: '王医生',
        department: '儿科',
        title: '主治医师',
        phone: '13800138003',
        email: 'wang@hospital.com',
        status: 'inactive',
        createTime: '2024-01-17 09:15:00',
      },
    ]
    total.value = doctors.value.length
  } finally {
    loading.value = false
  }
}

// 搜索处理
const handleSearch = () => {
  currentPage.value = 1
}

// 分页处理
const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
}

const handleCurrentChange = (page: number) => {
  currentPage.value = page
}

// 查看医生详情
const handleView = (doctor: Doctor) => {
  selectedDoctor.value = doctor
  showViewDialog.value = true
}

// 编辑医生
const handleEdit = (doctor: Doctor) => {
  isEdit.value = true
  Object.assign(doctorForm, doctor)
  showAddDialog.value = true
}

// 删除医生
const handleDelete = async (doctor: Doctor) => {
  try {
    await ElMessageBox.confirm(`确定要删除医生"${doctor.name}"吗？此操作不可恢复！`, '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    // 调用删除接口
    await doctorApi.delete(doctor.id)
    ElMessage.success('删除成功')
    getDoctors()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除医生失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!doctorFormRef.value) return

  try {
    await doctorFormRef.value.validate()
    submitLoading.value = true

    if (isEdit.value) {
      // 更新医生
      await doctorApi.update(selectedDoctor.value?.id || '', doctorForm)
      ElMessage.success('更新成功')
    } else {
      // 添加医生
      await doctorApi.create(doctorForm)
      ElMessage.success('添加成功')
    }

    showAddDialog.value = false
    resetForm()
    getDoctors()
  } catch (error: any) {
    console.error('提交失败:', error)
    ElMessage.error(isEdit.value ? '更新失败' : '添加失败')
  } finally {
    submitLoading.value = false
  }
}

// 重置表单
const resetForm = () => {
  doctorForm.name = ''
  doctorForm.department = ''
  doctorForm.title = ''
  doctorForm.phone = ''
  doctorForm.email = ''
  doctorForm.status = 'active'
  isEdit.value = false
  selectedDoctor.value = null
  doctorFormRef.value?.resetFields()
}

// 批量导入
const handleImport = () => {
  ElMessage.info('批量导入功能开发中...')
}

// 导出数据
const handleExport = async () => {
  if (doctors.value.length === 0) {
    ElMessage.warning('暂无数据可导出')
    return
  }

  const columns = [
    { key: 'id', title: 'ID' },
    { key: 'name', title: '姓名' },
    { key: 'department', title: '科室' },
    { key: 'title', title: '职称' },
    { key: 'phone', title: '联系电话' },
    { key: 'email', title: '邮箱' },
    {
      key: 'status',
      title: '状态',
      formatter: (value: string) =>
        formatters.status(value, {
          active: '在职',
          inactive: '离职',
        }),
    },
    {
      key: 'createTime',
      title: '创建时间',
      formatter: formatters.datetime,
    },
  ]

  await exportData(doctors.value, columns, {
    filename: '医生列表',
    format: 'xlsx',
    sheetName: '医生数据',
  })
}

// 监听对话框关闭
const handleDialogClose = () => {
  resetForm()
}

// 组件挂载时获取数据
onMounted(() => {
  getDoctors()
})
</script>

<style scoped>
.doctor-page {
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

.permission-debug {
  border: 1px solid #eee;
  padding: 10px;
  background-color: #f9f9f9;
  border-radius: 4px;
  font-size: 12px;
  color: #333;
  line-height: 1.5;
}

.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 16px;
  background: var(--card-background);
  border-radius: 8px;
  box-shadow: var(--card-shadow);
  border: 1px solid var(--color-border);
}

.left-actions {
  display: flex;
  gap: 12px;
}

.right-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.doctor-detail {
  padding: 20px;
}

.detail-item {
  display: flex;
  margin-bottom: 16px;
  align-items: center;
}

.detail-item .label {
  font-weight: 600;
  color: var(--color-heading);
  width: 100px;
  flex-shrink: 0;
}

.detail-item .value {
  color: var(--color-text);
  flex: 1;
}

@media (max-width: 768px) {
  .action-bar {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .right-actions {
    flex-direction: column;
    gap: 12px;
  }

  .right-actions .el-input {
    width: 100% !important;
  }
}
</style>
