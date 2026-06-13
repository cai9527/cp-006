<template>
  <el-container class="app-container">
    <el-header class="header">
      <div class="logo">
        <i class="el-icon-lift"></i>
        <span>工地升降机管理系统</span>
      </div>
      <div class="header-right">
        <el-dropdown>
          <span class="user-info">
            <i class="el-icon-user"></i>
            {{ currentUser.name }}
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item @click="logout">退出登录</el-dropdown-item>
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
}

.header {
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 30px;
}

.logo {
  display: flex;
  align-items: center;
  font-size: 20px;
  font-weight: bold;
}

.logo i {
  margin-right: 10px;
  font-size: 28px;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.user-info i {
  margin-right: 8px;
}

.sidebar {
  width: 200px;
  background: #2f4050;
}

.menu {
  border-right: none;
  height: 100%;
}

.main-content {
  background: #f3f3f4;
  padding: 20px;
}
</style>
