<template>
  <div
    v-loading="loading"
    class="prescriptions-tab"
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
          :icon="Document"
          :value="prescriptionStats?.totalPrescriptions ?? 0"
          label="Total Prescriptions"
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
          :icon="Box"
          :value="prescriptionStats?.uniqueMedicines ?? 0"
          label="Unique Medicines"
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
          :icon="TrendCharts"
          :value="prescriptionStats?.averagePrescriptionsPerRecord ?? 0"
          label="Avg per Record"
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
          :icon="Medal"
          :value="topMedicineName"
          label="Most Prescribed"
          icon-color="#F56C6C"
          icon-bg-color="rgba(245, 108, 108, 0.1)"
        />
      </el-col>
    </el-row>

    <!-- Top Medicines Chart -->
    <el-card
      shadow="never"
      class="chart-card"
    >
      <template #header>
        <span class="card-title">Top Prescribed Medicines</span>
      </template>
      <BarChart
        v-if="topMedicinesData.xAxis.length > 0"
        :x-axis-data="topMedicinesData.xAxis"
        :series="topMedicinesData.series"
        height="400px"
        y-axis-name="Prescriptions"
        :horizontal="true"
      />
      <el-empty
        v-else
        description="No prescription data available for the selected period"
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
            <span class="card-title">Medicine Distribution</span>
          </template>
          <PieChart
            v-if="medicineDistributionData.length > 0"
            :data="medicineDistributionData"
            height="350px"
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
            <span class="card-title">Top 5 Medicines Comparison</span>
          </template>
          <BarChart
            v-if="top5Data.xAxis.length > 0"
            :x-axis-data="top5Data.xAxis"
            :series="top5Data.series"
            height="350px"
            y-axis-name="Count"
          />
          <el-empty
            v-else
            description="No data available"
          />
        </el-card>
      </el-col>
    </el-row>

    <!-- Medicine Table -->
    <el-card shadow="never">
      <template #header>
        <div class="card-header-with-info">
          <span class="card-title">Medicine Details</span>
          <el-tag
            type="info"
            size="small"
          >
            {{ prescriptionStats?.topMedicines?.length ?? 0 }} medicines listed
          </el-tag>
        </div>
      </template>
      <el-table
        :data="prescriptionStats?.topMedicines ?? []"
        stripe
        style="width: 100%"
      >
        <el-table-column
          type="index"
          label="#"
          width="60"
        />
        <el-table-column
          prop="medicineName"
          label="Medicine Name"
          min-width="200"
        >
          <template #default="{ row }">
            <div class="medicine-name">
              <el-icon
                color="#409EFF"
                :size="16"
              >
                <Box />
              </el-icon>
              <span>{{ row.medicineName }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          prop="count"
          label="Prescriptions"
          width="140"
          align="center"
          sortable
        >
          <template #default="{ row }">
            <el-tag type="primary">
              {{ row.count }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="percentage"
          label="Percentage"
          width="150"
          align="center"
          sortable
        >
          <template #default="{ row }">
            <span class="percentage-text">{{ row.percentage }}%</span>
          </template>
        </el-table-column>
        <el-table-column
          label="Usage Frequency"
          width="250"
        >
          <template #default="{ row }">
            <el-progress
              :percentage="row.percentage"
              :stroke-width="12"
              :show-text="false"
              :color="getProgressColor(row.percentage)"
            />
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- Summary Info -->
    <el-card
      shadow="never"
      class="summary-card"
    >
      <template #header>
        <span class="card-title">Prescription Summary</span>
      </template>
      <el-descriptions
        :column="3"
        border
      >
        <el-descriptions-item label="Total Prescriptions">
          {{ prescriptionStats?.totalPrescriptions?.toLocaleString() ?? 0 }}
        </el-descriptions-item>
        <el-descriptions-item label="Unique Medicines">
          {{ prescriptionStats?.uniqueMedicines ?? 0 }}
        </el-descriptions-item>
        <el-descriptions-item label="Avg per Record">
          {{ prescriptionStats?.averagePrescriptionsPerRecord ?? 0 }}
        </el-descriptions-item>
        <el-descriptions-item label="Most Prescribed">
          {{ topMedicineName }}
        </el-descriptions-item>
        <el-descriptions-item label="Top Medicine Count">
          {{ prescriptionStats?.topMedicines?.[0]?.count ?? 0 }}
        </el-descriptions-item>
        <el-descriptions-item label="Top Medicine %">
          {{ prescriptionStats?.topMedicines?.[0]?.percentage ?? 0 }}%
        </el-descriptions-item>
      </el-descriptions>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Document, Box, TrendCharts, Medal } from '@element-plus/icons-vue';
import { useStatisticsStore } from '@/stores';
import { StatCard, BarChart, PieChart } from '@/components/charts';
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
const prescriptionStats = computed(() => statisticsStore.prescriptionStats);

const topMedicineName = computed(() => {
  const top = prescriptionStats.value?.topMedicines?.[0];
  return top?.medicineName ?? '-';
});

const topMedicinesData = computed(() => {
  const medicines = prescriptionStats.value?.topMedicines;
  if (!medicines || medicines.length === 0) {
    return { xAxis: [], series: [] };
  }

  return {
    xAxis: medicines.map((m) => m.medicineName),
    series: [
      {
        name: 'Prescriptions',
        data: medicines.map((m) => m.count),
        color: '#409EFF',
      },
    ],
  };
});

const medicineDistributionData = computed(() => {
  const medicines = prescriptionStats.value?.topMedicines;
  if (!medicines || medicines.length === 0) {
    return [];
  }

  // Take top 8 for pie chart
  const top = medicines.slice(0, 8);
  const totalTop = top.reduce((sum, m) => sum + m.count, 0);
  const totalAll = prescriptionStats.value?.totalPrescriptions ?? 0;
  const otherCount = totalAll - totalTop;

  const data = top.map((m) => ({
    name: m.medicineName,
    value: m.count,
  }));

  if (otherCount > 0) {
    data.push({
      name: 'Others',
      value: otherCount,
    });
  }

  return data;
});

const top5Data = computed(() => {
  const medicines = prescriptionStats.value?.topMedicines;
  if (!medicines || medicines.length === 0) {
    return { xAxis: [], series: [] };
  }

  const top = medicines.slice(0, 5);

  return {
    xAxis: top.map((m) => truncateText(m.medicineName, 12)),
    series: [
      {
        name: 'Count',
        data: top.map((m) => m.count),
        color: '#67C23A',
      },
    ],
  };
});

// Helper functions
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

function getProgressColor(percentage: number): string {
  if (percentage >= 20) return '#F56C6C';
  if (percentage >= 10) return '#E6A23C';
  return '#409EFF';
}
</script>

<style scoped>
.prescriptions-tab {
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

.summary-card {
  margin-top: 20px;
}

.card-title {
  font-weight: 600;
  font-size: 14px;
}

.card-header-with-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.medicine-name {
  display: flex;
  align-items: center;
  gap: 8px;
}

.percentage-text {
  font-weight: 500;
  color: #409EFF;
}
</style>
