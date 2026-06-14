<template>
  <div class="driver-add-page">
    <PageHeader title="驾驶员管理" :show-back="true" @back="$router.back()">
      <span>{{ editingDriver.id ? '编辑驾驶员' : '新增驾驶员' }}</span>
    </PageHeader>

    <FormCard title="基本信息" icon="el-icon-user">
      <el-form :model="editingDriver" :rules="formRules" ref="driverForm" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="姓名" prop="name">
              <el-input v-model="editingDriver.name" placeholder="请输入姓名"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="性别" prop="gender">
              <el-radio-group v-model="editingDriver.gender">
                <el-radio :label="1">男</el-radio>
                <el-radio :label="2">女</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="手机号" prop="phone">
              <el-input v-model="editingDriver.phone" placeholder="11位手机号"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="身份证号" prop="id_card">
              <el-input v-model="editingDriver.id_card" placeholder="18位身份证号" maxlength="18"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="驾驶证号" prop="license_no">
              <el-input v-model="editingDriver.license_no" placeholder="12-18位字母数字"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="驾驶证有效期" prop="license_expiry">
              <el-date-picker
                v-model="editingDriver.license_expiry"
                type="date"
                placeholder="选择有效期"
                value-format="yyyy-MM-dd"
                style="width: 100%;"
              ></el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="入职日期" prop="hire_date">
              <el-date-picker
                v-model="editingDriver.hire_date"
                type="date"
                placeholder="选择入职日期"
                value-format="yyyy-MM-dd"
                style="width: 100%;"
              ></el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </FormCard>

    <FormCard title="紧急联系" icon="el-icon-phone-outline">
      <el-form :model="editingDriver" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="紧急联系人">
              <el-input v-model="editingDriver.emergency_contact" placeholder="请输入紧急联系人"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="紧急联系电话" prop="emergency_phone">
              <el-input v-model="editingDriver.emergency_phone" placeholder="11位手机号"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="备注">
              <el-input
                v-model="editingDriver.remark"
                type="textarea"
                :rows="3"
                placeholder="备注信息（选填）"
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </FormCard>

    <FormActions
      align="center"
      :submitting="submitting"
      @submit="saveDriver"
      @cancel="$router.back()"
    />
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'DriverAdd',
  data() {
    return {
      submitting: false,
      editingDriver: {
        id: null,
        name: '',
        gender: 1,
        phone: '',
        id_card: '',
        license_no: '',
        license_expiry: '',
        hire_date: '',
        emergency_contact: '',
        emergency_phone: '',
        remark: ''
      },
      formRules: {
        name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
        gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
        phone: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: this.$validators.validatePhone, trigger: 'blur' }
        ],
        id_card: [
          { required: true, message: '请输入身份证号', trigger: 'blur' },
          { validator: this.$validators.validateIdCard, trigger: 'blur' }
        ],
        license_no: [
          { required: true, message: '请输入驾驶证号', trigger: 'blur' },
          { validator: this.$validators.validateLicenseNo, trigger: 'blur' }
        ],
        license_expiry: [{ required: true, message: '请选择驾驶证有效期', trigger: 'change' }],
        hire_date: [{ required: true, message: '请选择入职日期', trigger: 'change' }]
      }
    };
  },
  mounted() {
    const id = this.$route.query.id;
    if (id) this.loadDriver(id);
  },
  methods: {
    loadDriver(id) {
      axios.get(`/api/drivers/${id}`).then(res => {
        if (res.data.success) {
          this.editingDriver = { ...this.editingDriver, ...res.data.data };
        }
      });
    },
    saveDriver() {
      this.$refs.driverForm.validate(valid => {
        if (!valid) return;
        if (this.editingDriver.emergency_phone) {
          let phoneValid = true;
          this.$validators.validatePhone('', this.editingDriver.emergency_phone, (err) => { if (err) phoneValid = false; });
          if (!phoneValid) {
            this.$message.error('紧急联系电话格式不正确');
            return;
          }
        }
        this.submitting = true;
        const request = this.editingDriver.id
          ? axios.put(`/api/drivers/${this.editingDriver.id}`, this.editingDriver)
          : axios.post('/api/drivers', this.editingDriver);
        request.then(res => {
          if (res.data.success) {
            this.$message.success(this.editingDriver.id ? '修改成功' : '添加成功');
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
.driver-add-page {
  padding: 20px;
}
</style>
