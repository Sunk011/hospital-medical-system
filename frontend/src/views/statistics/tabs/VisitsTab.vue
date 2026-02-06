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
          :label="t('statistics.totalVisits')"
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
          :label="t('statistics.avgVisitsPerDay')"
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
          :label="t('statistics.outpatient')"
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
          :label="t('statistics.emergency')"
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
        <span class="card-title">{{ t('statistics.visitTrendOverTime') }}</span>
      </template>
      <LineChart
        v-if="visitTrendData.xAxis.length > 0"
        :x-axis-data="visitTrendData.xAxis"
        :series="visitTrendData.series"
        height="400px"
        :y-axis-name="t('statistics.numberOfVisits')"
      />
      <el-empty
        v-else
        :description="t('statistics.noVisitData')"
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
            <span class="card-title">{{ t('statistics.visitTypesDistribution') }}</span>
          </template>
          <PieChart
            v-if="visitTypeData.length > 0"
            :data="visitTypeData"
            height="300px"
          />
          <el-empty
            v-else
            :description="t('common.noData')"
          />
        </el-card>
      </el-col>
      <el-col
        :xs="24"
        :md="12"
      >
        <el-card shadow="never">
          <template #header>
            <span class="card-title">{{ t('statistics.recordStatusDistribution') }}</span>
          </template>
          <PieChart
            v-if="visitStatusData.length > 0"
            :data="visitStatusData"
            height="300px"
            :colors="['#E6A23C', '#67C23A', '#909399']"
          />
          <el-empty
            v-else
            :description="t('common.noData')"
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
        <span class="card-title">{{ t('statistics.visitTypeComparison') }}</span>
      </template>
      <BarChart
        v-if="visitTypeBarData.xAxis.length > 0"
        :x-axis-data="visitTypeBarData.xAxis"
        :series="visitTypeBarData.series"
        height="300px"
        :y-axis-name="t('statistics.count')"
      />
      <el-empty
        v-else
        :description="t('common.noData')"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
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
const { t } = useI18n();

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
        name: t('statistics.totalVisits'),
        data: trend.map((t) => t.count),
        color: '#409EFF',
        smooth: true,
        areaStyle: true,
      },
      {
        name: t('statistics.outpatient'),
        data: trend.map((t) => t.outpatient),
        color: '#67C23A',
        smooth: true,
      },
      {
        name: t('statistics.emergency'),
        data: trend.map((t) => t.emergency),
        color: '#F56C6C',
        smooth: true,
      },
      {
        name: t('statistics.inpatient'),
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
    outpatient: t('statistics.outpatient'),
    emergency: t('statistics.emergency'),
    inpatient: t('statistics.inpatient'),
    unknown: t('common.unknown'),
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
    draft: t('statistics.draft'),
    confirmed: t('statistics.confirmed'),
    archived: t('statistics.archived'),
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
    outpatient: t('statistics.outpatient'),
    emergency: t('statistics.emergency'),
    inpatient: t('statistics.inpatient'),
  };

  const entries = Object.entries(stats.visitsByType).filter(([key]) => key !== 'unknown');

  return {
    xAxis: entries.map(([key]) => typeLabels[key] || key),
    series: [
      {
        name: t('statistics.visits'),
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
