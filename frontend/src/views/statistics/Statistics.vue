<template>
  <div class="statistics-container">
    <div class="page-header">
      <h1 class="page-title">
        Statistics & Analytics
      </h1>
      <div class="header-actions">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="to"
          start-placeholder="Start date"
          end-placeholder="End date"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          :shortcuts="dateShortcuts"
          @change="handleDateChange"
        />
        <el-button
          type="primary"
          :loading="reportLoading"
          @click="generateReport"
        >
          <el-icon><Download /></el-icon>
          Generate Report
        </el-button>
      </div>
    </div>

    <el-tabs
      v-model="activeTab"
      class="statistics-tabs"
      @tab-change="handleTabChange"
    >
      <!-- Overview Tab -->
      <el-tab-pane
        label="Overview"
        name="overview"
      >
        <OverviewTab
          :loading="loading"
          :date-filter="dateFilter"
        />
      </el-tab-pane>

      <!-- Visits Tab -->
      <el-tab-pane
        label="Visits"
        name="visits"
      >
        <VisitsTab
          :loading="loading"
          :date-filter="dateFilter"
        />
      </el-tab-pane>

      <!-- Departments Tab -->
      <el-tab-pane
        label="Departments"
        name="departments"
      >
        <DepartmentsTab :loading="loading" />
      </el-tab-pane>

      <!-- Doctors Tab -->
      <el-tab-pane
        label="Doctors"
        name="doctors"
      >
        <DoctorsTab :loading="loading" />
      </el-tab-pane>

      <!-- Patients Tab -->
      <el-tab-pane
        label="Patients"
        name="patients"
      >
        <PatientsTab :loading="loading" />
      </el-tab-pane>

      <!-- Diseases Tab -->
      <el-tab-pane
        label="Diseases"
        name="diseases"
      >
        <DiseasesTab
          :loading="loading"
          :date-filter="dateFilter"
        />
      </el-tab-pane>

      <!-- Prescriptions Tab -->
      <el-tab-pane
        label="Prescriptions"
        name="prescriptions"
      >
        <PrescriptionsTab
          :loading="loading"
          :date-filter="dateFilter"
        />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { Download } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { useStatisticsStore } from '@/stores';
import { logger } from '@/utils';
import type { DateRangeFilter } from '@/types';
import OverviewTab from './tabs/OverviewTab.vue';
import VisitsTab from './tabs/VisitsTab.vue';
import DepartmentsTab from './tabs/DepartmentsTab.vue';
import DoctorsTab from './tabs/DoctorsTab.vue';
import PatientsTab from './tabs/PatientsTab.vue';
import DiseasesTab from './tabs/DiseasesTab.vue';
import PrescriptionsTab from './tabs/PrescriptionsTab.vue';

const statisticsStore = useStatisticsStore();

// State
const activeTab = ref('overview');
const loading = ref(false);
const reportLoading = ref(false);
const dateRange = ref<[string, string] | null>(null);

// Date shortcuts
const dateShortcuts = [
  {
    text: 'Last 7 days',
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 7);
      return [start, end];
    },
  },
  {
    text: 'Last 30 days',
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 30);
      return [start, end];
    },
  },
  {
    text: 'Last 90 days',
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 90);
      return [start, end];
    },
  },
  {
    text: 'This month',
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setDate(1);
      return [start, end];
    },
  },
  {
    text: 'Last month',
    value: () => {
      const end = new Date();
      end.setDate(0);
      const start = new Date(end);
      start.setDate(1);
      return [start, end];
    },
  },
  {
    text: 'This year',
    value: () => {
      const end = new Date();
      const start = new Date(end.getFullYear(), 0, 1);
      return [start, end];
    },
  },
];

// Computed
const dateFilter = computed<DateRangeFilter>(() => {
  if (!dateRange.value) {
    return {};
  }
  return {
    startDate: dateRange.value[0],
    endDate: dateRange.value[1],
  };
});

// Methods
function handleDateChange(): void {
  statisticsStore.setDateRange(dateFilter.value);
  loadTabData();
}

function handleTabChange(): void {
  loadTabData();
}

async function loadTabData(): Promise<void> {
  loading.value = true;
  try {
    switch (activeTab.value) {
      case 'overview':
        await Promise.all([
          statisticsStore.fetchDashboardStatistics(),
          statisticsStore.fetchVisitStatistics(dateFilter.value),
          statisticsStore.fetchVisitTrend(dateFilter.value),
        ]);
        break;
      case 'visits':
        await Promise.all([
          statisticsStore.fetchVisitStatistics(dateFilter.value),
          statisticsStore.fetchVisitTrend(dateFilter.value),
        ]);
        break;
      case 'departments':
        await statisticsStore.fetchDepartmentStatistics();
        break;
      case 'doctors':
        await statisticsStore.fetchDoctorStatistics(20);
        break;
      case 'patients':
        await statisticsStore.fetchPatientStatistics();
        break;
      case 'diseases':
        await statisticsStore.fetchDiseaseStatistics({ ...dateFilter.value, limit: 20 });
        break;
      case 'prescriptions':
        await statisticsStore.fetchPrescriptionStatistics(dateFilter.value);
        break;
    }
  } finally {
    loading.value = false;
  }
}

async function generateReport(): Promise<void> {
  reportLoading.value = true;
  try {
    const success = await statisticsStore.fetchReport(dateFilter.value);
    if (success && statisticsStore.report) {
      ElMessage.success('Report generated successfully');
      // In a real app, you might download the report as PDF/Excel
      logger.info('Report data:', statisticsStore.report);
    } else {
      ElMessage.error('Failed to generate report');
    }
  } finally {
    reportLoading.value = false;
  }
}

// Initialize with default date range (last 30 days)
function initializeDateRange(): void {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 30);
  dateRange.value = [
    start.toISOString().split('T')[0],
    end.toISOString().split('T')[0],
  ];
  statisticsStore.setDateRange(dateFilter.value);
}

// Lifecycle
onMounted(() => {
  initializeDateRange();
  loadTabData();
});
</script>

<style scoped>
.statistics-container {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.statistics-tabs {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

:deep(.el-tabs__header) {
  margin-bottom: 20px;
}

:deep(.el-tabs__item) {
  font-size: 14px;
  font-weight: 500;
}

:deep(.el-tabs__item.is-active) {
  font-weight: 600;
}
</style>
