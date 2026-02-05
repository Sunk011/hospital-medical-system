<template>
  <div
    v-loading="loading"
    class="visits-tab"
  >
    <!-- Summary Cards -->
    <el-row
      :gutter="20"
      class="stats-row"
    >
      <el-col
        :xs="24"
        :sm="12"
        :md="6"
      >
        <StatCard
          :icon="Calendar"
          :value="visitStats?.totalVisits ?? 0"
          label="Total Visits"
          icon-color="#409EFF"
          icon-bg-color="rgba(64, 158, 255, 0.1)"
        />
      </el-col>
      <el-col
        :xs="24"
        :sm="12"
        :md="6"
      >
        <StatCard
          :icon="TrendCharts"
          :value="visitStats?.averageVisitsPerDay ?? 0"
          label="Avg Visits/Day"
          icon-color="#67C23A"
          icon-bg-color="rgba(103, 194, 58, 0.1)"
        />
      </el-col>
      <el-col
        :xs="24"
        :sm="12"
        :md="6"
      >
        <StatCard
          :icon="FirstAidKit"
          :value="outpatientCount"
          label="Outpatient"
          icon-color="#E6A23C"
          icon-bg-color="rgba(230, 162, 60, 0.1)"
        />
      </el-col>
      <el-col
        :xs="24"
        :sm="12"
        :md="6"
      >
        <StatCard
          :icon="Warning"
          :value="emergencyCount"
          label="Emergency"
          icon-color="#F56C6C"
          icon-bg-color="rgba(245, 108, 108, 0.1)"
        />
      </el-col>
    </el-row>

    <!-- Visit Trend Chart -->
    <el-card
      shadow="never"
      class="chart-card"
    >
      <template #header>
        <span class="card-title">Visit Trend Over Time</span>
      </template>
      <LineChart
        v-if="visitTrendData.xAxis.length > 0"
        :x-axis-data="visitTrendData.xAxis"
        :series="visitTrendData.series"
        height="400px"
        y-axis-name="Number of Visits"
      />
      <el-empty
        v-else
        description="No visit data available for the selected period"
      />
    </el-card>

    <!-- Charts Row -->
    <el-row
      :gutter="20"
      class="charts-row"
    >
      <el-col
        :xs="24"
        :md="12"
      >
        <el-card shadow="never">
          <template #header>
            <span class="card-title">Visit Types Distribution</span>
          </template>
          <PieChart
            v-if="visitTypeData.length > 0"
            :data="visitTypeData"
            height="300px"
          />
          <el-empty
            v-else
            description="No data available"
          />
        </el-card>
      </el-col>
      <el-col
        :xs="24"
        :md="12"
      >
        <el-card shadow="never">
          <template #header>
            <span class="card-title">Record Status Distribution</span>
          </template>
          <PieChart
            v-if="visitStatusData.length > 0"
            :data="visitStatusData"
            height="300px"
            :colors="['#E6A23C', '#67C23A', '#909399']"
          />
          <el-empty
            v-else
            description="No data available"
          />
        </el-card>
      </el-col>
    </el-row>

    <!-- Visit Type Comparison -->
    <el-card
      shadow="never"
      class="chart-card"
    >
      <template #header>
        <span class="card-title">Visit Type Comparison</span>
      </template>
      <BarChart
        v-if="visitTypeBarData.xAxis.length > 0"
        :x-axis-data="visitTypeBarData.xAxis"
        :series="visitTypeBarData.series"
        height="300px"
        y-axis-name="Count"
      />
      <el-empty
        v-else
        description="No data available"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Calendar, TrendCharts, FirstAidKit, Warning } from '@element-plus/icons-vue';
import { useStatisticsStore } from '@/stores';
import { StatCard, LineChart, PieChart, BarChart } from '@/components/charts';
import type { DateRangeFilter } from '@/types';

// Props
interface Props {
  loading?: boolean;
  dateFilter?: DateRangeFilter;
}

withDefaults(defineProps<Props>(), {
  loading: false,
  dateFilter: () => ({}),
});

const statisticsStore = useStatisticsStore();

// Computed
const visitStats = computed(() => statisticsStore.visitStats);

const outpatientCount = computed(() => {
  return visitStats.value?.visitsByType?.outpatient ?? 0;
});

const emergencyCount = computed(() => {
  return visitStats.value?.visitsByType?.emergency ?? 0;
});

const visitTrendData = computed(() => {
  const trend = statisticsStore.visitTrend;
  if (!trend || trend.length === 0) {
    return { xAxis: [], series: [] };
  }

  return {
    xAxis: trend.map((t) => t.date),
    series: [
      {
        name: 'Total Visits',
        data: trend.map((t) => t.count),
        color: '#409EFF',
        smooth: true,
        areaStyle: true,
      },
      {
        name: 'Outpatient',
        data: trend.map((t) => t.outpatient),
        color: '#67C23A',
        smooth: true,
      },
      {
        name: 'Emergency',
        data: trend.map((t) => t.emergency),
        color: '#F56C6C',
        smooth: true,
      },
      {
        name: 'Inpatient',
        data: trend.map((t) => t.inpatient),
        color: '#E6A23C',
        smooth: true,
      },
    ],
  };
});

const visitTypeData = computed(() => {
  const stats = statisticsStore.visitStats;
  if (!stats?.visitsByType) {
    return [];
  }

  const typeLabels: Record<string, string> = {
    outpatient: 'Outpatient',
    emergency: 'Emergency',
    inpatient: 'Inpatient',
    unknown: 'Unknown',
  };

  return Object.entries(stats.visitsByType).map(([key, value]) => ({
    name: typeLabels[key] || key,
    value,
  }));
});

const visitStatusData = computed(() => {
  const stats = statisticsStore.visitStats;
  if (!stats?.visitsByStatus) {
    return [];
  }

  const statusLabels: Record<string, string> = {
    draft: 'Draft',
    confirmed: 'Confirmed',
    archived: 'Archived',
  };

  return Object.entries(stats.visitsByStatus).map(([key, value]) => ({
    name: statusLabels[key] || key,
    value,
  }));
});

const visitTypeBarData = computed(() => {
  const stats = statisticsStore.visitStats;
  if (!stats?.visitsByType) {
    return { xAxis: [], series: [] };
  }

  const typeLabels: Record<string, string> = {
    outpatient: 'Outpatient',
    emergency: 'Emergency',
    inpatient: 'Inpatient',
  };

  const entries = Object.entries(stats.visitsByType).filter(([key]) => key !== 'unknown');

  return {
    xAxis: entries.map(([key]) => typeLabels[key] || key),
    series: [
      {
        name: 'Visits',
        data: entries.map(([, value]) => value),
      },
    ],
  };
});
</script>

<style scoped>
.visits-tab {
  min-height: 400px;
}

.stats-row {
  margin-bottom: 20px;
}

.stats-row .el-col {
  margin-bottom: 20px;
}

.chart-card {
  margin-bottom: 20px;
}

.charts-row {
  margin-bottom: 20px;
}

.charts-row .el-col {
  margin-bottom: 20px;
}

.card-title {
  font-weight: 600;
  font-size: 14px;
}
</style>
