<template>
  <el-card class="filter-card-wrapper" shadow="never">
    <slot></slot>
  </el-card>
</template>

<script>
export default { name: 'FilterCard' };
</script>

<style scoped>
.filter-card-wrapper {
  margin-bottom: 16px;
}

.filter-card-wrapper >>> .el-card__body {
  padding: 16px 20px 4px;
}
</style>
