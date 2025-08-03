<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <h1>互联网医院管理平台</h1>
        <p>请登录您的账户</p>
      </div>

      <el-form ref="loginFormRef" :model="loginForm" :rules="loginRules" class="login-form"
        @submit.prevent="handleLogin">
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" placeholder="请输入用户名" size="large" prefix-icon="User" />
        </el-form-item>

        <el-form-item prop="password">
          <el-input v-model="loginForm.password" type="password" placeholder="请输入密码" size="large" prefix-icon="Lock"
            show-password />
        </el-form-item>

        <el-form-item prop="captcha">
          <div class="captcha-container">
            <el-input v-model="loginForm.captcha" placeholder="请输入计算结果" size="large" prefix-icon="Key"
              class="captcha-input" />
            <div class="captcha-image" @click="refreshCaptcha">
              <img v-if="captchaUrl" :src="captchaUrl" alt="验证码" />
              <div v-else class="captcha-placeholder">
                <el-icon>
                  <Picture />
                </el-icon>
              </div>
            </div>
          </div>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" size="large" class="login-button" :loading="loading" @click="handleLogin">
            登录
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import http from '../../axios/axios'
import { useUserStore } from '../../stores/user'

// 用户信息接口 - 适配后端返回格式
interface UserInfo {
  _id: string
  username: string
  realName: string
  email: string
  phone: string
  roleID: string
  permissions: string[]
}

const router = useRouter()
const userStore = useUserStore()
const loginFormRef = ref()
const loading = ref(false)

const loginForm = reactive({
  username: '',
  password: '',
  captcha: '',
})

const loginRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  captcha: [{ required: true, message: '请输入验证码', trigger: 'blur' }],
}

const captchaUrl = ref('')
const captchaId = ref('')
const currentCaptcha = ref('')

// 验证码选项
const captchaOptions = [
  {
    code: '4',
    question: '1 + 3 = ?',
    image:
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjQwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iNDAiIGZpbGw9IiNmMGYwZjAiLz48dGV4dCB4PSI2MCIgeT0iMjUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzMzMyIgdGV4dC1hbmNob3I9Im1pZGRsZSI+MSArIDMgPSA/PC90ZXh0Pjwvc3ZnPg==',
  },
  {
    code: '7',
    question: '3 + 4 = ?',
    image:
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjQwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iNDAiIGZpbGw9IiNmMGYwZjAiLz48dGV4dCB4PSI2MCIgeT0iMjUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzMzMyIgdGV4dC1hbmNob3I9Im1pZGRsZSI+MyArIDQgPSA/PC90ZXh0Pjwvc3ZnPg==',
  },
  {
    code: '5',
    question: '2 + 3 = ?',
    image:
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjQwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iNDAiIGZpbGw9IiNmMGYwZjAiLz48dGV4dCB4PSI2MCIgeT0iMjUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzMzMyIgdGV4dC1hbmNob3I9Im1pZGRsZSI+MiArIDMgPSA/PC90ZXh0Pjwvc3ZnPg==',
  },
  {
    code: '8',
    question: '5 + 3 = ?',
    image:
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjQwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iNDAiIGZpbGw9IiNmMGYwZjAiLz48dGV4dCB4PSI2MCIgeT0iMjUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzMzMyIgdGV4dC1hbmNob3I9Im1pZGRsZSI+NSArIDMgPSA/PC90ZXh0Pjwvc3ZnPg==',
  },
  {
    code: '6',
    question: '4 + 2 = ?',
    image:
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjQwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iNDAiIGZpbGw9IiNmMGYwZjAiLz48dGV4dCB4PSI2MCIgeT0iMjUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzMzMyIgdGV4dC1hbmNob3I9Im1pZGRsZSI+NCArIDIgPSA/PC90ZXh0Pjwvc3ZnPg==',
  },
]

// 获取验证码
const getCaptcha = () => {
  // 随机选择一个验证码
  const randomIndex = Math.floor(Math.random() * captchaOptions.length)
  const selectedCaptcha = captchaOptions[randomIndex]

  captchaUrl.value = selectedCaptcha.image
  currentCaptcha.value = selectedCaptcha.code
  captchaId.value = `captcha-${randomIndex}`
}

// 刷新验证码
const refreshCaptcha = () => {
  loginForm.captcha = ''
  getCaptcha()
}

// 组件挂载时获取验证码
onMounted(() => {
  getCaptcha()
})

const handleLogin = async () => {
  if (!loginFormRef.value) return

  try {
    await loginFormRef.value.validate()

    // {{ AURA-X: Modify - 移除前端验证码验证，改为后端验证. Approved: 安全修复. }}
    // 前端验证码验证已移除，改为后端验证
    // 注意：需要后端实现验证码验证逻辑

    loading.value = true

    // {{ AURA-X: Modify - 添加验证码到请求中. Approved: 安全修复. }}
    // 调用后端登录接口
    const response = await http.post('/lz/login', {
      username: loginForm.username,
      password: loginForm.password,
      captcha: loginForm.captcha,
      captchaId: captchaId.value
    })

    // 如果到这里说明登录成功（失败会被axios拦截器处理）
    // 根据你的后端接口，成功时返回 { code: 200, msg: "登录成功", data: userData }
    const userData: UserInfo = response.data
    userStore.setUserInfo(userData)

    ElMessage.success('登录成功')
    router.push('/home')
  } catch (error: any) {
    // 登录失败时刷新验证码
    refreshCaptcha()
    // 错误信息已经在 axios 拦截器中处理了
    console.error('登录失败:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-box {
  width: 400px;
  padding: 40px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header h1 {
  color: #2c3e50;
  font-size: 24px;
  margin-bottom: 8px;
  font-weight: 600;
}

.login-header p {
  color: #6c757d;
  font-size: 14px;
  margin: 0;
}

.login-form {
  margin-bottom: 20px;
}

.captcha-container {
  display: flex;
  gap: 12px;
  align-items: center;
}

.captcha-input {
  flex: 1;
}

.captcha-image {
  width: 120px;
  height: 40px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
  transition: border-color 0.3s;
}

.captcha-image:hover {
  border-color: #409eff;
}

.captcha-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 3px;
}

.captcha-placeholder {
  color: #909399;
  font-size: 20px;
}

.login-button {
  width: 100%;
  height: 44px;
  font-size: 16px;
  font-weight: 500;
}

.login-footer {
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid #e9ecef;
}

.login-footer p {
  color: #6c757d;
  font-size: 12px;
  margin: 0;
}

@media (max-width: 480px) {
  .login-box {
    width: 90%;
    padding: 30px 20px;
  }
}
</style>
