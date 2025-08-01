import { ElMessage, ElMessageBox } from 'element-plus'

// 导出格式类型
export type ExportFormat = 'xlsx' | 'csv'

// 导出配置接口
export interface ExportConfig {
  filename?: string
  format?: ExportFormat
  sheetName?: string
}

// 默认配置
const defaultConfig: ExportConfig = {
  filename: 'export',
  format: 'xlsx',
  sheetName: 'Sheet1',
}

/**
 * 导出数据为Excel文件
 * @param data 要导出的数据数组
 * @param columns 列配置
 * @param config 导出配置
 */
export const exportToExcel = async (
  data: any[],
  columns: Array<{
    key: string
    title: string
    formatter?: (value: any, row: any) => string
  }>,
  config: ExportConfig = {}
) => {
  try {
    // 动态导入xlsx库
    const XLSX = await import('xlsx')

    // 合并配置
    const finalConfig = { ...defaultConfig, ...config }

    // 处理数据
    const processedData = data.map((row, index) => {
      const processedRow: any = {}
      columns.forEach(column => {
        let value = row[column.key]

        // 使用自定义格式化函数
        if (column.formatter) {
          value = column.formatter(value, row)
        }

        processedRow[column.title] = value
      })
      return processedRow
    })

    // 创建工作簿
    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.json_to_sheet(processedData)

    // 设置列宽
    const colWidths = columns.map(col => ({ wch: Math.max(col.title.length, 10) }))
    worksheet['!cols'] = colWidths

    // 添加工作表到工作簿
    XLSX.utils.book_append_sheet(workbook, worksheet, finalConfig.sheetName)

    // 生成文件名
    const timestamp = new Date().toISOString().slice(0, 10)
    const filename = `${finalConfig.filename}_${timestamp}.xlsx`

    // 导出文件
    XLSX.writeFile(workbook, filename)

    ElMessage.success('导出成功')
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败，请检查数据格式')
  }
}

/**
 * 导出数据为CSV文件
 * @param data 要导出的数据数组
 * @param columns 列配置
 * @param config 导出配置
 */
export const exportToCSV = (
  data: any[],
  columns: Array<{
    key: string
    title: string
    formatter?: (value: any, row: any) => string
  }>,
  config: ExportConfig = {}
) => {
  try {
    // 合并配置
    const finalConfig = { ...defaultConfig, ...config }

    // 处理数据
    const processedData = data.map(row => {
      const processedRow: any = {}
      columns.forEach(column => {
        let value = row[column.key]

        // 使用自定义格式化函数
        if (column.formatter) {
          value = column.formatter(value, row)
        }

        processedRow[column.title] = value
      })
      return processedRow
    })

    // 生成CSV内容
    const headers = columns.map(col => col.title).join(',')
    const rows = processedData.map(row =>
      columns
        .map(col => {
          const value = row[col.title]
          // 如果值包含逗号或引号，需要用引号包围
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`
          }
          return value
        })
        .join(',')
    )

    const csvContent = [headers, ...rows].join('\n')

    // 创建Blob对象
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })

    // 生成文件名
    const timestamp = new Date().toISOString().slice(0, 10)
    const filename = `${finalConfig.filename}_${timestamp}.csv`

    // 下载文件
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = filename
    link.click()
    URL.revokeObjectURL(link.href)

    ElMessage.success('导出成功')
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败，请检查数据格式')
  }
}

/**
 * 通用导出函数
 * @param data 要导出的数据数组
 * @param columns 列配置
 * @param config 导出配置
 */
export const exportData = async (
  data: any[],
  columns: Array<{
    key: string
    title: string
    formatter?: (value: any, row: any) => string
  }>,
  config: ExportConfig = {}
) => {
  const finalConfig = { ...defaultConfig, ...config }

  if (finalConfig.format === 'csv') {
    exportToCSV(data, columns, config)
  } else {
    await exportToExcel(data, columns, config)
  }
}

/**
 * 带格式选择的导出函数
 * @param data 要导出的数据数组
 * @param columns 列配置
 * @param config 导出配置
 */
export const exportDataWithFormat = async (
  data: any[],
  columns: Array<{
    key: string
    title: string
    formatter?: (value: any, row: any) => string
  }>,
  config: ExportConfig = {}
) => {
  try {
    const result = await ElMessageBox.prompt('请选择导出格式', '导出设置', {
      confirmButtonText: '导出',
      cancelButtonText: '取消',
      inputType: 'select',
      inputValue: 'xlsx',
      inputPlaceholder: '请选择导出格式',
      inputOptions: [
        { label: 'Excel (.xlsx)', value: 'xlsx' },
        { label: 'CSV (.csv)', value: 'csv' },
      ],
    })

    if (result.action === 'confirm') {
      const format = result.value as ExportFormat
      await exportData(data, columns, { ...config, format })
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('导出失败:', error)
      ElMessage.error('导出失败')
    }
  }
}

/**
 * 预设的格式化函数
 */
export const formatters = {
  // 日期格式化
  date: (value: string | Date) => {
    if (!value) return ''
    const date = new Date(value)
    return date.toLocaleDateString('zh-CN')
  },

  // 时间格式化
  datetime: (value: string | Date) => {
    if (!value) return ''
    const date = new Date(value)
    return date.toLocaleString('zh-CN')
  },

  // 金额格式化
  currency: (value: number) => {
    if (value == null) return ''
    return `¥${value.toFixed(2)}`
  },

  // 状态格式化
  status: (value: string, statusMap: Record<string, string>) => {
    return statusMap[value] || value
  },

  // 布尔值格式化
  boolean: (value: boolean) => {
    return value ? '是' : '否'
  },
}
