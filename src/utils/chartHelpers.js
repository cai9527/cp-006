import * as echarts from 'echarts';

let resizeHandler = null;
const chartInstances = new Set();

function ensureResizeHandler() {
  if (resizeHandler) return;
  resizeHandler = function() {
    chartInstances.forEach(chart => {
      try { chart.resize(); } catch (e) {}
    });
  };
  window.addEventListener('resize', resizeHandler);
}

export function initChart(el, options) {
  if (!el) return null;
  ensureResizeHandler();
  const chart = echarts.init(el);
  chartInstances.add(chart);
  if (options) {
    chart.setOption(options, true);
  }
  return chart;
}

export function disposeChart(chart) {
  if (!chart) return;
  chartInstances.delete(chart);
  try { chart.dispose(); } catch (e) {}
  if (chartInstances.size === 0 && resizeHandler) {
    window.removeEventListener('resize', resizeHandler);
    resizeHandler = null;
  }
}

export function resizeChart(chart) {
  if (!chart) return;
  try { chart.resize(); } catch (e) {}
}

export function buildPieOption(config) {
  const {
    data,
    title = '',
    showLegend = true,
    radius = ['40%', '70%'],
    center = ['50%', '45%'],
    labelVisible = false,
    labelFormatter = null,
    showEmpty = true,
    tooltipFormatter = '{b}: {c} ({d}%)'
  } = config;

  const total = data.reduce((sum, d) => sum + (Number(d.value) || 0), 0);
  const hasData = total > 0;
  const graphic = (hasData || !showEmpty) ? null : [{
    type: 'text',
    left: 'center',
    top: 'middle',
    style: { text: '暂无数据', fontSize: 14, fill: '#c0c4cc' }
  }];

  return {
    title: title ? { text: title, left: 'center', top: 0, textStyle: { fontSize: 15, fontWeight: 600, color: '#303133' } } : undefined,
    tooltip: { trigger: 'item', formatter: tooltipFormatter },
    legend: showLegend ? {
      bottom: 0,
      itemWidth: 12,
      itemHeight: 12,
      textStyle: { fontSize: 12, color: '#606266' }
    } : undefined,
    graphic: graphic,
    series: [{
      type: 'pie',
      radius: radius,
      center: center,
      avoidLabelOverlap: false,
      label: {
        show: labelVisible,
        formatter: labelFormatter || (labelVisible ? '{b}\n{c} ({d}%)' : undefined),
        fontSize: 12,
        color: '#606266',
        lineHeight: 18
      },
      emphasis: {
        label: { show: true, fontSize: 14, fontWeight: 'bold' }
      },
      labelLine: labelVisible ? { length: 10, length2: 15, smooth: true } : { show: false },
      data: data
    }]
  };
}

export function buildAlarmTypePieData(alarms) {
  const typeNames = { 1: '超载报警', 2: '超速报警', 3: '故障报警', 4: '维护提醒' };
  const typeColors = { 1: '#f56c6c', 2: '#e6a23c', 3: '#909399', 4: '#67c23a' };
  return [1, 2, 3, 4].map(t => ({
    name: typeNames[t],
    value: alarms.filter(a => a.type === t).length,
    itemStyle: { color: typeColors[t] }
  }));
}

export function buildAlarmLevelPieData(alarms) {
  const levelNames = { 1: '警告', 2: '严重', 3: '紧急' };
  const levelColors = { 1: '#e6a23c', 2: '#f56c6c', 3: '#ff4d4f' };
  return [1, 2, 3].map(l => ({
    name: levelNames[l],
    value: alarms.filter(a => a.level === l).length,
    itemStyle: { color: levelColors[l] }
  }));
}

