module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
    es2021: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 2021,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ['vue', '@typescript-eslint'],
  rules: {
    'vue/multi-word-component-names': 'off', // 关闭组件名称必须为多单词
    '@typescript-eslint/no-explicit-any': 'on', // 开启any类型检查
    '@typescript-eslint/ban-ts-comment': 'off', // 关闭ts注释检查
    'prettier/prettier': 'error', // 使用prettier格式化代码
  },
  overrides: [
    {
      files: ['*.vue'],
      rules: {
        'max-attributes-per-line': 'off',
      },
    },
  ],
}
