module.exports = {
  root: true,
  extends: ['plugin:@typescript-eslint/recommended', 'plugin:prettier/recommended'],
  plugins: ['@typescript-eslint'],
  rules: {
    'prettier/prettier': 'error',
    // 移除无效的jest/globals环境配置
    // 可根据需要自定义规则
  },
};
