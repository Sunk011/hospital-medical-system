<template>
  <div class="user-management">
    <!-- Toolbar -->
    <div class="toolbar">
      <el-form
        :model="searchForm"
        inline
        @submit.prevent="handleSearch"
      >
        <el-form-item>
          <el-input
            v-model="searchForm.search"
            :placeholder="$t('system.searchPlaceholder')"
            clearable
            style="width: 220px"
            @clear="handleSearch"
          />
        </el-form-item>
        <el-form-item>
          <el-select
            v-model="searchForm.role"
            :placeholder="$t('system.selectRole')"
            clearable
            style="width: 150px"
            @change="handleSearch"
          >
            <el-option :label="$t('system.admin')" value="admin" />
            <el-option :label="$t('system.doctor')" value="doctor" />
            <el-option :label="$t('system.nurse')" value="nurse" />
            <el-option :label="$t('system.receptionist')" value="receptionist" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-select
            v-model="searchForm.status"
            :placeholder="$t('common.status')"
            clearable
            style="width: 120px"
            @change="handleSearch"
          >
            <el-option :label="$t('system.active')" value="active" />
            <el-option :label="$t('system.inactive')" value="inactive" />
          </el-select>
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
      <el-button
        type="primary"
        :icon="Plus"
        @click="handleCreate"
      >
        {{ $t('system.addUser') }}
      </el-button>
    </div>

    <!-- User Table -->
    <el-table
      v-loading="systemStore.userLoading"
      :data="systemStore.users"
      stripe
      border
      style="width: 100%"
    >
      <el-table-column
        prop="username"
        :label="$t('system.username')"
        width="130"
      />
      <el-table-column
        prop="email"
        :label="$t('system.email')"
        width="180"
      >
        <template #default="{ row }">
          {{ row.email || '-' }}
        </template>
      </el-table-column>
      <el-table-column
        prop="phone"
        :label="$t('system.phone')"
        width="130"
      >
        <template #default="{ row }">
          {{ row.phone || '-' }}
        </template>
      </el-table-column>
      <el-table-column
        prop="role"
        :label="$t('system.role')"
        width="120"
        align="center"
      >
        <template #default="{ row }">
          <el-tag
            :type="roleTagType(row.role)"
            size="small"
          >
            {{ roleLabel(row.role) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="status"
        :label="$t('system.status')"
        width="100"
        align="center"
      >
        <template #default="{ row }">
          <el-tag
            :type="row.status === 'active' ? 'success' : 'danger'"
            size="small"
          >
            {{ row.status === 'active' ? $t('system.active') : $t('system.inactive') }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="hasDoctorProfile"
        :label="$t('system.doctorProfile')"
        width="110"
        align="center"
      >
        <template #default="{ row }">
          <el-tag
            v-if="row.hasDoctorProfile"
            type="success"
            size="small"
          >
            {{ $t('common.yes') }}
          </el-tag>
          <span v-else>-</span>
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
        width="280"
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
            size="small"
            @click="handleResetPassword(row)"
          >
            {{ $t('system.resetPassword') }}
          </el-button>
          <el-button
            :type="row.status === 'active' ? 'info' : 'success'"
            size="small"
            @click="handleToggleStatus(row)"
          >
            {{ row.status === 'active' ? $t('system.disable') : $t('system.enable') }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- Pagination -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50]"
        :total="systemStore.userPagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </div>

    <!-- Form Dialog -->
    <UserFormDialog
      v-model:visible="formDialogVisible"
      :user="selectedUser"
      :mode="formMode"
      @success="handleFormSuccess"
    />

    <!-- Reset Password Dialog -->
    <el-dialog
      v-model="resetPasswordDialogVisible"
      :title="$t('system.resetPassword')"
      width="400px"
    >
      <el-form
        ref="resetFormRef"
        :model="resetForm"
        :rules="resetRules"
        label-width="100px"
      >
        <el-form-item
          :label="$t('system.newPassword')"
          prop="newPassword"
        >
          <el-input
            v-model="resetForm.newPassword"
            type="password"
            show-password
            :placeholder="$t('system.enterPassword')"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="resetPasswordDialogVisible = false">
          {{ $t('common.cancel') }}
        </el-button>
        <el-button
          type="primary"
          @click="confirmResetPassword"
        >
          {{ $t('common.confirm') }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import {
  Plus,
  Search,
  Refresh,
  Edit,
} from '@element-plus/icons-vue';
import { useSystemStore } from '@/stores/system';
import type { SystemUser } from '@/types/system';
import UserFormDialog from '../components/UserFormDialog.vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const systemStore = useSystemStore();

// Search form
const searchForm = ref({ search: '', role: '', status: '' });

// Dialog state
const formDialogVisible = ref(false);
const formMode = ref<'create' | 'edit'>('create');
const selectedUser = ref<SystemUser | null>(null);

// Reset password dialog
const resetPasswordDialogVisible = ref(false);
const resetFormRef = ref<FormInstance>();
const resetForm = ref({ newPassword: '' });
const resetTargetUser = ref<SystemUser | null>(null);

const resetRules: FormRules = {
  newPassword: [
    { required: true, message: () => t('system.passwordRequired'), trigger: 'blur' },
    { min: 6, max: 100, message: () => t('system.passwordLength'), trigger: 'blur' },
  ],
};

// Pagination
const currentPage = computed({
  get: () => systemStore.userPagination.page,
  set: (val) => systemStore.setUserFilters({ page: val }),
});

const pageSize = computed({
  get: () => systemStore.userPagination.pageSize,
  set: (val) => systemStore.setUserFilters({ pageSize: val }),
});

// Role helpers
function roleLabel(role: string): string {
  const labels: Record<string, string> = {
    admin: t('system.admin'),
    doctor: t('system.doctor'),
    nurse: t('system.nurse'),
    receptionist: t('system.receptionist'),
  };
  return labels[role] || role;
}

function roleTagType(role: string): string {
  const types: Record<string, string> = {
    admin: 'danger',
    doctor: 'primary',
    nurse: 'success',
    receptionist: 'warning',
  };
  return types[role] || 'info';
}

// Format date
function formatDate(dateStr: string): string {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('zh-CN');
}

// Search handlers
function handleSearch(): void {
  systemStore.setUserFilters({
    page: 1,
    search: searchForm.value.search || undefined,
    role: searchForm.value.role || undefined,
    status: searchForm.value.status || undefined,
  });
  systemStore.fetchUsers();
}

function handleReset(): void {
  searchForm.value = { search: '', role: '', status: '' };
  systemStore.clearUserFilters();
  systemStore.fetchUsers();
}

// Pagination handlers
function handleSizeChange(size: number): void {
  systemStore.setUserFilters({ pageSize: size, page: 1 });
  systemStore.fetchUsers();
}

function handlePageChange(page: number): void {
  systemStore.setUserFilters({ page });
  systemStore.fetchUsers();
}

// CRUD handlers
function handleCreate(): void {
  formMode.value = 'create';
  selectedUser.value = null;
  formDialogVisible.value = true;
}

function handleEdit(user: SystemUser): void {
  formMode.value = 'edit';
  selectedUser.value = user;
  formDialogVisible.value = true;
}

function handleResetPassword(user: SystemUser): void {
  resetTargetUser.value = user;
  resetForm.value.newPassword = '';
  resetPasswordDialogVisible.value = true;
}

async function confirmResetPassword(): Promise<void> {
  if (!resetFormRef.value || !resetTargetUser.value) return;

  try {
    await resetFormRef.value.validate();
  } catch {
    return;
  }

  try {
    await systemStore.resetUserPassword(
      resetTargetUser.value.id,
      resetForm.value.newPassword
    );
    ElMessage.success(t('system.passwordReset'));
    resetPasswordDialogVisible.value = false;
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    ElMessage.error(err.response?.data?.message || t('common.operationFailed'));
  }
}

async function handleToggleStatus(user: SystemUser): Promise<void> {
  const action = user.status === 'active' ? t('system.disable') : t('system.enable');
  try {
    await ElMessageBox.confirm(
      t('system.toggleStatusMsg', { action, name: user.username }),
      t('common.confirm'),
      {
        confirmButtonText: t('common.confirm'),
        cancelButtonText: t('common.cancel'),
        type: 'warning',
      }
    );
    await systemStore.toggleUserStatus(user.id);
    ElMessage.success(t('system.statusChanged'));
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
  systemStore.fetchUsers();
}

// Initialize
onMounted(() => {
  systemStore.fetchUsers();
});
</script>

<style scoped>
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.toolbar :deep(.el-form-item) {
  margin-bottom: 0;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>
