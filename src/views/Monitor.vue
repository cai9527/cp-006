<template>
  <div class="monitor-page">
    <PageHeader title="实时监控">
      <el-button type="primary" @click="refreshData">
        <i class="el-icon-refresh"></i> 刷新
      </el-button>
    </PageHeader>

    <div class="alarm-stats-section">
      <AlarmSummary :alarms="alarms" />

      <div class="charts-row cols-3">
        <ChartCard title="报警类型分布">
          <BaseChart :option="alarmTypeChartOption" />
        </ChartCard>
        <ChartCard title="报警级别占比">
          <BaseChart :option="alarmLevelChartOption" />
        </ChartCard>
        <ChartCard title="设备报警统计" wide>
          <BaseChart :option="alarmLiftChartOption" />
        </ChartCard>
      </div>
    </div>

    <div class="lift-grid">
      <LiftCard
        v-for="lift in lifts"
        :key="lift.id"
        :lift="lift"
        @click="showLiftDetail"
      />
    </div>

    <LiftDetailDialog
      :visible.sync="showDetail"
      :lift="selectedLift"
    />
  </div>
</template>

<script>
import axios from 'axios';
import {
  buildPieOption,
  buildStackedBarOption,
  buildAlarmTypePieData,
  buildAlarmLevelPieData,
  buildAlarmLiftBarData
} from '@/utils/chartHelpers';

export default {
  name: 'Monitor',
  data() {
    return {
      lifts: [],
      showDetail: false,
      selectedLift: null,
      alarms: []
    };
  },
  computed: {
    alarmTypeChartOption() {
      return buildPieOption({
        data: buildAlarmTypePieData(this.alarms),
        labelVisible: false
      });
    },
    alarmLevelChartOption() {
      return buildPieOption({
        data: buildAlarmLevelPieData(this.alarms),
        labelVisible: false
      });
    },
    alarmLiftChartOption() {
      const { categories, series } = buildAlarmLiftBarData(this.alarms);
      return buildStackedBarOption({
        categories,
        series,
        gridConfig: {
          left: '3%',
          right: '4%',
          bottom: '15%',
          top: '8%',
          containLabel: true
        }
      });
    }
  },
  mounted() {
    this.loadLifts();
    this.loadAlarms();
    setInterval(() => { this.updateLifts(); }, 3000);
    setInterval(() => { this.loadAlarms(); }, 15000);
  },
  methods: {
    loadLifts() {
      axios.get('/api/lifts').then(res => {
        if (res.data.success) {
          this.lifts = res.data.data;
        }
      });
    },
    loadAlarms() {
      axios.get('/api/alarms', { params: { status: 0 } }).then(res => {
        if (res.data.success) {
          this.alarms = res.data.data;
        }
      });
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
    showLiftDetail(lift) {
      this.selectedLift = lift;
      this.showDetail = true;
    }
  }
};
</script>

<style>
.monitor-page {
  padding: 20px;
}

.alarm-stats-section {
  margin-bottom: 24px;
}

.lift-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}
</style>
