<template>
  <div
    v-loading="loading"
    class="overview-tab"
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
          :icon="User"
          :value="dashboardStats?.totalPatients ?? 0"
          label="Total Patients"
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
          :icon="Document"
          :value="dashboardStats?.totalMedicalRecords ?? 0"
          label="Medical Records"
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
          :icon="UserFilled"
          :value="dashboardStats?.totalDoctors ?? 0"
          label="Doctors"
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
          :icon="OfficeBuilding"
          :value="dashboardStats?.totalDepartments ?? 0"
          label="Departments"
          icon-color="#F56C6C"
          icon-bg-color="rgba(245, 108, 108, 0.1)"
        />
      </el-col>
    </el-row>

    <!-- Charts Row -->
    <el-row
      :gutter="20"
      class="charts-row"
    >
      <el-col
        :xs="24"
        :lg="16"
      >
        <el-card shadow="never">
          <template #header>
            <span class="card-title">Visit Trend</span>
          </template>
          <LineChart
            v-if="visitTrendData.xAxis.length > 0"
            :x-axis-data="visitTrendData.xAxis"
            :series="visitTrendData.series"
            height="350px"
            y-axis-name="Visits"
          />
          <el-empty
            v-else
            description="No data available"
          />
        </el-card>
      </el-col>
      <el-col
        :xs="24"
        :lg="8"
      >
        <el-card shadow="never">
          <template #header>
            <span class="card-title">Visit Types</span>
          </template>
          <PieChart
            v-if="visitTypeData.length > 0"
            :data="visitTypeData"
            height="350px"
            :radius="['40%', '70%']"
          />
          <el-empty
            v-else
            description="No data available"
          />
        </el-card>
      </el-col>
    </el-row>

    <!-- Summary Stats -->
    <el-row
      :gutter="20"
      class="summary-row"
    >
      <el-col
        :xs="24"
        :md="12"
      >
        <el-card shadow="never">
          <template #header>
            <span class="card-title">Visit Summary</span>
          </template>
          <el-descriptions
            :column="1"
            border
          >
            <el-descriptions-item label="Total Visits">
              {{ visitStats?.totalVisits?.toLocaleString() ?? 0 }}
            </el-descriptions-item>
            <el-descriptions-item label="Average Visits/Day">
              {{ visitStats?.averageVisitsPerDay ?? 0 }}
            </el-descriptions-item>
            <el-descriptions-item label="Today's Visits">
              {{ dashboardStats?.todayVisits ?? 0 }}
            </el-descriptions-item>
            <el-descriptions-item label="Monthly Visits">
              {{ dashboardStats?.monthlyVisits ?? 0 }}
            </el-descriptions-item>
            <el-descriptions-item label="Pending Records">
              {{ dashboardStats?.pendingRecords ?? 0 }}
            </el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>
      <el-col
        :xs="24"
        :md="12"
      >
        <el-card shadow="never">
          <template #header>
            <span class="card-title">Visit Status Distribution</span>
          </template>
          <PieChart
            v-if="visitStatusData.length > 0"
            :data="visitStatusData"
            height="250px"
          />
          <el-empty
            v-else
            description="No data available"
          />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { User, Document, UserFilled, OfficeBuilding } from '@element-plus/icons-vue';
import { useStatisticsStore } from '@/stores';
import { StatCard, LineChart, PieChart } from '@/components/charts';
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
const dashboardStats = computed(() => statisticsStore.dashboardStats);
const visitStats = computed(() => statisticsStore.visitStats);

const visitTrendData = computed(() => {
  const trend = statisticsStore.visitTrend;
  if (!trend || trend.length === 0) {
    return { xAxis: [], series: [] };
  }

  return {
    xAxis: trend.map((t) => t.date.slice(5)),
    series: [
      {
        name: 'Total',
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
</script>

<style scoped>
.overview-tab {
  min-height: 400px;
}

.stats-row {
  margin-bottom: 20px;
}

.stats-row .el-col {
  margin-bottom: 20px;
}

.charts-row {
  margin-bottom: 20px;
}

.charts-row .el-col {
  margin-bottom: 20px;
}

.summary-row .el-col {
  margin-bottom: 20px;
}

.card-title {
  font-weight: 600;
  font-size: 14px;
}
</style>
