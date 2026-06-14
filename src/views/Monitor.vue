<template>
  <div class="monitor-page">
    <div class="page-header">
      <h2>实时监控</h2>
      <el-button type="primary" @click="refreshData">
        <i class="el-icon-refresh"></i> 刷新
      </el-button>
    </div>

    <div class="alarm-stats-section">
      <div class="alarm-summary-cards">
        <div class="alarm-summary-card card-warning">
          <div class="card-icon"><i class="el-icon-warning-outline"></i></div>
          <div class="card-info">
            <div class="card-value">{{ warningCount }}</div>
            <div class="card-label">预警</div>
          </div>
        </div>
        <div class="alarm-summary-card card-serious">
          <div class="card-icon"><i class="el-icon-warning"></i></div>
          <div class="card-info">
            <div class="card-value">{{ seriousCount }}</div>
            <div class="card-label">严重</div>
          </div>
        </div>
        <div class="alarm-summary-card card-urgent">
          <div class="card-icon"><i class="el-icon-bell"></i></div>
          <div class="card-info">
            <div class="card-value">{{ urgentCount }}</div>
            <div class="card-label">紧急</div>
          </div>
        </div>
        <div class="alarm-summary-card card-total">
          <div class="card-icon"><i class="el-icon-s-data"></i></div>
          <div class="card-info">
            <div class="card-value">{{ totalAlarmCount }}</div>
            <div class="card-label">未处理合计</div>
          </div>
        </div>
      </div>

      <div class="alarm-charts-row">
        <el-card class="alarm-chart-card">
          <div slot="header" class="chart-header">
            <span>报警类型分布</span>
          </div>
          <div ref="alarmTypeChart" class="chart-container"></div>
        </el-card>
        <el-card class="alarm-chart-card">
          <div slot="header" class="chart-header">
            <span>报警级别占比</span>
          </div>
          <div ref="alarmLevelChart" class="chart-container"></div>
        </el-card>
        <el-card class="alarm-chart-card alarm-chart-card-wide">
          <div slot="header" class="chart-header">
            <span>设备报警统计</span>
          </div>
          <div ref="alarmLiftChart" class="chart-container"></div>
        </el-card>
      </div>
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
import * as echarts from 'echarts';

