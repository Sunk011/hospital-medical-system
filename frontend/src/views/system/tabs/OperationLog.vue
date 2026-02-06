<template>
  <div class="operation-log">
    <!-- Toolbar -->
    <div class="toolbar">
      <el-form
        :model="searchForm"
        inline
        @submit.prevent="handleSearch"
      >
        <el-form-item>
          <el-input
            v-model="searchForm.module"
            :placeholder="$t('system.allModules')"
            clearable
            style="width: 150px"
            @clear="handleSearch"
          />
        </el-form-item>
        <el-form-item>
          <el-input
            v-model="searchForm.action"
            :placeholder="$t('system.allActions')"
            clearable
            style="width: 150px"
            @clear="handleSearch"
          />
        </el-form-item>
        <el-form-item>
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            :start-placeholder="$t('statistics.startDate')"
            :end-placeholder="$t('statistics.endDate')"
            value-format="YYYY-MM-DD"
            style="width: 260px"
            @change="handleSearch"
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            :icon="Search"
            @click="handleSearch"
          >
            {{ $t('common.search') }}
          </el-button>
          <el-button
            :icon="Refresh"
            @click="handleReset"
          >
            {{ $t('common.reset') }}
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- Log Table -->
    <el-table
      v-loading="systemStore.logLoading"
      :data="systemStore.logs"
      stripe
      border
      style="width: 100%"
    >
      <el-table-column
        prop="id"
        label="ID"
        width="70"
      />
      <el-table-column
        prop="username"
        :label="$t('system.username')"
        width="120"
      >
        <template #default="{ row }">
          {{ row.username || '-' }}
        </template>
      </el-table-column>
      <el-table-column
        prop="module"
        :label="$t('system.module')"
        width="120"
      >
        <template #default="{ row }">
          <el-tag
            v-if="row.module"
            size="small"
          >
            {{ row.module }}
          </el-tag>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="action"
        :label="$t('system.action')"
        width="120"
      >
        <template #default="{ row }">
          {{ row.action || '-' }}
        </template>
      </el-table-column>
      <el-table-column
        prop="targetId"
        :label="$t('system.targetId')"
        width="90"
        align="center"
      >
        <template #default="{ row }">
          {{ row.targetId ?? '-' }}
        </template>
      </el-table-column>
      <el-table-column
        prop="ipAddress"
        :label="$t('system.ipAddress')"
        width="140"
      >
        <template #default="{ row }">
          {{ row.ipAddress || '-' }}
        </template>
      </el-table-column>
      <el-table-column
        prop="details"
        :label="$t('system.details')"
        min-width="200"
      >
        <template #default="{ row }">
          <span class="details-text">{{ row.details || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="createdAt"
        :label="$t('system.operatedAt')"
        width="170"
      >
        <template #default="{ row }">
          {{ formatDateTime(row.createdAt) }}
        </template>
      </el-table-column>
    </el-table>

    <!-- Pagination -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="systemStore.logPagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { Search, Refresh } from '@element-plus/icons-vue';
import { useSystemStore } from '@/stores/system';
import { useI18n } from 'vue-i18n';

useI18n();
const systemStore = useSystemStore();

// Search form
const searchForm = ref({ module: '', action: '' });
const dateRange = ref<[string, string] | null>(null);

// Pagination
const currentPage = computed({
  get: () => systemStore.logPagination.page,
  set: (val) => systemStore.setLogFilters({ page: val }),
});

const pageSize = computed({
  get: () => systemStore.logPagination.pageSize,
  set: (val) => systemStore.setLogFilters({ pageSize: val }),
});

// Format datetime
function formatDateTime(dateStr: string): string {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleString('zh-CN');
}

// Search handlers
function handleSearch(): void {
  systemStore.setLogFilters({
    page: 1,
    module: searchForm.value.module || undefined,
    action: searchForm.value.action || undefined,
    startDate: dateRange.value?.[0] || undefined,
    endDate: dateRange.value?.[1] || undefined,
  });
  systemStore.fetchLogs();
}

function handleReset(): void {
  searchForm.value = { module: '', action: '' };
  dateRange.value = null;
  systemStore.clearLogFilters();
  systemStore.fetchLogs();
}

// Pagination handlers
function handleSizeChange(size: number): void {
  systemStore.setLogFilters({ pageSize: size, page: 1 });
  systemStore.fetchLogs();
}

function handlePageChange(page: number): void {
  systemStore.setLogFilters({ page });
  systemStore.fetchLogs();
}

// Initialize
onMounted(() => {
  systemStore.fetchLogs();
});
</script>

<style scoped>
.toolbar {
  margin-bottom: 16px;
}

.toolbar :deep(.el-form-item) {
  margin-bottom: 0;
}

.details-text {
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: inline-block;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>
