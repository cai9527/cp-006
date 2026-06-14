<template>
  <div class="driver-list-page">
    <PageHeader title="驾驶员管理">
      <el-button type="primary" @click="goToAdd">
        <i class="el-icon-plus"></i> 新增驾驶员
      </el-button>
    </PageHeader>

    <FilterCard>
      <el-form inline label-width="100px">
        <el-form-item label="姓名">
          <el-input v-model="filterName" placeholder="请输入姓名" clearable></el-input>
        </el-form-item>
        <el-form-item label="驾驶证号">
          <el-input v-model="filterLicense" placeholder="请输入驾驶证号" clearable></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadDrivers">筛选</el-button>
        </el-form-item>
      </el-form>
    </FilterCard>

    <el-table :data="filteredDrivers" border stripe>
      <el-table-column label="头像" width="80" align="center">
        <template slot-scope="scope">
          <el-avatar
            :size="36"
            :style="{ backgroundColor: $format.getAvatarColor(scope.row.name) }"
          >
            {{ scope.row.name.charAt(0) }}
          </el-avatar>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="姓名" width="100"></el-table-column>
      <el-table-column prop="phone" label="手机号" width="140">
        <template slot-scope="scope">{{ $format.formatPhone(scope.row.phone) }}</template>
      </el-table-column>
      <el-table-column prop="id_card" label="身份证号" width="200">
        <template slot-scope="scope">{{ $format.formatIdCard(scope.row.id_card) }}</template>
      </el-table-column>
      <el-table-column prop="license_no" label="驾驶证号" width="160"></el-table-column>
      <el-table-column label="驾照有效期" width="180">
        <template slot-scope="scope">
          <div class="license-info">
            <span>{{ scope.row.license_expiry }}</span>
            <el-tag
              :type="getLicenseTagType(scope.row.license_expiry)"
              size="mini"
              style="margin-left: 5px;"
            >
              {{ getLicenseStatusText(scope.row.license_expiry) }}
            </el-tag>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="created_at" label="入职时间" width="180"></el-table-column>
      <el-table-column label="操作" width="260" fixed="right">
        <template slot-scope="scope">
          <el-button size="small" type="info" @click="showDetail(scope.row)">详情</el-button>
          <el-button size="small" @click="editDriver(scope.row)">编辑</el-button>
          <el-button size="small" type="danger" @click="deleteDriver(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <DataPagination
      :total="filteredDrivers.length"
      :page-size="pageSize"
      :current-page="currentPage"
      @current-change="handlePageChange"
      @size-change="handleSizeChange"
    />

    <el-dialog title="驾驶员详情" :visible.sync="detailVisible" width="600px">
      <div v-if="currentDriver" class="driver-detail">
        <div class="detail-header">
          <el-avatar
            :size="64"
            :style="{ backgroundColor: $format.getAvatarColor(currentDriver.name) }"
          >
            {{ currentDriver.name.charAt(0) }}
          </el-avatar>
          <div class="header-info">
            <h3>{{ currentDriver.name }}</h3>
            <p class="subtitle">驾驶员</p>
          </div>
        </div>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="手机号">{{ $format.formatPhone(currentDriver.phone) }}</el-descriptions-item>
          <el-descriptions-item label="身份证号">{{ $format.formatIdCard(currentDriver.id_card) }}</el-descriptions-item>
          <el-descriptions-item label="驾驶证号">{{ currentDriver.license_no }}</el-descriptions-item>
          <el-descriptions-item label="性别">{{ currentDriver.gender === 1 ? '男' : '女' }}</el-descriptions-item>
          <el-descriptions-item label="驾驶证有效期" :span="2">
            <span>{{ currentDriver.license_expiry }}</span>
            <el-tag
              :type="getLicenseTagType(currentDriver.license_expiry)"
              size="mini"
              style="margin-left: 10px;"
            >{{ getLicenseStatusText(currentDriver.license_expiry) }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="紧急联系人">{{ currentDriver.emergency_contact }}</el-descriptions-item>
          <el-descriptions-item label="紧急联系电话">
            {{ $format.formatPhone(currentDriver.emergency_phone) }}
          </el-descriptions-item>
          <el-descriptions-item label="入职时间" :span="2">{{ currentDriver.created_at }}</el-descriptions-item>
          <el-descriptions-item label="备注" :span="2">{{ currentDriver.remark || '-' }}</el-descriptions-item>
        </el-descriptions>
      </div>
      <div slot="footer">
        <el-button @click="detailVisible = false">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'DriverList',
  data() {
    return {
      drivers: [],
      filterName: '',
      filterLicense: '',
      pageSize: 10,
      currentPage: 1,
      detailVisible: false,
      currentDriver: null
    };
  },
  computed: {
    filteredDrivers() {
      return this.drivers.filter(d => {
        if (this.filterName && !d.name.includes(this.filterName)) return false;
        if (this.filterLicense && !d.license_no.includes(this.filterLicense)) return false;
        return true;
      });
    }
  },
  mounted() {
    this.loadDrivers();
  },
  methods: {
    loadDrivers() {
      axios.get('/api/drivers').then(res => {
        if (res.data.success) {
          this.drivers = res.data.data || [];
        }
      });
    },
    goToAdd() {
      this.$router.push('/drivers/add');
    },
    editDriver(driver) {
      this.$router.push({ path: '/drivers/add', query: { id: driver.id } });
    },
    deleteDriver(driver) {
      this.$confirm(`确定要删除驾驶员"${driver.name}"吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        axios.delete(`/api/drivers/${driver.id}`).then(res => {
          if (res.data.success) {
            this.$message.success('删除成功');
            this.loadDrivers();
          }
        });
      }).catch(() => {});
    },
    showDetail(driver) {
      this.currentDriver = driver;
      this.detailVisible = true;
    },
    getLicenseTagType(expiry) {
      const status = this.$format.calcLicenseStatus(expiry);
      return status === 'normal' ? 'success' : status === 'expiring' ? 'warning' : 'danger';
    },
    getLicenseStatusText(expiry) {
      const status = this.$format.calcLicenseStatus(expiry);
      return status === 'normal' ? '正常' : status === 'expiring' ? '即将到期' : '已过期';
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
.driver-list-page {
  padding: 20px;
}

.license-info {
  display: flex;
  align-items: center;
}

.driver-detail .detail-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #ebeef5;
}

.driver-detail .header-info h3 {
  margin: 0 0 5px 0;
  font-size: 20px;
  color: #303133;
}

.driver-detail .header-info .subtitle {
  margin: 0;
  color: #909399;
  font-size: 13px;
}
</style>
