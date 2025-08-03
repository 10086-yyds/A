import axios from 'axios'
import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
} from 'axios'
import { ElMessage } from 'element-plus'

// 响应数据接口 - 适配你的后端格式
interface ApiResponse<T = any> {
  message?: string
  msg?: string
  user?: T
  data?: T
  success?: boolean
  code?: number
}

// 请求配置接口
interface RequestConfig extends AxiosRequestConfig {
  showLoading?: boolean
  showError?: boolean
}

// 错误信息接口
interface ErrorInfo {
  code: number
  message: string
}

class HttpRequest {
  private instance: AxiosInstance
  private baseURL: string
  private timeout: number

  constructor() {
    // 根据环境设置基础URL
    // {{ AURA-X: Modify - 移除硬编码API地址. Approved: 安全修复. }}
    // {{ AURA-X: Modify - 更新为用户IPv4地址. Approved: 网络配置修复. }}
    this.baseURL = process.env.VUE_APP_API_BASE_URL || 'http://198.18.0.1:3000'
    this.timeout = 10000

    // 创建axios实例
    this.instance = axios.create({
      baseURL: this.baseURL,
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
    })

    // 设置拦截器
    this.setupInterceptors()
  }

  /**
   * 设置请求和响应拦截器
   */
  private setupInterceptors(): void {
    // 请求拦截器
    this.instance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // 添加token
        const token = this.getToken()
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`
        }

        // 显示加载状态
        if ((config as any).showLoading !== false) {
          this.showLoading()
        }

        console.log('请求配置:', config)
        return config
      },
      (error: AxiosError) => {
        console.error('请求错误:', error)
        this.hideLoading()
        return Promise.reject(error)
      }
    )

    // 响应拦截器
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        this.hideLoading()

        const { data } = response

        // 调试：打印后端返回的数据
        console.log('后端返回数据:', data)
        console.log('请求URL:', response.config.url)

        // 根据你的后端接口格式处理
        // 登录接口：成功时返回 { code: 200, msg: "登录成功", data: userData }
        // 其他接口：成功时返回 { success: true, message: "xxx", data: xxx }
        // 失败时返回 { code: 400, msg: "错误信息" }

        // 检查是否是登录接口
        if (response.config.url?.includes('/login')) {
          // 登录接口：只有 code === 200 且 msg === '登录成功' 才算成功
          if (data.code === 200 && data.msg === '登录成功') {
            return data
          } else {
            // 登录失败处理 - 包括 code: 400 的情况
            const errorInfo: ErrorInfo = {
              code: data.code || 400,
              message: data.msg || '登录失败',
            }
            if ((response.config as any).showError !== false) {
              this.showError(errorInfo.message)
            }
            return Promise.reject(errorInfo)
          }
        } else {
          // 其他接口处理
          // 支持两种成功格式：
          // 1. { success: true, message: "xxx", data: xxx }
          // 2. { code: 200, msg: "xxx", data: xxx }
          if (data.success === true || data.code === 200) {
            return data
          } else {
            // 业务错误处理
            const errorInfo: ErrorInfo = {
              code: 400,
              message: data.message || data.msg || '请求失败',
            }
            if ((response.config as any).showError !== false) {
              this.showError(errorInfo.message)
            }
            return Promise.reject(errorInfo)
          }
        }
      },
      (error: AxiosError) => {
        this.hideLoading()

        let errorMessage = '网络错误'

        if (error.response) {
          const { status, data } = error.response

          switch (status) {
            case 400:
              errorMessage = (data as any)?.message || '请求参数错误'
              break
            case 401:
              errorMessage = (data as any)?.message || '未授权，请重新登录'
              this.handleUnauthorized()
              break
            case 403:
              errorMessage = (data as any)?.message || '拒绝访问'
              break
            case 404:
              errorMessage = '请求地址不存在'
              break
            case 500:
              errorMessage = (data as any)?.message || '服务器内部错误'
              break
            default:
              errorMessage = (data as any)?.message || `请求失败: ${status}`
          }
        } else if (error.request) {
          errorMessage = '网络连接失败'
        } else {
          errorMessage = error.message || '请求配置错误'
        }

        if ((error.config as any)?.showError !== false) {
          this.showError(errorMessage)
        }

        console.error('响应错误:', error)
        return Promise.reject({
          code: error.response?.status || 0,
          message: errorMessage,
        })
      }
    )
  }

  /**
   * 获取token
   */
  private getToken(): string | null {
    return localStorage.getItem('token') || sessionStorage.getItem('token')
  }

  /**
   * 显示加载状态
   */
  private showLoading(): void {
    // 这里可以集成loading组件，比如Element Plus的Loading
    console.log('显示加载状态')
  }

  /**
   * 隐藏加载状态
   */
  private hideLoading(): void {
    // 这里可以隐藏loading组件
    console.log('隐藏加载状态')
  }

  /**
   * 显示错误信息
   */
  private showError(message: string): void {
    ElMessage.error(message)
  }

  /**
   * 处理未授权情况
   */
  private handleUnauthorized(): void {
    // 清除token
    localStorage.removeItem('token')
    sessionStorage.removeItem('token')

    // 跳转到登录页
    // 这里需要根据实际路由配置调整
    window.location.href = '/login'
  }

  /**
   * GET请求
   */
  public get<T = any>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.instance.get(url, config)
  }

  /**
   * POST请求
   */
  public post<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.instance.post(url, data, config)
  }

  /**
   * PUT请求
   */
  public put<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.instance.put(url, data, config)
  }

  /**
   * DELETE请求
   */
  public delete<T = any>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.instance.delete(url, config)
  }

  /**
   * PATCH请求
   */
  public patch<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.instance.patch(url, data, config)
  }

  /**
   * 上传文件
   */
  public upload<T = any>(url: string, file: File, config?: RequestConfig): Promise<ApiResponse<T>> {
    const formData = new FormData()
    formData.append('file', file)

    return this.instance.post(url, formData, {
      ...config,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  }

  /**
   * 下载文件
   */
  public download(url: string, filename?: string, config?: RequestConfig): Promise<void> {
    return this.instance
      .get(url, {
        ...config,
        responseType: 'blob',
      })
      .then(response => {
        const blob = new Blob([response.data])
        const downloadUrl = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = downloadUrl
        link.download = filename || 'download'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(downloadUrl)
      })
  }
}

// 创建实例
const http = new HttpRequest()

// 导出实例和类
export default http
export { HttpRequest, type ApiResponse, type RequestConfig, type ErrorInfo }
