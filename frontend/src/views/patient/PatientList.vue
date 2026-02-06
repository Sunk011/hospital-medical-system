<template>
  <div class="patient-list-page">
    <!-- Page Header -->
    <div class="page-header">
      <h2>{{ $t('patient.title') }}</h2>
      <el-button
        type="primary"
        :icon="Plus"
        @click="handleCreate"
      >
        {{ $t('patient.addPatient') }}
      </el-button>
    </div>

    <!-- Search and Filters -->
    <el-card class="filter-card">
      <el-form
        :model="searchForm"
        inline
        @submit.prevent="handleSearch"
      >
        <el-form-item :label="$t('patient.name')">
          <el-input
            v-model="searchForm.name"
            :placeholder="$t('patient.searchPlaceholder')"
            clearable
            @clear="handleSearch"
          />
        </el-form-item>
        <el-form-item :label="$t('patient.medicalNo')">
          <el-input
            v-model="searchForm.medicalNo"
            :placeholder="$t('patient.searchPlaceholder')"
            clearable
            @clear="handleSearch"
          />
        </el-form-item>
        <el-form-item :label="$t('patient.phone')">
          <el-input
            v-model="searchForm.phone"
            :placeholder="$t('patient.searchPlaceholder')"
            clearable
            @clear="handleSearch"
          />
        </el-form-item>
        <el-form-item :label="$t('patient.idCard')">
          <el-input
            v-model="searchForm.idCard"
            :placeholder="$t('patient.searchPlaceholder')"
            clearable
            @clear="handleSearch"
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
    </el-card>

    <!-- Patient Table -->
    <el-card class="table-card">
      <el-table
        v-loading="patientStore.loading"
        :data="patientStore.patients"
        stripe
        border
        style="width: 100%"
      >
        <el-table-column
          prop="medicalNo"
          :label="$t('patient.medicalNo')"
          width="180"
          fixed="left"
        />
        <el-table-column
          prop="name"
          :label="$t('patient.name')"
          width="120"
        />
        <el-table-column
          prop="gender"
          :label="$t('patient.gender')"
          width="80"
          align="center"
        >
          <template #default="{ row }">
            <el-tag
              v-if="row.gender"
              :type="row.gender === 'M' ? 'primary' : 'danger'"
              size="small"
            >
              {{ row.gender === 'M' ? $t('patient.male') : $t('patient.female') }}
            </el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="age"
          :label="$t('patient.age')"
          width="70"
          align="center"
        >
          <template #default="{ row }">
            {{ row.age !== null ? row.age : '-' }}
          </template>
        </el-table-column>
        <el-table-column
          prop="phone"
          :label="$t('patient.phone')"
          width="130"
        >
          <template #default="{ row }">
            {{ row.phone || '-' }}
          </template>
        </el-table-column>
        <el-table-column
          prop="bloodType"
          :label="$t('patient.bloodType')"
          width="100"
          align="center"
        >
          <template #default="{ row }">
            <el-tag
              v-if="row.bloodType && row.bloodType !== 'Unknown'"
              type="warning"
              size="small"
            >
              {{ row.bloodType }}
            </el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="recordsCount"
          :label="$t('medicalRecord.prescriptions')"
          width="90"
          align="center"
        >
          <template #default="{ row }">
            {{ row.recordsCount || 0 }}
          </template>
        </el-table-column>
        <el-table-column
          prop="lastVisitDate"
          :label="$t('patient.lastVisitDate') || 'Last Visit'"
          width="120"
        >
          <template #default="{ row }">
            {{ row.lastVisitDate ? formatDate(row.lastVisitDate) : '-' }}
          </template>
        </el-table-column>
        <el-table-column
          prop="createdAt"
          :label="$t('common.createdAt')"
          width="120"
        >
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('common.actions')"
          width="200"
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
              {{ $t('common.view') || 'View' }}
            </el-button>
            <el-button
              type="warning"
              size="small"
              :icon="Edit"
              @click="handleEdit(row)"
            >
              {{ $t('common.edit') }}
            </el-button>
            <el-button
              type="danger"
              size="small"
              :icon="Delete"
              @click="handleDelete(row)"
            >
              {{ $t('common.delete') }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- Empty State -->
      <el-empty
        v-if="!patientStore.loading && patientStore.patients.length === 0"
        :description="$t('patient.noPatientsFound')"
      />

      <!-- Pagination -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="patientStore.pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <!-- Create/Edit Dialog -->
    <PatientFormDialog
      v-model:visible="formDialogVisible"
      :patient="selectedPatient"
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
  Delete,
} from '@element-plus/icons-vue';
import { usePatientStore } from '@/stores/patient';
import type { Patient, PatientListParams } from '@/types';
import PatientFormDialog from './components/PatientFormDialog.vue';

const router = useRouter();
const patientStore = usePatientStore();

// Search form
const searchForm = ref<PatientListParams>({
  name: '',
  medicalNo: '',
  phone: '',
  idCard: '',
});

// Pagination
const currentPage = computed({
  get: () => patientStore.pagination.page,
  set: (val) => patientStore.setFilters({ page: val }),
});

const pageSize = computed({
  get: () => patientStore.pagination.pageSize,
  set: (val) => patientStore.setFilters({ pageSize: val }),
});

// Dialog state
const formDialogVisible = ref(false);
const formMode = ref<'create' | 'edit'>('create');
const selectedPatient = ref<Patient | null>(null);

// Format date
function formatDate(dateStr: string): string {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN');
}

// Load patients
async function loadPatients(): Promise<void> {
  await patientStore.fetchPatients();
}

// Search handlers
function handleSearch(): void {
  patientStore.setFilters({
    ...searchForm.value,
    page: 1,
  });
  loadPatients();
}

function handleReset(): void {
  searchForm.value = {
    name: '',
    medicalNo: '',
    phone: '',
    idCard: '',
  };
  patientStore.clearFilters();
  loadPatients();
}

// Pagination handlers
function handleSizeChange(size: number): void {
  patientStore.setFilters({ pageSize: size, page: 1 });
  loadPatients();
}

function handlePageChange(page: number): void {
  patientStore.setFilters({ page });
  loadPatients();
}

// CRUD handlers
function handleCreate(): void {
  formMode.value = 'create';
  selectedPatient.value = null;
  formDialogVisible.value = true;
}

function handleView(patient: Patient): void {
  router.push(`/patients/${patient.id}`);
}

function handleEdit(patient: Patient): void {
  formMode.value = 'edit';
  selectedPatient.value = patient;
  formDialogVisible.value = true;
}

async function handleDelete(patient: Patient): Promise<void> {
  try {
    await ElMessageBox.confirm(
      `Are you sure you want to delete patient "${patient.name}" (${patient.medicalNo})?`,
      'Confirm Delete',
      {
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel',
        type: 'warning',
      }
    );

    const success = await patientStore.deletePatient(patient.id);
    if (success) {
      ElMessage.success('Patient deleted successfully');
    }
  } catch {
    // User cancelled
  }
}

function handleFormSuccess(): void {
  formDialogVisible.value = false;
  loadPatients();
}

// Initialize
onMounted(() => {
  loadPatients();
});
</script>

<style scoped>
.patient-list-page {
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
  margin-bottom: 0;
}

.table-card {
  margin-bottom: 20px;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>
