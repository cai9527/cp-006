<template>
  <div class="device-list-page">
    <div class="page-header">
      <h2>设备管理</h2>
      <el-button type="primary" @click="goToAdd">
        <i class="el-icon-plus"></i> 新增设备
      </el-button>
    </div>

    <el-table :data="devices" border stripe>
      <el-table-column prop="name" label="设备名称" min-width="120"></el-table-column>
      <el-table-column prop="code" label="设备编号" width="120"></el-table-column>
      <el-table-column prop="type" label="设备类型" width="120">
        <template slot-scope="scope">
          <span :class="getTypeClass(scope.row.type)">
            {{ getTypeText(scope.row.type) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="location" label="安装位置" min-width="150"></el-table-column>
      <el-table-column prop="status" label="设备状态" width="100">
        <template slot-scope="scope">
          <span :class="getStatusClass(scope.row.status)">
            {{ getStatusText(scope.row.status) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="max_weight" label="最大载重(kg)" width="120"></el-table-column>
      <el-table-column prop="total_floor" label="总楼层数" width="100"></el-table-column>
      <el-table-column prop="created_at" label="创建时间" width="180"></el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template slot-scope="scope">
          <el-button size="small" @click="editDevice(scope.row)">编辑</el-button>
          <el-button size="small" type="danger" @click="deleteDevice(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      class="pagination"
      background
      layout="total, prev, pager, next, jumper"
      :total="total"
      :page-size="pageSize"
      :current-page="currentPage"
      @current-change="handlePageChange"
    ></el-pagination>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'DeviceList',
  data() {
    return {
      devices: [],
      total: 0,
      pageSize: 10,
      currentPage: 1
    };
  },
  mounted() {
    this.loadDevices();
  },
  methods: {
    loadDevices() {
      axios.get('/api/lifts').then(res => {
        if (res.data.success) {
          this.devices = res.data.data.map(item => ({
            ...item,
            type: item.type || 1
          }));
          this.total = this.devices.length;
        }
      });
    },
    goToAdd() {
      this.$router.push('/devices/add');
    },
    editDevice(device) {
      this.$router.push({ path: '/devices/add', query: { id: device.id } });
    },
    deleteDevice(device) {
      this.$confirm(`确定要删除设备"${device.name}"吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        axios.delete(`/api/lifts/${device.id}`).then(res => {
          if (res.data.success) {
            this.$message.success('删除成功');
            this.loadDevices();
          }
        });
      }).catch(() => {});
    },
    getTypeClass(type) {
      const classes = ['', 'type-lift', 'type-elevator', 'type-cargo'];
      return classes[type] || '';
    },
    getTypeText(type) {
      const texts = ['', '施工升降机', '乘客电梯', '货梯'];
      return texts[type] || '未知';
    },
    getStatusClass(status) {
      const classes = ['status-stop', 'status-running', 'status-error', 'status-maintenance'];
      return classes[status] || classes[0];
    },
    getStatusText(status) {
      const texts = ['停止', '运行中', '故障', '维护中'];
      return texts[status] || '未知';
    },
    handlePageChange(page) {
      this.currentPage = page;
    }
  }
};
</script>

<style>
.device-list-page {
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

.pagination {
  margin-top: 20px;
  text-align: right;
}

.type-lift {
  color: #409eff;
  background: #e3f2fd;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.type-elevator {
  color: #67c23a;
  background: #e8f5e9;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.type-cargo {
  color: #e6a23c;
  background: #fdf6ec;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.status-stop {
  color: #909399;
  background: #f5f5f5;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.status-running {
  color: #67c23a;
  background: #e8f5e9;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.status-error {
  color: #f56c6c;
  background: #fef0f0;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.status-maintenance {
  color: #e6a23c;
  background: #fdf6ec;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}
</style>
