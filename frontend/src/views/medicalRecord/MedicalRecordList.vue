<template>
  <div class="medical-record-list-page">
    <!-- Page Header -->
    <div class="page-header">
      <h2>Medical Record Management</h2>
      <el-button
        type="primary"
        :icon="Plus"
        @click="handleCreate"
      >
        New Record
      </el-button>
    </div>

    <!-- Search and Filters -->
    <el-card class="filter-card">
      <el-form
        :model="searchForm"
        inline
        @submit.prevent="handleSearch"
      >
        <el-form-item label="Record No.">
          <el-input
            v-model="searchForm.recordNo"
            placeholder="Record number"
            clearable
            @clear="handleSearch"
          />
        </el-form-item>
        <el-form-item label="Patient">
          <el-input
            v-model="searchForm.patientName"
            placeholder="Patient name"
            clearable
            @clear="handleSearch"
          />
        </el-form-item>
        <el-form-item label="Doctor">
          <el-input
            v-model="searchForm.doctorName"
            placeholder="Doctor name"
            clearable
            @clear="handleSearch"
          />
        </el-form-item>
        <el-form-item label="Visit Type">
          <el-select
            v-model="searchForm.visitType"
            placeholder="All"
            clearable
            @change="handleSearch"
          >
            <el-option
              v-for="item in visitTypeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="Status">
          <el-select
            v-model="searchForm.status"
            placeholder="All"
            clearable
            @change="handleSearch"
          >
            <el-option
              v-for="item in recordStatusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="Date Range">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="to"
            start-placeholder="Start date"
            end-placeholder="End date"
            value-format="YYYY-MM-DD"
            @change="handleDateRangeChange"
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            :icon="Search"
            @click="handleSearch"
          >
            Search
          </el-button>
          <el-button
            :icon="Refresh"
            @click="handleReset"
          >
            Reset
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- Medical Record Table -->
    <el-card class="table-card">
      <el-table
        v-loading="medicalRecordStore.loading"
        :data="medicalRecordStore.records"
        stripe
        border
        style="width: 100%"
      >
        <el-table-column
          prop="recordNo"
          label="Record No."
          width="200"
          fixed="left"
        />
        <el-table-column
          label="Patient"
          width="120"
        >
          <template #default="{ row }">
            {{ row.patient?.name || '-' }}
          </template>
        </el-table-column>
        <el-table-column
          label="Doctor"
          width="120"
        >
          <template #default="{ row }">
            {{ row.doctor?.name || '-' }}
          </template>
        </el-table-column>
        <el-table-column
          label="Department"
          width="120"
        >
          <template #default="{ row }">
            {{ row.department?.name || '-' }}
          </template>
        </el-table-column>
        <el-table-column
          prop="visitType"
          label="Visit Type"
          width="110"
          align="center"
        >
          <template #default="{ row }">
            <el-tag
              v-if="row.visitType"
              :type="visitTypeColorMap[row.visitType as VisitType] || 'info'"
              size="small"
            >
              {{ getVisitTypeLabel(row.visitType) }}
            </el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="visitDate"
          label="Visit Date"
          width="120"
        >
          <template #default="{ row }">
            {{ formatDate(row.visitDate) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="diagnosis"
          label="Diagnosis"
          min-width="200"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            {{ row.diagnosis || '-' }}
          </template>
        </el-table-column>
        <el-table-column
          prop="status"
          label="Status"
          width="100"
          align="center"
        >
          <template #default="{ row }">
            <el-tag
              :type="statusColorMap[row.status as RecordStatus] || 'info'"
              size="small"
            >
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="Actions"
          width="280"
          fixed="right"
          align="center"
        >
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              :icon="View"
              @click="handleView(row)"
            >
              View
            </el-button>
            <el-button
              v-if="row.status === 'draft'"
              type="warning"
              size="small"
              :icon="Edit"
              @click="handleEdit(row)"
            >
              Edit
            </el-button>
            <el-dropdown
              v-if="row.status !== 'archived'"
              trigger="click"
              @command="(cmd: string) => handleStatusChange(row, cmd)"
            >
              <el-button
                size="small"
                :icon="More"
              >
                More
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item
                    v-if="row.status === 'draft'"
                    command="confirmed"
                  >
                    Confirm Record
                  </el-dropdown-item>
                  <el-dropdown-item
                    v-if="row.status === 'confirmed'"
                    command="archived"
                  >
                    Archive Record
                  </el-dropdown-item>
                  <el-dropdown-item
                    v-if="row.status === 'draft'"
                    command="delete"
                    divided
                  >
                    <span class="text-danger">Delete Record</span>
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>

      <!-- Pagination -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="medicalRecordStore.pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <!-- Create/Edit Dialog -->
    <MedicalRecordFormDialog
      v-model:visible="formDialogVisible"
      :record="selectedRecord"
      :mode="formMode"
      @success="handleFormSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  Plus,
  Search,
  Refresh,
  View,
  Edit,
  More,
} from '@element-plus/icons-vue';
import { useMedicalRecordStore } from '@/stores/medicalRecord';
import type {
  MedicalRecord,
  MedicalRecordListParams,
  VisitType,
  RecordStatus,
} from '@/types';
import {
  visitTypeOptions,
  recordStatusOptions,
  statusColorMap,
  visitTypeColorMap,
} from '@/types';
import MedicalRecordFormDialog from './components/MedicalRecordFormDialog.vue';

const router = useRouter();
const medicalRecordStore = useMedicalRecordStore();

// Search form
const searchForm = ref<MedicalRecordListParams>({
  recordNo: '',
  patientName: '',
  doctorName: '',
  visitType: undefined,
  status: undefined,
});

// Date range
const dateRange = ref<[string, string] | null>(null);

// Pagination
const currentPage = computed({
  get: () => medicalRecordStore.pagination.page,
  set: (val) => medicalRecordStore.setFilters({ page: val }),
});

const pageSize = computed({
  get: () => medicalRecordStore.pagination.pageSize,
  set: (val) => medicalRecordStore.setFilters({ pageSize: val }),
});

// Dialog state
const formDialogVisible = ref(false);
const formMode = ref<'create' | 'edit'>('create');
const selectedRecord = ref<MedicalRecord | null>(null);

// Format date
function formatDate(dateStr: string): string {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN');
}

// Get visit type label
function getVisitTypeLabel(type: string): string {
  const option = visitTypeOptions.find((o) => o.value === type);
  return option?.label || type;
}

// Get status label
function getStatusLabel(status: string): string {
  const option = recordStatusOptions.find((o) => o.value === status);
  return option?.label || status;
}

// Load records
async function loadRecords(): Promise<void> {
  await medicalRecordStore.fetchRecords();
}

// Handle date range change
function handleDateRangeChange(value: [string, string] | null): void {
  if (value) {
    searchForm.value.startDate = value[0];
    searchForm.value.endDate = value[1];
  } else {
    searchForm.value.startDate = undefined;
    searchForm.value.endDate = undefined;
  }
  handleSearch();
}

// Search handlers
function handleSearch(): void {
  medicalRecordStore.setFilters({
    ...searchForm.value,
    page: 1,
  });
  loadRecords();
}

function handleReset(): void {
  searchForm.value = {
    recordNo: '',
    patientName: '',
    doctorName: '',
    visitType: undefined,
    status: undefined,
  };
  dateRange.value = null;
  medicalRecordStore.clearFilters();
  loadRecords();
}

// Pagination handlers
function handleSizeChange(size: number): void {
  medicalRecordStore.setFilters({ pageSize: size, page: 1 });
  loadRecords();
}

function handlePageChange(page: number): void {
  medicalRecordStore.setFilters({ page });
  loadRecords();
}

// CRUD handlers
function handleCreate(): void {
  formMode.value = 'create';
  selectedRecord.value = null;
  formDialogVisible.value = true;
}

function handleView(record: MedicalRecord): void {
  router.push(`/medical-records/${record.id}`);
}

function handleEdit(record: MedicalRecord): void {
  formMode.value = 'edit';
  selectedRecord.value = record;
  formDialogVisible.value = true;
}

async function handleStatusChange(record: MedicalRecord, command: string): Promise<void> {
  if (command === 'delete') {
    await handleDelete(record);
    return;
  }

  const statusLabels: Record<string, string> = {
    confirmed: 'confirm',
    archived: 'archive',
  };

  try {
    await ElMessageBox.confirm(
      `Are you sure you want to ${statusLabels[command]} this record "${record.recordNo}"? This action cannot be undone.`,
      'Confirm Status Change',
      {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning',
      }
    );

    const result = await medicalRecordStore.updateRecordStatus(
      record.id,
      command as RecordStatus
    );
    if (result) {
      ElMessage.success(`Record ${statusLabels[command]}ed successfully`);
    }
  } catch {
    // User cancelled
  }
}

async function handleDelete(record: MedicalRecord): Promise<void> {
  try {
    await ElMessageBox.confirm(
      `Are you sure you want to delete record "${record.recordNo}"? This action cannot be undone.`,
      'Confirm Delete',
      {
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel',
        type: 'warning',
      }
    );

    const success = await medicalRecordStore.deleteRecord(record.id);
    if (success) {
      ElMessage.success('Record deleted successfully');
    }
  } catch {
    // User cancelled
  }
}

function handleFormSuccess(): void {
  formDialogVisible.value = false;
  loadRecords();
}

// Initialize
onMounted(() => {
  loadRecords();
});
</script>

<style scoped>
.medical-record-list-page {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  font-size: 20px;
  color: #303133;
}

.filter-card {
  margin-bottom: 20px;
}

.filter-card :deep(.el-form-item) {
  margin-bottom: 10px;
}

.table-card {
  margin-bottom: 20px;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.text-danger {
  color: #f56c6c;
}
</style>
