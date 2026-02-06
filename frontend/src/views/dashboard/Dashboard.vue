<template>
  <div class="dashboard-container">
    <div class="welcome-section">
      <h1 class="welcome-title">
        {{ $t('dashboard.welcome') }}, {{ authStore.username }}
      </h1>
      <p class="welcome-subtitle">
        {{ $t('dashboard.hospitalSystem') }}
      </p>
    </div>

    <!-- Statistics Cards -->
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
            :label="$t('statistics.totalPatients')"
            icon-color="#409EFF"
            icon-bg-color="rgba(64, 158, 255, 0.1)"
            :loading="loading"
            :show-trend="true"
            :trend="patientGrowthRate"
            trend-label="this month"
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
            :label="$t('statistics.totalRecords')"
            icon-color="#67C23A"
            icon-bg-color="rgba(103, 194, 58, 0.1)"
            :loading="loading"
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
            :label="$t('statistics.totalDoctors')"
            icon-color="#E6A23C"
            icon-bg-color="rgba(230, 162, 60, 0.1)"
            :loading="loading"
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
            :loading="loading"
          />
        </el-col>
      </el-row>

      <!-- Secondary Stats -->
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
            :value="dashboardStats?.todayVisits ?? 0"
            :label="$t('statistics.todayVisits')"
            icon-color="#9B59B6"
            icon-bg-color="rgba(155, 89, 182, 0.1)"
            :loading="loading"
          />
        </el-col>

        <el-col
          :xs="24"
          :sm="12"
          :md="6"
        >
          <StatCard
            :icon="TrendCharts"
            :value="dashboardStats?.monthlyVisits ?? 0"
            :label="$t('statistics.monthlyVisits')"
            icon-color="#1ABC9C"
            icon-bg-color="rgba(26, 188, 156, 0.1)"
            :loading="loading"
          />
        </el-col>

        <el-col
          :xs="24"
          :sm="12"
          :md="6"
        >
          <StatCard
            :icon="Plus"
            :value="dashboardStats?.newPatientsThisMonth ?? 0"
            :label="$t('statistics.newPatientsThisMonth')"
            icon-color="#3498DB"
            icon-bg-color="rgba(52, 152, 219, 0.1)"
            :loading="loading"
          />
        </el-col>

        <el-col
          :xs="24"
          :sm="12"
          :md="6"
        >
          <StatCard
            :icon="Clock"
            :value="dashboardStats?.pendingRecords ?? 0"
            :label="$t('statistics.pendingRecords')"
            icon-color="#E74C3C"
            icon-bg-color="rgba(231, 76, 60, 0.1)"
            :loading="loading"
          />
        </el-col>
      </el-row>

    <!-- Charts Row -->
    <el-row
      :gutter="20"
      class="content-row"
    >
      <el-col
        :xs="24"
        :lg="16"
      >
        <el-card
          class="content-card"
          shadow="hover"
        >
          <template #header>
            <div class="card-header">
              <span>{{ $t('dashboard.visitTrend') }}</span>
              <el-button
                text
                type="primary"
                @click="navigateToStatistics"
              >
                {{ $t('dashboard.viewDetails') }}
              </el-button>
            </div>
          </template>
          <div
            v-loading="trendLoading"
            class="chart-wrapper"
          >
            <LineChart
              v-if="visitTrendData.xAxis.length > 0"
              :x-axis-data="visitTrendData.xAxis"
              :series="visitTrendData.series"
              height="300px"
              y-axis-name="Visits"
            />
            <el-empty
              v-else
              :description="$t('common.noData')"
            />
          </div>
        </el-card>
      </el-col>

      <el-col
        :xs="24"
        :lg="8"
      >
        <el-card
          class="content-card"
          shadow="hover"
        >
          <template #header>
            <div class="card-header">
              <span>{{ $t('dashboard.visitTypes') }}</span>
            </div>
          </template>
          <div
            v-loading="statsLoading"
            class="chart-wrapper"
          >
            <PieChart
              v-if="visitTypeData.length > 0"
              :data="visitTypeData"
              height="300px"
              :radius="['40%', '70%']"
            />
            <el-empty
              v-else
              :description="$t('common.noData')"
            />
          </div>
        </el-card>
      </el-col>

      <el-col
        :xs="24"
        :lg="8"
      >
        <el-card
          class="content-card"
          shadow="hover"
        >
          <template #header>
            <div class="card-header">
              <span>{{ $t('dashboard.visitTypes') }}</span>
            </div>
          </template>
          <div
            v-loading="statsLoading"
            class="chart-wrapper"
          >
            <PieChart
              v-if="visitTypeData.length > 0"
              :data="visitTypeData"
              height="300px"
              :radius="['40%', '70%']"
            />
            <el-empty
              v-else
              :description="$t('common.noData')"
            />
          </div>
        </el-card>
      </el-col>

      <el-col
        :xs="24"
        :lg="16"
      >
        <el-card
          class="content-card"
          shadow="hover"
        >
          <template #header>
            <div class="card-header">
              <span>{{ $t('dashboard.departmentStats') }}</span>
            </div>
          </template>
          <div
            v-loading="deptLoading"
            class="chart-wrapper"
          >
            <BarChart
              v-if="departmentChartData.xAxis.length > 0"
              :x-axis-data="departmentChartData.xAxis"
              :series="departmentChartData.series"
              height="300px"
              y-axis-name="Count"
            />
            <el-empty
              v-else
              :description="$t('common.noData')"
            />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Department and Quick Actions Row -->
    <el-row
      :gutter="20"
      class="content-row"
    >
      <el-col
        :xs="24"
        :lg="16"
      >
        <el-card
          class="content-card"
          shadow="hover"
        >
          <template #header>
            <div class="card-header">
              <span>{{ $t('dashboard.departmentStats') }}</span>
            </div>
          </template>
          <div
            v-loading="deptLoading"
            class="chart-wrapper"
          >
            <BarChart
              v-if="departmentChartData.xAxis.length > 0"
              :x-axis-data="departmentChartData.xAxis"
              :series="departmentChartData.series"
              height="300px"
              y-axis-name="Count"
            />
            <el-empty
              v-else
              description="No department data available"
            />
          </div>
        </el-card>
      </el-col>

      <el-col
        :xs="24"
        :lg="8"
      >
        <el-card
          class="content-card"
          shadow="hover"
        >
          <template #header>
            <div class="card-header">
              <span>{{ $t('dashboard.quickActions') }}</span>
            </div>
          </template>
          <div class="quick-actions">
            <el-button
              type="primary"
              class="action-btn"
              @click="navigateTo('/patients')"
            >
              <el-icon><User /></el-icon>
              {{ $t('dashboard.managePatients') }}
            </el-button>
            <el-button
              type="success"
              class="action-btn"
              @click="navigateTo('/medical-records')"
            >
              <el-icon><Document /></el-icon>
              {{ $t('dashboard.medicalRecords') }}
            </el-button>
            <el-button
              type="warning"
              class="action-btn"
              @click="navigateTo('/doctors')"
            >
              <el-icon><UserFilled /></el-icon>
              {{ $t('dashboard.manageDoctors') }}
            </el-button>
            <el-button
              type="info"
              class="action-btn"
              @click="navigateToStatistics"
            >
              <el-icon><DataAnalysis /></el-icon>
              {{ $t('dashboard.viewStatistics') }}
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import {
  User,
  Document,
  UserFilled,
  OfficeBuilding,
  Plus,
  Calendar,
  TrendCharts,
  Clock,
  DataAnalysis,
} from '@element-plus/icons-vue';
import { useAuthStore, useStatisticsStore } from '@/stores';
import { StatCard, LineChart, PieChart, BarChart } from '@/components/charts';

