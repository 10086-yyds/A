<template>
  <div class="system-container">
    <div class="system-header">
      <h1>系统管理</h1>
      <p>管理系统角色和用户账号</p>
    </div>

    <div class="system-content">
      <!-- 功能按钮 -->
      <div class="function-buttons">
        <el-button type="primary" size="large" @click="showRoleDialog = true" class="function-button">
          <el-icon>
            <UserFilled />
          </el-icon>
          <span>添加角色</span>
        </el-button>

        <el-button type="success" size="large" @click="showUserDialog = true" class="function-button">
          <el-icon>
            <Avatar />
          </el-icon>
          <span>创建账号</span>
        </el-button>

        <el-button type="danger" size="large" @click="showDeleteDialog = true" class="function-button">
          <el-icon>
            <Delete />
          </el-icon>
          <span>删除账号</span>
        </el-button>

        <el-button type="warning" size="large" @click="handleLogout" class="function-button">
          <el-icon>
            <SwitchButton />
          </el-icon>
          <span>退出登录</span>
        </el-button>
      </div>
    </div>

    <!-- 添加角色对话框 -->
    <el-dialog v-model="showRoleDialog" title="添加角色" width="700px" :close-on-click-modal="false">
      <el-form :model="roleForm" :rules="roleRules" ref="roleFormRef" label-width="100px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="roleForm.roleName" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="权限设置">
          <div class="permission-section">
            <div class="permission-header">
              <span>选择权限模块：</span>
              <el-button type="text" size="small" @click="showPermissionPreview = !showPermissionPreview">
                {{ showPermissionPreview ? '隐藏' : '预览' }}权限详情
              </el-button>
            </div>

            <el-checkbox-group v-model="roleForm.permissions" class="permission-group">
              <div v-for="option in permissionOptions" :key="option.key" class="permission-item">
                <el-checkbox :label="option.key">
                  <div class="permission-label">
                    <span class="permission-name">{{ option.label }}</span>
                    <span class="permission-desc">{{ option.description }}</span>
                  </div>
                </el-checkbox>

                <!-- 权限预览 -->
                <div v-if="showPermissionPreview && roleForm.permissions.includes(option.key)"
                  class="permission-preview">
                  <div class="preview-title">可访问的路由：</div>
                  <div class="route-list">
                    <el-tag v-for="route in option.routes" :key="route" size="small" type="info" class="route-tag">
                      {{ route }}
                    </el-tag>
                  </div>
                </div>
              </div>
            </el-checkbox-group>

            <!-- 权限统计 -->
            <div v-if="roleForm.permissions.length > 0" class="permission-summary">
              <el-alert :title="`已选择 ${roleForm.permissions.length} 个权限模块`" type="info" :closable="false" show-icon>
                <template #default>
                  <div>该角色将可以访问以下功能：</div>
                  <div class="selected-permissions">
                    <el-tag v-for="perm in roleForm.permissions" :key="perm" size="small" type="success"
                      class="selected-tag">
                      {{ getPermissionName(perm) }}
                    </el-tag>
                  </div>
                </template>
              </el-alert>
            </div>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeRoleDialog">取消</el-button>
          <el-button type="primary" @click="addRole" :loading="roleLoading">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 创建账号对话框 -->
    <el-dialog v-model="showUserDialog" title="创建账号" width="500px" :close-on-click-modal="false">
      <el-form :model="userForm" :rules="userRules" ref="userFormRef" label-width="100px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="userForm.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="真实姓名" prop="realName">
          <el-input v-model="userForm.realName" placeholder="请输入真实姓名" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="userForm.password" type="password" placeholder="请输入密码" show-password />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="userForm.confirmPassword" type="password" placeholder="请确认密码" show-password />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="userForm.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="userForm.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="所属角色" prop="roleId">
          <el-select v-model="userForm.roleId" placeholder="请选择角色">
            <el-option v-for="role in roleList" :key="role.id" :label="role.roleName" :value="role.id" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeUserDialog">取消</el-button>
          <el-button type="primary" @click="createUser" :loading="userLoading">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 删除账号对话框 -->
    <el-dialog v-model="showDeleteDialog" title="删除账号" width="500px" :close-on-click-modal="false">
      <el-alert title="警告" type="warning" description="删除账号操作不可恢复，请谨慎操作！" show-icon :closable="false"
        style="margin-bottom: 20px" />

      <el-form :model="deleteForm" :rules="deleteRules" ref="deleteFormRef" label-width="100px">
        <el-form-item label="选择账号" prop="userId">
          <el-select v-model="deleteForm.userId" placeholder="请选择要删除的账号" filterable>
            <el-option v-for="position in positionList" :key="position.id"
              :label="`${position.username} (${position.realName})`" :value="position.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="确认删除" prop="confirmDelete">
          <el-input v-model="deleteForm.confirmDelete" placeholder="请输入'DELETE'确认删除" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeDeleteDialog">取消</el-button>
          <el-button type="danger" @click="deleteUser" :loading="deleteLoading"
            :disabled="deleteForm.confirmDelete !== 'DELETE'">
            删除账号
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import http from '../axios/axios'
import { useUserStore } from '../stores/user'

