<template>
  <div class="statistics-page">
    <div class="page-header">
      <h2>统计分析</h2>
      <div class="filter-bar">
        <el-date-picker v-model="startDate" type="date" placeholder="开始日期"></el-date-picker>
        <el-date-picker v-model="endDate" type="date" placeholder="结束日期"></el-date-picker>
        <el-select v-model="liftId" placeholder="选择升降机">
          <el-option label="全部" :value="0"></el-option>
          <el-option v-for="lift in lifts" :key="lift.id" :label="lift.name" :value="lift.id"></el-option>
        </el-select>
        <el-button type="primary" @click="loadStats">查询</el-button>
      </div>
    </div>
    
    <div class="stats-cards">
      <el-card class="stat-card">
        <div class="stat-icon run-icon">
          <i class="el-icon-data-line"></i>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.runStats && stats.runStats.total_runs || 0 }}</div>
          <div class="stat-label">运行次数</div>
        </div>
      </el-card>
      <el-card class="stat-card">
        <div class="stat-icon time-icon">
          <i class="el-icon-clock"></i>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ formatDuration(stats.runStats && stats.runStats.avg_duration || 0) }}</div>
          <div class="stat-label">平均时长</div>
        </div>
      </el-card>
      <el-card class="stat-card">
        <div class="stat-icon weight-icon">
          <i class="el-icon-sort-asc"></i>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ ((stats.runStats && stats.runStats.total_weight) || 0).toFixed(0) }}kg</div>
          <div class="stat-label">总载重</div>
        </div>
      </el-card>
      <el-card class="stat-card">
        <div class="stat-icon alarm-icon">
          <i class="el-icon-bell"></i>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ pendingAlarms }}</div>
          <div class="stat-label">待处理报警</div>
        </div>
      </el-card>
    </div>
    
    <div class="charts-row">
      <el-card class="chart-card">
        <h3>报警类型分布</h3>
        <div class="chart-container">
          <el-row :gutter="10">
            <el-col 
              v-for="item in alarmStats" 
              :key="item.type" 
              :span="6"
            >
              <div class="bar-item">
                <div :class="['bar', getAlarmTypeClass(item.type)]" :style="{ height: getBarHeight(item.count) + '%' }"></div>
                <div class="bar-label">{{ getAlarmTypeName(item.type) }}</div>
                <div class="bar-count">{{ item.count }}</div>
              </div>
            </el-col>
          </el-row>
        </div>
      </el-card>
      
      <el-card class="chart-card">
        <h3>维护状态统计</h3>
        <div class="pie-chart">
          <div class="pie">
            <svg viewBox="0 0 100 100">
              <circle 
                v-for="(item, index) in pieData" 
                :key="index"
                cx="50" 
                cy="50" 
                r="40"
                :fill="item.color"
                :stroke="item.color"
                :stroke-width="80"
                :stroke-dasharray="item.dashArray"
                :stroke-dashoffset="item.offset"
                transform="rotate(-90 50 50)"
              />
            </svg>
          </div>
          <div class="legend">
            <div v-for="item in legendData" :key="item.status" class="legend-item">
              <span :class="['legend-dot', getMaintenanceStatusClass(item.status)]"></span>
              <span>{{ item.label }}</span>
              <span class="legend-count">{{ item.count }}</span>
            </div>
          </div>
        </div>
      </el-card>
    </div>
    
    <el-card class="table-card">
      <h3>运行记录</h3>
      <el-table :data="runRecords" border>
        <el-table-column prop="lift_id" label="升降机" width="120">
          <template slot-scope="scope">
            {{ getLiftName(scope.row.lift_id) }}
          </template>
        </el-table-column>
        <el-table-column prop="start_floor" label="起始楼层" width="100"></el-table-column>
        <el-table-column prop="end_floor" label="到达楼层" width="100"></el-table-column>
        <el-table-column prop="weight" label="载重(kg)" width="100"></el-table-column>
        <el-table-column prop="duration" label="时长(秒)" width="100"></el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template slot-scope="scope">
            <span :class="scope.row.status === 1 ? 'status-normal' : 'status-abnormal'">
              {{ scope.row.status === 1 ? '正常' : '异常' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="时间" width="180"></el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'Statistics',
  data() {
    return {
      lifts: [],
      liftId: 0,
      startDate: '',
      endDate: '',
      stats: {},
      runRecords: [],
      alarmStats: [],
      maxAlarmCount: 1
    };
  },
  computed: {
    pendingAlarms() {
      return this.alarmStats.reduce((sum, item) => sum + item.count, 0);
    },
    pieData() {
      const maintenanceStats = this.stats.maintenanceStats || [];
      const total = maintenanceStats.reduce((sum, item) => sum + item.count, 0) || 0;
      if (total === 0) return [];
      
      let offset = 0;
      const colors = ['#f56c6c', '#e6a23c', '#67c23a'];
      
      return maintenanceStats.map((item, index) => {
        const percentage = (item.count / total) * 100;
        const dashArray = percentage * 2.51 + ' 251';
        const result = {
          color: colors[index] || '#909399',
          dashArray,
          offset: -offset
        };
        offset += percentage * 2.51;
        return result;
      });
    },
    legendData() {
      const statusMap = { 0: '待处理', 1: '进行中', 2: '已完成' };
      const maintenanceStats = this.stats.maintenanceStats || [];
      return maintenanceStats.map(item => ({
        status: item.status,
        label: statusMap[item.status] || '未知',
        count: item.count
      }));
    }
  },
  mounted() {
    this.loadLifts();
    this.loadStats();
  },
  methods: {
    loadLifts() {
      axios.get('/api/lifts').then(res => {
        if (res.data.success) {
          this.lifts = res.data.data;
        }
      });
    },
    loadStats() {
      const params = {};
      if (this.liftId > 0) params.lift_id = this.liftId;
      if (this.startDate) params.start_date = this.startDate;
      if (this.endDate) params.end_date = this.endDate;
      
      axios.get('/api/statistics', { params }).then(res => {
        if (res.data.success) {
          this.stats = res.data.data;
        }
      });
      
      axios.get('/api/run_records', { params }).then(res => {
        if (res.data.success) {
          this.runRecords = res.data.data;
        }
      });
      
      axios.get('/api/alarms', { params: { status: 0, ...(this.liftId > 0 ? { lift_id: this.liftId } : {}) } }).then(res => {
        if (res.data.success) {
          const data = res.data.data;
          this.alarmStats = [
            { type: 1, count: data.filter(a => a.type === 1).length },
            { type: 2, count: data.filter(a => a.type === 2).length },
            { type: 3, count: data.filter(a => a.type === 3).length },
            { type: 4, count: data.filter(a => a.type === 4).length }
          ];
          this.maxAlarmCount = Math.max(...this.alarmStats.map(a => a.count), 1);
        }
      });
    },
    formatDuration(seconds) {
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins}分${secs}秒`;
    },
    getBarHeight(count) {
      return (count / this.maxAlarmCount) * 100;
    },
    getAlarmTypeName(type) {
      const types = ['', '超载', '超速', '故障', '维护提醒'];
      return types[type] || '未知';
    },
    getAlarmTypeClass(type) {
      const classes = ['', 'bar-overload', 'bar-overspeed', 'bar-error', 'bar-maintenance'];
      return classes[type] || '';
    },
    getMaintenanceStatusClass(status) {
      const classes = ['status-pending', 'status-processing', 'status-completed'];
      return classes[status] || '';
    },
    getLiftName(id) {
      const lift = this.lifts.find(l => l.id === id);
      return lift ? lift.name : id;
    }
  }
};
</script>

<style>
.statistics-page {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.filter-bar {
  display: flex;
  gap: 10px;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 20px;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 20px;
  font-size: 28px;
}

.run-icon { background: #e8f5e9; color: #67c23a; }
.time-icon { background: #e3f2fd; color: #409eff; }
.weight-icon { background: #f3e5f5; color: #9c27b0; }
.alarm-icon { background: #ffebee; color: #f56c6c; }

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
}

.stat-label {
  color: #909399;
  font-size: 14px;
}

.charts-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

.chart-card {
  padding: 20px;
}

.chart-card h3 {
  margin: 0 0 20px 0;
  color: #303133;
}

.chart-container {
  height: 200px;
}

.bar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
}

.bar {
  width: 40px;
  border-radius: 8px 8px 0 0;
  transition: height 0.3s;
}

.bar-overload { background: #f56c6c; }
.bar-overspeed { background: #e6a23c; }
.bar-error { background: #909399; }
.bar-maintenance { background: #67c23a; }

.bar-label {
  margin-top: 10px;
  font-size: 12px;
  color: #909399;
}

.bar-count {
  font-weight: bold;
  color: #303133;
}

.pie-chart {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 40px;
}

.pie {
  width: 120px;
  height: 120px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.status-pending { background: #f56c6c; }
.status-processing { background: #e6a23c; }
.status-completed { background: #67c23a; }

.legend-count {
  margin-left: auto;
  font-weight: bold;
}

.table-card {
  padding: 20px;
}

.table-card h3 {
  margin: 0 0 20px 0;
  color: #303133;
}

.status-normal {
  color: #67c23a;
  background: #e8f5e9;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.status-abnormal {
  color: #f56c6c;
  background: #fef0f0;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}
</style>
