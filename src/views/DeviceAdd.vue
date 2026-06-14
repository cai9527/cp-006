<template>
  <div class="device-add-page">
    <PageHeader title="设备管理" :show-back="true" @back="$router.back()">
      <span>{{ editingLift.id ? '编辑设备' : '新增设备' }}</span>
    </PageHeader>

    <FormCard title="基本信息" icon="el-icon-info">
      <el-form :model="editingLift" :rules="formRules" ref="deviceForm" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="设备名称" prop="name">
              <el-input v-model="editingLift.name" placeholder="请输入设备名称"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="设备编号" prop="code">
              <el-input v-model="editingLift.code" placeholder="字母、数字、下划线、中划线"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="设备类型" prop="type">
              <el-select v-model="editingLift.type" placeholder="请选择类型">
                <el-option
                  v-for="opt in $status.getLiftTypeOptions()"
                  :key="opt.value"
                  :label="opt.label"
                  :value="opt.value"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="设备状态" prop="status">
              <el-select v-model="editingLift.status" placeholder="请选择状态">
                <el-option
                  v-for="opt in $status.getLiftStatusOptions()"
                  :key="opt.value"
                  :label="opt.label"
                  :value="opt.value"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="安装位置" prop="location">
              <el-input v-model="editingLift.location" placeholder="请输入安装位置"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="最大载重" prop="max_weight">
              <el-input-number
                v-model="editingLift.max_weight"
                :min="100"
                :max="10000"
                :step="100"
                style="width: 100%;"
              >
                <template slot="append">kg</template>
              </el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="总楼层数" prop="total_floor">
              <el-input-number
                v-model="editingLift.total_floor"
                :min="1"
                :max="200"
                style="width: 100%;"
              >
                <template slot="append">层</template>
              </el-input-number>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </FormCard>

    <FormActions
      align="center"
      :submitting="submitting"
      @submit="saveDevice"
      @cancel="$router.back()"
    />
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'DeviceAdd',
  data() {
    return {
      submitting: false,
      editingLift: {
        id: null,
        name: '',
        code: '',
        type: 1,
        location: '',
        status: 0,
        max_weight: 1000,
        total_floor: 10,
        current_floor: 1,
        current_weight: 0,
        speed: 0
      },
      formRules: {
        name: [{ required: true, message: '请输入设备名称', trigger: 'blur' }],
        code: [
          { required: true, message: '请输入设备编号', trigger: 'blur' },
          { validator: this.$validators.validateDeviceCode, trigger: 'blur' }
        ],
        type: [{ required: true, message: '请选择设备类型', trigger: 'change' }],
        status: [{ required: true, message: '请选择设备状态', trigger: 'change' }],
        location: [{ required: true, message: '请输入安装位置', trigger: 'blur' }],
        max_weight: [
          { required: true, message: '请输入最大载重', trigger: 'blur' },
          { validator: this.$validators.validateWeight, trigger: 'blur' }
        ],
        total_floor: [
          { required: true, message: '请输入总楼层数', trigger: 'blur' },
          { validator: this.$validators.validateFloor, trigger: 'blur' }
        ]
      }
    };
  },
  computed: {
    formRulesReactive() { return this.formRules; }
  },
  mounted() {
    const id = this.$route.query.id;
    if (id) this.loadDevice(id);
  },
  methods: {
    loadDevice(id) {
      axios.get(`/api/lifts/${id}`).then(res => {
        if (res.data.success) {
          this.editingLift = { ...this.editingLift, ...res.data.data };
        }
      });
    },
    saveDevice() {
      this.$refs.deviceForm.validate(valid => {
        if (!valid) return;
        this.submitting = true;
        const request = this.editingLift.id
          ? axios.put(`/api/lifts/${this.editingLift.id}`, this.editingLift)
          : axios.post('/api/lifts', this.editingLift);
        request.then(res => {
          if (res.data.success) {
            this.$message.success(this.editingLift.id ? '修改成功' : '添加成功');
            this.$router.back();
          }
        }).finally(() => {
          this.submitting = false;
        });
      });
    }
  }
};
</script>

<style>
.device-add-page {
  padding: 20px;
}
</style>
