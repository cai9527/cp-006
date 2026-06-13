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
      <el-table-column label="操作" width="280" fixed="right">
        <template slot-scope="scope">
          <el-button
            v-if="scope.row.status === 1"
            size="small"
            type="success"
            icon="el-icon-location"
            @click="showTrack(scope.row)"
          >查看轨迹</el-button>
          <el-button size="small" @click="editDevice(scope.row)">编辑</el-button>
          <el-button size="small" type="danger" @click="deleteDevice(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
      title="设备运行轨迹"
      :visible.sync="trackDialogVisible"
      width="900px"
      class="track-dialog"
      @close="closeTrackDialog"
    >
      <div class="track-header">
        <div class="track-device-info">
          <span class="label">设备名称：</span>
          <span class="value">{{ currentDevice.name }}</span>
          <span class="label" style="margin-left: 20px;">设备编号：</span>
          <span class="value">{{ currentDevice.code }}</span>
        </div>
        <div class="track-summary">
          <div class="summary-item">
            <div class="summary-value">{{ trackRecords.length }}</div>
            <div class="summary-label">运行次数</div>
          </div>
          <div class="summary-item">
            <div class="summary-value">{{ totalDistance }} 层</div>
            <div class="summary-label">累计移动</div>
          </div>
          <div class="summary-item">
            <div class="summary-value">{{ totalDuration }} 秒</div>
            <div class="summary-label">运行时长</div>
          </div>
        </div>
      </div>

      <div class="track-content">
        <div class="track-visual">
          <div class="building">
            <div class="building-label">楼层</div>
            <div class="floors">
              <div
                v-for="floor in totalFloors"
                :key="floor"
                class="floor"
                :class="{ 'has-stop': hasStopAtFloor(floor) }"
              >
                <span class="floor-num">{{ totalFloors - floor + 1 }}F</span>
              </div>
            </div>
          </div>
          <div class="path-container">
            <div class="path-label">移动路径</div>
            <div class="path-canvas">
              <svg :viewBox="`0 0 ${pathWidth} ${pathHeight}`" class="path-svg">
                <polyline
                  :points="pathPoints"
                  fill="none"
                  stroke="#409eff"
                  stroke-width="2"
                  stroke-dasharray="5,3"
                />
                <circle
                  v-for="(point, index) in pathPointList"
                  :key="index"
                  :cx="point.x"
                  :cy="point.y"
                  r="6"
                  :fill="point.status === 1 ? '#67c23a' : '#f56c6c'"
                  class="path-point"
                />
              </svg>
            </div>
          </div>
        </div>

        <div class="track-timeline">
          <div class="timeline-title">
            <i class="el-icon-time"></i> 运行时间轴
          </div>
          <el-timeline>
            <el-timeline-item
              v-for="(record, index) in trackRecords"
              :key="record.id"
              :timestamp="record.created_at"
              placement="top"
              :color="record.status === 1 ? '#67c23a' : '#f56c6c'"
            >
              <el-card shadow="never" class="timeline-card">
                <div class="timeline-record">
                  <div class="record-header">
                    <span class="record-title">第 {{ trackRecords.length - index }} 次运行</span>
                    <el-tag :type="record.status === 1 ? 'success' : 'danger'" size="mini">
                      {{ record.status === 1 ? '正常' : '异常' }}
                    </el-tag>
                  </div>
                  <div class="record-body">
                    <div class="record-item">
                      <i class="el-icon-top-right"></i>
                      <span>起始楼层：{{ record.start_floor }}F</span>
                    </div>
                    <div class="record-item">
                      <i class="el-icon-bottom-right"></i>
                      <span>到达楼层：{{ record.end_floor }}F</span>
                    </div>
                    <div class="record-item">
                      <i class="el-icon-truck"></i>
                      <span>载重：{{ record.weight }} kg</span>
                    </div>
                    <div class="record-item">
                      <i class="el-icon-timer"></i>
                      <span>时长：{{ record.duration }} 秒</span>
                    </div>
                  </div>
                </div>
              </el-card>
            </el-timeline-item>
          </el-timeline>
        </div>
      </div>

      <div slot="footer" class="dialog-footer">
        <el-button @click="trackDialogVisible = false">关闭</el-button>
      </div>
    </el-dialog>

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
      currentPage: 1,
      trackDialogVisible: false,
      currentDevice: {},
      trackRecords: [],
      pathWidth: 300,
      pathHeight: 400
    };
  },
  mounted() {
    this.loadDevices();
  },
  computed: {
    totalFloors() {
      return this.currentDevice.total_floor || 20;
    },
    totalDistance() {
      return this.trackRecords.reduce((sum, r) => sum + Math.abs(r.end_floor - r.start_floor), 0);
    },
    totalDuration() {
      return this.trackRecords.reduce((sum, r) => sum + (r.duration || 0), 0);
    },
    pathPointList() {
      if (!this.trackRecords.length) return [];
      const points = [];
      const totalFloors = this.totalFloors;
      const recordCount = this.trackRecords.length;
      const stepX = this.pathWidth / (recordCount || 1);

      this.trackRecords.forEach((record, index) => {
        const startY = this.pathHeight - ((record.start_floor - 1) / (totalFloors - 1)) * this.pathHeight;
        const endY = this.pathHeight - ((record.end_floor - 1) / (totalFloors - 1)) * this.pathHeight;
        const x1 = index * stepX + stepX * 0.3;
        const x2 = index * stepX + stepX * 0.7;

        points.push({ x: x1, y: startY, status: record.status, floor: record.start_floor });
        points.push({ x: x2, y: endY, status: record.status, floor: record.end_floor });
      });

      return points;
    },
    pathPoints() {
      return this.pathPointList.map(p => `${p.x},${p.y}`).join(' ');
    }
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
    },
    showTrack(device) {
      this.currentDevice = device;
      this.trackDialogVisible = true;
      this.loadTrackRecords(device.id);
    },
    closeTrackDialog() {
      this.trackRecords = [];
      this.currentDevice = {};
    },
    loadTrackRecords(liftId) {
      axios.get('/api/run_records', { params: { lift_id: liftId } }).then(res => {
        if (res.data.success) {
          this.trackRecords = res.data.data;
        }
      });
    },
    hasStopAtFloor(floor) {
      const actualFloor = this.totalFloors - floor + 1;
      return this.trackRecords.some(r => r.start_floor === actualFloor || r.end_floor === actualFloor);
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

.track-dialog .el-dialog__body {
  padding-top: 10px;
}

.track-header {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #ebeef5;
}

.track-device-info {
  margin-bottom: 15px;
  font-size: 14px;
}

.track-device-info .label {
  color: #909399;
}

.track-device-info .value {
  color: #303133;
  font-weight: 500;
}

.track-summary {
  display: flex;
  gap: 30px;
}

.track-summary .summary-item {
  text-align: center;
  padding: 10px 20px;
  background: #f5f7fa;
  border-radius: 6px;
  min-width: 100px;
}

.track-summary .summary-value {
  font-size: 20px;
  font-weight: bold;
  color: #409eff;
  margin-bottom: 4px;
}

.track-summary .summary-label {
  font-size: 12px;
  color: #909399;
}

.track-content {
  display: flex;
  gap: 30px;
}

.track-visual {
  flex: 0 0 400px;
  display: flex;
  gap: 15px;
}

.building {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.building-label {
  font-size: 13px;
  color: #606266;
  margin-bottom: 8px;
  font-weight: 500;
}

.floors {
  display: flex;
  flex-direction: column;
  border: 2px solid #dcdfe6;
  border-radius: 4px;
  background: #fafafa;
}

.floor {
  width: 50px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid #ebeef5;
  font-size: 11px;
  color: #909399;
}

.floor:last-child {
  border-bottom: none;
}

.floor.has-stop {
  background: #ecf5ff;
  color: #409eff;
  font-weight: bold;
}

.path-container {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.path-label {
  font-size: 13px;
  color: #606266;
  margin-bottom: 8px;
  font-weight: 500;
}

.path-canvas {
  flex: 1;
  background: #fafafa;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 10px;
}

.path-svg {
  width: 100%;
  height: 100%;
}

.path-point {
  cursor: pointer;
}

.track-timeline {
  flex: 1;
  max-height: 450px;
  overflow-y: auto;
}

.timeline-title {
  font-size: 13px;
  color: #606266;
  margin-bottom: 10px;
  font-weight: 500;
}

.timeline-card {
  margin-bottom: 0;
}

.timeline-record .record-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.timeline-record .record-title {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.timeline-record .record-body {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px 15px;
}

.timeline-record .record-item {
  display: flex;
  align-items: center;
  font-size: 13px;
  color: #606266;
}

.timeline-record .record-item i {
  margin-right: 5px;
  color: #909399;
}

.dialog-footer {
  text-align: right;
}
</style>
