<template>
  <div
    v-loading="loading"
    class="patients-tab"
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
          :value="patientStats?.totalPatients ?? 0"
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
          :icon="Plus"
          :value="patientStats?.newPatientsThisMonth ?? 0"
          label="New This Month"
          icon-color="#67C23A"
          icon-bg-color="rgba(103, 194, 58, 0.1)"
          :show-trend="true"
          :trend="patientStats?.growthRate ?? 0"
          trend-label="vs last month"
        />
      </el-col>
      <el-col
        :xs="24"
        :sm="12"
        :md="6"
      >
        <StatCard
          :icon="Calendar"
          :value="patientStats?.newPatientsLastMonth ?? 0"
          label="New Last Month"
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
          :icon="TrendCharts"
          :value="growthRateDisplay"
          label="Growth Rate"
          icon-color="#F56C6C"
          icon-bg-color="rgba(245, 108, 108, 0.1)"
          suffix="%"
        />
      </el-col>
    </el-row>

    <!-- Distribution Charts -->
    <el-row
      :gutter="20"
      class="charts-row"
    >
      <el-col
        :xs="24"
        :md="8"
      >
        <el-card shadow="never">
          <template #header>
            <span class="card-title">Gender Distribution</span>
          </template>
          <PieChart
            v-if="genderData.length > 0"
            :data="genderData"
            height="280px"
            :colors="['#409EFF', '#F56C6C', '#909399']"
          />
          <el-empty
            v-else
            description="No data available"
          />
        </el-card>
      </el-col>
      <el-col
        :xs="24"
        :md="8"
      >
        <el-card shadow="never">
          <template #header>
            <span class="card-title">Blood Type Distribution</span>
          </template>
          <PieChart
            v-if="bloodTypeData.length > 0"
            :data="bloodTypeData"
            height="280px"
          />
          <el-empty
            v-else
            description="No data available"
          />
        </el-card>
      </el-col>
      <el-col
        :xs="24"
        :md="8"
      >
        <el-card shadow="never">
          <template #header>
            <span class="card-title">Age Distribution</span>
          </template>
          <PieChart
            v-if="ageData.length > 0"
            :data="ageData"
            height="280px"
            :rose-type="true"
          />
          <el-empty
            v-else
            description="No data available"
          />
        </el-card>
      </el-col>
    </el-row>

    <!-- Bar Charts -->
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
            <span class="card-title">Age Group Breakdown</span>
          </template>
          <BarChart
            v-if="ageBarData.xAxis.length > 0"
            :x-axis-data="ageBarData.xAxis"
            :series="ageBarData.series"
            height="300px"
            y-axis-name="Patients"
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
            <span class="card-title">Blood Type Breakdown</span>
          </template>
          <BarChart
            v-if="bloodTypeBarData.xAxis.length > 0"
            :x-axis-data="bloodTypeBarData.xAxis"
            :series="bloodTypeBarData.series"
            height="300px"
            y-axis-name="Patients"
          />
          <el-empty
            v-else
            description="No data available"
          />
        </el-card>
      </el-col>
    </el-row>

    <!-- Summary Table -->
    <el-card shadow="never">
      <template #header>
        <span class="card-title">Patient Demographics Summary</span>
      </template>
      <el-row :gutter="20">
        <el-col
          :xs="24"
          :md="8"
        >
          <h4 class="summary-title">
            Gender
          </h4>
          <el-table
            :data="genderTableData"
            size="small"
            stripe
          >
            <el-table-column
              prop="name"
              label="Gender"
            />
            <el-table-column
              prop="count"
              label="Count"
              align="right"
            />
            <el-table-column
              prop="percentage"
              label="%"
              align="right"
            >
              <template #default="{ row }">
                {{ row.percentage }}%
              </template>
            </el-table-column>
          </el-table>
        </el-col>
        <el-col
          :xs="24"
          :md="8"
        >
          <h4 class="summary-title">
            Blood Type
          </h4>
          <el-table
            :data="bloodTypeTableData"
            size="small"
            stripe
          >
            <el-table-column
              prop="name"
              label="Type"
            />
            <el-table-column
              prop="count"
              label="Count"
              align="right"
            />
            <el-table-column
              prop="percentage"
              label="%"
              align="right"
            >
              <template #default="{ row }">
                {{ row.percentage }}%
              </template>
            </el-table-column>
          </el-table>
        </el-col>
        <el-col
          :xs="24"
          :md="8"
        >
          <h4 class="summary-title">
            Age Group
          </h4>
          <el-table
            :data="ageTableData"
            size="small"
            stripe
          >
            <el-table-column
              prop="name"
              label="Age"
            />
            <el-table-column
              prop="count"
              label="Count"
              align="right"
            />
            <el-table-column
              prop="percentage"
              label="%"
              align="right"
            >
              <template #default="{ row }">
                {{ row.percentage }}%
              </template>
            </el-table-column>
          </el-table>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { User, Plus, Calendar, TrendCharts } from '@element-plus/icons-vue';
