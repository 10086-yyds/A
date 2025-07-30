import axios from 'axios'
import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
} from 'axios'

// 响应数据接口
interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
  success: boolean
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
    this.baseURL = import.meta.env.VITE_API_BASE_URL || '/api'
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

        // 根据业务状态码处理
        if (data.code === 200 || data.success) {
          return data
        } else {
          // 业务错误处理
          const errorInfo: ErrorInfo = {
            code: data.code,
            message: data.message || '请求失败',
          }

          if ((response.config as any).showError !== false) {
            this.showError(errorInfo.message)
          }

          return Promise.reject(errorInfo)
        }
      },
      (error: AxiosError) => {
        this.hideLoading()

        let errorMessage = '网络错误'

        if (error.response) {
          const { status, data } = error.response

          switch (status) {
            case 401:
              errorMessage = '未授权，请重新登录'
              this.handleUnauthorized()
              break
            case 403:
              errorMessage = '拒绝访问'
              break
            case 404:
              errorMessage = '请求地址不存在'
              break
            case 500:
              errorMessage = '服务器内部错误'
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
    // 这里可以集成消息提示组件，比如Element Plus的Message
    console.error('错误信息:', message)
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
