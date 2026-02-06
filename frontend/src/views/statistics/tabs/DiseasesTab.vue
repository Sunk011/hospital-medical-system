<template>
  <div
    v-loading="loading"
    class="diseases-tab"
  >
    <!-- Top Diseases Chart -->
    <el-card
      shadow="never"
      class="chart-card"
    >
      <template #header>
        <span class="card-title">{{ t('statistics.topDiagnoses') }}</span>
      </template>
      <BarChart
        v-if="topDiseasesData.xAxis.length > 0"
        :x-axis-data="topDiseasesData.xAxis"
        :series="topDiseasesData.series"
        height="400px"
        :y-axis-name="t('statistics.cases')"
        :horizontal="true"
      />
      <el-empty
        v-else
        :description="t('statistics.noDiagnosisData')"
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
            <span class="card-title">{{ t('statistics.diagnosisDistribution') }}</span>
          </template>
          <PieChart
            v-if="diseaseDistributionData.length > 0"
            :data="diseaseDistributionData"
            height="350px"
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
            <span class="card-title">{{ t('statistics.top5DiagnosesComparison') }}</span>
          </template>
          <BarChart
            v-if="top5Data.xAxis.length > 0"
            :x-axis-data="top5Data.xAxis"
            :series="top5Data.series"
            height="350px"
            :y-axis-name="t('statistics.cases')"
          />
          <el-empty
            v-else
            :description="t('common.noData')"
          />
        </el-card>
      </el-col>
    </el-row>

    <!-- Disease Table -->
    <el-card shadow="never">
      <template #header>
        <div class="card-header-with-info">
          <span class="card-title">{{ t('statistics.diagnosisDetails') }}</span>
          <el-tag
            type="info"
            size="small"
          >
            {{ t('statistics.diagnosesFound', { count: diseaseStats.length }) }}
          </el-tag>
        </div>
      </template>
      <el-table
        :data="diseaseStats"
        stripe
        style="width: 100%"
      >
        <el-table-column
          type="index"
          label="#"
          width="60"
        />
        <el-table-column
          prop="diagnosis"
          :label="t('statistics.diagnosis')"
          min-width="250"
        >
          <template #default="{ row }">
            <span class="diagnosis-text">{{ row.diagnosis }}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="count"
          :label="t('statistics.cases')"
          width="120"
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
          :label="t('statistics.percentage')"
          width="150"
          align="center"
          sortable
        >
          <template #default="{ row }">
            <el-progress
              :percentage="row.percentage"
              :stroke-width="10"
              :format="() => `${row.percentage}%`"
            />
          </template>
        </el-table-column>
        <el-table-column
          :label="t('statistics.relativeFrequency')"
          width="200"
        >
          <template #default="{ row }">
            <div class="frequency-bar">
              <div
                class="frequency-fill"
                :style="{ width: `${row.percentage}%` }"
              />
            </div>
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
import { BarChart, PieChart } from '@/components/charts';
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
const diseaseStats = computed(() => statisticsStore.diseaseStats);

const topDiseasesData = computed(() => {
  const diseases = statisticsStore.diseaseStats;
  if (!diseases || diseases.length === 0) {
    return { xAxis: [], series: [] };
  }

  // Take top 15 diseases
  const top = diseases.slice(0, 15);

  return {
    xAxis: top.map((d) => truncateText(d.diagnosis, 30)),
    series: [
      {
        name: t('statistics.cases'),
        data: top.map((d) => d.count),
        color: '#409EFF',
      },
    ],
  };
});

const diseaseDistributionData = computed(() => {
  const diseases = statisticsStore.diseaseStats;
  if (!diseases || diseases.length === 0) {
    return [];
  }

  // Take top 8 for pie chart
  const top = diseases.slice(0, 8);
  const otherCount = diseases.slice(8).reduce((sum, d) => sum + d.count, 0);

  const data = top.map((d) => ({
    name: truncateText(d.diagnosis, 20),
    value: d.count,
  }));

  if (otherCount > 0) {
    data.push({
      name: t('statistics.others'),
      value: otherCount,
    });
  }

  return data;
});

const top5Data = computed(() => {
  const diseases = statisticsStore.diseaseStats;
  if (!diseases || diseases.length === 0) {
    return { xAxis: [], series: [] };
  }

  const top = diseases.slice(0, 5);

  return {
    xAxis: top.map((d) => truncateText(d.diagnosis, 15)),
    series: [
      {
        name: t('statistics.cases'),
        data: top.map((d) => d.count),
        color: '#67C23A',
      },
    ],
  };
});

// Helper function
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}
</script>

<style scoped>
.diseases-tab {
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

.card-header-with-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.diagnosis-text {
  font-size: 13px;
  line-height: 1.4;
}

.frequency-bar {
  width: 100%;
  height: 8px;
  background-color: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
}

.frequency-fill {
  height: 100%;
  background: linear-gradient(90deg, #409EFF, #67C23A);
  border-radius: 4px;
  transition: width 0.3s ease;
}
</style>
