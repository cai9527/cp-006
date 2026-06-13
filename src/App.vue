<template>
  <div id="app-root">
    <router-view v-if="isLoginPage"></router-view>
    
    <el-container v-else class="app-container">
      <el-header class="header">
        <div class="logo">
          <i class="el-icon-lift"></i>
          <span class="logo-text">工地升降机管理系统</span>
        </div>
        <div class="header-right">
          <div class="sidebar-zoom-controls" title="菜单缩放（在菜单区域按住 Ctrl + 鼠标滚轮 可快捷缩放）">
            <el-tooltip content="缩小菜单" placement="bottom">
              <el-button
                size="mini"
                icon="el-icon-minus"
                circle
                :disabled="sidebarScale <= MIN_SCALE"
                @click="zoomOut"
                class="zoom-btn"
              ></el-button>
            </el-tooltip>
            <span class="zoom-label">{{ zoomPercent }}%</span>
            <el-tooltip content="放大菜单" placement="bottom">
              <el-button
                size="mini"
                icon="el-icon-plus"
                circle
                :disabled="sidebarScale >= MAX_SCALE"
                @click="zoomIn"
                class="zoom-btn"
              ></el-button>
            </el-tooltip>
            <el-tooltip content="恢复默认大小" placement="bottom">
              <el-button
                size="mini"
                icon="el-icon-refresh"
                circle
                :disabled="sidebarScale === DEFAULT_SCALE"
                @click="resetZoom"
                class="zoom-btn"
              ></el-button>
            </el-tooltip>
          </div>
          <el-tag :type="roleTagType" size="small" effect="dark" class="role-tag">{{ roleText }}</el-tag>
          <el-dropdown>
            <span class="user-info">
              <i class="el-icon-user"></i>
              <span class="user-name">{{ currentUser.name }}</span>
              <i class="el-icon-arrow-down el-icon--right"></i>
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item disabled>用户名：{{ currentUser.username }}</el-dropdown-item>
              <el-dropdown-item disabled>角色：{{ roleText }}</el-dropdown-item>
              <el-dropdown-item divided @click.native="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
      </el-header>
      <el-container class="main-layout">
        <el-aside
          :width="sidebarWidth + 'px'"
          class="sidebar"
          @wheel="handleWheel"
        >
          <el-menu
            :default-active="$route.path"
            class="menu"
            router
          >
            <el-menu-item index="/monitor">
              <i class="el-icon-video-camera"></i>
              <span>实时监控</span>
            </el-menu-item>
            <el-menu-item index="/devices">
              <i class="el-icon-s-tools"></i>
              <span>设备管理</span>
            </el-menu-item>
            <el-menu-item index="/drivers/add">
              <i class="el-icon-s-custom"></i>
              <span>驾驶员管理</span>
            </el-menu-item>
            <el-menu-item index="/statistics">
              <i class="el-icon-bar-chart"></i>
              <span>统计分析</span>
            </el-menu-item>
            <el-menu-item index="/maintenance">
              <i class="el-icon-wrench"></i>
              <span>维护管理</span>
            </el-menu-item>
            <el-menu-item index="/alarm">
              <i class="el-icon-bell"></i>
              <span>报警预警</span>
            </el-menu-item>
            <el-submenu index="system" v-if="$isAdmin">
              <template slot="title">
                <i class="el-icon-setting"></i>
                <span>系统管理</span>
              </template>
              <el-menu-item index="/users">
                <i class="el-icon-user"></i>
                <span>用户管理</span>
              </el-menu-item>
            </el-submenu>
          </el-menu>
        </el-aside>
        <el-main class="main-content">
          <div class="content-inner">
            <router-view></router-view>
          </div>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>
import { getUser, getRoleText, isAdmin, logout as clearUser } from './utils/permissions';

const DEFAULT_SCALE = 1.0;
const MIN_SCALE = 0.7;
const MAX_SCALE = 1.5;
const STEP = 0.1;
const STORAGE_KEY = 'sidebar_scale';
const BASE_SIDEBAR_WIDTH = 200;
const BASE_CONTENT_PADDING = 20;

