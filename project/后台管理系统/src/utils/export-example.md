# 导出工具使用指南

## 概述

`src/utils/export.ts` 提供了一个通用的数据导出工具，支持导出为 Excel (.xlsx) 和 CSV 格式。

## 功能特性

- ✅ 支持 Excel (.xlsx) 和 CSV 格式导出
- ✅ 自动格式化日期、时间、金额等字段
- ✅ 自定义列配置和格式化函数
- ✅ 自动设置列宽（Excel）
- ✅ 支持中文文件名
- ✅ 错误处理和用户提示

## 基本用法

### 1. 导入工具

```typescript
import { exportData, formatters } from '../utils/export'
```

### 2. 定义列配置

```typescript
const columns = [
  { key: 'id', title: 'ID' },
  { key: 'name', title: '姓名' },
  {
    key: 'price',
    title: '价格',
    formatter: formatters.currency, // 使用预设格式化函数
  },
  {
    key: 'status',
    title: '状态',
    formatter: (value: string) =>
      formatters.status(value, {
        active: '启用',
        inactive: '禁用',
      }),
  },
  {
    key: 'createTime',
    title: '创建时间',
    formatter: formatters.datetime,
  },
]
```

### 3. 调用导出函数

#### 方式一：直接指定格式

```typescript
const handleExport = async () => {
  await exportData(data, columns, {
    filename: '用户列表',
    format: 'xlsx', // 或 'csv'
    sheetName: '用户数据',
  })
}
```

#### 方式二：弹出格式选择对话框

```typescript
const handleExport = async () => {
  await exportDataWithFormat(data, columns, {
    filename: '用户列表',
    sheetName: '用户数据',
  })
}
```

## 预设格式化函数

### formatters.currency

格式化金额，添加货币符号

```typescript
formatters.currency(123.45) // "¥123.45"
```

### formatters.date

格式化日期

```typescript
formatters.date('2024-01-15') // "2024/1/15"
```

### formatters.datetime

格式化日期时间

```typescript
formatters.datetime('2024-01-15 10:30:00') // "2024/1/15 10:30:00"
```

### formatters.status

格式化状态，需要提供状态映射

```typescript
formatters.status('active', {
  active: '启用',
  inactive: '禁用',
}) // "启用"
```

### formatters.boolean

格式化布尔值

```typescript
formatters.boolean(true) // "是"
formatters.boolean(false) // "否"
```

## 自定义格式化函数

```typescript
const columns = [
  {
    key: 'customField',
    title: '自定义字段',
    formatter: (value: any, row: any) => {
      // 可以访问当前行的所有数据
      return `自定义格式: ${value}`
    },
  },
]
```

## 完整示例

### 商品列表导出

```typescript
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

  await exportData(products.value, columns, {
    filename: '商品列表',
    format: 'xlsx',
    sheetName: '商品数据',
  })
}
```

### 处方列表导出

```typescript
const handleExport = async () => {
  if (recipes.value.length === 0) {
    ElMessage.warning('暂无数据可导出')
    return
  }

  const columns = [
    { key: 'index', title: '序号' },
    { key: 'prescriptionNumber', title: '处方编号' },
    { key: 'patientName', title: '患者姓名' },
    { key: 'phone', title: '电话' },
    { key: 'hospital', title: '医院' },
    { key: 'department', title: '科室' },
    { key: 'doctor', title: '开方医生' },
    {
      key: 'cost',
      title: '费用',
      formatter: formatters.currency,
    },
    {
      key: 'submitTime',
      title: '提交时间',
      formatter: formatters.datetime,
    },
    { key: 'auditor', title: '审核人' },
    {
      key: 'auditTime',
      title: '审核时间',
      formatter: formatters.datetime,
    },
    {
      key: 'status',
      title: '状态',
      formatter: (value: string) =>
        formatters.status(value, {
          pending: '未审核',
          approved: '已审核',
          rejected: '审核未通过',
        }),
    },
  ]

  await exportData(recipes.value, columns, {
    filename: '处方列表',
    format: 'xlsx',
    sheetName: '处方数据',
  })
}
```

## 注意事项

1. **数据检查**：导出前检查数据是否为空
2. **列配置**：确保 `key` 与数据字段名称一致
3. **格式化函数**：根据需要选择合适的格式化函数
4. **文件名**：建议使用有意义的文件名，工具会自动添加日期后缀
5. **错误处理**：工具内置了错误处理，会显示相应的提示信息

## 依赖

- `xlsx`: 用于 Excel 文件生成
- `element-plus`: 用于消息提示

确保已安装相关依赖：

```bash
npm install xlsx
```
