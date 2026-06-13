<template>
  <div class="device-add-page">
    <div class="page-header">
      <el-button icon="el-icon-arrow-left" @click="goBack">返回</el-button>
      <h2>{{ isEdit ? '编辑设备' : '添加设备' }}</h2>
    </div>

    <el-card class="form-card">
      <el-form
        ref="deviceForm"
        :model="form"
        :rules="rules"
        label-width="120px"
        class="device-form"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="设备名称" prop="name">
              <el-input
                v-model="form.name"
                placeholder="请输入设备名称"
                maxlength="50"
                show-word-limit
                clearable
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="设备型号" prop="model">
              <el-input
                v-model="form.model"
                placeholder="请输入设备型号"
                maxlength="50"
                show-word-limit
                clearable
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="设备编号" prop="code">
              <el-input
                v-model="form.code"
                placeholder="请输入设备编号"
                maxlength="30"
                show-word-limit
                clearable
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="设备类型" prop="type">
              <el-select
                v-model="form.type"
                placeholder="请选择设备类型"
                style="width: 100%"
                clearable
              >
                <el-option label="施工升降机" :value="1"></el-option>
                <el-option label="乘客电梯" :value="2"></el-option>
                <el-option label="货梯" :value="3"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="设备状态" prop="status">
              <el-select
                v-model="form.status"
                placeholder="请选择设备状态"
                style="width: 100%"
              >
                <el-option label="停止" :value="0"></el-option>
                <el-option label="运行中" :value="1"></el-option>
                <el-option label="故障" :value="2"></el-option>
                <el-option label="维护中" :value="3"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="安装位置" prop="location">
              <el-input
                v-model="form.location"
                placeholder="请输入安装位置"
                maxlength="100"
                show-word-limit
                clearable
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="最大载重(kg)" prop="max_weight">
              <el-input-number
                v-model="form.max_weight"
                :min="100"
                :max="10000"
                :step="100"
                style="width: 100%"
                controls-position="right"
              ></el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="总楼层数" prop="total_floor">
              <el-input-number
                v-model="form.total_floor"
                :min="1"
                :max="200"
                :step="1"
                style="width: 100%"
                controls-position="right"
              ></el-input-number>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="上次维护日期" prop="last_maintenance">
              <el-date-picker
                v-model="form.last_maintenance"
                type="date"
                placeholder="选择日期"
                style="width: 100%"
                value-format="yyyy-MM-dd"
              ></el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="下次维护日期" prop="next_maintenance">
              <el-date-picker
                v-model="form.next_maintenance"
                type="date"
                placeholder="选择日期"
                style="width: 100%"
                value-format="yyyy-MM-dd"
              ></el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="设备描述">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="4"
            placeholder="请输入设备描述信息"
            maxlength="500"
            show-word-limit
          ></el-input>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="submitForm" :loading="submitting">
            <i class="el-icon-check"></i> 提交
          </el-button>
          <el-button @click="resetForm">
            <i class="el-icon-refresh-left"></i> 重置
          </el-button>
          <el-button @click="goBack">
            <i class="el-icon-close"></i> 取消
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'DeviceAdd',
  data() {
    const validateCode = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请输入设备编号'));
      } else if (!/^[A-Za-z0-9_-]+$/.test(value)) {
        callback(new Error('设备编号只能包含字母、数字、下划线和中划线'));
      } else {
        callback();
      }
    };

    const validateWeight = (rule, value, callback) => {
      if (value === null || value === undefined || value === '') {
        callback(new Error('请输入最大载重'));
      } else if (value < 100) {
        callback(new Error('最大载重不能小于100kg'));
      } else {
        callback();
      }
    };

    const validateFloor = (rule, value, callback) => {
      if (value === null || value === undefined || value === '') {
        callback(new Error('请输入总楼层数'));
      } else if (value < 1) {
        callback(new Error('总楼层数不能小于1'));
      } else {
        callback();
      }
    };

    return {
      isEdit: false,
      submitting: false,
      form: {
        id: null,
        name: '',
        model: '',
        code: '',
        type: 1,
        status: 0,
        location: '',
        max_weight: 1000,
        total_floor: 10,
        last_maintenance: '',
        next_maintenance: '',
        description: ''
      },
      rules: {
        name: [
          { required: true, message: '请输入设备名称', trigger: 'blur' },
          { min: 2, max: 50, message: '设备名称长度在 2 到 50 个字符', trigger: 'blur' }
        ],
        model: [
          { required: true, message: '请输入设备型号', trigger: 'blur' },
          { min: 2, max: 50, message: '设备型号长度在 2 到 50 个字符', trigger: 'blur' }
        ],
        code: [
          { required: true, validator: validateCode, trigger: 'blur' }
        ],
        type: [
          { required: true, message: '请选择设备类型', trigger: 'change' }
        ],
        status: [
          { required: true, message: '请选择设备状态', trigger: 'change' }
        ],
        location: [
          { required: true, message: '请输入安装位置', trigger: 'blur' },
          { min: 2, max: 100, message: '安装位置长度在 2 到 100 个字符', trigger: 'blur' }
        ],
        max_weight: [
          { required: true, validator: validateWeight, trigger: 'blur' }
        ],
        total_floor: [
          { required: true, validator: validateFloor, trigger: 'blur' }
        ]
      }
    };
  },
  mounted() {
    if (this.$route.query.id) {
      this.isEdit = true;
      this.loadDeviceDetail(this.$route.query.id);
    }
  },
  methods: {
    loadDeviceDetail(id) {
      axios.get(`/api/lifts/${id}`).then(res => {
        if (res.data.success) {
          const data = res.data.data;
          this.form = {
            id: data.id,
            name: data.name || '',
            model: data.model || '',
            code: data.code || '',
            type: data.type || 1,
            status: data.status !== undefined ? data.status : 0,
            location: data.location || '',
            max_weight: data.max_weight || 1000,
            total_floor: data.total_floor || 10,
            last_maintenance: data.last_maintenance || '',
            next_maintenance: data.next_maintenance || '',
            description: data.description || ''
          };
        }
      });
    },
    submitForm() {
      this.$refs.deviceForm.validate((valid) => {
        if (valid) {
          this.submitting = true;
          const method = this.isEdit ? 'put' : 'post';
          const url = this.isEdit ? `/api/lifts/${this.form.id}` : '/api/lifts';

          const submitData = {
            name: this.form.name,
            model: this.form.model,
            code: this.form.code,
            type: this.form.type,
            status: this.form.status,
            location: this.form.location,
            max_weight: this.form.max_weight,
            total_floor: this.form.total_floor,
            last_maintenance: this.form.last_maintenance,
            next_maintenance: this.form.next_maintenance,
            description: this.form.description
          };

          axios[method](url, submitData)
            .then(res => {
              if (res.data.success) {
                this.$message.success(this.isEdit ? '设备更新成功' : '设备添加成功');
                this.goBack();
              } else {
                this.$message.error(res.data.message || '操作失败');
              }
            })
            .catch(err => {
              this.$message.error('提交失败，请稍后重试');
              console.error(err);
            })
            .finally(() => {
              this.submitting = false;
            });
        } else {
          this.$message.warning('请检查表单填写是否正确');
          return false;
        }
      });
    },
    resetForm() {
      this.$refs.deviceForm.resetFields();
      if (this.isEdit) {
        this.loadDeviceDetail(this.form.id);
      }
    },
    goBack() {
      this.$router.push('/devices');
    }
  }
};
</script>

<style>
.device-add-page {
  padding: 20px;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  color: #303133;
  font-size: 20px;
}

.form-card {
  max-width: 900px;
}

.device-form {
  padding: 10px 0;
}

.device-form .el-form-item {
  margin-bottom: 22px;
}
</style>
