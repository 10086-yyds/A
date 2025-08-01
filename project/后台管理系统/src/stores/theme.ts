import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  const isDarkMode = ref(false)

  // 初始化主题
  const initTheme = () => {
    const savedTheme = localStorage.getItem('theme')
    if (
      savedTheme === 'dark' ||
      (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)
    ) {
      isDarkMode.value = true
      applyTheme()
    }
  }

  // 切换主题
  const toggleTheme = () => {
    isDarkMode.value = !isDarkMode.value
    applyTheme()
    localStorage.setItem('theme', isDarkMode.value ? 'dark' : 'light')
  }

  // 应用主题
  const applyTheme = () => {
    const root = document.documentElement

    if (isDarkMode.value) {
      // 深色模式
      root.style.setProperty('--color-background', '#1a1a1a')
      root.style.setProperty('--color-background-soft', '#2a2a2a')
      root.style.setProperty('--color-background-mute', '#3a3a3a')
      root.style.setProperty('--color-text', '#ffffff')
      root.style.setProperty('--color-heading', '#ffffff')
      root.style.setProperty('--color-border', '#404040')
      root.style.setProperty('--color-border-hover', '#505050')
      root.style.setProperty('--card-background', '#2a2a2a')
      root.style.setProperty('--card-shadow', '0 2px 8px rgba(0, 0, 0, 0.3)')
      root.style.setProperty('--text-muted', '#a0a0a0')
    } else {
      // 浅色模式
      root.style.setProperty('--color-background', '#ffffff')
      root.style.setProperty('--color-background-soft', '#f8f8f8')
      root.style.setProperty('--color-background-mute', '#f2f2f2')
      root.style.setProperty('--color-text', '#2c3e50')
      root.style.setProperty('--color-heading', '#2c3e50')
      root.style.setProperty('--color-border', '#e1e1e1')
      root.style.setProperty('--color-border-hover', '#d1d1d1')
      root.style.setProperty('--card-background', '#ffffff')
      root.style.setProperty('--card-shadow', '0 2px 8px rgba(0, 0, 0, 0.1)')
      root.style.setProperty('--text-muted', '#6c757d')
    }
  }

  return {
    isDarkMode,
    initTheme,
    toggleTheme,
    applyTheme,
  }
})
