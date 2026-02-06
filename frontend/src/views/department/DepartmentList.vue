<template>
  <div class="department-list-page">
    <!-- Page Header -->
    <div class="page-header">
      <h2>{{ $t('department.title') }}</h2>
      <el-button
        v-if="isAdmin"
        type="primary"
        :icon="Plus"
        @click="handleCreate"
      >
        {{ $t('department.addDepartment') }}
      </el-button>
    </div>

    <!-- Search and Filters -->
    <el-card class="filter-card">
      <el-form
        :model="searchForm"
        inline
        @submit.prevent="handleSearch"
      >
        <el-form-item :label="$t('department.name')">
          <el-input
            v-model="searchForm.name"
            :placeholder="$t('department.enterName')"
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

    <!-- Department Table -->
    <el-card class="table-card">
      <el-table
        v-loading="departmentStore.loading"
        :data="filteredDepartments"
        stripe
        border
        style="width: 100%"
      >
        <el-table-column
          prop="name"
          :label="$t('department.name')"
          width="180"
        />
        <el-table-column
          prop="code"
          :label="$t('department.code')"
          width="120"
        >
          <template #default="{ row }">
            <el-tag
              v-if="row.code"
              type="info"
              size="small"
            >
              {{ row.code }}
            </el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="description"
          :label="$t('department.description')"
          min-width="200"
        >
          <template #default="{ row }">
            {{ row.description || '-' }}
          </template>
        </el-table-column>
        <el-table-column
          prop="status"
          :label="$t('department.status')"
          width="100"
          align="center"
        >
          <template #default="{ row }">
            <el-tag
              :type="row.status === 1 ? 'success' : 'danger'"
              size="small"
            >
              {{ row.status === 1 ? $t('department.active') : $t('department.inactive') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="doctorCount"
          :label="$t('department.doctorCount')"
          width="120"
          align="center"
        />
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
          v-if="isAdmin"
          :label="$t('common.actions')"
          width="260"
          fixed="right"
          align="center"
        >
          <template #default="{ row }">
            <el-button
              type="warning"
              size="small"
              :icon="Edit"
              @click="handleEdit(row)"
            >
              {{ $t('common.edit') }}
            </el-button>
            <el-button
              :type="row.status === 1 ? 'info' : 'success'"
              size="small"
              @click="handleToggleStatus(row)"
            >
              {{ row.status === 1 ? $t('department.disable') : $t('department.enable') }}
            </el-button>
            <el-button
              type="danger"
              size="small"
              :icon="Delete"
              :disabled="row.doctorCount > 0"
              @click="handleDelete(row)"
            >
              {{ $t('common.delete') }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- Form Dialog -->
    <DepartmentFormDialog
      v-model:visible="formDialogVisible"
      :department="selectedDepartment"
      :mode="formMode"
      @success="handleFormSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  Plus,
  Search,
  Refresh,
  Edit,
  Delete,
} from '@element-plus/icons-vue';
import { useDepartmentStore } from '@/stores/department';
import { useAuthStore } from '@/stores/auth';
import type { Department } from '@/types';
import DepartmentFormDialog from './components/DepartmentFormDialog.vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const departmentStore = useDepartmentStore();
const authStore = useAuthStore();

// Check if user is admin
const isAdmin = computed(() => authStore.user?.role === 'admin');

// Search form
const searchForm = ref({ name: '' });

// Dialog state
const formDialogVisible = ref(false);
const formMode = ref<'create' | 'edit'>('create');
const selectedDepartment = ref<Department | null>(null);

// Client-side filter
const filteredDepartments = computed(() => {
  if (!searchForm.value.name) return departmentStore.departments;
  const keyword = searchForm.value.name.toLowerCase();
  return departmentStore.departments.filter(
    (d) =>
      d.name.toLowerCase().includes(keyword) ||
      (d.code && d.code.toLowerCase().includes(keyword))
  );
});

// Format date
function formatDate(dateStr: string): string {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('zh-CN');
}

// Search handlers
function handleSearch(): void {
  // Client-side filtering via computed
}

function handleReset(): void {
  searchForm.value.name = '';
}

// CRUD handlers
function handleCreate(): void {
  formMode.value = 'create';
  selectedDepartment.value = null;
  formDialogVisible.value = true;
}

function handleEdit(dept: Department): void {
  formMode.value = 'edit';
  selectedDepartment.value = dept;
  formDialogVisible.value = true;
}

async function handleToggleStatus(dept: Department): Promise<void> {
  const action = dept.status === 1 ? t('department.disable') : t('department.enable');
  try {
    await ElMessageBox.confirm(
      t('department.toggleStatusMsg', { action, name: dept.name }),
      t('common.confirm'),
      {
        confirmButtonText: t('common.confirm'),
        cancelButtonText: t('common.cancel'),
        type: 'warning',
      }
    );
    await departmentStore.updateDepartment(dept.id, {
      status: dept.status === 1 ? 0 : 1,
    });
    ElMessage.success(t('department.departmentUpdated'));
  } catch (error: unknown) {
    if (error !== 'cancel') {
      const err = error as { response?: { data?: { message?: string } } };
      if (err.response?.data?.message) {
        ElMessage.error(err.response.data.message);
      }
    }
  }
}

async function handleDelete(dept: Department): Promise<void> {
  try {
    await ElMessageBox.confirm(
      t('department.deleteConfirmMsg', { name: dept.name }),
      t('common.confirmDeleteTitle'),
      {
        confirmButtonText: t('common.delete'),
        cancelButtonText: t('common.cancel'),
        type: 'warning',
      }
    );
    await departmentStore.deleteDepartment(dept.id);
    ElMessage.success(t('department.departmentDeleted'));
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
  departmentStore.fetchDepartments();
}

// Initialize
onMounted(() => {
  departmentStore.fetchDepartments();
});
</script>

<style scoped>
.department-list-page {
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
</style>
