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
        <span class="card-title">{{ t('statistics.topDoctorsByRecords') }}</span>
      </template>
      <BarChart
        v-if="topDoctorsData.xAxis.length > 0"
        :x-axis-data="topDoctorsData.xAxis"
        :series="topDoctorsData.series"
        height="350px"
        :y-axis-name="t('statistics.records')"
      />
      <el-empty
        v-else
        :description="t('statistics.noDoctorData')"
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
            <span class="card-title">{{ t('statistics.patientsPerDoctor') }}</span>
          </template>
          <BarChart
            v-if="patientsPerDoctorData.xAxis.length > 0"
            :x-axis-data="patientsPerDoctorData.xAxis"
            :series="patientsPerDoctorData.series"
            height="300px"
            :y-axis-name="t('statistics.patients')"
            :horizontal="true"
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
            <span class="card-title">{{ t('statistics.avgRecordsPerMonth') }}</span>
          </template>
          <BarChart
            v-if="avgRecordsData.xAxis.length > 0"
            :x-axis-data="avgRecordsData.xAxis"
            :series="avgRecordsData.series"
            height="300px"
            :y-axis-name="t('statistics.avgRecordsPerMonth')"
            :horizontal="true"
          />
          <el-empty
            v-else
            :description="t('common.noData')"
          />
        </el-card>
      </el-col>
    </el-row>

    <!-- Doctor Table -->
    <el-card shadow="never">
      <template #header>
        <span class="card-title">{{ t('statistics.doctorPerformance') }}</span>
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
          :label="t('statistics.doctorName')"
          min-width="120"
        />
        <el-table-column
          prop="title"
          :label="t('statistics.titleCol')"
          width="120"
        >
          <template #default="{ row }">
            {{ row.title || '-' }}
          </template>
        </el-table-column>
        <el-table-column
          prop="departmentName"
          :label="t('statistics.department')"
          min-width="150"
        >
          <template #default="{ row }">
            {{ row.departmentName || '-' }}
          </template>
        </el-table-column>
        <el-table-column
          prop="recordCount"
          :label="t('statistics.totalRecordsLabel')"
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
          :label="t('statistics.patients')"
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
          :label="t('statistics.avgPerMonth')"
          width="100"
          align="center"
          sortable
        >
          <template #default="{ row }">
            {{ row.averageRecordsPerMonth }}
          </template>
        </el-table-column>
        <el-table-column
          :label="t('statistics.efficiency')"
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
import { useI18n } from 'vue-i18n';
import { useStatisticsStore } from '@/stores';
import { BarChart } from '@/components/charts';
import type { DoctorStatisticsItem } from '@/types';

const { t } = useI18n();

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
        name: t('statistics.records'),
        data: top.map((d) => d.recordCount),
        color: '#409EFF',
      },
      {
        name: t('statistics.patients'),
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
        name: t('statistics.patients'),
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
        name: t('statistics.avgRecordsPerMonth'),
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
