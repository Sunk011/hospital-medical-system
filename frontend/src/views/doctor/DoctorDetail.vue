<template>
  <div class="doctor-detail-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-left">
        <el-button
          :icon="ArrowLeft"
          @click="goBack"
        >
          Back
        </el-button>
        <h2>Doctor Details</h2>
      </div>
      <div
        v-if="isAdmin && doctor"
        class="header-right"
      >
        <el-button
          type="warning"
          :icon="Edit"
          @click="handleEdit"
        >
          Edit
        </el-button>
        <el-button
          type="danger"
          :icon="Delete"
          @click="handleDelete"
        >
          Delete
        </el-button>
      </div>
    </div>

    <!-- Loading State -->
    <div
      v-if="loading"
      class="loading-container"
    >
      <el-skeleton
        :rows="10"
        animated
      />
    </div>

    <!-- Doctor Info -->
    <template v-else-if="doctor">
      <el-row :gutter="20">
        <!-- Basic Info Card -->
        <el-col :span="16">
          <el-card class="info-card">
            <template #header>
              <div class="card-header">
                <span>Basic Information</span>
              </div>
            </template>

            <el-descriptions
              :column="2"
              border
            >
              <el-descriptions-item label="Name">
                {{ doctor.name }}
              </el-descriptions-item>
              <el-descriptions-item label="Department">
                <el-tag
                  v-if="doctor.department"
                  type="info"
                >
                  {{ doctor.department.name }}
                </el-tag>
                <span v-else>-</span>
              </el-descriptions-item>
              <el-descriptions-item label="Title">
                {{ doctor.title || '-' }}
              </el-descriptions-item>
              <el-descriptions-item label="License No.">
                {{ doctor.licenseNo || '-' }}
              </el-descriptions-item>
              <el-descriptions-item
                label="Specialty"
                :span="2"
              >
                {{ doctor.specialty || '-' }}
              </el-descriptions-item>
              <el-descriptions-item
                label="Introduction"
                :span="2"
              >
                <div class="introduction-text">
                  {{ doctor.introduction || 'No introduction available.' }}
                </div>
              </el-descriptions-item>
            </el-descriptions>
          </el-card>

          <!-- Statistics Card -->
          <el-card class="info-card">
            <template #header>
              <div class="card-header">
                <span>Statistics</span>
              </div>
            </template>

            <el-row :gutter="20">
              <el-col :span="8">
                <div class="stat-item">
                  <div class="stat-value">
                    {{ doctor.recordsCount || 0 }}
                  </div>
                  <div class="stat-label">
                    Medical Records
                  </div>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="stat-item">
                  <div class="stat-value">
                    {{ formatDate(doctor.createdAt) }}
                  </div>
                  <div class="stat-label">
                    Joined Date
                  </div>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="stat-item">
                  <div class="stat-value">
                    <el-tag
                      :type="doctor.user.status === 'active' ? 'success' : 'danger'"
                    >
                      {{ doctor.user.status === 'active' ? 'Active' : 'Inactive' }}
                    </el-tag>
                  </div>
                  <div class="stat-label">
                    Account Status
                  </div>
                </div>
              </el-col>
            </el-row>
          </el-card>
        </el-col>

        <!-- Account Info Card -->
        <el-col :span="8">
          <el-card class="info-card">
            <template #header>
              <div class="card-header">
                <span>Account Information</span>
              </div>
            </template>

            <el-descriptions
              :column="1"
              border
            >
              <el-descriptions-item label="Username">
                {{ doctor.user.username }}
              </el-descriptions-item>
              <el-descriptions-item label="Email">
                {{ doctor.user.email || '-' }}
              </el-descriptions-item>
              <el-descriptions-item label="Phone">
                {{ doctor.user.phone || '-' }}
              </el-descriptions-item>
              <el-descriptions-item label="Status">
                <el-tag
                  :type="doctor.user.status === 'active' ? 'success' : 'danger'"
                >
                  {{ doctor.user.status === 'active' ? 'Active' : 'Inactive' }}
                </el-tag>
              </el-descriptions-item>
            </el-descriptions>
          </el-card>

          <!-- Quick Actions Card -->
          <el-card class="info-card">
            <template #header>
              <div class="card-header">
                <span>Quick Actions</span>
              </div>
            </template>

            <div class="quick-actions">
              <el-button
                type="primary"
                style="width: 100%; margin-bottom: 10px"
                @click="viewRecords"
              >
                View Medical Records
              </el-button>
              <el-button
                v-if="doctor.department"
                style="width: 100%"
                @click="viewDepartment"
              >
                View Department
              </el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </template>

    <!-- Not Found -->
    <el-empty
      v-else
      description="Doctor not found"
    >
      <el-button
        type="primary"
        @click="goBack"
      >
        Go Back
      </el-button>
    </el-empty>

    <!-- Edit Dialog -->
    <DoctorFormDialog
      v-model:visible="editDialogVisible"
      :doctor="doctor"
      mode="edit"
      @success="handleEditSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { ArrowLeft, Edit, Delete } from '@element-plus/icons-vue';