export function buildStackedBarOption(config) {
  const {
    categories,
    series,
    xLabelRotation = 0,
    showLegend = true,
    legendData = null,
    gridConfig = null,
    minYInterval = null
  } = config;

  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    legend: showLegend ? {
      data: legendData || series.map(s => s.name),
      bottom: 0,
      itemWidth: 12,
      itemHeight: 12,
      textStyle: { fontSize: 12, color: '#606266' }
    } : undefined,
    grid: gridConfig || {
      left: '3%',
      right: '4%',
      bottom: '12%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: categories,
      axisLabel: {
        fontSize: 11,
        color: '#909399',
        rotate: categories.length > 8 || xLabelRotation > 0 ? (xLabelRotation || 30) : 0
      },
      axisLine: { lineStyle: { color: '#dcdfe6' } }
    },
    yAxis: {
      type: 'value',
      minInterval: minYInterval || 1,
      axisLabel: { fontSize: 11, color: '#909399' },
      splitLine: { lineStyle: { color: '#f0f0f0' } }
    },
    series: series
  };
}

export function buildAlarmLiftBarData(alarms) {
  const liftMap = {};
  alarms.forEach(a => {
    const name = a.lift_name || ('设备#' + a.lift_id);
    if (!liftMap[name]) {
      liftMap[name] = { warning: 0, serious: 0, urgent: 0 };
    }
    if (a.level === 1) liftMap[name].warning++;
    else if (a.level === 2) liftMap[name].serious++;
    else liftMap[name].urgent++;
  });

  const liftNames = Object.keys(liftMap);
  return {
    categories: liftNames,
    series: [
      {
        name: '警告',
        type: 'bar',
        stack: 'alarm',
        data: liftNames.map(n => liftMap[n].warning),
        itemStyle: { color: '#e6a23c' }
      },
      {
        name: '严重',
        type: 'bar',
        stack: 'alarm',
        data: liftNames.map(n => liftMap[n].serious),
        itemStyle: { color: '#f56c6c' }
      },
      {
        name: '紧急',
        type: 'bar',
        stack: 'alarm',
        data: liftNames.map(n => liftMap[n].urgent),
        itemStyle: { color: '#ff4d4f', borderRadius: [4, 4, 0, 0] }
      }
    ]
  };
}

export function buildMaintenanceTimelineData(records) {
  const dateMap = {};
  records.forEach(r => {
    const dateKey = (r.created_at || '').slice(0, 10);
    if (!dateKey) return;
    if (!dateMap[dateKey]) {
      dateMap[dateKey] = { pending: 0, processing: 0, completed: 0 };
    }
    if (r.status === 0) dateMap[dateKey].pending++;
    else if (r.status === 1) dateMap[dateKey].processing++;
    else if (r.status === 2) dateMap[dateKey].completed++;
  });

  const dates = Object.keys(dateMap).sort();
  return {
    categories: dates,
    series: [
      {
        name: '待处理',
        type: 'bar',
        stack: 'maintenance',
        data: dates.map(d => dateMap[d].pending),
        itemStyle: { color: '#f56c6c' }
      },
      {
        name: '进行中',
        type: 'bar',
        stack: 'maintenance',
        data: dates.map(d => dateMap[d].processing),
        itemStyle: { color: '#e6a23c' }
      },
      {
        name: '已完成',
        type: 'bar',
        stack: 'maintenance',
        data: dates.map(d => dateMap[d].completed),
        itemStyle: { color: '#67c23a', borderRadius: [4, 4, 0, 0] }
      }
    ]
  };
}

export function buildMaintenancePieData(stats) {
  const statusNames = { 0: '待处理', 1: '进行中', 2: '已完成' };
  const statusColors = { 0: '#f56c6c', 1: '#e6a23c', 2: '#67c23a' };
  return (stats || []).map(item => ({
    name: statusNames[item.status] || '未知',
    value: item.count,
    itemStyle: { color: statusColors[item.status] || '#909399' }
  }));
}

export default {
  initChart,
  disposeChart,
  resizeChart,
  buildPieOption,
  buildAlarmTypePieData,
  buildAlarmLevelPieData,
  buildStackedBarOption,
  buildAlarmLiftBarData,
  buildMaintenanceTimelineData,
  buildMaintenancePieData
};
