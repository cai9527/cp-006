<template>
  <el-card class="form-actions-card" shadow="never">
    <div :class="['form-actions-row', alignClass]">
      <slot>
        <el-button v-if="showSubmit" type="primary" :loading="submitting" @click="$emit('submit')">
          <i class="el-icon-check"></i> {{ submitText }}
        </el-button>
        <el-button v-if="showReset" @click="$emit('reset')">
          <i class="el-icon-refresh-left"></i> {{ resetText }}
        </el-button>
        <el-button v-if="showCancel" @click="$emit('cancel')">
          <i class="el-icon-close"></i> {{ cancelText }}
        </el-button>
      </slot>
    </div>
  </el-card>
</template>

<script>
export default {
  name: 'FormActions',
  props: {
    align: { type: String, default: 'center', validator: v => ['left', 'center', 'right'].includes(v) },
    showSubmit: { type: Boolean, default: true },
    showReset: { type: Boolean, default: true },
    showCancel: { type: Boolean, default: true },
    submitText: { type: String, default: '提交' },
    resetText: { type: String, default: '重置' },
    cancelText: { type: String, default: '取消' },
    submitting: { type: Boolean, default: false }
  },
  computed: {
    alignClass() {
      return 'align-' + this.align;
    }
  }
};
</script>

<style scoped>
.form-actions-card {
  max-width: 900px;
  margin-bottom: 0;
  border: none !important;
  background: transparent !important;
}

.form-actions-card >>> .el-card__body {
  padding: 10px 0;
}

.form-actions-row {
  display: flex;
  gap: 12px;
}

.align-left { justify-content: flex-start; }
.align-center { justify-content: center; }
.align-right { justify-content: flex-end; }
</style>
