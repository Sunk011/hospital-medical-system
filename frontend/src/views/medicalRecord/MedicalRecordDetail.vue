<template>
  <div class="medical-record-detail-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-left">
        <el-button
          :icon="ArrowLeft"
          @click="goBack"
        >
          {{ t('common.back') }}
        </el-button>
        <h2>{{ t('medicalRecord.recordDetail') }}</h2>
      </div>
      <div class="header-right">
        <el-button
          v-if="record?.status === 'draft'"
          type="warning"
          :icon="Edit"
          @click="handleEdit"
        >
          {{ t('common.edit') }}
        </el-button>
        <el-button
          v-if="record?.status === 'draft'"
          type="success"
          @click="handleConfirm"
        >
          {{ t('medicalRecord.confirmRecord') }}
        </el-button>
        <el-button
          v-if="record?.status === 'confirmed'"
          type="info"
          @click="handleArchive"
        >
          {{ t('medicalRecord.archiveRecord') }}
        </el-button>
      </div>
    </div>

    <div
      v-loading="medicalRecordStore.loading"
      class="content-wrapper"
    >
      <template v-if="record">
        <!-- Basic Information -->
        <el-card class="info-card">
          <template #header>
            <div class="card-header">
              <span>{{ t('common.basicInfo') }}</span>
              <el-tag
                :type="statusColorMap[record.status as RecordStatus] || 'info'"
              >
                {{ getStatusLabel(record.status) }}
              </el-tag>
            </div>
          </template>

          <el-descriptions
            :column="3"
            border
          >
            <el-descriptions-item :label="t('medicalRecord.recordNo')">
              {{ record.recordNo }}
            </el-descriptions-item>
            <el-descriptions-item :label="t('medicalRecord.visitType')">
              <el-tag
                v-if="record.visitType"
                :type="visitTypeColorMap[record.visitType as VisitType] || 'info'"
                size="small"
              >
                {{ getVisitTypeLabel(record.visitType) }}
              </el-tag>
              <span v-else>-</span>
            </el-descriptions-item>
            <el-descriptions-item :label="t('medicalRecord.visitDate')">
              {{ formatDate(record.visitDate) }}
            </el-descriptions-item>
            <el-descriptions-item :label="t('medicalRecord.patient')">
              <router-link
                v-if="record.patient"
                :to="`/patients/${record.patient.id}`"
                class="link"
              >
                {{ record.patient.name }} ({{ record.patient.medicalNo }})
              </router-link>
              <span v-else>-</span>
            </el-descriptions-item>
            <el-descriptions-item :label="t('medicalRecord.doctor')">
              <router-link
                v-if="record.doctor"
                :to="`/doctors/${record.doctor.id}`"
                class="link"
              >
                {{ record.doctor.name }}
                <span v-if="record.doctor.title">({{ record.doctor.title }})</span>
              </router-link>
              <span v-else>-</span>
            </el-descriptions-item>
            <el-descriptions-item :label="t('medicalRecord.department')">
              {{ record.department?.name || '-' }}
            </el-descriptions-item>
            <el-descriptions-item :label="t('common.createdAt')">
              {{ formatDateTime(record.createdAt) }}
            </el-descriptions-item>
            <el-descriptions-item :label="t('common.updatedAt')">
              {{ formatDateTime(record.updatedAt) }}
            </el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- Medical Information -->
        <el-card class="info-card">
          <template #header>
            <span>{{ t('medicalRecord.medicalInfo') }}</span>
          </template>

          <el-descriptions
            :column="1"
            border
          >
            <el-descriptions-item :label="t('medicalRecord.chiefComplaint')">
              <div class="text-content">
                {{ record.chiefComplaint || '-' }}
              </div>
            </el-descriptions-item>
            <el-descriptions-item :label="t('medicalRecord.presentIllness')">
              <div class="text-content">
                {{ record.presentIllness || '-' }}
              </div>
            </el-descriptions-item>
            <el-descriptions-item :label="t('medicalRecord.physicalExam')">
              <div class="text-content">
                {{ record.physicalExam || '-' }}
              </div>
            </el-descriptions-item>
            <el-descriptions-item :label="t('medicalRecord.diagnosis')">
              <div class="text-content diagnosis">
                {{ record.diagnosis || '-' }}
              </div>
            </el-descriptions-item>
            <el-descriptions-item :label="t('medicalRecord.treatmentPlan')">
              <div class="text-content">
                {{ record.treatmentPlan || '-' }}
              </div>
            </el-descriptions-item>
            <el-descriptions-item :label="t('medicalRecord.notes')">
              <div class="text-content">
                {{ record.notes || '-' }}
              </div>
            </el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- Prescriptions -->
        <el-card class="info-card">
          <template #header>
            <div class="card-header">
              <span>{{ t('medicalRecord.prescriptions') }} ({{ medicalRecordStore.prescriptions.length }})</span>
              <el-button
                v-if="record.status === 'draft'"
                type="primary"
                size="small"
                :icon="Plus"
                @click="handleAddPrescription"
              >
                {{ t('medicalRecord.addPrescription') }}
              </el-button>
            </div>
          </template>

          <el-table
            v-loading="medicalRecordStore.prescriptionLoading"
            :data="medicalRecordStore.prescriptions"
            stripe
            border
            :empty-text="t('medicalRecord.noPrescriptions')"
          >
            <el-table-column
              prop="medicineName"
              :label="t('prescription.medicineName')"
              min-width="150"
            />
            <el-table-column
              prop="specification"
              :label="t('prescription.specification')"
              width="120"
            >
              <template #default="{ row }">
                {{ row.specification || '-' }}
              </template>
            </el-table-column>
            <el-table-column
              prop="dosage"
              :label="t('prescription.dosage')"
              width="100"
            >
              <template #default="{ row }">
                {{ row.dosage || '-' }}
              </template>
            </el-table-column>
            <el-table-column
              prop="frequency"
              :label="t('prescription.frequency')"
              width="120"
            >
              <template #default="{ row }">
                {{ row.frequency || '-' }}
              </template>
            </el-table-column>
            <el-table-column
              prop="duration"
              :label="t('prescription.duration')"
              width="100"
            >
              <template #default="{ row }">
                {{ row.duration || '-' }}
              </template>
            </el-table-column>
            <el-table-column
              prop="quantity"
              :label="t('prescription.quantity')"
              width="80"
              align="center"
            >
              <template #default="{ row }">
                {{ row.quantity || '-' }}
              </template>
            </el-table-column>
            <el-table-column
              prop="notes"
              :label="t('prescription.notes')"
              min-width="150"
              show-overflow-tooltip
            >
              <template #default="{ row }">
                {{ row.notes || '-' }}
              </template>
            </el-table-column>
            <el-table-column
              v-if="record.status === 'draft'"
              :label="t('common.actions')"
              width="150"
              align="center"
            >
              <template #default="{ row }">
                <el-button
                  type="warning"
                  size="small"
                  :icon="Edit"
                  @click="handleEditPrescription(row)"
                />
                <el-button
                  type="danger"
                  size="small"
                  :icon="Delete"
                  @click="handleDeletePrescription(row)"
                />
              </template>
            </el-table-column>
          </el-table>
        </el-card>

        <!-- Attachments -->
        <el-card class="info-card">
          <template #header>
            <div class="card-header">
              <span>{{ t('medicalRecord.attachments') }} ({{ medicalRecordStore.attachments.length }})</span>
              <el-button
                v-if="record.status === 'draft'"
                type="primary"
                size="small"
                :icon="Upload"
                @click="handleUploadAttachment"
              >
                {{ t('medicalRecord.uploadFile') }}
              </el-button>
            </div>
          </template>

          <el-table
            v-loading="medicalRecordStore.attachmentLoading"
            :data="medicalRecordStore.attachments"
            stripe
            border
            :empty-text="t('medicalRecord.noAttachments')"
          >
            <el-table-column
              prop="fileName"
              :label="t('attachment.fileName')"
              min-width="200"
            />
            <el-table-column
              prop="fileType"
              :label="t('attachment.fileType')"
              width="120"
            >
              <template #default="{ row }">
                {{ row.fileType || '-' }}
              </template>
            </el-table-column>
            <el-table-column
              prop="fileSize"
              :label="t('attachment.fileSize')"
              width="100"
            >
              <template #default="{ row }">
                {{ formatFileSize(row.fileSize) }}
              </template>
            </el-table-column>
            <el-table-column
              prop="description"
              :label="t('attachment.description')"
              min-width="150"
              show-overflow-tooltip
            >
              <template #default="{ row }">
                {{ row.description || '-' }}
              </template>
            </el-table-column>
            <el-table-column
              prop="createdAt"
              :label="t('attachment.uploadedAt')"
              width="160"
            >
              <template #default="{ row }">
                {{ formatDateTime(row.createdAt) }}
              </template>
            </el-table-column>
            <el-table-column
              :label="t('common.actions')"
              width="200"
              align="center"
            >
              <template #default="{ row }">
                <el-button
                  type="primary"
                  size="small"
                  :icon="Download"
                  @click="handleDownloadAttachment(row)"
                >
                  {{ t('common.download') }}
                </el-button>
                <el-button
                  v-if="record.status === 'draft'"
                  type="danger"
                  size="small"
                  :icon="Delete"
                  @click="handleDeleteAttachment(row)"
                />
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </template>

      <el-empty
        v-else
        :description="t('medicalRecord.notFound')"
      />
    </div>

    <!-- Edit Dialog -->
    <MedicalRecordFormDialog
      v-model:visible="formDialogVisible"
      :record="record"
      mode="edit"
      @success="handleFormSuccess"
    />

    <!-- Prescription Dialog -->
    <PrescriptionDialog
      v-model:visible="prescriptionDialogVisible"
      :prescription="selectedPrescription"
      :record-id="record?.id || 0"
      :mode="prescriptionMode"
      @success="handlePrescriptionSuccess"
    />

    <!-- Upload Dialog -->
    <AttachmentUploadDialog
      v-model:visible="uploadDialogVisible"
      :record-id="record?.id || 0"
      @success="handleUploadSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  ArrowLeft,
  Edit,
  Plus,
  Delete,
  Upload,
  Download,
} from '@element-plus/icons-vue';
import { useMedicalRecordStore } from '@/stores/medicalRecord';
import type {
  Prescription,
  Attachment,
  VisitType,
  RecordStatus,
} from '@/types';
import {
  statusColorMap,
  visitTypeColorMap,
} from '@/types';
import { downloadAttachment } from '@/api/medicalRecord';
import MedicalRecordFormDialog from './components/MedicalRecordFormDialog.vue';
import PrescriptionDialog from './components/PrescriptionDialog.vue';
import AttachmentUploadDialog from './components/AttachmentUploadDialog.vue';

