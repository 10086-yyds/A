<template>
  <div class="shop-page">
    <div class="page-header">
      <h1>商城管理</h1>
      <p>管理系统中的商品信息</p>
    </div>

    <!-- 操作按钮区域 -->
    <div class="action-bar">
      <div class="left-actions">
        <el-button
          v-permission="showAllButtons ? '' : 'shop_add'"
          type="primary"
          @click="showAddDialog = true"
          :icon="Plus"
        >
          添加商品
        </el-button>
        <el-button
          v-permission="showAllButtons ? '' : 'shop_import'"
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
          placeholder="搜索商品名称、标签或编号"
          style="width: 300px"
          clearable
          @input="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>

        <el-button
          v-permission="showAllButtons ? '' : 'shop_export'"
          type="info"
          @click="handleExport"
          :icon="Download"
        >
          导出数据
        </el-button>
      </div>
    </div>

    <!-- 商品列表 -->
    <el-table :data="filteredProducts" v-loading="loading" style="width: 100%" border stripe>
      <el-table-column prop="_id" label="ID" width="80" />
      <el-table-column prop="name" label="商品名称" width="200" />
      <el-table-column prop="tag" label="标签" width="120" />
      <el-table-column prop="key" label="编号" width="120" />
      <el-table-column prop="price" label="价格" width="100">
        <template #default="{ row }"> ¥{{ row.price }} </template>
      </el-table-column>
      <el-table-column prop="image" label="图片" width="120">
        <template #default="{ row }">
          <el-image
            v-if="row.image"
            :src="row.image"
            style="width: 50px; height: 50px"
            fit="cover"
          />
          <span v-else>无图片</span>
        </template>
      </el-table-column>

      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button
            v-permission="showAllButtons ? '' : 'shop_view'"
            type="primary"
            size="small"
            @click="handleView(row)"
            :icon="View"
          >
            查看
          </el-button>
          <el-button
            v-permission="showAllButtons ? '' : 'shop_edit'"
            type="warning"
            size="small"
            @click="handleEdit(row)"
            :icon="Edit"
          >
            编辑
          </el-button>
          <el-button
            v-permission="showAllButtons ? '' : 'shop_delete'"
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

    <!-- 添加/编辑商品对话框 -->
    <el-dialog
      v-model="showAddDialog"
      :title="isEdit ? '编辑商品' : '添加商品'"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form ref="productFormRef" :model="productForm" :rules="productRules" label-width="100px">
        <el-form-item label="商品名称" prop="name">
          <el-input v-model="productForm.name" placeholder="请输入商品名称" />
        </el-form-item>

        <el-form-item label="分类" prop="category">
          <el-select v-model="productForm.category" placeholder="请选择分类" style="width: 100%">
            <el-option label="药品" value="药品" />
            <el-option label="保健品" value="保健品" />
            <el-option label="医疗器械" value="医疗器械" />
            <el-option label="化妆品" value="化妆品" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>

        <el-form-item label="品牌" prop="brand">
          <el-input v-model="productForm.brand" placeholder="请输入品牌" />
        </el-form-item>

        <el-form-item label="价格" prop="price">
          <el-input-number
            v-model="productForm.price"
            :precision="2"
            :step="0.01"
            :min="0"
            style="width: 100%"
            placeholder="请输入价格"
          />
        </el-form-item>

        <el-form-item label="库存" prop="stock">
          <el-input-number
            v-model="productForm.stock"
            :min="0"
            style="width: 100%"
            placeholder="请输入库存"
          />
        </el-form-item>

        <el-form-item label="描述" prop="description">
          <el-input
            v-model="productForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入商品描述"
          />
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="productForm.status">
            <el-radio label="active">上架</el-radio>
            <el-radio label="inactive">下架</el-radio>
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

    <!-- 查看商品详情对话框 -->
    <el-dialog v-model="showViewDialog" title="商品详情" width="500px">
      <div v-if="selectedProduct" class="product-detail">
        <div class="detail-item">
          <span class="label">商品名称：</span>
          <span class="value">{{ selectedProduct.name }}</span>
        </div>
        <div class="detail-item">
          <span class="label">分类：</span>
          <span class="value">{{ selectedProduct.category }}</span>
        </div>
        <div class="detail-item">
          <span class="label">品牌：</span>
          <span class="value">{{ selectedProduct.brand }}</span>
        </div>
        <div class="detail-item">
          <span class="label">价格：</span>
          <span class="value">¥{{ selectedProduct.price }}</span>
        </div>
        <div class="detail-item">
          <span class="label">库存：</span>
          <span class="value">{{ selectedProduct.stock }}</span>
        </div>
        <div class="detail-item">
          <span class="label">描述：</span>
          <span class="value">{{ selectedProduct.description }}</span>
        </div>
        <div class="detail-item">
          <span class="label">状态：</span>
          <el-tag :type="selectedProduct.status === 'active' ? 'success' : 'danger'">
            {{ selectedProduct.status === 'active' ? '上架' : '下架' }}
          </el-tag>
        </div>
        <div class="detail-item">
          <span class="label">创建时间：</span>
          <span class="value">{{ selectedProduct.createTime }}</span>
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
import http from '../axios/axios'
import { exportData, exportDataWithFormat, formatters } from '../utils/export'

// 商品接口
interface Product {
  _id: string
  name: string
  image?: string
  price: number
  key?: string
  tag?: string
  category?: string
  brand?: string
  stock?: number
  description?: string
  status?: 'active' | 'inactive'
  createTime?: string
}

// 商品列表响应接口
interface ProductListResponse {
  code: number
  msg: string
  data: Product[]
  total: number
}

// 表单接口
interface ProductForm {
  name: string
  category: string
  brand: string
  price: number
  stock: number
  description: string
  status: 'active' | 'inactive'
}

