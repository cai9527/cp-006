<template>
  <el-card :class="['chart-card', { 'chart-card-wide': wide }]" shadow="never">
    <div slot="header" class="chart-card-header">
      <span>{{ title }}</span>
      <slot name="extra"></slot>
    </div>
    <div :class="['chart-container', sizeClass]">
      <slot></slot>
    </div>
  </el-card>
</template>

<script>
export default {
  name: 'ChartCard',
  props: {
    title: { type: String, required: true },
    wide: { type: Boolean, default: false },
    height: { type: [Number, String], default: 260 },
    size: { type: String, default: 'normal' }
  },
  computed: {
    sizeClass() {
      const map = { normal: '', tall: 'chart-container-tall', small: 'chart-container-small' };
      return map[this.size] || '';
    }
  }
};
</script>

<style scoped>
.chart-card {
  border-radius: 10px;
}

.chart-card >>> .el-card__header {
  padding: 14px 20px;
  border-bottom: 1px solid #f0f0f0;
}

.chart-card-header {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-container {
  height: 260px;
  width: 100%;
}

.chart-container-tall {
  height: 320px;
}

.chart-container-small {
  height: 220px;
}
</style>
