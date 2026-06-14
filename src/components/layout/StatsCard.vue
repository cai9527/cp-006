<template>
  <div :class="['stats-card', themeClass]">
    <div class="card-icon" :style="iconStyle">
      <i :class="icon"></i>
    </div>
    <div class="card-info">
      <div class="card-value">{{ displayValue }}</div>
      <div class="card-label">{{ label }}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StatsCard',
  props: {
    value: { type: [Number, String], default: 0 },
    label: { type: String, required: true },
    icon: { type: String, default: 'el-icon-s-data' },
    theme: { type: String, default: 'default' },
    suffix: { type: String, default: '' },
    iconBg: { type: String, default: '' },
    iconColor: { type: String, default: '' },
    valueFormat: { type: Function, default: null }
  },
  computed: {
    displayValue() {
      if (this.valueFormat) return this.valueFormat(this.value);
      return this.value + this.suffix;
    },
    themeClass() {
      const map = {
        warning: 'card-warning',
        serious: 'card-serious',
        urgent: 'card-urgent',
        total: 'card-total',
        success: 'card-success',
        info: 'card-info',
        primary: 'card-primary'
      };
      return map[this.theme] || '';
    },
    iconStyle() {
      const style = {};
      if (this.iconBg) style.background = this.iconBg;
      if (this.iconColor) style.color = this.iconColor;
      return style;
    }
  }
};
</script>

<style scoped>
.stats-card {
  display: flex;
  align-items: center;
  padding: 18px 20px;
  border-radius: 10px;
  border: 1px solid transparent;
  transition: box-shadow 0.2s;
  background: #fff;
}

.stats-card:hover {
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

.card-success {
  background: #f0f9eb;
  border-color: #c2e7b0;
}

.card-info {
  background: #f4f4f5;
  border-color: #d3d4d6;
}

.card-primary {
  background: #ecf5ff;
  border-color: #b3d8ff;
}

.stats-card .card-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  margin-right: 16px;
  flex-shrink: 0;
  background: #e8f5e9;
  color: #67c23a;
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

.card-success .card-icon {
  background: #e1f3d8;
  color: #67c23a;
}

.card-info .card-icon {
  background: #e9e9eb;
  color: #909399;
}

.card-primary .card-icon {
  background: #d9ecff;
  color: #409eff;
}

.stats-card .card-info {
  flex: 1;
  min-width: 0;
}

.stats-card .card-value {
  font-size: 28px;
  font-weight: 700;
  color: #303133;
  line-height: 1.2;
}

.stats-card .card-label {
  font-size: 13px;
  color: #909399;
  margin-top: 2px;
}
</style>