export default {
  name: 'Monitor',
  data() {
    return {
      lifts: [],
      showDetail: false,
      selectedLift: null,
      alarms: [],
      alarmTypeChart: null,
      alarmLevelChart: null,
      alarmLiftChart: null
    };
  },
  computed: {
    warningCount() {
      return this.alarms.filter(a => a.level === 1).length;
    },
    seriousCount() {
      return this.alarms.filter(a => a.level === 2).length;
    },
    urgentCount() {
      return this.alarms.filter(a => a.level === 3).length;
    },
    totalAlarmCount() {
      return this.alarms.length;
    }
  },
  mounted() {
    this.loadLifts();
    this.loadAlarms();
    setInterval(() => {
      this.updateLifts();
    }, 3000);
    setInterval(() => {
      this.loadAlarms();
    }, 15000);
    window.addEventListener('resize', this.handleResize);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize);
    if (this.alarmTypeChart) this.alarmTypeChart.dispose();
    if (this.alarmLevelChart) this.alarmLevelChart.dispose();
    if (this.alarmLiftChart) this.alarmLiftChart.dispose();
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
    loadAlarms() {
      axios.get('/api/alarms', { params: { status: 0 } }).then(res => {
        if (res.data.success) {
          this.alarms = res.data.data;
          this.$nextTick(() => {
            this.renderAlarmTypeChart();
            this.renderAlarmLevelChart();
            this.renderAlarmLiftChart();
          });
        }
      });
    },
    renderAlarmTypeChart() {
      if (!this.$refs.alarmTypeChart) return;
      if (!this.alarmTypeChart) {
        this.alarmTypeChart = echarts.init(this.$refs.alarmTypeChart);
      }
      var typeNames = { 1: '超载报警', 2: '超速报警', 3: '故障报警', 4: '维护提醒' };
      var typeColors = { 1: '#f56c6c', 2: '#e6a23c', 3: '#909399', 4: '#67c23a' };
      var typeData = [1, 2, 3, 4].map(function(t) {
        return {
          name: typeNames[t],
          value: this.alarms.filter(function(a) { return a.type === t; }).length,
          itemStyle: { color: typeColors[t] }
        };
      }.bind(this));

      this.alarmTypeChart.setOption({
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c} ({d}%)'
        },
        legend: {
          bottom: 0,
          itemWidth: 12,
          itemHeight: 12,
          textStyle: { fontSize: 12, color: '#606266' }
        },
        series: [{
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['50%', '45%'],
          avoidLabelOverlap: false,
          label: { show: false },
          emphasis: {
            label: { show: true, fontSize: 14, fontWeight: 'bold' }
          },
          labelLine: { show: false },
          data: typeData
        }]
      });
    },
    renderAlarmLevelChart() {
      if (!this.$refs.alarmLevelChart) return;
      if (!this.alarmLevelChart) {
        this.alarmLevelChart = echarts.init(this.$refs.alarmLevelChart);
      }
      var levelNames = { 1: '警告', 2: '严重', 3: '紧急' };
      var levelColors = { 1: '#e6a23c', 2: '#f56c6c', 3: '#ff4d4f' };
      var levelData = [1, 2, 3].map(function(l) {
        return {
          name: levelNames[l],
          value: this.alarms.filter(function(a) { return a.level === l; }).length,
          itemStyle: { color: levelColors[l] }
        };
      }.bind(this));

      this.alarmLevelChart.setOption({
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c} ({d}%)'
        },
        legend: {
          bottom: 0,
          itemWidth: 12,
          itemHeight: 12,
          textStyle: { fontSize: 12, color: '#606266' }
        },
        series: [{
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['50%', '45%'],
          avoidLabelOverlap: false,
          label: { show: false },
          emphasis: {
            label: { show: true, fontSize: 14, fontWeight: 'bold' }
          },
          labelLine: { show: false },
          data: levelData
        }]
      });
    },
    renderAlarmLiftChart() {
      if (!this.$refs.alarmLiftChart) return;
      if (!this.alarmLiftChart) {
        this.alarmLiftChart = echarts.init(this.$refs.alarmLiftChart);
      }
      var liftMap = {};
      this.alarms.forEach(function(a) {
        var name = a.lift_name || ('设备#' + a.lift_id);
        if (!liftMap[name]) {
          liftMap[name] = { warning: 0, serious: 0, urgent: 0 };
        }
        if (a.level === 1) liftMap[name].warning++;
        else if (a.level === 2) liftMap[name].serious++;
        else liftMap[name].urgent++;
      });

      var liftNames = Object.keys(liftMap);
      var warningData = liftNames.map(function(n) { return liftMap[n].warning; });
      var seriousData = liftNames.map(function(n) { return liftMap[n].serious; });
      var urgentData = liftNames.map(function(n) { return liftMap[n].urgent; });

      this.alarmLiftChart.setOption({
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' }
        },
        legend: {
          data: ['警告', '严重', '紧急'],
          bottom: 0,
          itemWidth: 12,
          itemHeight: 12,
          textStyle: { fontSize: 12, color: '#606266' }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '15%',
          top: '8%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: liftNames,
          axisLabel: { fontSize: 11, color: '#909399' },
          axisLine: { lineStyle: { color: '#dcdfe6' } }
        },
        yAxis: {
          type: 'value',
          minInterval: 1,
          axisLabel: { fontSize: 11, color: '#909399' },
          splitLine: { lineStyle: { color: '#f0f0f0' } }
        },
        series: [
          {
            name: '警告',
            type: 'bar',
            stack: 'alarm',
            data: warningData,
            itemStyle: { color: '#e6a23c', borderRadius: [0, 0, 0, 0] }
          },
          {
            name: '严重',
            type: 'bar',
            stack: 'alarm',
            data: seriousData,
            itemStyle: { color: '#f56c6c', borderRadius: [0, 0, 0, 0] }
          },
          {
            name: '紧急',
            type: 'bar',
            stack: 'alarm',
            data: urgentData,
            itemStyle: { color: '#ff4d4f', borderRadius: [4, 4, 0, 0] }
          }
        ]
      });
    },
    handleResize() {
      if (this.alarmTypeChart) this.alarmTypeChart.resize();
      if (this.alarmLevelChart) this.alarmLevelChart.resize();
      if (this.alarmLiftChart) this.alarmLiftChart.resize();
    },
    refreshData() {
      this.loadLifts();
      this.loadAlarms();
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

.alarm-stats-section {
  margin-bottom: 24px;
}

.alarm-summary-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.alarm-summary-card {
  display: flex;
  align-items: center;
  padding: 18px 20px;
  border-radius: 10px;
  border: 1px solid transparent;
  transition: box-shadow 0.2s;
}

.alarm-summary-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.card-warning {
  background: #fdf6ec;
  border-color: #f0c78a;
}

.card-serious {
  background: #fff2e8;
  border-color: #ffc069;
}

.card-urgent {
  background: #fff1f0;
  border-color: #ffa39e;
}

.card-total {
  background: #f0f5ff;
  border-color: #adc6ff;
}

.alarm-summary-card .card-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  margin-right: 16px;
  flex-shrink: 0;
}

.card-warning .card-icon {
  background: #faecd8;
  color: #e6a23c;
}

.card-serious .card-icon {
  background: #fde2c8;
  color: #f56c6c;
}

.card-urgent .card-icon {
  background: #fdccc8;
  color: #ff4d4f;
}

.card-total .card-icon {
  background: #d6e4ff;
  color: #2f54eb;
}

.alarm-summary-card .card-info {
  flex: 1;
}

.alarm-summary-card .card-value {
  font-size: 28px;
  font-weight: 700;
  color: #303133;
  line-height: 1.2;
}

.alarm-summary-card .card-label {
  font-size: 13px;
  color: #909399;
  margin-top: 2px;
}

.alarm-charts-row {
  display: grid;
  grid-template-columns: 1fr 1fr 2fr;
  gap: 16px;
}

.alarm-chart-card {
  border-radius: 10px;
}

.alarm-chart-card .el-card__header {
  padding: 14px 20px;
  border-bottom: 1px solid #f0f0f0;
}

.chart-header {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
}

.chart-container {
  height: 260px;
  width: 100%;
}

.alarm-chart-card-wide .chart-container {
  height: 260px;
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
