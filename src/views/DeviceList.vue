<template>
  <div class="device-list-page">
    <PageHeader title="设备管理">
      <el-button type="primary" @click="goToAdd">
        <i class="el-icon-plus"></i> 新增设备
      </el-button>
    </PageHeader>

    <el-table :data="devices" border stripe>
      <el-table-column prop="name" label="设备名称" min-width="120"></el-table-column>
      <el-table-column prop="code" label="设备编号" width="120"></el-table-column>
      <el-table-column prop="type" label="设备类型" width="120">
        <template slot-scope="scope">
          <StatusBadge type="liftType" :value="scope.row.type" />
        </template>
      </el-table-column>
      <el-table-column prop="location" label="安装位置" min-width="150"></el-table-column>
      <el-table-column prop="status" label="设备状态" width="100">
        <template slot-scope="scope">
          <StatusBadge type="lift" :value="scope.row.status" />
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
            <div class="floors" :style="{ height: pathHeight + 'px' }">
              <div
                v-for="floor in totalFloors"
                :key="floor"
                class="floor"
                :class="{ 'has-stop': hasStopAtFloor(floor) }"
                :style="{ height: floorHeight + 'px', lineHeight: floorHeight + 'px' }"
              >
                <span class="floor-num">{{ totalFloors - floor + 1 }}F</span>
              </div>
            </div>
          </div>
          <div class="path-container">
            <div class="path-label">运行轨迹（从左到右：时间顺序）</div>
            <div class="path-canvas" :style="{ height: pathHeight + 'px' }">
              <div v-if="trackLoading" class="path-loading">
                <i class="el-icon-loading"></i>
                <span>加载中...</span>
              </div>
              <div v-else-if="!sortedTrackRecords.length" class="path-empty">
                <i class="el-icon-document"></i>
                <span>暂无运行轨迹数据</span>
              </div>
              <svg v-else :viewBox="`0 0 ${pathWidth} ${pathHeight}`" class="path-svg">
                <line
                  v-for="(line, index) in gridLines"
                  :key="'grid-' + index"
                  :x1="line.x1"
                  :y1="line.y1"
                  :x2="line.x2"
                  :y2="line.y2"
                  stroke="#f0f0f0"
                  stroke-width="1"
                />
                <line
                  v-for="(line, index) in pathLines"
                  :key="'line-' + index"
                  :x1="line.x1"
                  :y1="line.y1"
                  :x2="line.x2"
                  :y2="line.y2"
                  :stroke="line.isSameRecord ? getLineColor(line.status) : '#dcdfe6'"
                  stroke-width="2"
                  :stroke-dasharray="line.isSameRecord ? '0' : '4,4'"
                  :class="{ 'line-active': activeRecordIndex === line.recordIndex }"
                />
                <g v-for="(point, index) in trackPointList" :key="'point-' + index">
                  <circle
                    :cx="point.x"
                    :cy="point.y"
                    :r="hoverPointIndex === index || activeRecordIndex === point.recordIndex ? 8 : 5"
                    :fill="getPointColor(point.status, point.isStart)"
                    :stroke="point.status === 1 ? '#67c23a' : '#f56c6c'"
                    stroke-width="2"
                    class="track-point"
                    @mouseenter="handlePointHover(index)"
                    @mouseleave="handlePointLeave"
                  />
                  <text
                    v-if="point.isStart"
                    :x="point.x + 10"
                    :y="point.y - 8"
                    class="point-label"
                    :class="{ 'label-visible': hoverPointIndex === index || activeRecordIndex === point.recordIndex }"
                  >
                    {{ point.floor }}F
                  </text>
                </g>
              </svg>
            </div>
            <div class="path-legend">
              <span class="legend-item">
                <span class="legend-line normal"></span>
                <span class="legend-text">正常运行</span>
              </span>
              <span class="legend-item">
                <span class="legend-line error"></span>
                <span class="legend-text">异常运行</span>
              </span>
              <span class="legend-item">
                <span class="legend-line idle"></span>
                <span class="legend-text">停靠等待</span>
              </span>
            </div>
          </div>
        </div>

        <div class="track-timeline">
          <div class="timeline-title">
            <i class="el-icon-time"></i> 运行时间轴
            <span class="timeline-count">共 {{ trackRecords.length }} 条记录</span>
          </div>
          <div v-if="trackLoading" class="timeline-loading">
            <i class="el-icon-loading"></i>
            <span>加载中...</span>
          </div>
          <div v-else-if="!trackRecords.length" class="timeline-empty">
            <i class="el-icon-document"></i>
            <span>暂无运行记录</span>
          </div>
          <el-timeline v-else>
            <el-timeline-item
              v-for="(record, index) in trackRecords"
              :key="record.id"
              :timestamp="record.created_at"
              placement="top"
              :color="record.status === 1 ? '#67c23a' : '#f56c6c'"
              :class="{ 'timeline-item-active': activeRecordIndex === getSortedIndex(index) }"
              @mouseenter.native="handleTimelineHover(getSortedIndex(index))"
              @mouseleave.native="handleTimelineLeave"
            >
              <el-card shadow="never" class="timeline-card" :class="{ 'card-active': activeRecordIndex === getSortedIndex(index) }">
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
                      <span>起始楼层：{{ record.start_floor || '-' }}F</span>
                    </div>
                    <div class="record-item">
                      <i class="el-icon-bottom-right"></i>
                      <span>到达楼层：{{ record.end_floor || '-' }}F</span>
                    </div>
                    <div class="record-item">
                      <i class="el-icon-truck"></i>
                      <span>载重：{{ record.weight || 0 }} kg</span>
                    </div>
                    <div class="record-item">
                      <i class="el-icon-timer"></i>
                      <span>时长：{{ record.duration || 0 }} 秒</span>
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

    <DataPagination
      :total="total"
      :page-size="pageSize"
      :current-page="currentPage"
      :show-sizes="false"
      @current-change="handlePageChange"
    />
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
      trackLoading: false,
      pathWidth: 320,
      pathHeight: 380,
      activeRecordIndex: -1,
      hoverPointIndex: -1
    };
  },
  mounted() {
    this.loadDevices();
  },
  computed: {
    totalFloors() {
      return Math.max(1, this.currentDevice.total_floor || 20);
    },
    floorHeight() {
      return Math.max(12, this.pathHeight / this.totalFloors);
    },
    sortedTrackRecords() {
      return [...this.trackRecords].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    },
    totalDistance() {
      return this.trackRecords.reduce((sum, r) => {
        const start = r.start_floor || 0;
        const end = r.end_floor || 0;
        return sum + Math.abs(end - start);
      }, 0);
    },
    totalDuration() {
      return this.trackRecords.reduce((sum, r) => sum + (r.duration || 0), 0);
    },
    gridLines() {
      const lines = [];
      const totalFloors = this.totalFloors;
      const padding = 20;
      const usableHeight = this.pathHeight - padding * 2;
      for (let i = 0; i <= totalFloors; i++) {
        const y = padding + (i / totalFloors) * usableHeight;
        lines.push({ x1: 0, y1: y, x2: this.pathWidth, y2: y });
      }
      return lines;
    },
    trackPointList() {
      const records = this.sortedTrackRecords;
      if (!records.length) return [];
      const points = [];
      const totalFloors = this.totalFloors;
      const recordCount = records.length;
      const padding = 20;
      const usableWidth = this.pathWidth - padding * 2;
      const usableHeight = this.pathHeight - padding * 2;
      const getY = (floor) => {
        const safeFloor = Math.max(1, Math.min(totalFloors, floor || 1));
        if (totalFloors <= 1) return padding + usableHeight / 2;
        return padding + usableHeight - ((safeFloor - 1) / (totalFloors - 1)) * usableHeight;
      };
      records.forEach((record, index) => {
        const x = recordCount > 1
          ? padding + (index / (recordCount - 1)) * usableWidth
          : padding + usableWidth / 2;
        const startY = getY(record.start_floor);
        const endY = getY(record.end_floor);
        points.push({ x, y: startY, status: record.status, floor: record.start_floor || 1, recordIndex: index, isStart: true, time: record.created_at });
        points.push({ x, y: endY, status: record.status, floor: record.end_floor || 1, recordIndex: index, isStart: false, time: record.created_at });
      });
      return points;
    },
    pathLines() {
      const points = this.trackPointList;
      if (points.length < 2) return [];
      const lines = [];
      for (let i = 0; i < points.length - 1; i++) {
        const p1 = points[i];
        const p2 = points[i + 1];
        const isSameRecord = p1.recordIndex === p2.recordIndex;
        lines.push({ x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y, isSameRecord, status: p1.status, recordIndex: p1.recordIndex });
      }
      return lines;
    }
  },
  methods: {
    loadDevices() {
      axios.get('/api/lifts').then(res => {
        if (res.data.success) {
          this.devices = res.data.data.map(item => ({ ...item, type: item.type || 1 }));
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
    handlePageChange(page) {
      this.currentPage = page;
    },
    showTrack(device) {
      this.currentDevice = device;
      this.trackDialogVisible = true;
      this.activeRecordIndex = -1;
      this.hoverPointIndex = -1;
      this.loadTrackRecords(device.id);
    },
    closeTrackDialog() {
      this.trackRecords = [];
      this.currentDevice = {};
      this.activeRecordIndex = -1;
      this.hoverPointIndex = -1;
    },
    loadTrackRecords(liftId) {
      this.trackLoading = true;
      axios.get('/api/run_records', { params: { lift_id: liftId } }).then(res => {
        if (res.data.success) {
          this.trackRecords = res.data.data || [];
        } else {
          this.trackRecords = [];
        }
      }).catch(() => {
        this.trackRecords = [];
        this.$message.error('加载轨迹数据失败');
      }).finally(() => {
        this.trackLoading = false;
      });
    },
    hasStopAtFloor(floor) {
      const actualFloor = this.totalFloors - floor + 1;
      return this.trackRecords.some(r =>
        (r.start_floor && r.start_floor === actualFloor) ||
        (r.end_floor && r.end_floor === actualFloor)
      );
    },
    getLineColor(status) {
      return status === 1 ? '#67c23a' : '#f56c6c';
    },
    getPointColor(status, isStart) {
      if (isStart) return '#ffffff';
      return status === 1 ? '#67c23a' : '#f56c6c';
    },
    handlePointHover(index) {
      this.hoverPointIndex = index;
      const point = this.trackPointList[index];
      if (point) this.activeRecordIndex = point.recordIndex;
    },
    handlePointLeave() {
      this.hoverPointIndex = -1;
      this.activeRecordIndex = -1;
    },
    handleTimelineHover(sortedIndex) {
      this.activeRecordIndex = sortedIndex;
    },
    handleTimelineLeave() {
      this.activeRecordIndex = -1;
    },
    getSortedIndex(originalIndex) {
      const record = this.trackRecords[originalIndex];
      if (!record) return -1;
      return this.sortedTrackRecords.findIndex(r => r.id === record.id);
    }
  }
};
</script>

<style>
.device-list-page {
  padding: 20px;
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

.track-device-info .label { color: #909399; }
.track-device-info .value { color: #303133; font-weight: 500; }

.track-summary { display: flex; gap: 30px; }

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

.track-content { display: flex; gap: 30px; }

.track-visual {
  flex: 0 0 420px;
  display: flex;
  gap: 15px;
}

.building {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
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
  overflow: hidden;
}

.floor {
  width: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid #ebeef5;
  font-size: 11px;
  color: #909399;
  box-sizing: border-box;
  transition: all 0.2s ease;
}

.floor:last-child { border-bottom: none; }

.floor.has-stop {
  background: #ecf5ff;
  color: #409eff;
  font-weight: bold;
}

.path-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
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
  position: relative;
  overflow: hidden;
}

.path-loading,
.path-empty,
.timeline-loading,
.timeline-empty {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #909399;
  font-size: 13px;
  gap: 8px;
}

.path-loading i,
.path-empty i,
.timeline-loading i,
.timeline-empty i {
  font-size: 32px;
  color: #c0c4cc;
}

.path-loading i { animation: rotate 1s linear infinite; }

.timeline-loading,
.timeline-empty {
  position: relative;
  padding: 40px 0;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.path-svg {
  width: 100%;
  height: 100%;
  display: block;
}

.track-point {
  cursor: pointer;
  transition: all 0.2s ease;
}

.point-label {
  font-size: 11px;
  fill: #606266;
  opacity: 0;
  transition: opacity 0.2s ease;
  pointer-events: none;
}

.point-label.label-visible { opacity: 1; }

.line-active {
  stroke-width: 3 !important;
  filter: drop-shadow(0 0 3px rgba(64, 158, 255, 0.5));
}

.path-legend {
  display: flex;
  gap: 15px;
  margin-top: 8px;
  padding: 0 4px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  color: #606266;
}

.legend-line {
  width: 20px;
  height: 3px;
  border-radius: 2px;
}

.legend-line.normal { background: #67c23a; }
.legend-line.error { background: #f56c6c; }
.legend-line.idle {
  background: repeating-linear-gradient(to right, #dcdfe6, #dcdfe6 4px, transparent 4px, transparent 8px);
  height: 2px;
}

.track-timeline {
  flex: 1;
  max-height: 450px;
  overflow-y: auto;
  position: relative;
  min-width: 0;
}

.timeline-title {
  font-size: 13px;
  color: #606266;
  margin-bottom: 10px;
  font-weight: 500;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.timeline-count {
  font-size: 12px;
  color: #909399;
  font-weight: normal;
}

.timeline-card {
  margin-bottom: 0;
  transition: all 0.2s ease;
  cursor: pointer;
}

.timeline-card:hover {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1) !important;
}

.timeline-card.card-active {
  border-color: #409eff;
  background: #ecf5ff;
}

.timeline-item-active .el-timeline-item__node {
  transform: scale(1.3);
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
</style>