// 权限路由映射定义 - 基于后端接口
const permissionRoutes = {
  home_access: {
    name: '首页访问',
    routes: ['/home'],
    description: '可以访问系统首页',
  },
  doctor_manage: {
    name: '医生管理',
    routes: ['/doctors'],
    description: '可以管理医生信息',
  },
  user_manage: {
    name: '用户管理',
    routes: ['/users'],
    description: '可以管理用户账号',
  },
  prescription_manage: {
    name: '处方管理',
    routes: ['/prescriptions'],
    description: '可以管理处方信息',
  },
  order_manage: {
    name: '订单管理',
    routes: ['/orders'],
    description: '可以查看和处理订单',
  },
  role_manage: {
    name: '角色管理',
    routes: ['/system'],
    description: '可以管理角色权限',
  },
  system_manage: {
    name: '系统管理',
    routes: ['/system'],
    description: '可以管理系统配置',
  },
  report_view: {
    name: '报表查看',
    routes: ['/statistics'],
    description: '可以查看统计报表',
  },
  patient_manage: {
    name: '患者管理',
    routes: ['/users'],
    description: '可以管理患者信息',
  },
  medicine_manage: {
    name: '药品管理',
    routes: ['/products'],
    description: '可以管理药品信息',
  },
}

// 获取所有权限选项
const permissionOptions = Object.entries(permissionRoutes).map(([key, value]) => ({
  key,
  label: value.name,
  description: value.description,
  routes: value.routes,
}))

// 类型定义
interface Role {
  id: string
  roleName: string
  description?: string
  permissions?: string[]
}

interface User {
  id: string
  username: string
  realName: string
  email?: string
  phone?: string
  roleId?: string
}

const router = useRouter()
const userStore = useUserStore()

// 获取权限名称的函数
const getPermissionName = (perm: string) => {
  return (permissionRoutes as any)[perm]?.name || perm
}

// 角色表单
const roleFormRef = ref()
const roleLoading = ref(false)
const showPermissionPreview = ref(false)
const roleForm = reactive({
  roleName: '',
  permissions: [] as string[],
})

const roleRules = {
  roleName: [
    { required: true, message: '请输入角色名称', trigger: 'blur' },
    { min: 2, max: 20, message: '角色名称长度在 2 到 20 个字符', trigger: 'blur' },
  ],
}

// 用户表单
const userFormRef = ref()
const userLoading = ref(false)
const userForm = reactive({
  username: '',
  realName: '',
  password: '',
  confirmPassword: '',
  email: '',
  phone: '',
  roleId: '',
})

const userRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' },
  ],
  realName: [{ required: true, message: '请输入真实姓名', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于 6 个字符', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule: any, value: string, callback: any) => {
        if (value !== userForm.password) {
          callback(new Error('两次输入密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur',
    },
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' },
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' },
  ],
  roleId: [{ required: true, message: '请选择角色', trigger: 'change' }],
}

// 删除表单
const deleteFormRef = ref()
const deleteLoading = ref(false)
const deleteForm = reactive({
  userId: '',
  confirmDelete: '',
})

const deleteRules = {
  userId: [{ required: true, message: '请选择要删除的账号', trigger: 'change' }],
  confirmDelete: [
    { required: true, message: '请输入确认信息', trigger: 'blur' },
    {
      validator: (rule: any, value: string, callback: any) => {
        if (value !== 'DELETE') {
          callback(new Error('请输入DELETE确认删除'))
        } else {
          callback()
        }
      },
      trigger: 'blur',
    },
  ],
}

// 数据列表
const roleList = ref<Role[]>([])
const userList = ref<User[]>([])
const positionList = ref<User[]>([])

// 对话框控制
const showRoleDialog = ref(false)
const showUserDialog = ref(false)
const showDeleteDialog = ref(false)

// 关闭对话框
const closeRoleDialog = () => {
  showRoleDialog.value = false
  resetRoleForm()
}

const closeUserDialog = () => {
  showUserDialog.value = false
  resetUserForm()
}

const closeDeleteDialog = () => {
  showDeleteDialog.value = false
  resetDeleteForm()
}

// 获取角色列表
const getRoleList = async () => {
  try {
    const response = await http.get('/lz/roleList')
    // 将后端返回的数据格式转换为前端期望的格式
    roleList.value = (response.data || []).map((role: any) => ({
      id: role._id,
      roleName: role.name,
    }))
  } catch (error) {
    console.error('获取角色列表失败:', error)
    // 模拟数据
    roleList.value = [
      { id: '1', roleName: '超级管理员' },
      { id: '2', roleName: '普通管理员' },
      { id: '3', roleName: '医生' },
      { id: '4', roleName: '护士' },
    ]
  }
}

// 获取用户列表
const getUserList = async () => {
  try {
    const response = await http.get('/lz/list')
    // 将后端返回的数据格式转换为前端期望的格式
    userList.value = (response.data || []).map((user: any) => ({
      id: user._id || user.id,
      username: user.username,
      realName: user.realName || user.name,
      email: user.email,
      phone: user.phone,
      roleId: user.roleId,
    }))
  } catch (error) {
    console.error('获取用户列表失败:', error)
    // 模拟数据
    userList.value = [
      { id: '1', username: 'admin', realName: '管理员' },
      { id: '2', username: 'doctor1', realName: '张医生' },
      { id: '3', username: 'nurse1', realName: '李护士' },
    ]
  }
}

// 获取职位列表（用于删除账号）
const getPositionList = async () => {
  try {
    const response = await http.get('/lz/positionList')
    // 将后端返回的数据格式转换为前端期望的格式
    positionList.value = (response.data || []).map((position: any) => ({
      id: position._id || position.id,
      username: position.username,
      realName: position.realName || position.name,
      email: position.email,
      phone: position.phone,
      roleID: position.roleID,
    }))
  } catch (error) {
    console.error('获取职位列表失败:', error)
    // 模拟数据
    positionList.value = [
      { id: '1', username: 'admin', realName: '管理员' },
      { id: '2', username: 'doctor1', realName: '张医生' },
      { id: '3', username: 'nurse1', realName: '李护士' },
    ]
  }
}

// 添加角色
const addRole = async () => {
  if (!roleFormRef.value) return

  try {
    await roleFormRef.value.validate()
    roleLoading.value = true

    // 构造符合后端接口的数据格式
    const roleData = {
      role: roleForm.roleName,
      permission: roleForm.permissions, // 直接发送字符串数组
    }

    const response = await http.post('/lz/create', roleData)

    // 如果到这里说明请求成功（失败会被axios拦截器处理）
    ElMessage.success('角色添加成功')
    resetRoleForm()
    getRoleList()
    showRoleDialog.value = false // 关闭对话框
  } catch (error: any) {
    console.error('添加角色失败:', error)
  } finally {
    roleLoading.value = false
  }
}

// 创建用户
const createUser = async () => {
  if (!userFormRef.value) return

  try {
    await userFormRef.value.validate()
    userLoading.value = true

    // 构造符合后端接口的数据格式，过滤掉不需要的字段
    const userData = {
      username: userForm.username,
      password: userForm.password,
      realName: userForm.realName,
      email: userForm.email,
      phone: userForm.phone,
      roleID: userForm.roleId, // 后端期望 roleID 字段名
    }




    const response = await http.post('/lz/add', userData)

    // 如果到这里说明请求成功（失败会被axios拦截器处理）
    ElMessage.success('账号创建成功')
    resetUserForm()
    getUserList()
    showUserDialog.value = false // 关闭对话框
  } catch (error: any) {
    console.error('创建用户失败:', error)
  } finally {
    userLoading.value = false
  }
}

// 删除用户
const deleteUser = async () => {
  if (!deleteFormRef.value) return

  try {
    await deleteFormRef.value.validate()

    await ElMessageBox.confirm('确定要删除这个账号吗？此操作不可恢复！', '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    deleteLoading.value = true

    const response = await http.delete(`/lz/del/${deleteForm.userId}`)
    // 如果到这里说明请求成功（失败会被axios拦截器处理）
    ElMessage.success('账号删除成功')
    resetDeleteForm()
    getPositionList() // 刷新职位列表
    showDeleteDialog.value = false // 关闭对话框
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除用户失败:', error)
    }
  } finally {
    deleteLoading.value = false
  }
}

// 退出登录
const handleLogout = async () => {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '退出确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    // 清除用户信息
    userStore.clearUserInfo()

    ElMessage.success('退出登录成功！')

    // 跳转到登录页面
    router.push('/login')
  } catch (error) {
    // 用户取消退出，不做任何操作
  }
}

// 重置表单
const resetRoleForm = () => {
  roleForm.roleName = ''
  roleForm.permissions = []
  roleFormRef.value?.resetFields()
}

const resetUserForm = () => {
  userForm.username = ''
  userForm.realName = ''
  userForm.password = ''
  userForm.confirmPassword = ''
  userForm.email = ''
  userForm.phone = ''
  userForm.roleId = ''
  userFormRef.value?.resetFields()
}

const resetDeleteForm = () => {
  deleteForm.userId = ''
  deleteForm.confirmDelete = ''
  deleteFormRef.value?.resetFields()
}

// 组件挂载时获取数据
onMounted(() => {
  getRoleList()
  getUserList()
  getPositionList() // 获取职位列表用于删除功能
})
</script>

<style scoped>
.system-container {
  max-width: 1200px;
  margin: 0 auto;
}

.system-header {
  text-align: center;
  margin-bottom: 30px;
}

.system-header h1 {
  color: var(--color-heading);
  font-size: 28px;
  margin-bottom: 8px;
  font-weight: 600;
}

.system-header p {
  color: var(--text-muted);
  font-size: 16px;
  margin: 0;
}

.system-content {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.function-buttons {
  display: flex;
  gap: 30px;
  flex-wrap: wrap;
  justify-content: center;
}

.function-button {
  min-width: 200px;
  height: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 12px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.function-button:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.function-button .el-icon {
  font-size: 32px;
}

@media (max-width: 768px) {
  .function-buttons {
    flex-direction: column;
    gap: 20px;
  }

  .function-button {
    min-width: 280px;
    height: 100px;
  }
}

/* 权限设置样式 */
.permission-section {
  width: 100%;
}

.permission-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e4e7ed;
}

.permission-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 300px;
  overflow-y: auto;
  padding: 10px;
}

.permission-item {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 8px 12px;
  background: #fafafa;
  transition: all 0.3s;
}

.permission-item:hover {
  border-color: #409eff;
  background: #f0f9ff;
}

.permission-label {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.permission-name {
  font-weight: 500;
  color: #303133;
}

.permission-desc {
  font-size: 12px;
  color: #909399;
}

.permission-preview {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed var(--color-border);
}

.preview-title {
  font-size: 12px;
  color: var(--text-muted);
  margin-bottom: 8px;
}

.route-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.route-tag {
  font-size: 11px;
}

.permission-summary {
  margin-top: 16px;
}

.selected-permissions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}

.selected-tag {
  font-size: 12px;
}
</style>
