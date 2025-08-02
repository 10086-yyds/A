import http from './axios'
import { userApi, articleApi, fileApi, doctorApi, doctorApiExample } from './api'

// 测试函数
export const testAxios = {
  // 测试基础请求
  async testBasicRequests() {
    console.log('=== 测试基础请求 ===')

    try {
      // 测试 GET 请求
      const getResponse = await http.get('/test/get')
      console.log('GET 请求成功:', getResponse)

      // 测试 POST 请求
      const postResponse = await http.post('/test/post', { name: 'test' })
      console.log('POST 请求成功:', postResponse)

      // 测试带参数的请求
      const paramsResponse = await http.get('/test/params', {
        params: { id: 1, name: 'test' },
      })
      console.log('带参数请求成功:', paramsResponse)
    } catch (error) {
      console.error('基础请求测试失败:', error)
    }
  },

  // 测试用户 API
  async testUserApi() {
    console.log('=== 测试用户 API ===')

    try {
      // 测试登录
      const loginResponse = await userApi.login({
        username: 'admin',
        password: '123456',
      })
      console.log('登录成功:', loginResponse)

      // 测试获取用户信息
      const userInfoResponse = await userApi.getUserInfo()
      console.log('获取用户信息成功:', userInfoResponse)
    } catch (error) {
      console.error('用户 API 测试失败:', error)
    }
  },

  // 测试文章 API
  async testArticleApi() {
    console.log('=== 测试文章 API ===')

    try {
      // 测试获取文章列表
      const listResponse = await articleApi.getList({
        page: 1,
        pageSize: 10,
      })
      console.log('获取文章列表成功:', listResponse)

      // 测试获取文章详情
      const detailResponse = await articleApi.getDetail(1)
      console.log('获取文章详情成功:', detailResponse)
    } catch (error) {
      console.error('文章 API 测试失败:', error)
    }
  },

  // 测试静默请求
  async testSilentRequest() {
    console.log('=== 测试静默请求 ===')

    try {
      const response = await http.get('/test/silent', {
        showLoading: false,
        showError: false,
      })
      console.log('静默请求成功:', response)
    } catch (error) {
      console.error('静默请求测试失败:', error)
    }
  },

  // 测试错误处理
  async testErrorHandling() {
    console.log('=== 测试错误处理 ===')

    try {
      // 测试 404 错误
      await http.get('/test/not-found')
    } catch (error) {
      console.log('404 错误处理正常:', error)
    }

    try {
      // 测试业务错误
      await http.post('/test/business-error', {})
    } catch (error) {
      console.log('业务错误处理正常:', error)
    }
  },

  // 测试文件操作
  async testFileOperations() {
    console.log('=== 测试文件操作 ===')

    try {
      // 创建测试文件
      const testFile = new File(['test content'], 'test.txt', {
        type: 'text/plain',
      })

      // 测试文件上传
      const uploadResponse = await fileApi.upload(testFile)
      console.log('文件上传成功:', uploadResponse)
    } catch (error) {
      console.error('文件操作测试失败:', error)
    }
  },

  // 运行所有测试
  async runAllTests() {
    console.log('开始运行 axios 封装测试...')

    await this.testBasicRequests()
    await this.testUserApi()
    await this.testArticleApi()
    await this.testSilentRequest()
    await this.testErrorHandling()
    await this.testFileOperations()

    console.log('所有测试完成!')
  },
}

// 在浏览器控制台中运行测试
if (typeof window !== 'undefined') {
  // @ts-ignore
  window.testAxios = testAxios
  console.log('测试函数已挂载到 window.testAxios')
  console.log('运行测试: window.testAxios.runAllTests()')
}

// 测试医生API功能
export const testDoctorApi = async () => {
  console.log('开始测试医生API...')

  try {
    // 测试1: 获取医生列表
    console.log('\n=== 测试1: 获取医生列表 ===')
    const doctorsResponse = await doctorApi.getDoctorsFromPositions({
      page: 1,
      pageSize: 10,
    })
    console.log('医生列表响应:', doctorsResponse)
    console.log('医生数量:', doctorsResponse.data.length)

    // 测试2: 搜索特定科室的医生
    console.log('\n=== 测试2: 搜索内科医生 ===')
    const searchResponse = await doctorApi.getDoctorsFromPositions({
      page: 1,
      pageSize: 10,
      keyword: '内科',
    })
    console.log('内科医生列表:', searchResponse.data)

    // 测试3: 使用示例函数
    console.log('\n=== 测试3: 使用示例函数 ===')
    await doctorApiExample.getDoctorsExample()

    console.log('\n✅ 医生API测试完成!')
    return true
  } catch (error) {
    console.error('\n❌ 医生API测试失败:', error)
    return false
  }
}

