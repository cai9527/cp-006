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
        <div slot="header" class="chart-card-header">报警类型分布</div>
        <div ref="alarmTypeChart" class="echart-container"></div>
      </el-card>

      <el-card class="chart-card">
        <div slot="header" class="chart-card-header">维护状态统计</div>
        <div ref="maintenancePieChart" class="echart-container"></div>
      </el-card>
    </div>

    <div class="charts-row">
      <el-card class="chart-card chart-card-full">
        <div slot="header" class="chart-card-header">维护状态时间序列</div>
        <div ref="maintenanceTimelineChart" class="echart-container echart-container-tall"></div>
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
import * as echarts from 'echarts';

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
      maintenanceRecords: [],
      alarmTypeChart: null,
      maintenancePieChart: null,
      maintenanceTimelineChart: null
    };
  },
  computed: {
    pendingAlarms() {
      return this.alarmStats.reduce((sum, item) => sum + item.count, 0);
    }
  },
  mounted() {
    this.loadLifts();
    this.loadStats();
    window.addEventListener('resize', this.handleResize);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize);
    if (this.alarmTypeChart) this.alarmTypeChart.dispose();
    if (this.maintenancePieChart) this.maintenancePieChart.dispose();
    if (this.maintenanceTimelineChart) this.maintenanceTimelineChart.dispose();
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
      var params = {};
      if (this.liftId > 0) params.lift_id = this.liftId;
      if (this.startDate) params.start_date = this.startDate;
      if (this.endDate) params.end_date = this.endDate;

      axios.get('/api/statistics', { params }).then(res => {
        if (res.data.success) {
          this.stats = res.data.data;
          this.$nextTick(() => {
            this.renderMaintenancePieChart();
            this.renderMaintenanceTimelineChart();
          });
        }
      });

      axios.get('/api/run_records', { params }).then(res => {
        if (res.data.success) {
          this.runRecords = res.data.data;
        }
      });

      var alarmParams = { status: 0 };
      if (this.liftId > 0) alarmParams.lift_id = this.liftId;
      axios.get('/api/alarms', { params: alarmParams }).then(res => {
        if (res.data.success) {
          var data = res.data.data;
          this.alarmStats = [
            { type: 1, count: data.filter(a => a.type === 1).length },
            { type: 2, count: data.filter(a => a.type === 2).length },
            { type: 3, count: data.filter(a => a.type === 3).length },
            { type: 4, count: data.filter(a => a.type === 4).length }
          ];
          this.$nextTick(() => {
            this.renderAlarmTypeChart();
          });
        }
      });

      var maintParams = {};
      if (this.liftId > 0) maintParams.lift_id = this.liftId;
      axios.get('/api/maintenance', { params: maintParams }).then(res => {
        if (res.data.success) {
          this.maintenanceRecords = res.data.data;
          this.$nextTick(() => {
            this.renderMaintenanceTimelineChart();
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
      var chartData = this.alarmStats.map(function(item) {
        return {
          name: typeNames[item.type] || '未知',
          value: item.count,
          itemStyle: { color: typeColors[item.type] || '#909399' }
        };
      }).filter(function(d) { return d.value > 0; });

      var hasData = chartData.length > 0;

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
        graphic: hasData ? null : [{
          type: 'text',
          left: 'center',
          top: 'middle',
          style: {
            text: '暂无数据',
            fontSize: 14,
            fill: '#c0c4cc'
          }
        }],
        series: [{
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['50%', '45%'],
          avoidLabelOverlap: false,
          label: {
            show: true,
            formatter: '{b}\n{c} ({d}%)',
            fontSize: 12,
            color: '#606266'
          },
          emphasis: {
            label: { show: true, fontSize: 14, fontWeight: 'bold' }
          },
          labelLine: {
            length: 10,
            length2: 15,
            smooth: true
          },
          data: chartData
        }]
      }, true);
    },
    renderMaintenancePieChart() {
      if (!this.$refs.maintenancePieChart) return;
      if (!this.maintenancePieChart) {
        this.maintenancePieChart = echarts.init(this.$refs.maintenancePieChart);
      }

      var maintenanceStats = this.stats.maintenanceStats || [];
      var statusNames = { 0: '待处理', 1: '进行中', 2: '已完成' };
      var statusColors = { 0: '#f56c6c', 1: '#e6a23c', 2: '#67c23a' };
      var total = maintenanceStats.reduce(function(sum, item) { return sum + item.count; }, 0);

      var chartData = maintenanceStats.map(function(item) {
        return {
          name: statusNames[item.status] || '未知',
          value: item.count,
          itemStyle: { color: statusColors[item.status] || '#909399' }
        };
      });

      var hasData = total > 0;

      this.maintenancePieChart.setOption({
        tooltip: {
          trigger: 'item',
          formatter: function(params) {
            var pct = total > 0 ? ((params.value / total) * 100).toFixed(1) : '0.0';
            return params.name + ': ' + params.value + ' (' + pct + '%)';
          }
        },
        legend: {
          bottom: 0,
          itemWidth: 12,
          itemHeight: 12,
          textStyle: { fontSize: 12, color: '#606266' }
        },
        graphic: hasData ? null : [{
          type: 'text',
          left: 'center',
          top: 'middle',
          style: {
            text: '暂无数据',
            fontSize: 14,
            fill: '#c0c4cc'
          }
        }],
        series: [{
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['50%', '45%'],
          avoidLabelOverlap: false,
          label: {
            show: true,
            formatter: function(params) {
              var pct = total > 0 ? ((params.value / total) * 100).toFixed(1) : '0.0';
              return params.name + '\n' + params.value + ' (' + pct + '%)';
            },
            fontSize: 12,
            color: '#606266',
            lineHeight: 18
          },
          emphasis: {
            label: { show: true, fontSize: 14, fontWeight: 'bold' }
          },
          labelLine: {
            length: 10,
            length2: 15,
            smooth: true
          },
          data: chartData
        }]
      }, true);
    },
    renderMaintenanceTimelineChart() {
      if (!this.$refs.maintenanceTimelineChart) return;
      if (!this.maintenanceTimelineChart) {
        this.maintenanceTimelineChart = echarts.init(this.$refs.maintenanceTimelineChart);
      }

      var records = this.maintenanceRecords;
      if (!records.length) {
        this.maintenanceTimelineChart.setOption({
          graphic: [{
            type: 'text',
            left: 'center',
            top: 'middle',
            style: { text: '暂无维护数据', fontSize: 14, fill: '#c0c4cc' }
          }]
        }, true);
        return;
      }

      var dateMap = {};
      records.forEach(function(r) {
        var dateKey = (r.created_at || '').slice(0, 10);
        if (!dateKey) return;
        if (!dateMap[dateKey]) {
          dateMap[dateKey] = { pending: 0, processing: 0, completed: 0 };
        }
        if (r.status === 0) dateMap[dateKey].pending++;
        else if (r.status === 1) dateMap[dateKey].processing++;
        else if (r.status === 2) dateMap[dateKey].completed++;
      });

      var dates = Object.keys(dateMap).sort();
      var pendingData = dates.map(function(d) { return dateMap[d].pending; });
      var processingData = dates.map(function(d) { return dateMap[d].processing; });
      var completedData = dates.map(function(d) { return dateMap[d].completed; });

      this.maintenanceTimelineChart.setOption({
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' }
        },
        legend: {
          data: ['待处理', '进行中', '已完成'],
          bottom: 0,
          itemWidth: 12,
          itemHeight: 12,
          textStyle: { fontSize: 12, color: '#606266' }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '12%',
          top: '10%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: dates,
          axisLabel: { fontSize: 11, color: '#909399', rotate: dates.length > 8 ? 30 : 0 },
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
            name: '待处理',
            type: 'bar',
            stack: 'maintenance',
            data: pendingData,
            itemStyle: { color: '#f56c6c' }
          },
          {
            name: '进行中',
            type: 'bar',
            stack: 'maintenance',
            data: processingData,
            itemStyle: { color: '#e6a23c' }
          },
          {
            name: '已完成',
            type: 'bar',
            stack: 'maintenance',
            data: completedData,
            itemStyle: { color: '#67c23a', borderRadius: [4, 4, 0, 0] }
          }
        ]
      }, true);
    },
    handleResize() {
      if (this.alarmTypeChart) this.alarmTypeChart.resize();
      if (this.maintenancePieChart) this.maintenancePieChart.resize();
      if (this.maintenanceTimelineChart) this.maintenanceTimelineChart.resize();
    },
    formatDuration(seconds) {
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return mins + '分' + secs + '秒';
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
  border-radius: 10px;
}

.chart-card .el-card__header {
  padding: 14px 20px;
  border-bottom: 1px solid #f0f0f0;
}

.chart-card-header {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
}

.chart-card-full {
  grid-column: 1 / -1;
}

.echart-container {
  height: 300px;
  width: 100%;
}

.echart-container-tall {
  height: 320px;
}

.table-card {
  padding: 20px;
  border-radius: 10px;
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
