import { globalIgnores } from 'eslint/config'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import pluginVue from 'eslint-plugin-vue'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'

// To allow more languages other than `ts` in `.vue` files, uncomment the following lines:
// import { configureVueProject } from '@vue/eslint-config-typescript'
// configureVueProject({ scriptLangs: ['ts', 'tsx'] })
// More info at https://github.com/vuejs/eslint-config-typescript/#advanced-setup

export default defineConfigWithVueTs(
  {
    name: 'app/files-to-lint',
    files: ['**/*.{ts,mts,tsx,vue}'],
  },

  globalIgnores(['**/dist/**', '**/dist-ssr/**', '**/coverage/**']),

  // {{ AURA-X: Modify - 修复Vue 3 v-model语法支持. Approved: 代码质量修复. }}
  {
    ...pluginVue.configs['flat/vue3-essential'],
    rules: {
      ...pluginVue.configs['flat/vue3-essential'].rules,
      'vue/no-v-model-argument': 'off', // Vue 3 supports v-model arguments
      'vue/multi-word-component-names': 'off'
    }
  },
  vueTsConfigs.recommended,
  skipFormatting,
)
