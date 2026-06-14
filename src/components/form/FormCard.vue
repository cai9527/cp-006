<template>
  <el-card class="form-card-wrapper">
    <div v-if="title || icon || $slots.header" slot="header" class="form-card-header">
      <i v-if="icon" :class="icon"></i>
      <span v-if="title">{{ title }}</span>
      <slot name="header"></slot>
    </div>
    <slot></slot>
  </el-card>
</template>

<script>
export default {
  name: 'FormCard',
  props: {
    title: { type: String, default: '' },
    icon: { type: String, default: '' }
  }
};
</script>

<style scoped>
.form-card-wrapper {
  max-width: 900px;
  margin-bottom: 16px;
}

.form-card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.form-card-header i {
  font-size: 18px;
  color: #409eff;
}
</style>
