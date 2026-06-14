<template>
  <div ref="chartEl" class="base-chart" :style="{ height: heightStyle }"></div>
</template>

<script>
import { initChart, disposeChart, resizeChart } from '@/utils/chartHelpers';

export default {
  name: 'BaseChart',
  props: {
    option: { type: Object, required: true },
    height: { type: [Number, String], default: 260 },
    notMerge: { type: Boolean, default: false }
  },
  data() {
    return { chart: null };
  },
  computed: {
    heightStyle() {
      return typeof this.height === 'number' ? this.height + 'px' : this.height;
    }
  },
  watch: {
    option: {
      deep: true,
      handler(val) {
        this.$nextTick(() => this.render(val));
      }
    }
  },
  mounted() {
    this.$nextTick(() => this.render(this.option));
  },
  beforeDestroy() {
    disposeChart(this.chart);
    this.chart = null;
  },
  methods: {
    render(opt) {
      if (!this.$refs.chartEl) return;
      if (!this.chart) {
        this.chart = initChart(this.$refs.chartEl);
      }
      if (this.chart && opt) {
        this.chart.setOption(opt, this.notMerge);
      }
    },
    resize() {
      resizeChart(this.chart);
    },
    getInstance() {
      return this.chart;
    }
  }
};
</script>

<style scoped>
.base-chart {
  width: 100%;
  min-height: 200px;
}
</style>
