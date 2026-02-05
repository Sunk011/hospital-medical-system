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
import { BarChart as EChartsBarChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import type { EChartsOption } from 'echarts';

// Register ECharts components
echarts.use([
  EChartsBarChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  CanvasRenderer,
]);

// Props
interface Props {
  title?: string;
  xAxisData: string[];
  series: Array<{
    name: string;
    data: number[];
    color?: string;
  }>;
  width?: string;
  height?: string;
  showLegend?: boolean;
  yAxisName?: string;
  horizontal?: boolean;
  stack?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  width: '100%',
  height: '300px',
  showLegend: true,
  yAxisName: '',
  horizontal: false,
  stack: false,
});

// Refs
const chartRef = ref<HTMLDivElement | null>(null);
let chartInstance: echarts.ECharts | null = null;

// Default colors
const defaultColors = ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399', '#9B59B6', '#1ABC9C'];

// Computed chart options
const chartOptions = computed<EChartsOption>(() => {
  const baseOptions: EChartsOption = {
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
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },
    legend: props.showLegend
      ? {
          data: props.series.map((s) => s.name),
          bottom: 0,
        }
      : undefined,
    grid: {
      left: '3%',
      right: '4%',
      bottom: props.showLegend ? '15%' : '3%',
      top: props.title ? '15%' : '10%',
      containLabel: true,
    },
    series: props.series.map((s, index) => ({
      name: s.name,
      type: 'bar',
      data: s.data,
      stack: props.stack ? 'total' : undefined,
      itemStyle: {
        color: s.color || defaultColors[index % defaultColors.length],
        borderRadius: props.stack ? 0 : [4, 4, 0, 0],
      },
      barMaxWidth: 50,
    })),
  };

  if (props.horizontal) {
    return {
      ...baseOptions,
      xAxis: {
        type: 'value',
        name: props.yAxisName,
      },
      yAxis: {
        type: 'category',
        data: props.xAxisData,
        axisLabel: {
          width: 100,
          overflow: 'truncate',
        },
      },
    };
  }

  return {
    ...baseOptions,
    xAxis: {
      type: 'category',
      data: props.xAxisData,
      axisLabel: {
        rotate: props.xAxisData.length > 7 ? 45 : 0,
        interval: 0,
      },
    },
    yAxis: {
      type: 'value',
      name: props.yAxisName,
    },
  };
});

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
  () => [props.xAxisData, props.series],
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