export default {
  name: 'App',
  data() {
    return {
      currentUser: {
        id: null,
        username: '',
        name: '',
        role: null
      },
      sidebarScale: DEFAULT_SCALE,
      MIN_SCALE,
      MAX_SCALE,
      DEFAULT_SCALE
    };
  },
  computed: {
    isLoginPage() {
      return this.$route.path === '/login';
    },
    roleText() {
      return getRoleText(this.currentUser.role);
    },
    roleTagType() {
      if (isAdmin()) return 'danger';
      return 'success';
    },
    zoomPercent() {
      return Math.round(this.sidebarScale * 100);
    },
    sidebarWidth() {
      return Math.round(BASE_SIDEBAR_WIDTH * this.sidebarScale);
    },
    contentPadding() {
      return Math.round(BASE_CONTENT_PADDING * this.sidebarScale);
    }
  },
  watch: {
    $route() {
      this.loadUser();
    },
    sidebarScale(val) {
      try {
        sessionStorage.setItem(STORAGE_KEY, String(val));
      } catch (e) {}
    }
  },
  created() {
    this.loadUser();
    this.loadScale();
    this.applyRootStyles();
  },
  updated() {
    this.applyRootStyles();
  },
  methods: {
    loadUser() {
      const user = getUser();
      if (user) {
        this.currentUser = user;
      }
    },
    loadScale() {
      try {
        const saved = parseFloat(sessionStorage.getItem(STORAGE_KEY));
        if (!isNaN(saved) && saved >= MIN_SCALE && saved <= MAX_SCALE) {
          this.sidebarScale = saved;
        }
      } catch (e) {}
    },
    applyRootStyles() {
      const root = document.documentElement;
      if (root) {
        root.style.setProperty('--sb-scale', this.sidebarScale);
        root.style.setProperty('--sb-width', this.sidebarWidth + 'px');
        root.style.setProperty('--sb-font', (14 * this.sidebarScale) + 'px');
        root.style.setProperty('--sb-icon', (16 * this.sidebarScale) + 'px');
        root.style.setProperty('--sb-item-height', (50 * this.sidebarScale) + 'px');
        root.style.setProperty('--sb-item-padding', (20 * this.sidebarScale) + 'px');
        root.style.setProperty('--sb-sub-padding', (50 * this.sidebarScale) + 'px');
        root.style.setProperty('--sb-content-padding', this.contentPadding + 'px');
        root.style.setProperty('--sb-scroll-width', Math.max(6, 6 * this.sidebarScale) + 'px');
      }
    },
    zoomIn() {
      this.sidebarScale = Math.min(MAX_SCALE, +(this.sidebarScale + STEP).toFixed(2));
    },
    zoomOut() {
      this.sidebarScale = Math.max(MIN_SCALE, +(this.sidebarScale - STEP).toFixed(2));
    },
    resetZoom() {
      this.sidebarScale = DEFAULT_SCALE;
    },
    handleWheel(e) {
      if (!e.ctrlKey) return;
      e.preventDefault();
      if (e.deltaY < 0) {
        this.zoomIn();
      } else if (e.deltaY > 0) {
        this.zoomOut();
      }
    },
    logout() {
      clearUser();
      this.currentUser = { id: null, username: '', name: '', role: null };
      this.$router.push('/login');
    }
  }
};
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --sb-scale: 1;
  --sb-width: 200px;
  --sb-font: 14px;
  --sb-icon: 16px;
  --sb-item-height: 50px;
  --sb-item-padding: 20px;
  --sb-sub-padding: 50px;
  --sb-content-padding: 20px;
  --sb-scroll-width: 6px;
}

body {
  font-family: 'Microsoft YaHei', sans-serif;
}

#app-root {
  min-height: 100vh;
  width: 100%;
}