const route = useRoute();
const router = useRouter();
const medicalRecordStore = useMedicalRecordStore();
const { t } = useI18n();

// Record data
const record = computed(() => medicalRecordStore.currentRecord);

// Dialog states
const formDialogVisible = ref(false);
const prescriptionDialogVisible = ref(false);
const uploadDialogVisible = ref(false);
const prescriptionMode = ref<'create' | 'edit'>('create');
const selectedPrescription = ref<Prescription | null>(null);

// Format date
function formatDate(dateStr: string): string {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN');
}

// Format datetime
function formatDateTime(dateStr: string): string {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleString('zh-CN');
}

// Format file size
function formatFileSize(bytes: number | null): string {
  if (!bytes) return '-';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Get visit type label
function getVisitTypeLabel(type: string | null): string {
  if (!type) return '-';
  const typeMap: Record<string, string> = {
    outpatient: t('medicalRecord.outpatient'),
    emergency: t('medicalRecord.emergency'),
    inpatient: t('medicalRecord.inpatient'),
  };
  return typeMap[type] || type;
}

// Get status label
function getStatusLabel(status: string): string {
  const statusMap: Record<string, string> = {
    draft: t('medicalRecord.draft'),
    confirmed: t('medicalRecord.confirmed'),
    archived: t('medicalRecord.archived'),
  };
  return statusMap[status] || status;
}

// Navigation
function goBack(): void {
  router.push('/medical-records');
}

// Load record data
async function loadRecord(): Promise<void> {
  const id = parseInt(route.params.id as string, 10);
  if (isNaN(id)) {
    ElMessage.error(t('medicalRecord.invalidRecordId'));
    goBack();
    return;
  }

  const success = await medicalRecordStore.fetchRecordById(id);
  if (!success) {
    ElMessage.error(t('medicalRecord.loadFailed'));
  }

  // Load prescriptions and attachments
  await Promise.all([
    medicalRecordStore.fetchPrescriptions(id),
    medicalRecordStore.fetchAttachments(id),
  ]);
}

// Edit record
function handleEdit(): void {
  formDialogVisible.value = true;
}

// Confirm record
async function handleConfirm(): Promise<void> {
  if (!record.value) return;

  try {
    await ElMessageBox.confirm(
      t('medicalRecord.confirmRecordMsg'),
      t('medicalRecord.confirmRecord'),
      {
        confirmButtonText: t('common.confirm'),
        cancelButtonText: t('common.cancel'),
        type: 'warning',
      }
    );

    const result = await medicalRecordStore.updateRecordStatus(record.value.id, 'confirmed');
    if (result) {
      ElMessage.success(t('medicalRecord.confirmedSuccess'));
    }
  } catch {
    // User cancelled
  }
}

// Archive record
async function handleArchive(): Promise<void> {
  if (!record.value) return;

  try {
    await ElMessageBox.confirm(
      t('medicalRecord.archiveRecordMsg'),
      t('medicalRecord.archiveRecord'),
      {
        confirmButtonText: t('common.confirm'),
        cancelButtonText: t('common.cancel'),
        type: 'warning',
      }
    );

    const result = await medicalRecordStore.updateRecordStatus(record.value.id, 'archived');
    if (result) {
      ElMessage.success(t('medicalRecord.archivedSuccess'));
    }
  } catch {
    // User cancelled
  }
}

function handleFormSuccess(): void {
  formDialogVisible.value = false;
  loadRecord();
}

// Prescription handlers
function handleAddPrescription(): void {
  prescriptionMode.value = 'create';
  selectedPrescription.value = null;
  prescriptionDialogVisible.value = true;
}

function handleEditPrescription(prescription: Prescription): void {
  prescriptionMode.value = 'edit';
  selectedPrescription.value = prescription;
  prescriptionDialogVisible.value = true;
}

async function handleDeletePrescription(prescription: Prescription): Promise<void> {
  try {
    await ElMessageBox.confirm(
      t('prescription.deleteConfirmMsg', { name: prescription.medicineName }),
      t('common.confirmDeleteTitle'),
      {
        confirmButtonText: t('common.delete'),
        cancelButtonText: t('common.cancel'),
        type: 'warning',
      }
    );

    const success = await medicalRecordStore.removePrescription(prescription.id);
    if (success) {
      ElMessage.success(t('prescription.deleteSuccess'));
    }
  } catch {
    // User cancelled
  }
}

function handlePrescriptionSuccess(): void {
  prescriptionDialogVisible.value = false;
}

// Attachment handlers
function handleUploadAttachment(): void {
  uploadDialogVisible.value = true;
}

async function handleDownloadAttachment(attachment: Attachment): Promise<void> {
  try {
    await downloadAttachment(attachment.id, attachment.fileName);
    ElMessage.success(t('attachment.downloadStarted'));
  } catch {
    ElMessage.error(t('attachment.downloadFailed'));
  }
}

async function handleDeleteAttachment(attachment: Attachment): Promise<void> {
  try {
    await ElMessageBox.confirm(
      t('attachment.deleteConfirmMsg', { name: attachment.fileName }),
      t('common.confirmDeleteTitle'),
      {
        confirmButtonText: t('common.delete'),
        cancelButtonText: t('common.cancel'),
        type: 'warning',
      }
    );

    const success = await medicalRecordStore.removeAttachment(attachment.id);
    if (success) {
      ElMessage.success(t('attachment.deleteSuccess'));
    }
  } catch {
    // User cancelled
  }
}

function handleUploadSuccess(): void {
  uploadDialogVisible.value = false;
}

// Initialize
onMounted(() => {
  loadRecord();
});
</script>

<style scoped>
.medical-record-detail-page {
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

.content-wrapper {
  min-height: 400px;
}

.info-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.text-content {
  white-space: pre-wrap;
  word-break: break-word;
  min-height: 20px;
}

.text-content.diagnosis {
  font-weight: 600;
  color: #409eff;
}

.link {
  color: #409eff;
  text-decoration: none;
}

.link:hover {
  text-decoration: underline;
}
</style>
