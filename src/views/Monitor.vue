<template>
  <div class="monitor-page">
    <div class="page-header">
      <h2>实时监控</h2>
      <el-button type="primary" @click="refreshData">
        <i class="el-icon-refresh"></i> 刷新
      </el-button>
    </div>
    
    <div class="lift-grid">
      <el-card 
        v-for="lift in lifts" 
        :key="lift.id" 
        :class="getStatusClass(lift.status)"
        @click="showLiftDetail(lift)"
      >
        <div class="lift-header">
          <div class="lift-info">
            <h3>{{ lift.name }}</h3>
            <span class="lift-code">{{ lift.code }}</span>
          </div>
          <div :class="['status-badge', getStatusClass(lift.status)]">
            {{ getStatusText(lift.status) }}
          </div>
        </div>
        
        <div class="lift-stats">
          <div class="stat-item">
            <span class="stat-label">当前楼层</span>
            <span class="stat-value floor">{{ lift.current_floor }}F</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">载重</span>
            <span class="stat-value">{{ lift.current_weight }}/{{ lift.max_weight }}kg</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">速度</span>
            <span class="stat-value">{{ lift.speed }}m/s</span>
          </div>
        </div>
        
        <div class="location">{{ lift.location }}</div>
      </el-card>
    </div>
    
    <el-dialog title="升降机详情" :visible.sync="showDetail" width="600px">
      <div v-if="selectedLift" class="detail-content">
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="detail-item">
              <span class="label">设备编号</span>
              <span class="value">{{ selectedLift.code }}</span>
            </div>
            <div class="detail-item">
              <span class="label">安装位置</span>
              <span class="value">{{ selectedLift.location }}</span>
            </div>
            <div class="detail-item">
              <span class="label">最大载重</span>
              <span class="value">{{ selectedLift.max_weight }}kg</span>
            </div>
            <div class="detail-item">
              <span class="label">总楼层数</span>
              <span class="value">{{ selectedLift.total_floor }}层</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="detail-item">
              <span class="label">当前状态</span>
              <span :class="['value', getStatusClass(selectedLift.status)]">{{ getStatusText(selectedLift.status) }}</span>
            </div>
            <div class="detail-item">
              <span class="label">当前楼层</span>
              <span class="value">{{ selectedLift.current_floor }}F</span>
            </div>
            <div class="detail-item">
              <span class="label">当前载重</span>
              <span class="value">{{ selectedLift.current_weight }}kg</span>
            </div>
            <div class="detail-item">
              <span class="label">运行速度</span>
              <span class="value">{{ selectedLift.speed }}m/s</span>
            </div>
          </el-col>
        </el-row>
        <div class="progress-section">
          <div class="progress-item">
            <span class="progress-label">载重比例</span>
            <el-progress :percentage="getLoadPercentage(selectedLift)" :color="getLoadColor(selectedLift)" />
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'Monitor',
  data() {
    return {
      lifts: [],
      showDetail: false,
      selectedLift: null
    };
  },
  mounted() {
    this.loadLifts();
    setInterval(() => {
      this.updateLifts();
    }, 3000);
  },
  methods: {
    loadLifts() {
      axios.get('/api/lifts')
        .then(res => {
          if (res.data.success) {
            this.lifts = res.data.data;
          }
        });
    },
    refreshData() {
      this.loadLifts();
      this.$message.success('数据已刷新');
    },
    updateLifts() {
      this.lifts = this.lifts.map(lift => {
        if (lift.status === 1) {
          return {
            ...lift,
            current_floor: lift.current_floor + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 3),
            current_weight: Math.min(lift.max_weight, Math.max(0, lift.current_weight + (Math.random() - 0.5) * 200)),
            speed: Math.random() * 2
          };
        }
        return lift;
      });
    },
    getStatusClass(status) {
      const classes = ['status-stop', 'status-running', 'status-error', 'status-maintenance'];
      return classes[status] || classes[0];
    },
    getStatusText(status) {
      const texts = ['停止', '运行中', '故障', '维护中'];
      return texts[status] || texts[0];
    },
    showLiftDetail(lift) {
      this.selectedLift = lift;
      this.showDetail = true;
    },
    getLoadPercentage(lift) {
      return Math.round((lift.current_weight / lift.max_weight) * 100);
    },
    getLoadColor(lift) {
      const percentage = this.getLoadPercentage(lift);
      if (percentage > 80) return '#f56c6c';
      if (percentage > 60) return '#e6a23c';
      return '#67c23a';
    }
  }
};
</script>

<style>
.monitor-page {
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

.lift-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.lift-grid .el-card {
  cursor: pointer;
  transition: all 0.3s;
}

.lift-grid .el-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.lift-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.lift-info h3 {
  margin: 0 0 5px 0;
  color: #303133;
}

.lift-code {
  color: #909399;
  font-size: 12px;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: bold;
}

.status-stop {
  background: #f5f5f5;
  color: #909399;
}

.status-running {
  background: #e8f5e9;
  color: #67c23a;
}

.status-error {
  background: #fef0f0;
  color: #f56c6c;
}

.status-maintenance {
  background: #fdf6ec;
  color: #e6a23c;
}

.lift-stats {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
}

.stat-item {
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 12px;
  color: #909399;
  margin-bottom: 5px;
}

.stat-value {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}

.stat-value.floor {
  font-size: 24px;
  color: #409eff;
}

.location {
  color: #909399;
  font-size: 12px;
}

.detail-content {
  padding: 10px 0;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #f2f6fc;
}

.detail-item .label {
  color: #909399;
}

.detail-item .value {
  color: #303133;
  font-weight: 500;
}

.progress-section {
  margin-top: 20px;
}

.progress-item {
  display: flex;
  align-items: center;
  gap: 15px;
}

.progress-label {
  width: 80px;
  color: #909399;
}
</style>
