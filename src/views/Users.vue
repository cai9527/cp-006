<template>
  <div class="users-page">
    <PageHeader title="用户管理">
      <el-button type="primary" @click="showAddDialog">
        <i class="el-icon-plus"></i> 新增用户
      </el-button>
    </PageHeader>

    <el-table :data="users" border stripe>
      <el-table-column prop="username" label="用户名" width="140"></el-table-column>
      <el-table-column prop="name" label="姓名" width="120"></el-table-column>
      <el-table-column prop="phone" label="手机号" width="140">
        <template slot-scope="scope">{{ $format.formatPhone(scope.row.phone) }}</template>
      </el-table-column>
      <el-table-column prop="role" label="角色" width="120">
        <template slot-scope="scope">
          <StatusBadge type="role" :value="scope.row.role" />
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template slot-scope="scope">
          <StatusBadge type="user" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column prop="created_at" label="创建时间" width="180"></el-table-column>
      <el-table-column label="操作" width="220" fixed="right">
        <template slot-scope="scope">
          <el-button size="small" @click="showEditDialog(scope.row)">编辑</el-button>
          <el-button
            size="small"
            :type="scope.row.status === 1 ? 'warning' : 'success'"
            @click="toggleStatus(scope.row)"
          >{{ scope.row.status === 1 ? '禁用' : '启用' }}</el-button>
          <el-button size="small" type="danger" @click="deleteUser(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <DataPagination
      :total="total"
      :page-size="pageSize"
      :current-page="currentPage"
      @current-change="handlePageChange"
      @size-change="handleSizeChange"
    />

    <el-dialog
      :title="editingUser.id ? '编辑用户' : '新增用户'"
      :visible.sync="dialogVisible"
      width="500px"
    >
      <el-form :model="editingUser" :rules="formRules" ref="userForm" label-width="100px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="editingUser.username" placeholder="请输入用户名"></el-input>
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="editingUser.name" placeholder="请输入姓名"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="editingUser.phone" placeholder="请输入手机号"></el-input>
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="editingUser.role" placeholder="请选择角色">
            <el-option
              v-for="opt in $status.getUserRoleOptions()"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="editingUser.status" placeholder="请选择状态">
            <el-option
              v-for="opt in $status.getUserStatusOptions()"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="密码" v-if="!editingUser.id" prop="password">
          <el-input v-model="editingUser.password" type="password" placeholder="请输入初始密码"></el-input>
        </el-form-item>
      </el-form>
      <FormActions
        slot="footer"
        :submitting="submitting"
        @submit="saveUser"
        @cancel="dialogVisible = false"
      />
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
      total: 0,
      pageSize: 10,
      currentPage: 1,
      dialogVisible: false,
      submitting: false,
      editingUser: {
        id: null,
        username: '',
        name: '',
        phone: '',
        role: 2,
        status: 1,
        password: ''
      },
      formRules: {
        username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
        name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
        phone: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: this.$validators.validatePhone, trigger: 'blur' }
        ],
        role: [{ required: true, message: '请选择角色', trigger: 'change' }],
        status: [{ required: true, message: '请选择状态', trigger: 'change' }],
        password: [{ required: true, message: '请输入初始密码', trigger: 'blur' }]
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
          this.users = res.data.data || [];
          this.total = this.users.length;
        }
      });
    },
    showAddDialog() {
      this.editingUser = {
        id: null,
        username: '',
        name: '',
        phone: '',
        role: 2,
        status: 1,
        password: ''
      };
      this.dialogVisible = true;
    },
    showEditDialog(user) {
      this.editingUser = { ...user, password: '' };
      this.dialogVisible = true;
    },
    saveUser() {
      this.$refs.userForm.validate(valid => {
        if (!valid) return;
        this.submitting = true;
        const request = this.editingUser.id
          ? axios.put(`/api/users/${this.editingUser.id}`, this.editingUser)
          : axios.post('/api/users', this.editingUser);
        request.then(res => {
          if (res.data.success) {
            this.$message.success(this.editingUser.id ? '修改成功' : '新增成功');
            this.dialogVisible = false;
            this.loadUsers();
          }
        }).finally(() => {
          this.submitting = false;
        });
      });
    },
    toggleStatus(user) {
      const newStatus = user.status === 1 ? 0 : 1;
      axios.put(`/api/users/${user.id}`, { status: newStatus }).then(res => {
        if (res.data.success) {
          this.$message.success(newStatus === 1 ? '已启用' : '已禁用');
          this.loadUsers();
        }
      });
    },
    deleteUser(user) {
      this.$confirm(`确定要删除用户"${user.name}"吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        axios.delete(`/api/users/${user.id}`).then(res => {
          if (res.data.success) {
            this.$message.success('删除成功');
            this.loadUsers();
          }
        });
      }).catch(() => {});
    },
    handlePageChange(page) {
      this.currentPage = page;
    },
    handleSizeChange(size) {
      this.pageSize = size;
    }
  }
};
</script>

<style>
.users-page {
  padding: 20px;
}
</style>
