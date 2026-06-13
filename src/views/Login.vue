<template>
  <div class="login-container">
    <div class="login-box">
      <div class="logo">
        <i class="el-icon-lift"></i>
        <span>工地升降机管理系统</span>
      </div>
      <el-form :model="form" ref="form" label-width="80px" class="login-form">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input type="password" v-model="form.password" placeholder="请输入密码"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="login" class="login-btn">登录</el-button>
        </el-form-item>
      </el-form>
      <div class="tips">
        <p>用户名: admin / operator / maintainer</p>
        <p>密码: 123456</p>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'Login',
  data() {
    return {
      form: {
        username: '',
        password: ''
      }
    };
  },
  methods: {
    login() {
      axios.post('/api/login', this.form)
        .then(res => {
          if (res.data.success) {
            sessionStorage.setItem('user', JSON.stringify(res.data.user));
            this.$router.push('/monitor');
          } else {
            this.$message.error(res.data.message);
          }
        })
        .catch(() => {
          this.$message.error('登录失败，请检查网络');
        });
    }
  }
};
</script>

<style>
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  display: flex;
  justify-content: center;
  align-items: center;
}

.login-box {
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  width: 400px;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  font-weight: bold;
  color: #1e3c72;
  margin-bottom: 30px;
}

.logo i {
  font-size: 36px;
  margin-right: 12px;
}

.login-btn {
  width: 100%;
}

.tips {
  margin-top: 20px;
  text-align: center;
  color: #999;
  font-size: 12px;
}

.tips p {
  margin: 5px 0;
}
</style>
