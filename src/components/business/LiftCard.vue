<template>
  <el-card
    :class="['lift-card-wrapper', statusClass, { clickable: clickable }]"
    @click="handleClick"
  >
    <div class="lift-header">
      <div class="lift-info">
        <h3>{{ lift.name }}</h3>
        <span class="lift-code">{{ lift.code }}</span>
      </div>
      <span :class="['status-badge', statusClass]">{{ statusText }}</span>
    </div>
    <div class="lift-stats">
      <div class="stat-item">
        <span class="stat-label">当前楼层</span>
        <span class="stat-value floor">{{ lift.current_floor }}F</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">载重</span>
        <span class="stat-value">{{ displayWeight }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">速度</span>
        <span class="stat-value">{{ displaySpeed }}</span>
      </div>
    </div>
    <div class="location">{{ lift.location }}</div>
  </el-card>
</template>

<script>
import { getLiftStatusClass, getLiftStatusText } from '@/utils/statusMappers';
import { formatSpeed } from '@/utils/formatters';

export default {
  name: 'LiftCard',
  props: {
    lift: { type: Object, required: true },
    clickable: { type: Boolean, default: true }
  },
  computed: {
    statusClass() {
      return getLiftStatusClass(this.lift.status);
    },
    statusText() {
      return getLiftStatusText(this.lift.status);
    },
    displayWeight() {
      return `${Math.round(this.lift.current_weight || 0)}/${this.lift.max_weight || 0}kg`;
    },
    displaySpeed() {
      return formatSpeed(this.lift.speed || 0);
    }
  },
  methods: {
    handleClick() {
      if (this.clickable) {
        this.$emit('click', this.lift);
      }
    }
  }
};
</script>

<style scoped>
.lift-card-wrapper {
  cursor: default;
  transition: all 0.3s;
  height: 100%;
}

.lift-card-wrapper.clickable {
  cursor: pointer;
}

.lift-card-wrapper.clickable:hover {
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

.lift-stats {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
}

.stat-item {
  text-align: center;
  flex: 1;
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
</style>
