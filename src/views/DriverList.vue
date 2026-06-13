<template>
  <div class="driver-list-page">
    <div class="page-header">
      <h2>驾驶员管理</h2>
      <el-button type="primary" @click="goToAdd">
        <i class="el-icon-plus"></i> 录入驾驶员
      </el-button>
    </div>

    <el-card class="filter-card" shadow="never">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="姓名">
          <el-input
            v-model="filterForm.name"
            placeholder="请输入姓名"
            clearable
            @keyup.enter.native="handleSearch"
          ></el-input>
        </el-form-item>
        <el-form-item label="性别">
          <el-select
            v-model="filterForm.gender"
            placeholder="全部"
            clearable
            style="width: 120px"
          >
            <el-option label="男" :value="1"></el-option>
            <el-option label="女" :value="2"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="驾驶证类型">
          <el-select
            v-model="filterForm.license_type"
            placeholder="全部"
            clearable
            style="width: 180px"
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
        <el-form-item label="所属部门">
          <el-select
            v-model="filterForm.department"
            placeholder="全部"
            clearable
            style="width: 160px"
            filterable
          >
            <el-option
              v-for="item in departmentOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="驾证状态">
          <el-select
            v-model="filterForm.license_status"
            placeholder="全部"
            clearable
            style="width: 140px"
          >
            <el-option label="正常" value="normal"></el-option>
            <el-option label="即将过期" value="expiring"></el-option>
            <el-option label="已过期" value="expired"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
          <el-button icon="el-icon-refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-table
      :data="pagedDrivers"
      border
      stripe
      v-loading="loading"
      element-loading-text="加载中..."
    >
      <el-table-column type="index" label="序号" width="60" align="center"></el-table-column>
      <el-table-column prop="name" label="姓名" width="100" fixed="left">
        <template slot-scope="scope">
          <div class="name-cell">
            <el-avatar
              :size="32"
              :style="{ backgroundColor: getAvatarColor(scope.row.name) }"
              class="driver-avatar"
            >
              {{ scope.row.name ? scope.row.name.charAt(0) : '' }}
            </el-avatar>
            <span>{{ scope.row.name }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="gender" label="性别" width="70" align="center">
        <template slot-scope="scope">
          <span :class="scope.row.gender === 1 ? 'gender-male' : 'gender-female'">
            {{ scope.row.gender === 1 ? '男' : '女' }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="birthday" label="出生日期" width="120"></el-table-column>
      <el-table-column prop="id_card" label="身份证号码" width="200">
        <template slot-scope="scope">
          {{ formatIdCard(scope.row.id_card) }}
        </template>
      </el-table-column>
      <el-table-column prop="phone" label="联系电话" width="130"></el-table-column>
      <el-table-column prop="license_type" label="驾证类型" width="100" align="center">
        <template slot-scope="scope">
          <el-tag size="mini" :type="getLicenseTagType(scope.row.license_type)">
            {{ scope.row.license_type }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="license_no" label="驾驶证号" width="180"></el-table-column>
      <el-table-column prop="first_license_date" label="初领日期" width="120"></el-table-column>
      <el-table-column prop="license_expiry_date" label="有效期至" width="120"></el-table-column>
      <el-table-column label="驾证状态" width="100" align="center">
        <template slot-scope="scope">
          <el-tag
            size="mini"
            :type="getLicenseStatusType(scope.row.license_expiry_date)"
            effect="light"
          >
            {{ getLicenseStatusText(scope.row.license_expiry_date) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="department" label="所属部门" width="120"></el-table-column>
      <el-table-column prop="emergency_contact" label="紧急联系人" width="100"></el-table-column>
      <el-table-column prop="emergency_phone" label="紧急电话" width="130"></el-table-column>
      <el-table-column label="操作" width="180" fixed="right" align="center">
        <template slot-scope="scope">
          <el-button size="small" type="text" icon="el-icon-view" @click="viewDriver(scope.row)">查看</el-button>
          <el-button size="small" type="text" icon="el-icon-edit" @click="editDriver(scope.row)">编辑</el-button>
          <el-button size="small" type="text" class="danger-text" icon="el-icon-delete" @click="deleteDriver(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
      title="驾驶员详情"
      :visible.sync="detailVisible"
      width="680px"
      top="6vh"
      class="detail-dialog"
    >
      <div v-if="currentDriver" class="detail-content">
        <div class="detail-header">
          <el-avatar
            :size="64"
            :style="{ backgroundColor: getAvatarColor(currentDriver.name) }"
            class="detail-avatar"
          >
            {{ currentDriver.name ? currentDriver.name.charAt(0) : '' }}
          </el-avatar>
          <div class="detail-header-info">
            <h3>{{ currentDriver.name }}</h3>
            <div class="detail-tags">
              <el-tag size="small" :type="currentDriver.gender === 1 ? '' : 'danger'">
                {{ currentDriver.gender === 1 ? '男' : '女' }}
              </el-tag>
              <el-tag size="small" :type="getLicenseTagType(currentDriver.license_type)">
                {{ currentDriver.license_type }}
              </el-tag>
              <el-tag
                size="small"
                :type="getLicenseStatusType(currentDriver.license_expiry_date)"
              >
                {{ getLicenseStatusText(currentDriver.license_expiry_date) }}
              </el-tag>
            </div>
          </div>
        </div>

        <el-divider content-position="left">基本信息</el-divider>
        <el-descriptions :column="2" border size="medium">
          <el-descriptions-item label="姓名">{{ currentDriver.name }}</el-descriptions-item>
          <el-descriptions-item label="性别">{{ currentDriver.gender === 1 ? '男' : '女' }}</el-descriptions-item>
          <el-descriptions-item label="出生日期">{{ currentDriver.birthday }}</el-descriptions-item>
          <el-descriptions-item label="身份证号码">{{ currentDriver.id_card }}</el-descriptions-item>
          <el-descriptions-item label="联系电话">{{ currentDriver.phone }}</el-descriptions-item>
          <el-descriptions-item label="所属部门">{{ currentDriver.department }}</el-descriptions-item>
        </el-descriptions>

        <el-divider content-position="left">驾驶证信息</el-divider>
        <el-descriptions :column="2" border size="medium">
          <el-descriptions-item label="驾驶证类型">{{ currentDriver.license_type }}</el-descriptions-item>
          <el-descriptions-item label="驾驶证号码">{{ currentDriver.license_no }}</el-descriptions-item>
          <el-descriptions-item label="初次领证日期">{{ currentDriver.first_license_date }}</el-descriptions-item>
          <el-descriptions-item label="有效期至">{{ currentDriver.license_expiry_date }}</el-descriptions-item>
        </el-descriptions>

        <el-divider content-position="left">紧急联系信息</el-divider>
        <el-descriptions :column="2" border size="medium">
          <el-descriptions-item label="紧急联系人">{{ currentDriver.emergency_contact }}</el-descriptions-item>
          <el-descriptions-item label="紧急联系电话">{{ currentDriver.emergency_phone }}</el-descriptions-item>
        </el-descriptions>
      </div>

      <span slot="footer">
        <el-button @click="detailVisible = false">关闭</el-button>
        <el-button type="primary" @click="editFromDetail">编辑</el-button>
      </span>
    </el-dialog>

    <el-pagination
      class="pagination"
      background
      layout="total, sizes, prev, pager, next, jumper"
      :total="filteredTotal"
      :page-sizes="[10, 20, 50, 100]"
      :page-size="pageSize"
      :current-page="currentPage"
      @size-change="handleSizeChange"
      @current-change="handlePageChange"
    ></el-pagination>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'DriverList',
  data() {
    return {
      loading: false,
      drivers: [],
      detailVisible: false,
      currentDriver: null,
      filterForm: {
        name: '',
        gender: null,
        license_type: '',
        department: '',
        license_status: ''
      },
      departmentOptions: [
        { label: '一车队', value: '一车队' },
        { label: '二车队', value: '二车队' },
        { label: '三车队', value: '三车队' },
        { label: '运输部', value: '运输部' },
        { label: '工程部', value: '工程部' },
        { label: '安全管理部', value: '安全管理部' }
      ],
      pageSize: 10,
      currentPage: 1,
      avatarColors: [
        '#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399',
        '#5EB2EF', '#85CE61', '#EEBE77', '#F78989', '#ABAFB8'
      ]
    };
  },
  computed: {
    filteredDrivers() {
      let result = [...this.drivers];

      if (this.filterForm.name) {
        const keyword = this.filterForm.name.trim().toLowerCase();
        result = result.filter(d => d.name && d.name.toLowerCase().includes(keyword));
      }

      if (this.filterForm.gender !== null && this.filterForm.gender !== undefined && this.filterForm.gender !== '') {
        result = result.filter(d => d.gender === this.filterForm.gender);
      }

      if (this.filterForm.license_type) {
        result = result.filter(d => d.license_type === this.filterForm.license_type);
      }

      if (this.filterForm.department) {
        result = result.filter(d => d.department === this.filterForm.department);
      }

      if (this.filterForm.license_status) {
        result = result.filter(d => {
          const status = this.calcLicenseStatus(d.license_expiry_date);
          return status === this.filterForm.license_status;
        });
      }

      return result;
    },
    filteredTotal() {
      return this.filteredDrivers.length;
    },
    pagedDrivers() {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      return this.filteredDrivers.slice(start, end);
    }
  },
  mounted() {
    this.loadDrivers();
  },
  methods: {
    loadDrivers() {
      this.loading = true;
      axios.get('/api/drivers').then(res => {
        if (res.data && res.data.success) {
          this.drivers = res.data.data || [];
        } else {
          this.drivers = this.getMergedData();
        }
      }).catch(() => {
        this.drivers = this.getMergedData();
      }).finally(() => {
        this.loading = false;
      });
    },
    getMergedData() {
      const mockData = this.getMockData();
      try {
        const stored = JSON.parse(sessionStorage.getItem('driver_list') || '[]');
        if (stored.length > 0) {
          const mockMap = {};
          mockData.forEach(d => { mockMap[d.id] = d; });
          stored.forEach(s => { mockMap[s.id] = s; });
          return Object.values(mockMap);
        }
      } catch (e) {}
      return mockData;
    },
    saveToStorage(drivers) {
      try {
        sessionStorage.setItem('driver_list', JSON.stringify(drivers));
      } catch (e) {}
    },
    getMockData() {
      const names = ['张伟', '王芳', '李强', '刘洋', '陈静', '杨帆', '赵磊', '黄丽', '周杰', '吴敏',
                     '徐军', '孙燕', '马超', '朱琳', '胡斌', '郭娜', '林峰', '何雪', '高翔', '罗艳'];
      const licenseTypes = ['A1', 'A2', 'A3', 'B1', 'B2', 'C1'];
      const departments = ['一车队', '二车队', '三车队', '运输部', '工程部', '安全管理部'];
      const now = new Date();
      return names.map((name, idx) => {
        const gender = idx % 2 === 0 ? 1 : 2;
        const year = 1980 + (idx % 20);
        const month = String((idx % 12) + 1).padStart(2, '0');
        const day = String((idx % 28) + 1).padStart(2, '0');
        const firstYear = 2005 + (idx % 15);
        const expiryYear = now.getFullYear() + (idx % 12) - 2;
        const licenseType = licenseTypes[idx % licenseTypes.length];
        const phoneBase = '138' + String(10000000 + idx * 12345).slice(0, 8);
        return {
          id: idx + 1,
          name,
          gender,
          birthday: `${year}-${month}-${day}`,
          id_card: `3201${String(100 + idx).slice(0, 2)}${year}${month}${day}${String(1000 + idx * 17).slice(-4)}`,
          phone: phoneBase,
          license_type: licenseType,
          license_no: `3201${year}${String(1000000 + idx * 123).slice(0, 6)}`,
          first_license_date: `${firstYear}-${month}-${day}`,
          license_expiry_date: `${expiryYear}-${month}-${day}`,
          department: departments[idx % departments.length],
          emergency_contact: names[(idx + 3) % names.length],
          emergency_phone: '139' + String(20000000 + idx * 23456).slice(0, 8),
          created_at: '2024-01-01 10:00:00'
        };
      });
    },
    getAvatarColor(name) {
      if (!name) return this.avatarColors[0];
      let hash = 0;
      for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
      }
      return this.avatarColors[Math.abs(hash) % this.avatarColors.length];
    },
    formatIdCard(idCard) {
      if (!idCard || idCard.length < 8) return idCard;
      return idCard.slice(0, 6) + '********' + idCard.slice(-4);
    },
    getLicenseTagType(type) {
      const map = {
        'A1': 'danger', 'A2': 'danger', 'A3': 'warning',
        'B1': 'warning', 'B2': 'warning',
        'C1': 'success', 'C2': 'success', 'C3': 'success', 'C4': 'success',
        'D': 'info', 'E': 'info', 'F': 'info'
      };
      return map[type] || '';
    },
    calcLicenseStatus(expiryDate) {
      if (!expiryDate) return 'normal';
      const now = new Date();
      const expiry = new Date(expiryDate);
      const diffDays = Math.floor((expiry - now) / (1000 * 60 * 60 * 24));
      if (diffDays < 0) return 'expired';
      if (diffDays <= 90) return 'expiring';
      return 'normal';
    },
    getLicenseStatusType(expiryDate) {
      const status = this.calcLicenseStatus(expiryDate);
      const map = {
        'normal': 'success',
        'expiring': 'warning',
        'expired': 'danger'
      };
      return map[status] || 'info';
    },
    getLicenseStatusText(expiryDate) {
      const status = this.calcLicenseStatus(expiryDate);
      const map = {
        'normal': '正常',
        'expiring': '即将过期',
        'expired': '已过期'
      };
      return map[status] || '未知';
    },
    handleSearch() {
      this.currentPage = 1;
    },
    handleReset() {
      this.filterForm = {
        name: '',
        gender: null,
        license_type: '',
        department: '',
        license_status: ''
      };
      this.currentPage = 1;
    },
    goToAdd() {
      this.$router.push('/drivers/add');
    },
    viewDriver(driver) {
      this.currentDriver = driver;
      this.detailVisible = true;
    },
    editFromDetail() {
      this.detailVisible = false;
      this.editDriver(this.currentDriver);
    },
    editDriver(driver) {
      sessionStorage.setItem('driver_edit', JSON.stringify(driver));
      this.$router.push({ path: '/drivers/add', query: { id: driver.id } });
    },
    deleteDriver(driver) {
      this.$confirm(`确定要删除驾驶员"${driver.name}"吗？删除后数据不可恢复。`, '删除确认', {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
        confirmButtonClass: 'el-button--danger'
      }).then(() => {
        axios.delete(`/api/drivers/${driver.id}`).then(res => {
          if (res.data && res.data.success) {
            this.$message.success('删除成功');
            this.loadDrivers();
          } else {
            this.removeDriverFromStorage(driver.id);
          }
        }).catch(() => {
          this.removeDriverFromStorage(driver.id);
        });
      }).catch(() => {});
    },
    removeDriverFromStorage(id) {
      this.drivers = this.drivers.filter(d => d.id !== id);
      this.saveToStorage(this.drivers);
      this.$message.success('删除成功');
    },
    handlePageChange(page) {
      this.currentPage = page;
    },
    handleSizeChange(size) {
      this.pageSize = size;
      this.currentPage = 1;
    }
  }
};
</script>

<style scoped>
.driver-list-page {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.page-header h2 {
  margin: 0;
  color: #303133;
  font-size: 20px;
}

.filter-card {
  margin-bottom: 16px;
}

.filter-card >>> .el-card__body {
  padding: 16px 20px 4px;
}

.filter-form .el-form-item {
  margin-bottom: 12px;
}

.name-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.driver-avatar {
  flex-shrink: 0;
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  border: none;
}

.gender-male {
  color: #409eff;
  font-weight: 500;
}

.gender-female {
  color: #f06292;
  font-weight: 500;
}

.danger-text {
  color: #f56c6c !important;
}

.danger-text:hover {
  color: #f78989 !important;
}

.pagination {
  margin-top: 20px;
  text-align: right;
}

.detail-content {
  padding: 0 10px;
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 8px;
}

.detail-avatar {
  flex-shrink: 0;
  color: #fff;
  font-size: 28px;
  font-weight: 600;
}

.detail-header-info h3 {
  margin: 0 0 8px 0;
  font-size: 20px;
  color: #303133;
}

.detail-tags {
  display: flex;
  gap: 8px;
}

.detail-content .el-divider {
  margin: 20px 0 16px;
}

@media screen and (max-width: 768px) {
  .driver-list-page {
    padding: 12px;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .page-header h2 {
    font-size: 16px;
  }

  .filter-form >>> .el-form-item {
    width: 100% !important;
    margin-right: 0 !important;
  }

  .filter-form >>> .el-select,
  .filter-form >>> .el-input {
    width: 100% !important;
  }

  .pagination {
    text-align: center;
  }
}
</style>
