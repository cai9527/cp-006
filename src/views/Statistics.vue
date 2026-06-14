<template>
  <div class="statistics-page">
    <PageHeader title="统计分析" />

    <div class="stat-cards-row cols-4">
      <StatsCard label="设备总数" :value="stats.totalLifts" icon="el-icon-truck" />
      <StatsCard label="运行中" :value="stats.runningLifts" icon="el-icon-video-play" theme="success" />
      <StatsCard label="待处理报警" :value="stats.unhandledAlarms" icon="el-icon-warning" theme="danger" />
      <StatsCard label="进行中维护" :value="stats.ongoingMaintenance" icon="el-icon-setting" theme="warning" />
    </div>

    <div class="charts-row cols-2">
      <ChartCard title="维护状态分布">
        <BaseChart :option="maintenancePieOption" />
      </ChartCard>
      <ChartCard title="维护类型统计">
        <BaseChart :option="typePieOption" />
      </ChartCard>
      <ChartCard title="每月维护时间轴" wide>
        <BaseChart :option="timelineBarOption" height="320px" />
      </ChartCard>
    </div>

    <el-card class="record-card" shadow="never">
      <div slot="header" class="card-header">
        <span>运行记录</span>
      </div>
      <el-table :data="records" border stripe>
        <el-table-column prop="lift_name" label="设备名称" min-width="120"></el-table-column>
        <el-table-column prop="start_floor" label="起始楼层" width="100"></el-table-column>
        <el-table-column prop="end_floor" label="到达楼层" width="100"></el-table-column>
        <el-table-column prop="weight" label="载重(kg)" width="100"></el-table-column>
        <el-table-column prop="duration" label="运行时长(秒)" width="120"></el-table-column>
        <el-table-column prop="status" label="运行状态" width="100">
          <template slot-scope="scope">
            <StatusBadge type="run" :value="scope.row.status" />
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="运行时间" width="180"></el-table-column>
      </el-table>
      <DataPagination
        :total="recordsTotal"
        :page-size="pageSize"
        :current-page="currentPage"
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
      />
    </el-card>
  </div>
</template>

<script>
import axios from 'axios';
import {
  buildPieOption,
  buildStackedBarOption,
  buildMaintenanceTimelineData,
  buildMaintenancePieData
} from '@/utils/chartHelpers';

export default {
  name: 'Statistics',
  data() {
    return {
      stats: {
        totalLifts: 0,
        runningLifts: 0,
        unhandledAlarms: 0,
        ongoingMaintenance: 0
      },
      maintenanceStats: {
        statusCounts: { pending: 0, processing: 0, completed: 0 },
        typeCounts: { routine: 0, periodic: 0, fault: 0 }
      },
      maintenanceRecords: [],
      records: [],
      recordsTotal: 0,
      pageSize: 10,
      currentPage: 1
    };
  },
  computed: {
    maintenancePieOption() {
      return buildPieOption({
        data: buildMaintenancePieData(this.maintenanceStats)
      });
    },
    typePieOption() {
      const { routine, periodic, fault } = this.maintenanceStats.typeCounts;
      return buildPieOption({
        data: [
          { name: '日常维护', value: routine },
          { name: '定期维护', value: periodic },
          { name: '故障维护', value: fault }
        ]
      });
    },
    timelineBarOption() {
      const { categories, series } = buildMaintenanceTimelineData(this.maintenanceRecords);
      return buildStackedBarOption({
        categories,
        series,
        xAxisName: '月份',
        yAxisName: '维护次数'
      });
    }
  },
  mounted() {
    this.loadStatistics();
    this.loadRecords();
  },
  methods: {
    loadStatistics() {
      axios.all([
        axios.get('/api/lifts'),
        axios.get('/api/alarms', { params: { status: 0 } }),
        axios.get('/api/maintenance_records')
      ]).then(axios.spread((liftsRes, alarmsRes, maintenanceRes) => {
        const lifts = liftsRes.data.data || [];
        const alarms = alarmsRes.data.data || [];
        const mRecords = maintenanceRes.data.data || [];
        this.stats.totalLifts = lifts.length;
        this.stats.runningLifts = lifts.filter(l => l.status === 1).length;
        this.stats.unhandledAlarms = alarms.length;
        this.stats.ongoingMaintenance = mRecords.filter(m => m.status === 1).length;
        this.maintenanceRecords = mRecords;
        this.maintenanceStats.statusCounts = {
          pending: mRecords.filter(m => m.status === 0).length,
          processing: mRecords.filter(m => m.status === 1).length,
          completed: mRecords.filter(m => m.status === 2).length
        };
        this.maintenanceStats.typeCounts = {
          routine: mRecords.filter(m => m.type === 1).length,
          periodic: mRecords.filter(m => m.type === 2).length,
          fault: mRecords.filter(m => m.type === 3).length
        };
      }));
    },
    loadRecords() {
      axios.get('/api/run_records').then(res => {
        if (res.data.success) {
          this.records = res.data.data || [];
          this.recordsTotal = this.records.length;
        }
      });
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
.statistics-page {
  padding: 20px;
}

.record-card {
  margin-top: 24px;
}

.card-header {
  font-size: 16px;
  font-weight: 500;
}
</style>
