<template>
  <el-container class="app-container">
    <el-header class="header">
      <div class="logo">
        <i class="el-icon-lift"></i>
        <span class="logo-text">工地升降机管理系统</span>
      </div>
      <div class="header-right">
        <el-dropdown>
          <span class="user-info">
            <i class="el-icon-user"></i>
            <span class="user-name">{{ currentUser.name }}</span>
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item @click.native="logout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </el-header>
    <el-container>
      <el-aside class="sidebar">
        <el-menu :default-active="$route.path" class="menu" router>
          <el-menu-item index="/monitor">
            <i class="el-icon-video-camera"></i>
            <span>实时监控</span>
          </el-menu-item>
          <el-menu-item index="/statistics">
            <i class="el-icon-bar-chart"></i>
            <span>统计分析</span>
          </el-menu-item>
          <el-menu-item index="/maintenance">
            <i class="el-icon-wrench"></i>
            <span>维护管理</span>
          </el-menu-item>
          <el-menu-item index="/users">
            <i class="el-icon-user"></i>
            <span>用户管理</span>
          </el-menu-item>
          <el-menu-item index="/alarm">
            <i class="el-icon-bell"></i>
            <span>报警预警</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-main class="main-content">
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      currentUser: {
        name: '管理员',
        role: 'admin'
      }
    };
  },
  methods: {
    logout() {
      sessionStorage.removeItem('user');
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

body {
  font-family: 'Microsoft YaHei', sans-serif;
}

.app-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  color: #ffffff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 30px;
  height: 60px;
  flex-shrink: 0;
}

.logo {
  display: flex;
  align-items: center;
  font-size: 20px;
  font-weight: bold;
  color: #ffffff;
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
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  color: #ffffff;
  padding: 8px 16px;
  border-radius: 4px;
  transition: background-color 0.2s;
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
  width: 200px;
  background-color: #2f4050 !important;
  min-height: calc(100vh - 60px);
  flex-shrink: 0;
}

.sidebar .el-aside {
  background-color: #2f4050 !important;
}

.menu {
  border-right: none;
  height: 100%;
  background-color: #2f4050 !important;
}

.menu .el-menu {
  background-color: #2f4050 !important;
}

.menu .el-menu-item {
  background-color: #2f4050 !important;
  color: #a7b1c2;
  border-bottom: 1px solid #293846;
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

.main-content {
  background: #f3f3f4;
  padding: 20px;
  flex: 1;
  overflow-y: auto;
}
</style>
