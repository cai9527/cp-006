<template>
  <el-dialog :title="title" :visible.sync="innerVisible" :width="width" append-to-body>
    <div v-if="lift" class="detail-content">
      <el-row :gutter="20">
        <el-col :span="12">
          <div class="detail-item">
            <span class="label">设备编号</span>
            <span class="value">{{ lift.code }}</span>
          </div>
          <div class="detail-item">
            <span class="label">安装位置</span>
            <span class="value">{{ lift.location }}</span>
          </div>
          <div class="detail-item">
            <span class="label">最大载重</span>
            <span class="value">{{ lift.max_weight }}kg</span>
          </div>
          <div class="detail-item">
            <span class="label">总楼层数</span>
            <span class="value">{{ lift.total_floor }}层</span>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="detail-item">
            <span class="label">当前状态</span>
            <span :class="['value', statusClass]">{{ statusText }}</span>
          </div>
          <div class="detail-item">
            <span class="label">当前楼层</span>
            <span class="value">{{ lift.current_floor }}F</span>
          </div>
          <div class="detail-item">
            <span class="label">当前载重</span>
            <span class="value">{{ Math.round(lift.current_weight || 0) }}kg</span>
          </div>
          <div class="detail-item">
            <span class="label">运行速度</span>
            <span class="value">{{ formatSpeed(lift.speed || 0) }}</span>
          </div>
        </el-col>
      </el-row>
      <div class="progress-section">
        <div class="progress-item">
          <span class="progress-label">载重比例</span>
          <el-progress :percentage="loadPercentage" :color="loadColor" />
        </div>
      </div>
      <slot name="extra"></slot>
    </div>
    <span v-if="$slots.footer" slot="footer">
      <slot name="footer"></slot>
    </span>
  </el-dialog>
</template>

<script>
import { getLiftStatusClass, getLiftStatusText } from '@/utils/statusMappers';
import { formatSpeed, getLoadPercentage, getLoadColor } from '@/utils/formatters';

export default {
  name: 'LiftDetailDialog',
  props: {
    visible: { type: Boolean, default: false },
    lift: { type: Object, default: null },
    title: { type: String, default: '升降机详情' },
    width: { type: String, default: '600px' }
  },
  computed: {
    innerVisible: {
      get() { return this.visible; },
      set(val) { this.$emit('update:visible', val); }
    },
    statusClass() {
      return this.lift ? getLiftStatusClass(this.lift.status) : '';
    },
    statusText() {
      return this.lift ? getLiftStatusText(this.lift.status) : '';
    },
    loadPercentage() {
      return this.lift ? getLoadPercentage(this.lift.current_weight, this.lift.max_weight) : 0;
    },
    loadColor() {
      return getLoadColor(this.loadPercentage);
    }
  },
  methods: { formatSpeed }
};
</script>

<style scoped>
.detail-content {
  padding: 10px 0;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #f2f6fc;
}

.label {
  color: #909399;
}

.value {
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
  flex-shrink: 0;
}
</style>