.app-container {
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.main-layout {
  flex: 1;
  display: flex;
  overflow: hidden;
  min-width: 0;
}

.header {
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  color: #ffffff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 30px;
  height: 60px !important;
  line-height: 60px;
  flex-shrink: 0;
  z-index: 10;
}

.logo {
  display: flex;
  align-items: center;
  font-size: 20px;
  font-weight: bold;
  color: #ffffff;
  line-height: 1;
}

.logo i {
  margin-right: 10px;
  font-size: 28px;
  color: #ffffff;
}

.logo-text {
  color: #ffffff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.header-right {
  display: flex;
  align-items: center;
  line-height: 1;
}

.sidebar-zoom-controls {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-right: 16px;
  padding: 4px 10px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  transition: background-color 0.2s;
  user-select: none;
}

.sidebar-zoom-controls:hover {
  background: rgba(255, 255, 255, 0.15);
}

.zoom-btn {
  color: #ffffff !important;
  background: rgba(255, 255, 255, 0.15) !important;
  border: none !important;
  transition: all 0.2s;
}

.zoom-btn:hover:not(.is-disabled) {
  background: rgba(255, 255, 255, 0.3) !important;
  transform: scale(1.05);
}

.zoom-btn.is-disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.zoom-label {
  color: #ffffff;
  font-size: 12px;
  min-width: 36px;
  text-align: center;
  font-weight: 500;
}

.role-tag {
  margin-right: 16px;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  color: #ffffff;
  padding: 8px 16px;
  border-radius: 4px;
  transition: background-color 0.2s;
  line-height: 1;
}

.user-info:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.user-info i {
  margin-right: 8px;
  color: #ffffff;
}

.user-name {
  color: #ffffff;
  font-size: 14px;
}

.sidebar {
  background-color: #2f4050 !important;
  flex-shrink: 0;
  overflow-y: auto;
  overflow-x: hidden;
  transition: width 0.25s ease;
  height: calc(100vh - 60px);
}

.sidebar .el-aside {
  background-color: #2f4050 !important;
}

.menu {
  border-right: none;
  background-color: #2f4050 !important;
  width: 100%;
  height: 100%;
}

.menu .el-menu {
  background-color: #2f4050 !important;
}

.menu .el-menu-item {
  height: var(--sb-item-height) !important;
  line-height: var(--sb-item-height) !important;
  padding: 0 var(--sb-item-padding) !important;
  font-size: var(--sb-font) !important;
  background-color: #2f4050 !important;
  color: #a7b1c2;
  border-bottom: 1px solid #293846;
  transition: background-color 0.2s, color 0.2s;
}

.menu .el-menu-item i {
  font-size: var(--sb-icon) !important;
  margin-right: calc(10px * var(--sb-scale)) !important;
  width: var(--sb-icon) !important;
  text-align: center;
  vertical-align: middle;
}

.menu .el-menu-item:hover {
  background-color: #1f2d3d !important;
  color: #ffffff;
}

.menu .el-menu-item.is-active {
  background-color: #1ab394 !important;
  color: #ffffff;
}

.menu .el-menu-item.is-active:hover {
  background-color: #179d82 !important;
}

.menu .el-submenu__title {
  height: var(--sb-item-height) !important;
  line-height: var(--sb-item-height) !important;
  padding: 0 var(--sb-item-padding) !important;
  font-size: var(--sb-font) !important;
  background-color: #2f4050 !important;
  color: #a7b1c2 !important;
  border-bottom: 1px solid #293846;
  transition: background-color 0.2s, color 0.2s;
}

.menu .el-submenu__title i {
  font-size: var(--sb-icon) !important;
  margin-right: calc(10px * var(--sb-scale)) !important;
  width: var(--sb-icon) !important;
  text-align: center;
  vertical-align: middle;
}

.menu .el-submenu__title:hover {
  background-color: #1f2d3d !important;
  color: #ffffff !important;
}

.menu .el-submenu .el-menu {
  background-color: #293846 !important;
}

.menu .el-submenu .el-menu-item {
  height: var(--sb-item-height) !important;
  line-height: var(--sb-item-height) !important;
  padding: 0 var(--sb-sub-padding) !important;
  font-size: var(--sb-font) !important;
  background-color: #293846 !important;
  color: #a7b1c2;
  border-bottom: 1px solid #243241;
  min-width: 0 !important;
}

.menu .el-submenu .el-menu-item:hover {
  background-color: #1f2d3d !important;
  color: #ffffff;
}

.menu .el-submenu .el-menu-item.is-active {
  background-color: #1ab394 !important;
  color: #ffffff;
}

.menu .el-menu-item [class^="el-icon-"],
.menu .el-submenu__title [class^="el-icon-"] {
  vertical-align: middle;
}

.el-menu--popup {
  min-width: 0 !important;
}

.main-content {
  background: #f3f3f4;
  padding: 0 !important;
  flex: 1;
  overflow: hidden !important;
  min-width: 0;
  transition: all 0.25s ease;
}

.main-content .el-main {
  padding: 0 !important;
}

.content-inner {
  width: 100%;
  height: 100%;
  padding: var(--sb-content-padding);
  overflow-y: auto;
  overflow-x: auto;
  box-sizing: border-box;
  transition: padding 0.25s ease;
}

.sidebar::-webkit-scrollbar,
.content-inner::-webkit-scrollbar {
  width: var(--sb-scroll-width);
  height: var(--sb-scroll-width);
}

.sidebar::-webkit-scrollbar-track {
  background: #2f4050;
}

.content-inner::-webkit-scrollbar-track {
  background: #e8e8e8;
  border-radius: 3px;
}

.sidebar::-webkit-scrollbar-thumb {
  background: #51667a;
  border-radius: 3px;
  transition: background 0.2s;
}

.content-inner::-webkit-scrollbar-thumb {
  background: #c0c4cc;
  border-radius: 3px;
  transition: background 0.2s;
}

.sidebar::-webkit-scrollbar-thumb:hover {
  background: #6b7d8e;
}

.content-inner::-webkit-scrollbar-thumb:hover {
  background: #a0a4ac;
}

.sidebar::-webkit-scrollbar-corner,
.content-inner::-webkit-scrollbar-corner {
  background: transparent;
}
</style>
