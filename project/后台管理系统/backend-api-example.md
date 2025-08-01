# 后端API示例 - 获取医生列表

## 概述

本文档说明如何通过职位列表接口获取医生信息，并提供了完整的前端实现。

## 后端接口

### 职位列表接口

```javascript
router.get("/positionList", async function (req, res) {
  try {
    let { page = 1, pageSize = 10 } = req.query;
    page = parseInt(page);
    pageSize = parseInt(pageSize);
    
    let list = await positionModel
      .find({})
      .skip((page - 1) * pageSize)
      .limit(pageSize);
    let total = await positionModel.countDocuments();
    return res.json({ code: 200, msg: "获取成功", data: list, total });
  } catch (error) {
    console.error("获取职位列表错误:", error);
    return res.json({ code: 500, msg: "服务器错误" });
  }
});
```

### 响应数据格式

```json
{
  "code": 200,
  "msg": "获取成功",
  "data": [
    {
      "_id": "688b70ad43564643c1fdd80f",
      "username": "张三123",
      "password": "123456",
      "realName": "张三",
      "email": "2732849023@qq.com",
      "phone": "15233886553",
      "roleID": {
        "_id": "688b5a2043564643c1fdd7b7",
        "name": "医生"
      },
      "_v": 0
    },
    {
      "_id": "688b70ad43564643c1fdd810",
      "username": "李四123",
      "password": "123456",
      "realName": "李四",
      "email": "li@hospital.com",
      "phone": "13800138002",
      "roleID": {
        "_id": "688b5a2043564643c1fdd7b8",
        "name": "护士"
      },
      "_v": 0
    }
  ],
  "total": 100
}
```

## 前端实现

### 1. API接口定义

```typescript
// src/axios/api.ts
export const doctorApi = {
  // 通过职位列表接口获取医生列表
  getDoctorsFromPositions: async (params: PositionListParams) => {
    try {
      const response = await http.get<PositionListResponse>('/positionList', { params })
      
      if (response.data.code === 200) {
        // 筛选出医生职位
        const doctors = response.data.data.filter(position => {
          // 根据roleID判断是否为医生
          // 支持roleID为字符串或对象的情况
          const roleId = typeof position.roleID === 'string' 
            ? position.roleID 
            : position.roleID?._id || position.roleID?.id
            
          const roleName = typeof position.roleID === 'string' 
            ? '' 
            : position.roleID?.name || ''
            
          return (
            roleId === '688b5a2043564643c1fdd7b7' || // 医生roleID
            roleName?.includes('医生') || // 角色名称包含医生
            position.realName?.includes('医生') || // 真实姓名包含医生
            position.username?.includes('doctor') // 用户名包含doctor
          )
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
          createTime: position.createTime || new Date().toISOString()
        }))
        
        return {
          code: 200,
          msg: '获取成功',
          data: doctorList,
          total: doctorList.length
        }
      }
      
      return {
        code: response.data.code,
        msg: response.data.msg,
        data: [] as Doctor[],
        total: 0
      }
    } catch (error) {
      console.error('获取医生列表失败:', error)
      throw error
    }
  }
}
```

### 2. 在Vue组件中使用

```vue
<template>
  <div class="doctor-page">
    <!-- 医生列表 -->
    <el-table :data="doctors" v-loading="loading">
      <el-table-column prop="name" label="姓名" />
      <el-table-column prop="department" label="科室" />
      <el-table-column prop="title" label="职称" />
      <el-table-column prop="phone" label="联系电话" />
      <el-table-column prop="status" label="状态">
        <template #default="{ row }">
          <el-tag :type="row.status === 'active' ? 'success' : 'danger'">
            {{ row.status === 'active' ? '在职' : '离职' }}
          </el-tag>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :total="total"
      @current-change="getDoctors"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { doctorApi, type Doctor } from '../axios/api'

const loading = ref(false)
const doctors = ref<Doctor[]>([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 获取医生列表
const getDoctors = async () => {
  try {
    loading.value = true
    const response = await doctorApi.getDoctorsFromPositions({
      page: currentPage.value,
      pageSize: pageSize.value
    })
    
    if (response.code === 200) {
      doctors.value = response.data
      total.value = response.total
    }
  } catch (error) {
    console.error('获取医生列表失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  getDoctors()
})
</script>
```

## 筛选逻辑说明

系统会自动筛选出医生职位，筛选条件包括：

1. **角色ID**: `position.roleID._id === '688b5a2043564643c1fdd7b7'` (医生roleID)
2. **角色名称**: `position.roleID.name?.includes('医生')` (角色名称包含医生)
3. **真实姓名包含**: `position.realName?.includes('医生')`
4. **用户名包含**: `position.username?.includes('doctor')`

**注意**: 系统同时支持 `roleID` 为字符串或对象的情况，确保向后兼容。

## 数据转换

从职位数据转换为医生数据时，会进行以下处理：

- `_id` 转换为 `id`
- `realName` 或 `username` 转换为 `name`
- `department` 如果为空则设置为 '未分配'
- `title` 如果为空则设置为 '医生'
- 状态字段从 `string` 转换为 `'active' | 'inactive'`
- `createTime` 如果为空则使用当前时间
- 确保类型安全

## 使用示例

```typescript
// 获取所有医生
const allDoctors = await doctorApi.getDoctorsFromPositions({
  page: 1,
  pageSize: 100
})

// 搜索内科医生
const internalDoctors = await doctorApi.getDoctorsFromPositions({
  page: 1,
  pageSize: 10,
  keyword: '内科'
})

// 分页获取医生
const doctorsPage2 = await doctorApi.getDoctorsFromPositions({
  page: 2,
  pageSize: 20
})
```

## 注意事项

1. 确保后端 `/lz/positionList` 接口正常工作，并使用 `populate("roleID")` 关联角色信息
2. 数据中的 `roleID` 字段现在是一个对象，包含 `_id` 和 `name` 等属性
3. 医生用户的 `roleID._id` 应设置为特定的医生角色ID
4. 前端会自动处理数据转换和筛选逻辑，支持字符串和对象两种格式
5. 支持分页和搜索功能
6. 需要根据实际的医生roleID来修改筛选条件 