// 用户权限 store
const userStore = useUserStore()

// 响应式数据
const loading = ref(false)
const submitLoading = ref(false)
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const products = ref<Product[]>([])
const showAddDialog = ref(false)
const showViewDialog = ref(false)
const isEdit = ref(false)
const selectedProduct = ref<Product | null>(null)
const showAllButtons = ref(false) // 临时开关

// 表单数据
const productFormRef = ref()
const productForm = reactive<ProductForm>({
  name: '',
  category: '',
  brand: '',
  price: 0,
  stock: 0,
  description: '',
  status: 'active',
})

// 表单验证规则
const productRules = {
  name: [
    { required: true, message: '请输入商品名称', trigger: 'blur' },
    { min: 2, max: 50, message: '商品名称长度在 2 到 50 个字符', trigger: 'blur' },
  ],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
  brand: [
    { required: true, message: '请输入品牌', trigger: 'blur' },
    { min: 1, max: 30, message: '品牌长度在 1 到 30 个字符', trigger: 'blur' },
  ],
  price: [
    { required: true, message: '请输入价格', trigger: 'blur' },
    { type: 'number', min: 0, message: '价格必须大于等于0', trigger: 'blur' },
  ],
  stock: [
    { required: true, message: '请输入库存', trigger: 'blur' },
    { type: 'number', min: 0, message: '库存必须大于等于0', trigger: 'blur' },
  ],
}

// 计算属性：过滤后的商品列表
const filteredProducts = computed(() => {
  if (!searchKeyword.value) {
    return products.value
  }

  const keyword = searchKeyword.value.toLowerCase()
  return products.value.filter(
    product =>
      product.name.toLowerCase().includes(keyword) ||
      (product.tag && product.tag.toLowerCase().includes(keyword)) ||
      (product.key && product.key.toLowerCase().includes(keyword))
  )
})

// 获取商品列表
const getProducts = async () => {
  try {
    loading.value = true
    console.log('开始获取商品列表...')

    // 调用商品列表接口
    const response = await http.get<ProductListResponse>('/lz/drugList')
    console.log('API响应:', response)
    const data = response.data

    console.log('API响应:', data)

    // 检查数据结构
    if (Array.isArray(data)) {
      // 如果直接返回数组，说明API返回的是商品列表
      products.value = data
      total.value = data.length
      console.log('商品数据:', products.value)
      console.log('总数:', total.value)
    } else if (data?.code === 200) {
      // 如果返回的是标准格式 {code: 200, data: [], total: 0}
      products.value = data.data || []
      total.value = data.total || 0
      console.log('商品数据:', products.value)
      console.log('总数:', total.value)
    } else {
      console.log('API返回错误')
      products.value = []
      total.value = 0
    }
  } catch (error) {
    console.error('获取商品列表失败:', error)
    products.value = []
    total.value = 0
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

// 查看商品详情
const handleView = (product: Product) => {
  selectedProduct.value = product
  showViewDialog.value = true
}

// 编辑商品
const handleEdit = (product: Product) => {
  isEdit.value = true
  Object.assign(productForm, product)
  showAddDialog.value = true
}

// 删除商品
const handleDelete = async (product: Product) => {
  try {
    await ElMessageBox.confirm(`确定要删除商品"${product.name}"吗？此操作不可恢复！`, '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    // 调用删除接口
    // await productApi.delete(product.id)
    ElMessage.success('删除成功')
    getProducts()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除商品失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!productFormRef.value) return

  try {
    await productFormRef.value.validate()
    submitLoading.value = true

    if (isEdit.value) {
      // 更新商品
      // await productApi.update(selectedProduct.value?.id || '', productForm)
      ElMessage.success('更新成功')
    } else {
      // 添加商品
      // await productApi.create(productForm)
      ElMessage.success('添加成功')
    }

    showAddDialog.value = false
    resetForm()
    getProducts()
  } catch (error: any) {
    console.error('提交失败:', error)
    ElMessage.error(isEdit.value ? '更新失败' : '添加失败')
  } finally {
    submitLoading.value = false
  }
}

// 重置表单
const resetForm = () => {
  productForm.name = ''
  productForm.category = ''
  productForm.brand = ''
  productForm.price = 0
  productForm.stock = 0
  productForm.description = ''
  productForm.status = 'active'
  isEdit.value = false
  selectedProduct.value = null
  productFormRef.value?.resetFields()
}

// 批量导入
const handleImport = () => {
  ElMessage.info('批量导入功能开发中...')
}

// 导出数据
const handleExport = async () => {
  if (products.value.length === 0) {
    ElMessage.warning('暂无数据可导出')
    return
  }

  const columns = [
    { key: '_id', title: 'ID' },
    { key: 'name', title: '商品名称' },
    { key: 'tag', title: '标签' },
    { key: 'key', title: '编号' },
    {
      key: 'price',
      title: '价格',
      formatter: formatters.currency,
    },
    { key: 'category', title: '分类' },
    { key: 'brand', title: '品牌' },
    { key: 'stock', title: '库存' },
    { key: 'description', title: '描述' },
    {
      key: 'status',
      title: '状态',
      formatter: (value: string) =>
        formatters.status(value, {
          active: '上架',
          inactive: '下架',
        }),
    },
    {
      key: 'createTime',
      title: '创建时间',
      formatter: formatters.datetime,
    },
  ]

  // 使用带格式选择的导出函数
  await exportDataWithFormat(products.value, columns, {
    filename: '商品列表',
    sheetName: '商品数据',
  })
}

// 监听对话框关闭
const handleDialogClose = () => {
  resetForm()
}

// 组件挂载时获取数据
onMounted(() => {
  getProducts()
})
</script>

<style scoped>
.shop-page {
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

.product-detail {
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
