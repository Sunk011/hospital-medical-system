<template>
  <div class="doctor-list-page">
    <!-- Page Header -->
    <div class="page-header">
      <h2>{{ $t('doctor.title') }}</h2>
      <el-button
        v-if="isAdmin"
        type="primary"
        :icon="Plus"
        @click="handleCreate"
      >
        {{ $t('doctor.addDoctor') }}
      </el-button>
    </div>

    <!-- Search and Filters -->
    <el-card class="filter-card">
      <el-form
        :model="searchForm"
        inline
        @submit.prevent="handleSearch"
      >
        <el-form-item :label="$t('doctor.name')">
          <el-input
            v-model="searchForm.name"
            :placeholder="$t('doctor.enterName')"
            clearable
            @clear="handleSearch"
          />
        </el-form-item>
        <el-form-item :label="$t('doctor.department')">
          <DepartmentSelect
            v-model="searchForm.departmentId"
            :placeholder="$t('doctor.allDepartments')"
            @change="handleSearch"
          />
        </el-form-item>
        <el-form-item :label="$t('doctor.titleLabel')">
          <el-select
            v-model="searchForm.title"
            :placeholder="$t('doctor.allTitles')"
            clearable
            style="width: 180px"
            @change="handleSearch"
          >
            <el-option
              v-for="title in doctorTitles"
              :key="title"
              :label="title"
              :value="title"
            />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('doctor.specialty')">
          <el-input
            v-model="searchForm.specialty"
            :placeholder="$t('doctor.specialty')"
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

    <!-- Doctor Table -->
    <el-card class="table-card">
      <el-table
        v-loading="doctorStore.loading"
        :data="doctorStore.doctors"
        stripe
        border
        style="width: 100%"
      >
        <el-table-column
          prop="name"
          :label="$t('doctor.name')"
          width="120"
          fixed="left"
        />
        <el-table-column
          prop="department"
          :label="$t('doctor.department')"
          width="150"
        >
          <template #default="{ row }">
            <el-tag
              v-if="row.department"
              type="info"
              size="small"
            >
              {{ row.department.name }}
            </el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="title"
          :label="$t('doctor.titleLabel')"
          width="160"
        >
          <template #default="{ row }">
            {{ row.title || '-' }}
          </template>
        </el-table-column>
        <el-table-column
          prop="specialty"
          :label="$t('doctor.specialty')"
          min-width="180"
        >
          <template #default="{ row }">
            {{ row.specialty || '-' }}
          </template>
        </el-table-column>
        <el-table-column
          prop="licenseNo"
          :label="$t('doctor.licenseNo')"
          width="150"
        >
          <template #default="{ row }">
            {{ row.licenseNo || '-' }}
          </template>
        </el-table-column>
        <el-table-column
          prop="user"
          :label="$t('doctor.account')"
          width="130"
        >
          <template #default="{ row }">
            <span>{{ row.user.username }}</span>
            <el-tag
              v-if="row.user.status === 'inactive'"
              type="danger"
              size="small"
              style="margin-left: 4px"
            >
              {{ $t('doctor.inactive') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="recordsCount"
          :label="$t('doctor.records')"
          width="90"
          align="center"
        >
          <template #default="{ row }">
            {{ row.recordsCount || 0 }}
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
          :width="isAdmin ? 200 : 100"
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
              {{ $t('common.view') }}
            </el-button>
            <template v-if="isAdmin">
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
          </template>
        </el-table-column>
      </el-table>

      <!-- Pagination -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="doctorStore.pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <!-- Create/Edit Dialog -->
    <DoctorFormDialog
      v-model:visible="formDialogVisible"
      :doctor="selectedDoctor"
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
import { useDoctorStore } from '@/stores/doctor';
import { useAuthStore } from '@/stores/auth';
import type { Doctor, DoctorListParams } from '@/types';
import DoctorFormDialog from './components/DoctorFormDialog.vue';
import DepartmentSelect from '@/components/common/DepartmentSelect.vue';
import { useI18n } from 'vue-i18n';

const router = useRouter();
const { t } = useI18n();
const doctorStore = useDoctorStore();
const authStore = useAuthStore();

// Check if user is admin
const isAdmin = computed(() => authStore.user?.role === 'admin');

// Doctor titles for filter
const doctorTitles = [
  'Chief Physician',
  'Associate Chief Physician',
  'Attending Physician',
  'Resident Physician',
  'Intern',
];

// Search form
const searchForm = ref<DoctorListParams>({
  name: '',
  departmentId: undefined,
  title: '',
  specialty: '',
});

// Pagination
const currentPage = computed({
  get: () => doctorStore.pagination.page,
  set: (val) => doctorStore.setFilters({ page: val }),
});

const pageSize = computed({
  get: () => doctorStore.pagination.pageSize,
  set: (val) => doctorStore.setFilters({ pageSize: val }),
});

// Dialog state
const formDialogVisible = ref(false);
const formMode = ref<'create' | 'edit'>('create');
const selectedDoctor = ref<Doctor | null>(null);

// Format date
function formatDate(dateStr: string): string {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN');
}

// Load doctors
async function loadDoctors(): Promise<void> {
  await doctorStore.fetchDoctors();
}

// Search handlers
function handleSearch(): void {
  const filters: DoctorListParams = {
    page: 1,
  };

  if (searchForm.value.name) {
    filters.name = searchForm.value.name;
  }
  if (searchForm.value.departmentId) {
    filters.departmentId = searchForm.value.departmentId;
  }
  if (searchForm.value.title) {
    filters.title = searchForm.value.title;
  }
  if (searchForm.value.specialty) {
    filters.specialty = searchForm.value.specialty;
  }

  doctorStore.setFilters(filters);
  loadDoctors();
}

function handleReset(): void {
  searchForm.value = {
    name: '',
    departmentId: undefined,
    title: '',
    specialty: '',
  };
  doctorStore.clearFilters();
  loadDoctors();
}

// Pagination handlers
function handleSizeChange(size: number): void {
  doctorStore.setFilters({ pageSize: size, page: 1 });
  loadDoctors();
}

function handlePageChange(page: number): void {
  doctorStore.setFilters({ page });
  loadDoctors();
}

// CRUD handlers
function handleCreate(): void {
  formMode.value = 'create';
  selectedDoctor.value = null;
  formDialogVisible.value = true;
}

function handleView(doctor: Doctor): void {
  router.push(`/doctors/${doctor.id}`);
}

function handleEdit(doctor: Doctor): void {
  formMode.value = 'edit';
  selectedDoctor.value = doctor;
  formDialogVisible.value = true;
}

async function handleDelete(doctor: Doctor): Promise<void> {
  try {
    await ElMessageBox.confirm(
      t('doctor.deleteConfirmMsg', { name: doctor.name }),
      t('common.confirmDeleteTitle'),
      {
        confirmButtonText: t('common.delete'),
        cancelButtonText: t('common.cancel'),
        type: 'warning',
      }
    );

    await doctorStore.deleteDoctor(doctor.id);
    ElMessage.success(t('doctor.doctorDeleted'));
  } catch (error: unknown) {
    if (error !== 'cancel') {
      const err = error as { response?: { data?: { message?: string } } };
      if (err.response?.data?.message) {
        ElMessage.error(err.response.data.message);
      }
    }
  }
}

function handleFormSuccess(): void {
  formDialogVisible.value = false;
  loadDoctors();
}

// Initialize
onMounted(() => {
  loadDoctors();
});
</script>

<style scoped>
.doctor-list-page {
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
