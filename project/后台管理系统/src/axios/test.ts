import http from './axios'
import { userApi, articleApi, fileApi } from './api'

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