import { useDoctorStore } from '@/stores/doctor';
import { useAuthStore } from '@/stores/auth';
import DoctorFormDialog from './components/DoctorFormDialog.vue';

const route = useRoute();
const router = useRouter();
const doctorStore = useDoctorStore();
const authStore = useAuthStore();

// State
const loading = ref(true);
const editDialogVisible = ref(false);

// Computed
const doctor = computed(() => doctorStore.currentDoctor);
const isAdmin = computed(() => authStore.user?.role === 'admin');

// Format date
function formatDate(dateStr: string): string {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN');
}

// Load doctor data
async function loadDoctor(): Promise<void> {
  const id = parseInt(route.params.id as string, 10);
  if (isNaN(id)) {
    loading.value = false;
    return;
  }

  loading.value = true;
  try {
    await doctorStore.fetchDoctorById(id);
  } finally {
    loading.value = false;
  }
}

// Navigation
function goBack(): void {
  router.push('/doctors');
}

function viewRecords(): void {
  // Navigate to medical records filtered by this doctor
  ElMessage.info('Medical records feature coming soon');
}

function viewDepartment(): void {
  if (doctor.value?.department) {
    ElMessage.info('Department details feature coming soon');
  }
}

// Edit handler
function handleEdit(): void {
  editDialogVisible.value = true;
}

function handleEditSuccess(): void {
  editDialogVisible.value = false;
  loadDoctor();
}

// Delete handler
async function handleDelete(): Promise<void> {
  if (!doctor.value) return;

  try {
    await ElMessageBox.confirm(
      `Are you sure you want to delete doctor "${doctor.value.name}"?`,
      'Confirm Delete',
      {
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel',
        type: 'warning',
      }
    );

    await doctorStore.deleteDoctor(doctor.value.id);
    ElMessage.success('Doctor deleted successfully');
    router.push('/doctors');
  } catch (error: unknown) {
    if (error !== 'cancel') {
      const err = error as { response?: { data?: { message?: string } } };
      if (err.response?.data?.message) {
        ElMessage.error(err.response.data.message);
      }
    }
  }
}

// Initialize
onMounted(() => {
  loadDoctor();
});
</script>

<style scoped>
.doctor-detail-page {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-left h2 {
  margin: 0;
  font-size: 20px;
  color: #303133;
}

.header-right {
  display: flex;
  gap: 10px;
}

.loading-container {
  padding: 20px;
}

.info-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

.introduction-text {
  white-space: pre-wrap;
  line-height: 1.6;
  color: #606266;
}

.stat-item {
  text-align: center;
  padding: 20px;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.quick-actions {
  padding: 10px 0;
}
</style>
