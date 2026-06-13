<template>
  <div class="driver-add-page">
    <div class="page-header">
      <el-button icon="el-icon-arrow-left" @click="goBack">返回</el-button>
      <h2>{{ isEdit ? '编辑驾驶员' : '录入驾驶员' }}</h2>
    </div>

    <el-card class="form-card">
      <div slot="header" class="card-header">
        <i class="el-icon-user"></i>
        <span>基本信息</span>
      </div>
      <el-form
        ref="driverForm"
        :model="form"
        :rules="rules"
        label-width="130px"
        class="driver-form"
      >
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12">
            <el-form-item label="姓名" prop="name">
              <el-input
                v-model="form.name"
                placeholder="请输入姓名"
                maxlength="20"
                show-word-limit
                clearable
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="性别" prop="gender">
              <el-radio-group v-model="form.gender">
                <el-radio :label="1">男</el-radio>
                <el-radio :label="2">女</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :xs="24" :sm="12">
            <el-form-item label="出生日期" prop="birthday">
              <el-date-picker
                v-model="form.birthday"
                type="date"
                placeholder="请选择出生日期"
                style="width: 100%"
                value-format="yyyy-MM-dd"
                :picker-options="birthdayPickerOptions"
              ></el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="身份证号码" prop="id_card">
              <el-input
                v-model="form.id_card"
                placeholder="请输入身份证号码"
                maxlength="18"
                show-word-limit
                clearable
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :xs="24" :sm="12">
            <el-form-item label="联系电话" prop="phone">
              <el-input
                v-model="form.phone"
                placeholder="请输入联系电话"
                maxlength="11"
                show-word-limit
                clearable
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="所属部门/车队" prop="department">
              <el-select
                v-model="form.department"
                placeholder="请选择所属部门/车队"
                style="width: 100%"
                clearable
                filterable
                allow-create
              >
                <el-option
                  v-for="item in departmentOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <el-card class="form-card">
      <div slot="header" class="card-header">
        <i class="el-icon-postcard"></i>
        <span>驾驶证信息</span>
      </div>
      <el-form
        ref="licenseForm"
        :model="form"
        :rules="rules"
        label-width="130px"
        class="driver-form"
      >
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12">
            <el-form-item label="驾驶证类型" prop="license_type">
              <el-select
                v-model="form.license_type"
                placeholder="请选择驾驶证类型"
                style="width: 100%"
                clearable
              >
                <el-option label="A1（大型客车）" value="A1"></el-option>
                <el-option label="A2（牵引车）" value="A2"></el-option>
                <el-option label="A3（城市公交车）" value="A3"></el-option>
                <el-option label="B1（中型客车）" value="B1"></el-option>
                <el-option label="B2（大型货车）" value="B2"></el-option>
                <el-option label="C1（小型汽车）" value="C1"></el-option>
                <el-option label="C2（小型自动挡汽车）" value="C2"></el-option>
                <el-option label="C3（低速载货汽车）" value="C3"></el-option>
                <el-option label="C4（三轮汽车）" value="C4"></el-option>
                <el-option label="D（普通三轮摩托车）" value="D"></el-option>
                <el-option label="E（普通二轮摩托车）" value="E"></el-option>
                <el-option label="F（轻便摩托车）" value="F"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="驾驶证号码" prop="license_no">
              <el-input
                v-model="form.license_no"
                placeholder="请输入驾驶证号码"
                maxlength="18"
                show-word-limit
                clearable
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :xs="24" :sm="12">
            <el-form-item label="初次领证日期" prop="first_license_date">
              <el-date-picker
                v-model="form.first_license_date"
                type="date"
                placeholder="请选择初次领证日期"
                style="width: 100%"
                value-format="yyyy-MM-dd"
                :picker-options="firstLicensePickerOptions"
              ></el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="驾驶证有效期至" prop="license_expiry_date">
              <el-date-picker
                v-model="form.license_expiry_date"
                type="date"
                placeholder="请选择有效期截止日期"
                style="width: 100%"
                value-format="yyyy-MM-dd"
                :picker-options="expiryDatePickerOptions"
              ></el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <el-card class="form-card">
      <div slot="header" class="card-header">
        <i class="el-icon-phone-outline"></i>
        <span>紧急联系信息</span>
      </div>
      <el-form
        ref="emergencyForm"
        :model="form"
        :rules="rules"
        label-width="130px"
        class="driver-form"
      >
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12">
            <el-form-item label="紧急联系人" prop="emergency_contact">
              <el-input
                v-model="form.emergency_contact"
                placeholder="请输入紧急联系人姓名"
                maxlength="20"
                show-word-limit
                clearable
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="紧急联系电话" prop="emergency_phone">
              <el-input
                v-model="form.emergency_phone"
                placeholder="请输入紧急联系人电话"
                maxlength="11"
                show-word-limit
                clearable
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <el-card class="form-card">
      <div class="form-actions">
        <el-button type="primary" @click="submitForm" :loading="submitting">
          <i class="el-icon-check"></i> 提交
        </el-button>
        <el-button @click="resetForm">
          <i class="el-icon-refresh-left"></i> 重置
        </el-button>
        <el-button @click="goBack">
          <i class="el-icon-close"></i> 取消
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'DriverAdd',
  data() {
    const validateIdCard = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请输入身份证号码'));
      } else if (!/^[1-9]\d{5}(19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/.test(value)) {
        callback(new Error('请输入正确的身份证号码'));
      } else {
        callback();
      }
    };

    const validatePhone = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请输入联系电话'));
      } else if (!/^1[3-9]\d{9}$/.test(value)) {
        callback(new Error('请输入正确的手机号码'));
      } else {
        callback();
      }
    };

    const validateLicenseNo = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请输入驾驶证号码'));
      } else if (!/^[A-Za-z0-9]{12,18}$/.test(value)) {
        callback(new Error('驾驶证号码格式不正确'));
      } else {
        callback();
      }
    };

    const validateEmergencyPhone = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请输入紧急联系电话'));
      } else if (!/^1[3-9]\d{9}$/.test(value)) {
        callback(new Error('请输入正确的手机号码'));
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
        gender: 1,
        birthday: '',
        id_card: '',
        phone: '',
        license_type: '',
        license_no: '',
        first_license_date: '',
        license_expiry_date: '',
        department: '',
        emergency_contact: '',
        emergency_phone: ''
      },
      departmentOptions: [
        { label: '一车队', value: '一车队' },
        { label: '二车队', value: '二车队' },
        { label: '三车队', value: '三车队' },
        { label: '运输部', value: '运输部' },
        { label: '工程部', value: '工程部' },
        { label: '安全管理部', value: '安全管理部' }
      ],
      birthdayPickerOptions: {
        disabledDate(time) {
          return time.getTime() > Date.now();
        }
      },
      firstLicensePickerOptions: {
        disabledDate(time) {
          return time.getTime() > Date.now();
        }
      },
      expiryDatePickerOptions: {
        disabledDate(time) {
          return time.getTime() < Date.now() - 86400000;
        }
      },
      rules: {
        name: [
          { required: true, message: '请输入姓名', trigger: 'blur' },
          { min: 2, max: 20, message: '姓名长度在 2 到 20 个字符', trigger: 'blur' }
        ],
        gender: [
          { required: true, message: '请选择性别', trigger: 'change' }
        ],
        birthday: [
          { required: true, message: '请选择出生日期', trigger: 'change' }
        ],
        id_card: [
          { required: true, validator: validateIdCard, trigger: 'blur' }
        ],
        phone: [
          { required: true, validator: validatePhone, trigger: 'blur' }
        ],
        license_type: [
          { required: true, message: '请选择驾驶证类型', trigger: 'change' }
        ],
        license_no: [
          { required: true, validator: validateLicenseNo, trigger: 'blur' }
        ],
        first_license_date: [
          { required: true, message: '请选择初次领证日期', trigger: 'change' }
        ],
        license_expiry_date: [
          { required: true, message: '请选择驾驶证有效期', trigger: 'change' }
        ],
        department: [
          { required: true, message: '请选择所属部门/车队', trigger: 'change' }
        ],
        emergency_contact: [
          { required: true, message: '请输入紧急联系人姓名', trigger: 'blur' },
          { min: 2, max: 20, message: '姓名长度在 2 到 20 个字符', trigger: 'blur' }
        ],
        emergency_phone: [
          { required: true, validator: validateEmergencyPhone, trigger: 'blur' }
        ]
      }
    };
  },
  mounted() {
    if (this.$route.query.id) {
      this.isEdit = true;
      this.loadDriverDetail(this.$route.query.id);
    }
  },
  methods: {
    loadDriverDetail(id) {
      axios.get(`/api/drivers/${id}`).then(res => {
        if (res.data.success) {
          const data = res.data.data;
          this.form = {
            id: data.id,
            name: data.name || '',
            gender: data.gender || 1,
            birthday: data.birthday || '',
            id_card: data.id_card || '',
            phone: data.phone || '',
            license_type: data.license_type || '',
            license_no: data.license_no || '',
            first_license_date: data.first_license_date || '',
            license_expiry_date: data.license_expiry_date || '',
            department: data.department || '',
            emergency_contact: data.emergency_contact || '',
            emergency_phone: data.emergency_phone || ''
          };
        }
      });
    },
    submitForm() {
      const forms = [this.$refs.driverForm, this.$refs.licenseForm, this.$refs.emergencyForm];
      let allValid = true;

      const validations = forms.map(form => {
        return new Promise(resolve => {
          form.validate(valid => {
            if (!valid) allValid = false;
            resolve();
          });
        });
      });

      Promise.all(validations).then(() => {
        if (allValid) {
          this.submitting = true;
          const method = this.isEdit ? 'put' : 'post';
          const url = this.isEdit ? `/api/drivers/${this.form.id}` : '/api/drivers';

          const submitData = {
            name: this.form.name,
            gender: this.form.gender,
            birthday: this.form.birthday,
            id_card: this.form.id_card,
            phone: this.form.phone,
            license_type: this.form.license_type,
            license_no: this.form.license_no,
            first_license_date: this.form.first_license_date,
            license_expiry_date: this.form.license_expiry_date,
            department: this.form.department,
            emergency_contact: this.form.emergency_contact,
            emergency_phone: this.form.emergency_phone
          };

          axios[method](url, submitData)
            .then(res => {
              if (res.data.success) {
                this.$message.success(this.isEdit ? '驾驶员信息更新成功' : '驾驶员信息录入成功');
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
        }
      });
    },
    resetForm() {
      this.$refs.driverForm.resetFields();
      this.$refs.licenseForm.resetFields();
      this.$refs.emergencyForm.resetFields();
      if (this.isEdit) {
        this.loadDriverDetail(this.form.id);
      }
    },
    goBack() {
      this.$router.push('/drivers');
    }
  }
};
</script>

<style scoped>
.driver-add-page {
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
  margin-bottom: 16px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.card-header i {
  font-size: 18px;
  color: #409eff;
}

.driver-form {
  padding: 10px 0;
}

.driver-form .el-form-item {
  margin-bottom: 22px;
}

.form-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  padding: 10px 0;
}

@media screen and (max-width: 768px) {
  .driver-add-page {
    padding: 12px;
  }

  .page-header h2 {
    font-size: 16px;
  }

  .driver-form >>> .el-form-item__label {
    width: 110px !important;
    font-size: 13px;
  }

  .form-actions {
    flex-direction: column;
  }

  .form-actions .el-button {
    width: 100%;
  }
}
</style>
