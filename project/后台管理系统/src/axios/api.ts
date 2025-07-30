import http from './axios'

// 用户相关接口
export interface User {
  id: number
  username: string
  email: string
  avatar?: string
}

export interface LoginParams {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  user: User
}

// 用户API
export const userApi = {
  // 登录
  login: (data: LoginParams) => {
    return http.post<LoginResponse>('/auth/login', data)
  },

  // 获取用户信息
  getUserInfo: () => {
    return http.get<User>('/user/info')
  },

  // 更新用户信息
  updateUserInfo: (data: Partial<User>) => {
    return http.put<User>('/user/info', data)
  },

  // 上传头像
  uploadAvatar: (file: File) => {
    return http.upload<{ url: string }>('/user/avatar', file)
  },
}

// 文章相关接口
export interface Article {
  id: number
  title: string
  content: string
  author: string
  createTime: string
  updateTime: string
}

export interface ArticleListParams {
  page: number
  pageSize: number
  keyword?: string
}

export interface ArticleListResponse {
  list: Article[]
  total: number
  page: number
  pageSize: number
}

// 文章API
export const articleApi = {
  // 获取文章列表
  getList: (params: ArticleListParams) => {
    return http.get<ArticleListResponse>('/articles', { params })
  },

  // 获取文章详情
  getDetail: (id: number) => {
    return http.get<Article>(`/articles/${id}`)
  },

  // 创建文章
  create: (data: Omit<Article, 'id' | 'createTime' | 'updateTime'>) => {
    return http.post<Article>('/articles', data)
  },

  // 更新文章
  update: (id: number, data: Partial<Article>) => {
    return http.put<Article>(`/articles/${id}`, data)
  },

  // 删除文章
  delete: (id: number) => {
    return http.delete(`/articles/${id}`)
  },
}

// 文件相关API
export const fileApi = {
  // 上传文件
  upload: (file: File) => {
    return http.upload<{ url: string; filename: string }>('/files/upload', file)
  },

  // 下载文件
  download: (url: string, filename?: string) => {
    return http.download(url, filename)
  },
}

// 使用示例
export const apiExample = {
  // 登录示例
  async loginExample() {
    try {
      const response = await userApi.login({
        username: 'admin',
        password: '123456',
      })

      // 保存token
      localStorage.setItem('token', response.data.token)

      console.log('登录成功:', response.data.user)
      return response.data
    } catch (error) {
      console.error('登录失败:', error)
      throw error
    }
  },

  // 获取文章列表示例
  async getArticlesExample() {
    try {
      const response = await articleApi.getList({
        page: 1,
        pageSize: 10,
        keyword: 'Vue',
      })

      console.log('文章列表:', response.data)
      return response.data
    } catch (error) {
      console.error('获取文章列表失败:', error)
      throw error
    }
  },

  // 上传文件示例
  async uploadFileExample(file: File) {
    try {
      const response = await fileApi.upload(file)

      console.log('文件上传成功:', response.data)
      return response.data
    } catch (error) {
      console.error('文件上传失败:', error)
      throw error
    }
  },

  // 不显示加载状态的请求示例
  async silentRequestExample() {
    try {
      const response = await http.get('/api/silent', {
        showLoading: false,
        showError: false,
      })

      console.log('静默请求成功:', response.data)
      return response.data
    } catch (error) {
      console.error('静默请求失败:', error)
      throw error
    }
  },
}
