<template>
  <div
    ref="chartRef"
    :style="{ width: width, height: height }"
    class="chart-container"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue';
import * as echarts from 'echarts/core';
import { PieChart as EChartsPieChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import type { EChartsOption } from 'echarts';

// Register ECharts components
echarts.use([
  EChartsPieChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  CanvasRenderer,
]);

// Props
interface DataItem {
  name: string;
  value: number;
}

interface Props {
  title?: string;
  data: DataItem[];
  width?: string;
  height?: string;
  showLegend?: boolean;
  radius?: string | string[];
  roseType?: boolean;
  colors?: string[];
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  width: '100%',
  height: '300px',
  showLegend: true,
  radius: '60%',
  roseType: false,
  colors: () => [],
});

// Refs
const chartRef = ref<HTMLDivElement | null>(null);
let chartInstance: echarts.ECharts | null = null;

// Default colors
const defaultColors = [
  '#409EFF',
  '#67C23A',
  '#E6A23C',
  '#F56C6C',
  '#909399',
  '#9B59B6',
  '#1ABC9C',
  '#3498DB',
  '#E74C3C',
  '#2ECC71',
];

// Computed chart options
const chartOptions = computed<EChartsOption>(() => ({
  title: props.title
    ? {
        text: props.title,
        left: 'center',
        textStyle: {
          fontSize: 14,
          fontWeight: 500,
        },
      }
    : undefined,
  tooltip: {
    trigger: 'item',
    formatter: '{a} <br/>{b}: {c} ({d}%)',
  },
  legend: props.showLegend
    ? {
        orient: 'horizontal',
        bottom: 0,
        data: props.data.map((d) => d.name),
      }
    : undefined,
  color: props.colors.length > 0 ? props.colors : defaultColors,
  series: [
    {
      name: props.title || 'Data',
      type: 'pie',
      radius: props.radius,
      center: ['50%', props.showLegend ? '45%' : '50%'],
      roseType: props.roseType ? 'area' : undefined,
      data: props.data,
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)',
        },
      },
      label: {
        show: true,
        formatter: '{b}: {d}%',
      },
      labelLine: {
        show: true,
      },
    },
  ],
}));

// Initialize chart
function initChart(): void {
  if (!chartRef.value) return;

  chartInstance = echarts.init(chartRef.value);
  chartInstance.setOption(chartOptions.value);
}

// Update chart
function updateChart(): void {
  if (!chartInstance) return;
  chartInstance.setOption(chartOptions.value, true);
}

// Resize handler
function handleResize(): void {
  chartInstance?.resize();
}

// Watch for data changes
watch(
  () => props.data,
  () => {
    updateChart();
  },
  { deep: true }
);

// Lifecycle
onMounted(() => {
  initChart();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  chartInstance?.dispose();
});

// Expose methods
defineExpose({
  resize: handleResize,
  getInstance: () => chartInstance,
});
</script>

<style scoped>
.chart-container {
  min-height: 200px;
}
</style>