// 模拟后端数据测试
export const testWithMockData = () => {
  console.log('开始模拟数据测试...')

  // 模拟职位数据
  const mockPositions = [
    {
      _id: '688b70ad43564643c1fdd80f',
      username: '张三123',
      password: '123456',
      realName: '张三',
      email: '2732849023@qq.com',
      phone: '15233886553',
      roleID: { _id: '688b5a2043564643c1fdd7b7', name: '医生' }, // 医生roleID对象
      _v: 0,
      department: '内科',
      title: '主任医师',
      status: 'active',
      createTime: '2024-01-15 10:30:00',
    },
    {
      _id: '688b70ad43564643c1fdd810',
      username: '李四123',
      password: '123456',
      realName: '李四',
      email: 'li@hospital.com',
      phone: '13800138002',
      roleID: { _id: '688b5a2043564643c1fdd7b8', name: '护士' }, // 护士roleID对象
      _v: 0,
      department: '护理部',
      title: '主管护师',
      status: 'active',
      createTime: '2024-01-16 14:20:00',
    },
    {
      _id: '688b70ad43564643c1fdd811',
      username: '王五123',
      password: '123456',
      realName: '王五',
      email: 'wang@hospital.com',
      phone: '13800138003',
      roleID: { _id: '688b5a2043564643c1fdd7b7', name: '医生' }, // 医生roleID对象
      _v: 0,
      department: '外科',
      title: '副主任医师',
      status: 'active',
      createTime: '2024-01-17 09:15:00',
    },
    {
      _id: '688b70ad43564643c1fdd812',
      username: '赵医生',
      password: '123456',
      realName: '赵医生',
      email: 'zhao@hospital.com',
      phone: '13800138004',
      roleID: { _id: '688b5a2043564643c1fdd7b7', name: '医生' }, // 医生roleID对象
      _v: 0,
      department: '儿科',
      title: '主治医师',
      status: 'inactive',
      createTime: '2024-01-18 16:45:00',
    },
  ]

  // 模拟筛选逻辑
  const doctors = mockPositions.filter(position => {
    // 支持roleID为字符串或对象的情况
    const roleId =
      typeof position.roleID === 'string'
        ? position.roleID
        : position.roleID?._id || position.roleID?.id

    const roleName = typeof position.roleID === 'string' ? '' : position.roleID?.name || ''

    return (
      roleId === '688b5a2043564643c1fdd7b7' || // 医生roleID
      roleName?.includes('医生') || // 角色名称包含医生
      position.realName?.includes('医生') || // 真实姓名包含医生
      position.username?.includes('doctor') // 用户名包含doctor
    )
  })

  console.log('原始职位数据:', mockPositions)
  console.log('筛选后的医生数据:', doctors)
  console.log('医生数量:', doctors.length)

  return doctors
}

// 调试筛选条件
export const debugFilterConditions = async () => {
  console.log('开始调试筛选条件...')

  try {
    const response = await doctorApi.getDoctorsFromPositions({
      page: 1,
      pageSize: 10,
    })

    console.log('API响应:', response)

    // 手动测试不同的筛选条件
    if (response.data?.data) {
      response.data.data.forEach((position, index) => {
        console.log(`\n用户 ${index + 1}:`, {
          realName: position.realName,
          username: position.username,
          roleID: position.roleID,
          roleIDType: typeof position.roleID,
          roleIDId: typeof position.roleID === 'string' ? position.roleID : position.roleID?._id,
          roleIDName: typeof position.roleID === 'string' ? '' : position.roleID?.name,
        })
      })
    }

    return response
  } catch (error) {
    console.error('调试失败:', error)
    throw error
  }
}

// 运行测试
if (typeof window !== 'undefined') {
  // 在浏览器环境中运行
  window.testDoctorApi = testDoctorApi
  window.testWithMockData = testWithMockData
  window.debugFilterConditions = debugFilterConditions
}

export default {
  testDoctorApi,
  testWithMockData,
  debugFilterConditions,
}
