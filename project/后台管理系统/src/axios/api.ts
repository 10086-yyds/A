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

// 医生相关接口
export interface Doctor {
  id: string
  name: string
  department: string
  title: string
  phone: string
  email: string
  status: 'active' | 'inactive'
  createTime: string
}

export interface Position {
  _id: string
  username: string
  password: string
  realName: string
  email: string
  phone: string
  roleID: string | { _id: string; name: string; [key: string]: any } // 可能是字符串或对象
  _v: number
  // 可选字段，用于医生信息
  department?: string
  title?: string
  status?: string
  createTime?: string
}

export interface PositionListParams {
  page: number
  pageSize: number
  keyword?: string
}

export interface PositionListResponse {
  code: number
  msg: string
  data: Position[]
  total: number
}

// 医生API
export const doctorApi = {
  // 通过职位列表接口获取医生列表
  getDoctorsFromPositions: async () => {
    try {
      const response = await http.get<PositionListResponse>('/lz/positionList')
      console.log('所有用户数据:', response)
      if (response.code === 200) {
        // 调试：显示所有用户数据
        console.log('所有用户数据:', response.data)

        // 筛选出医生职位（通过roleID判断）
        const doctors = response.data.filter(position => {
          // 根据roleID判断是否为医生
          // 支持roleID为字符串或对象的情况
          const roleId =
            typeof position.roleID === 'string'
              ? position.roleID
              : position.roleID?._id || position.roleID?.id

          const roleName = typeof position.roleID === 'string' ? '' : position.roleID?.name || ''

          // 调试信息
          console.log(
            '检查用户:',
            position.realName,
            'roleID:',
            position.roleID,
            'roleId:',
            roleId,
            'roleName:',
            roleName
          )

          // 临时放宽筛选条件，显示所有用户用于调试
          return true

          // 原始筛选条件（暂时注释）
          // return (
          //   roleId === '688b5a2043564643c1fdd7b7' || // 医生roleID
          //   roleName?.includes('医生') || // 角色名称包含医生
          //   position.realName?.includes('医生') || // 真实姓名包含医生
          //   position.username?.includes('doctor') // 用户名包含doctor
          // )
        })

        // 转换为医生格式
        const doctorList: Doctor[] = doctors.map(position => ({
          id: position._id,
          name: position.realName || position.username,
          department: position.department || '未分配',
          title: position.title || '医生',
          phone: position.phone,
          email: position.email,
          status: position.status === 'active' ? 'active' : 'inactive',
          createTime: position.createTime || new Date().toISOString(),
        }))

        return {
          code: 200,
          msg: '获取成功',
          data: doctorList,
          total: doctorList.length,
        }
      }

      return {
        code: response.data?.code || 500,
        msg: response.data?.msg || '获取失败',
        data: [] as Doctor[],
        total: 0,
      }
    } catch (error) {
      console.error('获取医生列表失败:', error)
      throw error
    }
  },

  // 获取医生列表（直接调用医生接口）
  getList: (params: PositionListParams) => {
    return http.get<PositionListResponse>('/lz/doctors', { params })
  },

  // 获取医生详情
  getDetail: (id: string) => {
    return http.get<Doctor>(`/lz/doctors/${id}`)
  },

  // 创建医生
  create: (data: Omit<Doctor, 'id' | 'createTime'>) => {
    return http.post<Doctor>('/lz/doctors', data)
  },

  // 更新医生
  update: (id: string, data: Partial<Doctor>) => {
    return http.put<Doctor>(`/lz/doctors/${id}`, data)
  },

  // 删除医生
  delete: (id: string) => {
    return http.delete(`/lz/doctors/${id}`)
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
      localStorage.setItem('token', response.data?.token || '')

      console.log('登录成功:', response.data?.user)
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

// 医生API使用示例
export const doctorApiExample = {
  // 获取医生列表示例
  async getDoctorsExample() {
    try {
      const response = await doctorApi.getDoctorsFromPositions()

      console.log('医生列表:', response.data)
      return response.data
    } catch (error) {
      console.error('获取医生列表失败:', error)
      throw error
    }
  },

  // 创建医生示例
  async createDoctorExample() {
    try {
      const doctorData = {
        name: '新医生',
        department: '内科',
        title: '主治医师',
        phone: '13800138000',
        email: 'newdoctor@hospital.com',
        status: 'active' as const,
      }

      const response = await doctorApi.create(doctorData)
      console.log('创建医生成功:', response.data)
      return response.data
    } catch (error) {
      console.error('创建医生失败:', error)
      throw error
    }
  },

  // 更新医生示例
  async updateDoctorExample(id: string) {
    try {
      const updateData = {
        title: '副主任医师',
        status: 'active' as const,
      }

      const response = await doctorApi.update(id, updateData)
      console.log('更新医生成功:', response.data)
      return response.data
    } catch (error) {
      console.error('更新医生失败:', error)
      throw error
    }
  },

  // 删除医生示例
  async deleteDoctorExample(id: string) {
    try {
      await doctorApi.delete(id)
      console.log('删除医生成功')
    } catch (error) {
      console.error('删除医生失败:', error)
      throw error
    }
  },
}
