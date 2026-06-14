<template>
  <div :class="['alarm-summary-wrapper', 'stat-cards-row', colsClass]">
    <StatsCard
      v-for="item in summaryItems"
      :key="item.level"
      :value="item.count"
      :label="item.label"
      :icon="item.icon"
      :theme="item.theme"
    />
    <StatsCard
      v-if="showTotal"
      :value="totalCount"
      label="未处理合计"
      icon="el-icon-s-data"
      theme="total"
    />
  </div>
</template>

<script>
import StatsCard from '@/components/layout/StatsCard.vue';
import { getAlarmLevelIcon } from '@/utils/statusMappers';

export default {
  name: 'AlarmSummary',
  components: { StatsCard },
  props: {
    alarms: { type: Array, default: () => [] },
    showTotal: { type: Boolean, default: true },
    includeHandled: { type: Boolean, default: false }
  },
  computed: {
    filteredAlarms() {
      if (this.includeHandled) return this.alarms;
      return this.alarms.filter(a => a.status === 0);
    },
    warningCount() {
      return this.filteredAlarms.filter(a => a.level === 1).length;
    },
    seriousCount() {
      return this.filteredAlarms.filter(a => a.level === 2).length;
    },
    urgentCount() {
      return this.filteredAlarms.filter(a => a.level === 3).length;
    },
    totalCount() {
      return this.filteredAlarms.length;
    },
    summaryItems() {
      return [
        { level: 1, count: this.warningCount, label: '预警', theme: 'warning', icon: getAlarmLevelIcon(1) },
        { level: 2, count: this.seriousCount, label: '严重', theme: 'serious', icon: getAlarmLevelIcon(2) },
        { level: 3, count: this.urgentCount, label: '紧急', theme: 'urgent', icon: getAlarmLevelIcon(3) }
      ];
    },
    colsClass() {
      return this.showTotal ? 'cols-4' : 'cols-3';
    }
  }
};
</script>

<style scoped>
.alarm-summary-wrapper {
  margin-bottom: 20px;
}
</style>
