<template>
  <div
    v-loading="loading"
    class="departments-tab"
  >
    <!-- Charts Row -->
    <el-row
      :gutter="20"
      class="charts-row"
    >
      <el-col
        :xs="24"
        :lg="12"
      >
        <el-card shadow="never">
          <template #header>
            <span class="card-title">Records by Department</span>
          </template>
          <BarChart
            v-if="recordsByDeptData.xAxis.length > 0"
            :x-axis-data="recordsByDeptData.xAxis"
            :series="recordsByDeptData.series"
            height="350px"
            y-axis-name="Records"
            :horizontal="true"
          />
          <el-empty
            v-else
            description="No department data available"
          />
        </el-card>
      </el-col>
      <el-col
        :xs="24"
        :lg="12"
      >
        <el-card shadow="never">
          <template #header>
            <span class="card-title">Doctors by Department</span>
          </template>
          <BarChart
            v-if="doctorsByDeptData.xAxis.length > 0"
            :x-axis-data="doctorsByDeptData.xAxis"
            :series="doctorsByDeptData.series"
            height="350px"
            y-axis-name="Doctors"
            :horizontal="true"
          />
          <el-empty
            v-else
            description="No department data available"
          />
        </el-card>
      </el-col>
    </el-row>

    <!-- Department Distribution Pie -->
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
            <span class="card-title">Record Distribution</span>
          </template>
          <PieChart
            v-if="recordDistributionData.length > 0"
            :data="recordDistributionData"
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
            <span class="card-title">Patient Distribution</span>
          </template>
          <PieChart
            v-if="patientDistributionData.length > 0"
            :data="patientDistributionData"
            height="300px"
          />
          <el-empty
            v-else
            description="No data available"
          />
        </el-card>
      </el-col>
    </el-row>

    <!-- Department Table -->
    <el-card shadow="never">
      <template #header>
        <span class="card-title">Department Details</span>
      </template>
      <el-table
        :data="departmentStats"
        stripe
        style="width: 100%"
      >
        <el-table-column
          prop="name"
          label="Department"
          min-width="150"
        />
        <el-table-column
          prop="code"
          label="Code"
          width="100"
        >
          <template #default="{ row }">
            {{ row.code || '-' }}
          </template>
        </el-table-column>
        <el-table-column
          prop="doctorCount"
          label="Doctors"
          width="100"
          align="center"
        >
          <template #default="{ row }">
            <el-tag type="primary">
              {{ row.doctorCount }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="recordCount"
          label="Records"
          width="100"
          align="center"
        >
          <template #default="{ row }">
            <el-tag type="success">
              {{ row.recordCount }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="patientCount"
          label="Patients"
          width="100"
          align="center"
        >
          <template #default="{ row }">
            <el-tag type="warning">
              {{ row.patientCount }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="Avg Records/Doctor"
          width="150"
          align="center"
        >
          <template #default="{ row }">
            {{ row.doctorCount > 0 ? (row.recordCount / row.doctorCount).toFixed(1) : 0 }}
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useStatisticsStore } from '@/stores';
import { BarChart, PieChart } from '@/components/charts';

// Props
interface Props {
  loading?: boolean;
}

withDefaults(defineProps<Props>(), {
  loading: false,
});

const statisticsStore = useStatisticsStore();

// Computed
const departmentStats = computed(() => statisticsStore.departmentStats);

const recordsByDeptData = computed(() => {
  const depts = statisticsStore.departmentStats;
  if (!depts || depts.length === 0) {
    return { xAxis: [], series: [] };
  }

  // Sort by record count and take top 10
  const sorted = [...depts].sort((a, b) => b.recordCount - a.recordCount).slice(0, 10);

  return {
    xAxis: sorted.map((d) => d.name),
    series: [
      {
        name: 'Records',
        data: sorted.map((d) => d.recordCount),
        color: '#409EFF',
      },
    ],
  };
});

const doctorsByDeptData = computed(() => {
  const depts = statisticsStore.departmentStats;
  if (!depts || depts.length === 0) {
    return { xAxis: [], series: [] };
  }

  // Sort by doctor count and take top 10
  const sorted = [...depts].sort((a, b) => b.doctorCount - a.doctorCount).slice(0, 10);

  return {
    xAxis: sorted.map((d) => d.name),
    series: [
      {
        name: 'Doctors',
        data: sorted.map((d) => d.doctorCount),
        color: '#67C23A',
      },
    ],
  };
});

const recordDistributionData = computed(() => {
  const depts = statisticsStore.departmentStats;
  if (!depts || depts.length === 0) {
    return [];
  }

  // Take top 8 departments by records
  const sorted = [...depts].sort((a, b) => b.recordCount - a.recordCount).slice(0, 8);

  return sorted.map((d) => ({
    name: d.name,
    value: d.recordCount,
  }));
});

const patientDistributionData = computed(() => {
  const depts = statisticsStore.departmentStats;
  if (!depts || depts.length === 0) {
    return [];
  }

  // Take top 8 departments by patients
  const sorted = [...depts].sort((a, b) => b.patientCount - a.patientCount).slice(0, 8);

  return sorted.map((d) => ({
    name: d.name,
    value: d.patientCount,
  }));
});
</script>

<style scoped>
.departments-tab {
  min-height: 400px;
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