const router = useRouter();
const authStore = useAuthStore();
const statisticsStore = useStatisticsStore();

// Loading states
const loading = ref(false);
const trendLoading = ref(false);
const statsLoading = ref(false);
const deptLoading = ref(false);

// Computed
const dashboardStats = computed(() => statisticsStore.dashboardStats);
const patientGrowthRate = computed(() => {
  const stats = statisticsStore.patientStats;
  return stats?.growthRate ?? 0;
});

// Visit trend chart data
const visitTrendData = computed(() => {
  const trend = statisticsStore.visitTrend;
  if (!trend || trend.length === 0) {
    return { xAxis: [], series: [] };
  }

  return {
    xAxis: trend.map((t) => t.date.slice(5)), // MM-DD format
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
    ],
  };
});

// Visit type pie chart data
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

// Department bar chart data
const departmentChartData = computed(() => {
  const depts = statisticsStore.departmentStats;
  if (!depts || depts.length === 0) {
    return { xAxis: [], series: [] };
  }

  // Take top 8 departments
  const topDepts = depts.slice(0, 8);

  return {
    xAxis: topDepts.map((d) => d.name),
    series: [
      {
        name: 'Records',
        data: topDepts.map((d) => d.recordCount),
        color: '#409EFF',
      },
      {
        name: 'Doctors',
        data: topDepts.map((d) => d.doctorCount),
        color: '#67C23A',
      },
    ],
  };
});

// Methods
function navigateTo(path: string): void {
  router.push(path);
}

function navigateToStatistics(): void {
  router.push('/statistics');
}

async function loadDashboardData(): Promise<void> {
  loading.value = true;
  try {
    await Promise.all([
      statisticsStore.fetchDashboardStatistics(),
      statisticsStore.fetchPatientStatistics(),
    ]);
  } finally {
    loading.value = false;
  }
}

async function loadVisitTrend(): Promise<void> {
  trendLoading.value = true;
  try {
    // Get last 30 days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    await statisticsStore.fetchVisitTrend({
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    });
  } finally {
    trendLoading.value = false;
  }
}

async function loadVisitStats(): Promise<void> {
  statsLoading.value = true;
  try {
    await statisticsStore.fetchVisitStatistics();
  } finally {
    statsLoading.value = false;
  }
}

async function loadDepartmentStats(): Promise<void> {
  deptLoading.value = true;
  try {
    await statisticsStore.fetchDepartmentStatistics();
  } finally {
    deptLoading.value = false;
  }
}

// Lifecycle
onMounted(() => {
  loadDashboardData();
  loadVisitTrend();
  loadVisitStats();
  loadDepartmentStats();
});
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
}

.welcome-section {
  margin-bottom: 24px;
}

.welcome-title {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px 0;
}

.welcome-subtitle {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

.stats-row {
  margin-bottom: 20px;
}

.stats-row .el-col {
  margin-bottom: 20px;
}

.content-row {
  margin-bottom: 20px;
}

.content-card {
  height: 100%;
  min-height: 380px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

.chart-wrapper {
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 10px 0;
}

.action-btn {
  width: 100%;
  justify-content: flex-start;
  height: 44px;
}
</style>
