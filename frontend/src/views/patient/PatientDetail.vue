<template>
  <div class="patient-detail-page">
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

    <!-- Content -->
    <template v-else-if="patient">
      <!-- Page Header -->
      <div class="page-header">
        <div class="header-left">
          <el-button
            :icon="ArrowLeft"
            @click="goBack"
          >
            {{ $t('common.back') }}
          </el-button>
          <h2>{{ $t('patient.patientDetail') }}</h2>
        </div>
        <div class="header-right">
          <el-button
            type="primary"
            :icon="Edit"
            @click="handleEdit"
          >
            {{ $t('common.edit') }}
          </el-button>
          <el-button
            type="danger"
            :icon="Delete"
            @click="handleDelete"
          >
            {{ $t('common.delete') }}
          </el-button>
        </div>
      </div>

      <!-- Basic Information Card -->
      <el-card class="info-card">
        <template #header>
          <div class="card-header">
            <el-icon><User /></el-icon>
            <span>{{ $t('patient.basicInfo') }}</span>
          </div>
        </template>

        <el-descriptions
          :column="3"
          border
        >
          <el-descriptions-item :label="$t('patient.medicalNo')">
            <el-tag type="primary">
              {{ patient.medicalNo }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item :label="$t('patient.name')">
            {{ patient.name }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('patient.gender')">
            <el-tag
              v-if="patient.gender"
              :type="patient.gender === 'M' ? 'primary' : 'danger'"
              size="small"
            >
              {{ patient.gender === 'M' ? $t('patient.male') : $t('patient.female') }}
            </el-tag>
            <span v-else>-</span>
          </el-descriptions-item>
          <el-descriptions-item :label="$t('patient.age')">
            {{ patient.age !== null ? `${patient.age} ${$t('patient.years')}` : '-' }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('patient.birthDate')">
            {{ patient.birthDate ? formatDate(patient.birthDate) : '-' }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('patient.bloodType')">
            <el-tag
              v-if="patient.bloodType && patient.bloodType !== 'Unknown'"
              type="warning"
              size="small"
            >
              {{ patient.bloodType }}
            </el-tag>
            <span v-else>-</span>
          </el-descriptions-item>
          <el-descriptions-item :label="$t('patient.idCard')">
            {{ patient.idCard ? maskIdCard(patient.idCard) : '-' }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('patient.phone')">
            {{ patient.phone || '-' }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('patient.address')">
            {{ patient.address || '-' }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('patient.emergencyContact')">
            {{ patient.emergencyContact || '-' }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('patient.emergencyPhone')">
            {{ patient.emergencyPhone || '-' }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('patient.registered')">
            {{ formatDateTime(patient.createdAt) }}
          </el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- Medical Information Card -->
      <el-card class="info-card">
        <template #header>
          <div class="card-header">
            <el-icon><Document /></el-icon>
            <span>{{ $t('patient.medicalInfo') }}</span>
          </div>
        </template>

        <el-descriptions
          :column="1"
          border
        >
          <el-descriptions-item :label="$t('patient.allergies')">
            <div
              v-if="patient.allergies"
              class="text-content"
            >
              <el-tag
                v-for="(allergy, index) in parseAllergies(patient.allergies)"
                :key="index"
                type="danger"
                size="small"
                class="allergy-tag"
              >
                {{ allergy }}
              </el-tag>
            </div>
            <span v-else>{{ $t('patient.noAllergies') }}</span>
          </el-descriptions-item>
          <el-descriptions-item :label="$t('patient.medicalHistory')">
            <div
              v-if="patient.medicalHistory"
              class="text-content"
            >
              {{ patient.medicalHistory }}
            </div>
            <span v-else>{{ $t('patient.noMedicalHistory') }}</span>
          </el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- Visit Statistics Card -->
      <el-card class="info-card">
        <template #header>
          <div class="card-header">
            <el-icon><DataAnalysis /></el-icon>
            <span>{{ $t('patient.visitStatistics') }}</span>
          </div>
        </template>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-statistic
              :title="$t('patient.totalVisits')"
              :value="patient.recordsCount || 0"
            />
          </el-col>
          <el-col :span="8">
            <el-statistic :title="$t('patient.lastVisit')">
              <template #default>
                <span class="stat-text">
                  {{ patient.lastVisitDate ? formatDate(patient.lastVisitDate) : $t('patient.never') }}
                </span>
              </template>
            </el-statistic>
          </el-col>
          <el-col :span="8">
            <el-statistic :title="$t('patient.patientSince')">
              <template #default>
                <span class="stat-text">
                  {{ formatDate(patient.createdAt) }}
                </span>
              </template>
            </el-statistic>
          </el-col>
        </el-row>
      </el-card>

      <!-- Recent Medical Records -->
      <el-card class="info-card">
        <template #header>
          <div class="card-header">
            <el-icon><List /></el-icon>
            <span>{{ $t('patient.recentRecords') }}</span>
          </div>
        </template>

        <el-table
          v-loading="recordsLoading"
          :data="medicalRecords"
          stripe
          border
          style="width: 100%"
        >
          <el-table-column
            prop="recordNo"
            :label="$t('patient.recordNo')"
            width="180"
          />
          <el-table-column
            prop="visitDate"
            :label="$t('patient.visitDate')"
            width="120"
          >
            <template #default="{ row }">
              {{ formatDate(row.visitDate) }}
            </template>
          </el-table-column>
          <el-table-column
            prop="visitType"
            :label="$t('patient.visitType')"
            width="100"
          >
            <template #default="{ row }">
              <el-tag
                :type="getVisitTypeTag(row.visitType)"
                size="small"
              >
                {{ formatVisitType(row.visitType) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            prop="doctor.name"
            :label="$t('patient.doctor')"
            width="120"
          >
            <template #default="{ row }">
              {{ row.doctor?.name || '-' }}
            </template>
          </el-table-column>
          <el-table-column
            prop="department.name"
            :label="$t('patient.department')"
            width="150"
          >
            <template #default="{ row }">
              {{ row.department?.name || '-' }}
            </template>
          </el-table-column>
          <el-table-column
            prop="diagnosis"
            :label="$t('patient.diagnosis')"
            min-width="200"
          >
            <template #default="{ row }">
              {{ row.diagnosis || '-' }}
            </template>
          </el-table-column>
          <el-table-column
            prop="status"
            :label="$t('common.status')"
            width="100"
          >
            <template #default="{ row }">
              <el-tag
                :type="getStatusTag(row.status)"
                size="small"
              >
                {{ row.status }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>

        <div
          v-if="medicalRecords.length === 0 && !recordsLoading"
          class="empty-records"
        >
          <el-empty :description="$t('patient.noRecordsFound')" />
        </div>

        <!-- Pagination -->
        <div
          v-if="recordsPagination.total > 0"
          class="pagination-container"
        >
          <el-pagination
            v-model:current-page="recordsPage"
            :page-size="5"
            :total="recordsPagination.total"
            layout="total, prev, pager, next"
            @current-change="loadRecords"
          />
        </div>
      </el-card>
    </template>

    <!-- Not Found -->
    <el-result
      v-else
      icon="warning"
      :title="$t('patient.notFound')"
      :sub-title="$t('patient.notFoundDesc')"
    >
      <template #extra>
        <el-button
          type="primary"
          @click="goBack"
        >
          {{ $t('common.backToList') }}
        </el-button>
      </template>
    </el-result>

    <!-- Edit Dialog -->
    <PatientFormDialog
      v-model:visible="editDialogVisible"
      :patient="patient"
      mode="edit"
      @success="handleEditSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  ArrowLeft,
  Edit,
  Delete,
  User,
  Document,
  DataAnalysis,
  List,
} from '@element-plus/icons-vue';
import { usePatientStore } from '@/stores/patient';
import { getPatientRecords } from '@/api/patient';
import type { PatientMedicalRecord, Pagination } from '@/types';
import { logger } from '@/utils';
import PatientFormDialog from './components/PatientFormDialog.vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const patientStore = usePatientStore();

const loading = ref(true);
const editDialogVisible = ref(false);

// Medical records
const medicalRecords = ref<PatientMedicalRecord[]>([]);
const recordsLoading = ref(false);
const recordsPage = ref(1);
const recordsPagination = ref<Pagination>({
  page: 1,
  pageSize: 5,
  total: 0,
  totalPages: 0,
});

// Computed
const patient = computed(() => patientStore.currentPatient);
const patientId = computed(() => parseInt(route.params.id as string, 10));

// Format functions
function formatDate(dateStr: string): string {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN');
}

function formatDateTime(dateStr: string): string {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleString('zh-CN');
}

function maskIdCard(idCard: string): string {
  if (!idCard || idCard.length < 10) return idCard;
  return idCard.slice(0, 6) + '********' + idCard.slice(-4);
}

function parseAllergies(allergies: string): string[] {
  if (!allergies) return [];
  return allergies.split(/[,;，；\n]/).map((a) => a.trim()).filter((a) => a);
}

function formatVisitType(type: string | null): string {
  const types: Record<string, string> = {
    outpatient: t('medicalRecord.outpatient'),
    emergency: t('medicalRecord.emergency'),
    inpatient: t('medicalRecord.inpatient'),
  };
  return types[type || ''] || type || '-';
}

function getVisitTypeTag(type: string | null): string {
  const tags: Record<string, string> = {
    outpatient: 'primary',
    emergency: 'danger',
    inpatient: 'warning',
  };
  return tags[type || ''] || 'info';
}

function getStatusTag(status: string): string {
  const tags: Record<string, string> = {
    draft: 'info',
    confirmed: 'success',
    archived: 'warning',
  };
  return tags[status] || 'info';
}

// Navigation
function goBack(): void {
  router.push('/patients');
}

// Load patient data
async function loadPatient(): Promise<void> {
  loading.value = true;
  try {
    await patientStore.fetchPatientById(patientId.value);
  } finally {
    loading.value = false;
  }
}

// Load medical records
async function loadRecords(page: number = 1): Promise<void> {
  recordsLoading.value = true;
  try {
    const response = await getPatientRecords(patientId.value, {
      page,
      pageSize: 5,
    });
    if (response.data) {
      medicalRecords.value = response.data.list;
      recordsPagination.value = response.data.pagination;
      recordsPage.value = page;
    }
  } catch (error) {
    logger.error('Failed to load records', error);
  } finally {
    recordsLoading.value = false;
  }
}

// Actions
function handleEdit(): void {
  editDialogVisible.value = true;
}

async function handleEditSuccess(): Promise<void> {
  editDialogVisible.value = false;
  await loadPatient();
}

async function handleDelete(): Promise<void> {
  if (!patient.value) return;

  try {
    await ElMessageBox.confirm(
      t('patient.deleteConfirmMsg', { name: patient.value.name, medicalNo: patient.value.medicalNo }),
      t('common.confirmDeleteTitle'),
      {
        confirmButtonText: t('common.delete'),
        cancelButtonText: t('common.cancel'),
        type: 'warning',
      }
    );

    const success = await patientStore.deletePatient(patient.value.id);
    if (success) {
      ElMessage.success(t('patient.patientDeleted'));
      router.push('/patients');
    }
  } catch {
    // User cancelled
  }
}

// Initialize
onMounted(async () => {
  await loadPatient();
  if (patient.value) {
    await loadRecords();
  }
});
</script>

<style scoped>
.patient-detail-page {
  padding: 20px;
}

.loading-container {
  padding: 40px;
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
  gap: 15px;
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

.info-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

.text-content {
  white-space: pre-wrap;
  line-height: 1.6;
}

.allergy-tag {
  margin-right: 8px;
  margin-bottom: 4px;
}

.stat-text {
  font-size: 18px;
  font-weight: 600;
  color: #409eff;
}

.empty-records {
  padding: 40px 0;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>
