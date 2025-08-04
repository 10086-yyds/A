<template>
  <!-- 登录页面不显示菜单栏 -->
  <div v-if="isLoginPage" class="login-container">
    <router-view />
  </div>

  <!-- 其他页面显示完整布局 -->
  <div v-else class="app-container">
    <!-- 左侧菜单栏 -->
    <el-aside width="256px" class="sidebar">
      <div class="sidebar-header">
        <el-avatar
          :size="40"
          src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"
        />
        <span class="platform-title">互联网医院管理平台</span>
      </div>

      <el-menu
        :default-active="activeIndex"
        class="sidebar-menu"
        background-color="#1e3a8a"
        text-color="#ffffff"
        active-text-color="#409eff"
        :collapse="false"
        router
      >
        <!-- 动态渲染菜单项 -->
        <template v-for="menu in userStore.menuItems" :key="menu.index">
          <!-- 子菜单 -->
          <el-sub-menu v-if="menu.children && menu.children.length > 0" :index="menu.index">
            <template #title>
              <el-icon><component :is="menu.icon" /></el-icon>
              <span>{{ menu.title }}</span>
            </template>
            <el-menu-item v-for="child in menu.children" :key="child.index" :index="child.index">
              <el-icon><component :is="child.icon" /></el-icon>
              <span>{{ child.title }}</span>
            </el-menu-item>
          </el-sub-menu>

          <!-- 单菜单项 -->
          <el-menu-item v-else :index="menu.index">
            <el-icon><component :is="menu.icon" /></el-icon>
            <span>{{ menu.title }}</span>
          </el-menu-item>
        </template>
      </el-menu>
    </el-aside>

    <!-- 主内容区域 -->
    <el-main class="main-content">
      <router-view />
    </el-main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useThemeStore } from './stores/theme'
import { useUserStore } from './stores/user'

const route = useRoute()
const themeStore = useThemeStore()
const userStore = useUserStore()
const activeIndex = ref(route.path)

// 判断是否为登录页面
const isLoginPage = computed(() => {
  return route.path === '/login' || route.path === '/'
})

// 初始化用户信息
userStore.initUserInfo()
</script>

<style scoped>
.login-container {
  height: 100vh;
  width: 100vw;
}

.app-container {
  display: flex;
  height: 100vh;
  background-color: var(--color-background);
}

.sidebar {
  background-color: #1e3a8a;
  border-right: 1px solid var(--color-border);
}

.sidebar-header {
  width: 195px;
  display: flex;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.platform-title {
  margin-left: 12px;
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
}

.sidebar-menu {
  border-right: none;
  /* height: calc(100vh - 60px); */
  overflow-y: auto;
}

/* 隐藏滚动条 - 更强制的方式 */
.sidebar-menu::-webkit-scrollbar {
  width: 0 !important;
  display: none !important;
}

.sidebar-menu::-webkit-scrollbar-track {
  display: none !important;
}

.sidebar-menu::-webkit-scrollbar-thumb {
  display: none !important;
}

.sidebar-menu {
  -ms-overflow-style: none !important; /* IE and Edge */
  scrollbar-width: none !important; /* Firefox */
}

/* 针对 Element Plus 菜单组件的滚动条 */
.sidebar-menu .el-menu {
  overflow-y: auto;
}

.sidebar-menu .el-menu::-webkit-scrollbar {
  width: 0 !important;
  display: none !important;
}

.sidebar-menu .el-menu::-webkit-scrollbar-track {
  display: none !important;
}

.sidebar-menu .el-menu::-webkit-scrollbar-thumb {
  display: none !important;
}

.sidebar-menu .el-menu {
  -ms-overflow-style: none !important;
  scrollbar-width: none !important;
}

.sidebar-menu .el-menu-item {
  height: 35px;
  line-height: 35px;
  margin: 1px 0;
  border-radius: 0;
  font-size: 14px;
}

.sidebar-menu .el-sub-menu .el-sub-menu__title {
  height: 35px;
  line-height: 35px;
  font-size: 14px;
}

.sidebar-menu .el-sub-menu .el-menu-item {
  height: 32px;
  line-height: 32px;
  margin: 1px 0;
  padding-left: 48px !important;
  font-size: 13px;
}

.sidebar-menu .el-menu-item:hover {
  background-color: rgba(255, 255, 255, 0.1) !important;
}

.sidebar-menu .el-menu-item.is-active {
  background-color: #409eff !important;
  color: #ffffff !important;
}

.main-content {
  flex: 1;
  background-color: var(--color-background);
  padding: 20px;
  color: var(--color-text);
}
</style>
