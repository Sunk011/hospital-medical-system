<template>
  <div
    v-loading="loading"
    class="doctors-tab"
  >
    <!-- Top Doctors Chart -->
    <el-card
      shadow="never"
      class="chart-card"
    >
      <template #header>
        <span class="card-title">Top Doctors by Records</span>
      </template>
      <BarChart
        v-if="topDoctorsData.xAxis.length > 0"
        :x-axis-data="topDoctorsData.xAxis"
        :series="topDoctorsData.series"
        height="350px"
        y-axis-name="Records"
      />
      <el-empty
        v-else
        description="No doctor data available"
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
            <span class="card-title">Patients per Doctor</span>
          </template>
          <BarChart
            v-if="patientsPerDoctorData.xAxis.length > 0"
            :x-axis-data="patientsPerDoctorData.xAxis"
            :series="patientsPerDoctorData.series"
            height="300px"
            y-axis-name="Patients"
            :horizontal="true"
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
            <span class="card-title">Avg Records/Month</span>
          </template>
          <BarChart
            v-if="avgRecordsData.xAxis.length > 0"
            :x-axis-data="avgRecordsData.xAxis"
            :series="avgRecordsData.series"
            height="300px"
            y-axis-name="Avg Records"
            :horizontal="true"
          />
          <el-empty
            v-else
            description="No data available"
          />
        </el-card>
      </el-col>
    </el-row>

    <!-- Doctor Table -->
    <el-card shadow="never">
      <template #header>
        <span class="card-title">Doctor Performance Details</span>
      </template>
      <el-table
        :data="doctorStats"
        stripe
        style="width: 100%"
      >
        <el-table-column
          type="index"
          label="#"
          width="60"
        />
        <el-table-column
          prop="name"
          label="Doctor Name"
          min-width="120"
        />
        <el-table-column
          prop="title"
          label="Title"
          width="120"
        >
          <template #default="{ row }">
            {{ row.title || '-' }}
          </template>
        </el-table-column>
        <el-table-column
          prop="departmentName"
          label="Department"
          min-width="150"
        >
          <template #default="{ row }">
            {{ row.departmentName || '-' }}
          </template>
        </el-table-column>
        <el-table-column
          prop="recordCount"
          label="Total Records"
          width="120"
          align="center"
          sortable
        >
          <template #default="{ row }">
            <el-tag type="primary">
              {{ row.recordCount }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="patientCount"
          label="Patients"
          width="100"
          align="center"
          sortable
        >
          <template #default="{ row }">
            <el-tag type="success">
              {{ row.patientCount }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="averageRecordsPerMonth"
          label="Avg/Month"
          width="100"
          align="center"
          sortable
        >
          <template #default="{ row }">
            {{ row.averageRecordsPerMonth }}
          </template>
        </el-table-column>
        <el-table-column
          label="Efficiency"
          width="150"
          align="center"
        >
          <template #default="{ row }">
            <el-progress
              :percentage="calculateEfficiency(row)"
              :stroke-width="8"
              :color="getEfficiencyColor(row)"
            />
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useStatisticsStore } from '@/stores';
import { BarChart } from '@/components/charts';
import type { DoctorStatisticsItem } from '@/types';

// Props
interface Props {
  loading?: boolean;
}

withDefaults(defineProps<Props>(), {
  loading: false,
});

const statisticsStore = useStatisticsStore();

// Computed
const doctorStats = computed(() => statisticsStore.doctorStats);

const topDoctorsData = computed(() => {
  const doctors = statisticsStore.doctorStats;
  if (!doctors || doctors.length === 0) {
    return { xAxis: [], series: [] };
  }

  // Take top 10 doctors by records
  const top = doctors.slice(0, 10);

  return {
    xAxis: top.map((d) => d.name),
    series: [
      {
        name: 'Records',
        data: top.map((d) => d.recordCount),
        color: '#409EFF',
      },
      {
        name: 'Patients',
        data: top.map((d) => d.patientCount),
        color: '#67C23A',
      },
    ],
  };
});

const patientsPerDoctorData = computed(() => {
  const doctors = statisticsStore.doctorStats;
  if (!doctors || doctors.length === 0) {
    return { xAxis: [], series: [] };
  }

  // Sort by patient count and take top 10
  const sorted = [...doctors].sort((a, b) => b.patientCount - a.patientCount).slice(0, 10);

  return {
    xAxis: sorted.map((d) => d.name),
    series: [
      {
        name: 'Patients',
        data: sorted.map((d) => d.patientCount),
        color: '#67C23A',
      },
    ],
  };
});

const avgRecordsData = computed(() => {
  const doctors = statisticsStore.doctorStats;
  if (!doctors || doctors.length === 0) {
    return { xAxis: [], series: [] };
  }

  // Sort by average records and take top 10
  const sorted = [...doctors].sort((a, b) => b.averageRecordsPerMonth - a.averageRecordsPerMonth).slice(0, 10);

  return {
    xAxis: sorted.map((d) => d.name),
    series: [
      {
        name: 'Avg Records/Month',
        data: sorted.map((d) => d.averageRecordsPerMonth),
        color: '#E6A23C',
      },
    ],
  };
});

// Methods
function calculateEfficiency(doctor: DoctorStatisticsItem): number {
  // Calculate efficiency based on average records per month
  // Assuming 20 records/month is 100% efficiency
  const maxRecords = 20;
  const efficiency = Math.min((doctor.averageRecordsPerMonth / maxRecords) * 100, 100);
  return Math.round(efficiency);
}

function getEfficiencyColor(doctor: DoctorStatisticsItem): string {
  const efficiency = calculateEfficiency(doctor);
  if (efficiency >= 80) return '#67C23A';
  if (efficiency >= 50) return '#E6A23C';
  return '#F56C6C';
}
</script>

<style scoped>
.doctors-tab {
  min-height: 400px;
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
