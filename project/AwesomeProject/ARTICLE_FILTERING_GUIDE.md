# 文章分类过滤功能说明

## 功能概述

根据后端返回的 `cate` 字段动态过滤和显示不同分类的文章。

## 分类映射

| cate值 | 分类名称 | 说明 |
|--------|----------|------|
| 0 | 女性健康 | 女性健康相关文章 |
| 1 | 心理健康 | 心理健康相关文章 |
| 2 | 科学备孕 | 科学备孕相关文章 |
| 3 | 科学育儿 | 科学育儿相关文章 |

## 实现原理

### 1. 分类映射定义
```typescript
const categoryMap = {
  0: '女性健康',
  1: '心理健康', 
  2: '科学备孕',
  3: '科学育儿'
};
```

### 2. 文章过滤逻辑
```typescript
const getFilteredArticles = () => {
  if (!articleData || articleData.length === 0) return [];
  
  const selectedCategoryIndex = articleCategories.indexOf(selectedArticleTab);
  return articleData.filter((article: Article) => article.cate === selectedCategoryIndex);
};
```

### 3. 文章渲染
- 每个文章卡片显示对应的分类标签
- 根据选中的标签过滤显示相应分类的文章
- 空状态提示：当某个分类没有文章时显示友好提示

## 使用方法

1. **后端数据格式**：确保文章数据包含 `cate` 字段
2. **前端调用**：使用 `getFilteredArticles()` 获取过滤后的文章
3. **标签切换**：点击不同分类标签自动过滤文章

## 数据结构

```typescript
interface Article {
  id: string;
  title: string;
  browse: string;
  content: string;
  cate: number; // 分类索引：0-女性健康，1-心理健康，2-科学备孕，3-科学育儿
}
```

## 调试信息

控制台会输出过滤过程的详细信息：
- 当前选中的分类
- 分类对应的索引
- 过滤后的文章数量

## 注意事项

1. 确保后端返回的 `cate` 值与前端映射一致
2. 文章数据为空时会显示空状态提示
3. 分类标签点击后会立即更新文章列表 