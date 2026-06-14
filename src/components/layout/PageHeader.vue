<template>
  <div :class="['page-header', { 'page-header-with-back': showBack }]">
    <el-button v-if="showBack" icon="el-icon-arrow-left" @click="$emit('back')">返回</el-button>
    <h2>{{ title }}</h2>
    <div v-if="$slots.actions" class="header-actions">
      <slot name="actions"></slot>
    </div>
    <div v-else-if="$slots.default" class="header-actions">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PageHeader',
  props: {
    title: { type: String, required: true },
    showBack: { type: Boolean, default: false }
  }
};
</script>
