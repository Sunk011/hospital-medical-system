<template>
  <el-card
    class="stat-card"
    shadow="hover"
    :body-style="{ padding: '20px' }"
  >
    <div class="stat-content">
      <div
        class="stat-icon-wrapper"
        :style="{ backgroundColor: iconBgColor }"
      >
        <el-icon
          :size="iconSize"
          :color="iconColor"
        >
          <component :is="icon" />
        </el-icon>
      </div>
      <div class="stat-info">
        <div class="stat-value">
          <span v-if="loading">
            <el-skeleton
              :rows="1"
              animated
              style="width: 80px"
            />
          </span>
          <span v-else>{{ formattedValue }}</span>
        </div>
        <div class="stat-label">
          {{ label }}
        </div>
        <div
          v-if="showTrend && trend !== undefined"
          class="stat-trend"
          :class="trendClass"
        >
          <el-icon :size="12">
            <component :is="trendIcon" />
          </el-icon>
          <span>{{ Math.abs(trend) }}%</span>
          <span class="trend-label">{{ trendLabel }}</span>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import {
  ArrowUp,
  ArrowDown,
  Minus,
} from '@element-plus/icons-vue';
import type { Component } from 'vue';

// Props
interface Props {
  icon: Component;
  iconColor?: string;
  iconBgColor?: string;
  iconSize?: number;
  value: number | string;
  label: string;
  loading?: boolean;
  trend?: number;
  trendLabel?: string;
  showTrend?: boolean;
  prefix?: string;
  suffix?: string;
  formatter?: (value: number | string) => string;
}

const props = withDefaults(defineProps<Props>(), {
  iconColor: '#409EFF',
  iconBgColor: 'rgba(64, 158, 255, 0.1)',
  iconSize: 28,
  loading: false,
  trend: undefined,
  trendLabel: 'vs last month',
  showTrend: false,
  prefix: '',
  suffix: '',
  formatter: undefined,
});

// Computed
const formattedValue = computed(() => {
  if (props.formatter) {
    return props.formatter(props.value);
  }

  const numValue = typeof props.value === 'string' ? parseFloat(props.value) : props.value;

  if (isNaN(numValue)) {
    return props.value;
  }

  // Format large numbers with commas
  const formatted = numValue.toLocaleString();
  return `${props.prefix}${formatted}${props.suffix}`;
});

const trendClass = computed(() => {
  if (props.trend === undefined || props.trend === 0) {
    return 'trend-neutral';
  }
  return props.trend > 0 ? 'trend-up' : 'trend-down';
});

const trendIcon = computed(() => {
  if (props.trend === undefined || props.trend === 0) {
    return Minus;
  }
  return props.trend > 0 ? ArrowUp : ArrowDown;
});
</script>

<style scoped>
.stat-card {
  height: 100%;
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-content {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.stat-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 12px;
  flex-shrink: 0;
}

.stat-info {
  flex: 1;
  min-width: 0;
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
  line-height: 1.2;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.stat-trend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
}

.trend-up {
  color: #67C23A;
}

.trend-down {
  color: #F56C6C;
}

.trend-neutral {
  color: #909399;
}

.trend-label {
  color: #909399;
  margin-left: 4px;
}
</style>
