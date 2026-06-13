<template>
  <div class="users-page">
    <div class="page-header">
      <h2>用户管理</h2>
      <el-button type="primary" @click="showAddForm = true">
        <i class="el-icon-plus"></i> 新增用户
      </el-button>
    </div>
    
    <el-table :data="users" border>
      <el-table-column prop="username" label="用户名" width="120"></el-table-column>
      <el-table-column prop="name" label="真实姓名" width="120"></el-table-column>
      <el-table-column prop="role" label="角色" width="100">
        <template slot-scope="scope">
          <span :class="getRoleClass(scope.row.role)">
            {{ getRoleText(scope.row.role) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="phone" label="联系电话" width="130"></el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template slot-scope="scope">
          <span :class="scope.row.status === 1 ? 'status-active' : 'status-disabled'">
            {{ scope.row.status === 1 ? '启用' : '禁用' }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="created_at" label="创建时间" width="180"></el-table-column>
      <el-table-column label="操作" width="200">
        <template slot-scope="scope">
          <el-button size="small" @click="editUser(scope.row)">编辑</el-button>
          <el-button 
            size="small" 
            :type="scope.row.status === 1 ? 'warning' : 'success'" 
            @click="toggleStatus(scope.row)"
          >
            {{ scope.row.status === 1 ? '禁用' : '启用' }}
          </el-button>
          <el-button size="small" type="danger" @click="deleteUser(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <el-dialog title="用户信息" :visible.sync="showAddForm" width="500px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="用户名">
          <el-input v-model="form.username" :disabled="!!form.id"></el-input>
        </el-form-item>
        <el-form-item label="密码" v-if="!form.id">
          <el-input type="password" v-model="form.password"></el-input>
        </el-form-item>
        <el-form-item label="真实姓名">
          <el-input v-model="form.name"></el-input>
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="form.role">
            <el-option label="管理员" :value="1"></el-option>
            <el-option label="操作员" :value="2"></el-option>
            <el-option label="维护人员" :value="3"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="联系电话">
          <el-input v-model="form.phone"></el-input>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="form.status">
            <el-option label="启用" :value="1"></el-option>
            <el-option label="禁用" :value="0"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="showAddForm = false">取消</el-button>
        <el-button type="primary" @click="saveUser">保存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'Users',
  data() {
    return {
      users: [],
      showAddForm: false,
      form: {
        id: null,
        username: '',
        password: '',
        name: '',
        role: 2,
        phone: '',
        status: 1
      }
    };
  },
  mounted() {
    this.loadUsers();
  },
  methods: {
    loadUsers() {
      axios.get('/api/users').then(res => {
        if (res.data.success) {
          this.users = res.data.data;
        }
      });
    },
    getRoleClass(role) {
      const classes = ['', 'role-admin', 'role-operator', 'role-maintainer'];
      return classes[role] || '';
    },
    getRoleText(role) {
      const texts = ['', '管理员', '操作员', '维护人员'];
      return texts[role] || '未知';
    },
    editUser(user) {
      this.form = { ...user, password: '' };
      this.showAddForm = true;
    },
    saveUser() {
      if (!this.form.username) {
        this.$message.error('请输入用户名');
        return;
      }
      if (!this.form.id && !this.form.password) {
        this.$message.error('请输入密码');
        return;
      }
      
      const method = this.form.id ? 'put' : 'post';
      const url = this.form.id ? `/api/users/${this.form.id}` : '/api/users';
      
      axios[method](url, this.form).then(res => {
        if (res.data.success) {
          this.$message.success('保存成功');
          this.showAddForm = false;
          this.form = { id: null, username: '', password: '', name: '', role: 2, phone: '', status: 1 };
          this.loadUsers();
        }
      });
    },
    toggleStatus(user) {
      axios.put(`/api/users/${user.id}`, {
        ...user,
        status: user.status === 1 ? 0 : 1
      }).then(res => {
        if (res.data.success) {
          this.$message.success(user.status === 1 ? '已禁用' : '已启用');
          this.loadUsers();
        }
      });
    },
    deleteUser(user) {
      this.$confirm('确定要删除该用户吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(() => {
        axios.delete(`/api/users/${user.id}`).then(res => {
          if (res.data.success) {
            this.$message.success('删除成功');
            this.loadUsers();
          }
        });
      });
    }
  }
};
</script>

<style>
.users-page {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  color: #303133;
}

.role-admin {
  color: #409eff;
  background: #e3f2fd;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.role-operator {
  color: #67c23a;
  background: #e8f5e9;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.role-maintainer {
  color: #e6a23c;
  background: #fdf6ec;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.status-active {
  color: #67c23a;
  background: #e8f5e9;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.status-disabled {
  color: #909399;
  background: #f5f5f5;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}
</style>
