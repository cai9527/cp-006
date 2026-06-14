<template>
  <el-pagination
    class="data-pagination"
    background
    :layout="layout"
    :total="total"
    :page-sizes="pageSizes"
    :page-size="innerPageSize"
    :current-page="innerCurrentPage"
    @size-change="handleSizeChange"
    @current-change="handlePageChange"
  ></el-pagination>
</template>

<script>
export default {
  name: 'DataPagination',
  props: {
    total: { type: Number, required: true },
    pageSize: { type: Number, default: 10 },
    currentPage: { type: Number, default: 1 },
    pageSizes: { type: Array, default: () => [10, 20, 50, 100] },
    showSizes: { type: Boolean, default: true }
  },
  data() {
    return {
      innerPageSize: this.pageSize,
      innerCurrentPage: this.currentPage
    };
  },
  computed: {
    layout() {
      return this.showSizes
        ? 'total, sizes, prev, pager, next, jumper'
        : 'total, prev, pager, next, jumper';
    }
  },
  watch: {
    pageSize(val) { this.innerPageSize = val; },
    currentPage(val) { this.innerCurrentPage = val; }
  },
  methods: {
    handleSizeChange(size) {
      this.innerPageSize = size;
      this.innerCurrentPage = 1;
      this.$emit('update:pageSize', size);
      this.$emit('size-change', size);
      this.$emit('change', { page: 1, pageSize: size });
    },
    handlePageChange(page) {
      this.innerCurrentPage = page;
      this.$emit('update:currentPage', page);
      this.$emit('current-change', page);
      this.$emit('change', { page, pageSize: this.innerPageSize });
    }
  }
};
</script>

<style scoped>
.data-pagination {
  margin-top: 20px;
  text-align: right;
}
</style>