import { useStatisticsStore } from '@/stores';
import { StatCard, PieChart, BarChart } from '@/components/charts';

// Props
interface Props {
  loading?: boolean;
}

withDefaults(defineProps<Props>(), {
  loading: false,
});

const statisticsStore = useStatisticsStore();

// Computed
const patientStats = computed(() => statisticsStore.patientStats);

const growthRateDisplay = computed(() => {
  const rate = patientStats.value?.growthRate ?? 0;
  return rate >= 0 ? `+${rate}` : rate.toString();
});

const genderLabels: Record<string, string> = {
  M: 'Male',
  F: 'Female',
  Unknown: 'Unknown',
};

const genderData = computed(() => {
  const dist = patientStats.value?.genderDistribution;
  if (!dist) return [];

  return Object.entries(dist).map(([key, value]) => ({
    name: genderLabels[key] || key,
    value,
  }));
});

const bloodTypeData = computed(() => {
  const dist = patientStats.value?.bloodTypeDistribution;
  if (!dist) return [];

  return Object.entries(dist).map(([key, value]) => ({
    name: `Type ${key}`,
    value,
  }));
});

const ageData = computed(() => {
  const dist = patientStats.value?.ageDistribution;
  if (!dist) return [];

  return Object.entries(dist).map(([key, value]) => ({
    name: key,
    value,
  }));
});

const ageBarData = computed(() => {
  const dist = patientStats.value?.ageDistribution;
  if (!dist) return { xAxis: [], series: [] };

  const entries = Object.entries(dist);
  return {
    xAxis: entries.map(([key]) => key),
    series: [
      {
        name: 'Patients',
        data: entries.map(([, value]) => value),
        color: '#409EFF',
      },
    ],
  };
});

const bloodTypeBarData = computed(() => {
  const dist = patientStats.value?.bloodTypeDistribution;
  if (!dist) return { xAxis: [], series: [] };

  const entries = Object.entries(dist);
  return {
    xAxis: entries.map(([key]) => key),
    series: [
      {
        name: 'Patients',
        data: entries.map(([, value]) => value),
        color: '#F56C6C',
      },
    ],
  };
});

// Table data with percentages
const genderTableData = computed(() => {
  const dist = patientStats.value?.genderDistribution;
  if (!dist) return [];

  const total = Object.values(dist).reduce((a, b) => a + b, 0);
  return Object.entries(dist).map(([key, value]) => ({
    name: genderLabels[key] || key,
    count: value,
    percentage: total > 0 ? ((value / total) * 100).toFixed(1) : 0,
  }));
});

const bloodTypeTableData = computed(() => {
  const dist = patientStats.value?.bloodTypeDistribution;
  if (!dist) return [];

  const total = Object.values(dist).reduce((a, b) => a + b, 0);
  return Object.entries(dist).map(([key, value]) => ({
    name: key,
    count: value,
    percentage: total > 0 ? ((value / total) * 100).toFixed(1) : 0,
  }));
});

const ageTableData = computed(() => {
  const dist = patientStats.value?.ageDistribution;
  if (!dist) return [];

  const total = Object.values(dist).reduce((a, b) => a + b, 0);
  return Object.entries(dist).map(([key, value]) => ({
    name: key,
    count: value,
    percentage: total > 0 ? ((value / total) * 100).toFixed(1) : 0,
  }));
});
</script>

<style scoped>
.patients-tab {
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

.card-title {
  font-weight: 600;
  font-size: 14px;
}

.summary-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 12px 0;
}
</style>
