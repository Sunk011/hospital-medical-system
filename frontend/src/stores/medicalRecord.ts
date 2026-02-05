import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type {
  MedicalRecord,
  MedicalRecordListParams,
  MedicalRecordFormData,
  MedicalRecordStatistics,
  Prescription,
  PrescriptionFormData,
  Attachment,
  AttachmentUpdateData,
  Pagination,
  RecordStatus,
} from '@/types';
import {
  getMedicalRecords as getMedicalRecordsApi,
  getMedicalRecordById as getMedicalRecordByIdApi,
  createMedicalRecord as createMedicalRecordApi,
  updateMedicalRecord as updateMedicalRecordApi,
  updateMedicalRecordStatus as updateMedicalRecordStatusApi,
  deleteMedicalRecord as deleteMedicalRecordApi,
  getMedicalRecordStatistics as getMedicalRecordStatisticsApi,
  getPrescriptionsByRecordId as getPrescriptionsByRecordIdApi,
  createPrescription as createPrescriptionApi,
  createPrescriptions as createPrescriptionsApi,
  updatePrescription as updatePrescriptionApi,
  deletePrescription as deletePrescriptionApi,
  getAttachmentsByRecordId as getAttachmentsByRecordIdApi,
  uploadAttachment as uploadAttachmentApi,
  updateAttachment as updateAttachmentApi,
  deleteAttachment as deleteAttachmentApi,
} from '@/api/medicalRecord';
import { logger } from '@/utils';

export const useMedicalRecordStore = defineStore('medicalRecord', () => {
  // State
  const records = ref<MedicalRecord[]>([]);
  const currentRecord = ref<MedicalRecord | null>(null);
  const prescriptions = ref<Prescription[]>([]);
  const attachments = ref<Attachment[]>([]);
  const statistics = ref<MedicalRecordStatistics | null>(null);
  const loading = ref(false);
  const prescriptionLoading = ref(false);
  const attachmentLoading = ref(false);
  const pagination = ref<Pagination>({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  });
  const filters = ref<MedicalRecordListParams>({
    page: 1,
    pageSize: 10,
  });

  // Getters
  const hasRecords = computed(() => records.value.length > 0);
  const totalRecords = computed(() => pagination.value.total);
  const hasPrescriptions = computed(() => prescriptions.value.length > 0);
  const hasAttachments = computed(() => attachments.value.length > 0);

  // ==================== Medical Record Actions ====================

  async function fetchRecords(params?: MedicalRecordListParams): Promise<boolean> {
    loading.value = true;
    try {
      const queryParams = { ...filters.value, ...params };
      filters.value = queryParams;

      const response = await getMedicalRecordsApi(queryParams);
      if (response.data) {
        records.value = response.data.list;
        pagination.value = response.data.pagination;
        return true;
      }
      return false;
    } catch (error) {
      logger.error('Failed to fetch medical records', error);
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function fetchRecordById(id: number): Promise<boolean> {
    loading.value = true;
    try {
      const response = await getMedicalRecordByIdApi(id);
      if (response.data) {
        currentRecord.value = response.data;
        // Also set prescriptions and attachments if included
        if (response.data.prescriptions) {
          prescriptions.value = response.data.prescriptions;
        }
        if (response.data.attachments) {
          attachments.value = response.data.attachments;
        }
        return true;
      }
      return false;
    } catch (error) {
      logger.error('Failed to fetch medical record', error);
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function createRecord(data: MedicalRecordFormData): Promise<MedicalRecord | null> {
    loading.value = true;
    try {
      const response = await createMedicalRecordApi(data);
      if (response.data) {
        await fetchRecords();
        return response.data;
      }
      return null;
    } catch (error) {
      logger.error('Failed to create medical record', error);
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function updateRecord(
    id: number,
    data: Partial<MedicalRecordFormData>
  ): Promise<MedicalRecord | null> {
    loading.value = true;
    try {
      const response = await updateMedicalRecordApi(id, data);
      if (response.data) {
        if (currentRecord.value?.id === id) {
          currentRecord.value = response.data;
        }
        await fetchRecords();
        return response.data;
      }
      return null;
    } catch (error) {
      logger.error('Failed to update medical record', error);
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function updateRecordStatus(
    id: number,
    status: RecordStatus
  ): Promise<MedicalRecord | null> {
    loading.value = true;
    try {
      const response = await updateMedicalRecordStatusApi(id, status);
      if (response.data) {
        if (currentRecord.value?.id === id) {
          currentRecord.value = response.data;
        }
        await fetchRecords();
        return response.data;
      }
      return null;
    } catch (error) {
      logger.error('Failed to update medical record status', error);
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function deleteRecord(id: number): Promise<boolean> {
    loading.value = true;
    try {
      await deleteMedicalRecordApi(id);
      if (currentRecord.value?.id === id) {
        currentRecord.value = null;
      }
      await fetchRecords();
      return true;
    } catch (error) {
      logger.error('Failed to delete medical record', error);
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function fetchStatistics(): Promise<boolean> {
    try {
      const response = await getMedicalRecordStatisticsApi();
      if (response.data) {
        statistics.value = response.data;
        return true;
      }
      return false;
    } catch (error) {
      logger.error('Failed to fetch statistics', error);
      return false;
    }
  }

  // ==================== Prescription Actions ====================

  async function fetchPrescriptions(recordId: number): Promise<boolean> {
    prescriptionLoading.value = true;
    try {
      const response = await getPrescriptionsByRecordIdApi(recordId);
      if (response.data) {
        prescriptions.value = response.data;
        return true;
      }
      return false;
    } catch (error) {
      logger.error('Failed to fetch prescriptions', error);
      return false;
    } finally {
      prescriptionLoading.value = false;
    }
  }

  async function addPrescription(data: PrescriptionFormData): Promise<Prescription | null> {
    prescriptionLoading.value = true;
    try {
      const response = await createPrescriptionApi(data);
      if (response.data) {
        prescriptions.value.push(response.data);
        return response.data;
      }
      return null;
    } catch (error) {
      logger.error('Failed to create prescription', error);
      return null;
    } finally {
      prescriptionLoading.value = false;
    }
  }

  async function addPrescriptions(
    recordId: number,
    items: Omit<PrescriptionFormData, 'recordId'>[]
  ): Promise<Prescription[] | null> {
    prescriptionLoading.value = true;
    try {
      const response = await createPrescriptionsApi(recordId, items);
      if (response.data) {
        prescriptions.value.push(...response.data);
        return response.data;
      }
      return null;
    } catch (error) {
      logger.error('Failed to create prescriptions', error);
      return null;
    } finally {
      prescriptionLoading.value = false;
    }
  }

  async function editPrescription(
    id: number,
    data: Partial<PrescriptionFormData>
  ): Promise<Prescription | null> {
    prescriptionLoading.value = true;
    try {
      const response = await updatePrescriptionApi(id, data);
      if (response.data) {
        const index = prescriptions.value.findIndex((p) => p.id === id);
        if (index !== -1) {
          prescriptions.value[index] = response.data;
        }
        return response.data;
      }
      return null;
    } catch (error) {
      logger.error('Failed to update prescription', error);
      return null;
    } finally {
      prescriptionLoading.value = false;
    }
  }

  async function removePrescription(id: number): Promise<boolean> {
    prescriptionLoading.value = true;
    try {
      await deletePrescriptionApi(id);
      prescriptions.value = prescriptions.value.filter((p) => p.id !== id);
      return true;
    } catch (error) {
      logger.error('Failed to delete prescription', error);
      return false;
    } finally {
      prescriptionLoading.value = false;
    }
  }

  // ==================== Attachment Actions ====================

  async function fetchAttachments(recordId: number): Promise<boolean> {
    attachmentLoading.value = true;
    try {
      const response = await getAttachmentsByRecordIdApi(recordId);
      if (response.data) {
        attachments.value = response.data;
        return true;
      }
      return false;
    } catch (error) {
      logger.error('Failed to fetch attachments', error);
      return false;
    } finally {
      attachmentLoading.value = false;
    }
  }

  async function uploadFile(
    recordId: number,
    file: File,
    description?: string
  ): Promise<Attachment | null> {
    attachmentLoading.value = true;
    try {
      const response = await uploadAttachmentApi(recordId, file, description);
      if (response.data) {
        attachments.value.push(response.data);
        return response.data;
      }
      return null;
    } catch (error) {
      logger.error('Failed to upload attachment', error);
      return null;
    } finally {
      attachmentLoading.value = false;
    }
  }

  async function editAttachment(
    id: number,
    data: AttachmentUpdateData
  ): Promise<Attachment | null> {
    attachmentLoading.value = true;
    try {
      const response = await updateAttachmentApi(id, data);
      if (response.data) {
        const index = attachments.value.findIndex((a) => a.id === id);
        if (index !== -1) {
          attachments.value[index] = response.data;
        }
        return response.data;
      }
      return null;
    } catch (error) {
      logger.error('Failed to update attachment', error);
      return null;
    } finally {
      attachmentLoading.value = false;
    }
  }

  async function removeAttachment(id: number): Promise<boolean> {
    attachmentLoading.value = true;
    try {
      await deleteAttachmentApi(id);
      attachments.value = attachments.value.filter((a) => a.id !== id);
      return true;
    } catch (error) {
      logger.error('Failed to delete attachment', error);
      return false;
    } finally {
      attachmentLoading.value = false;
    }
  }

  // ==================== Utility Actions ====================

  function setFilters(newFilters: MedicalRecordListParams): void {
    filters.value = { ...filters.value, ...newFilters };
  }

  function clearFilters(): void {
    filters.value = {
      page: 1,
      pageSize: 10,
    };
  }

  function clearCurrentRecord(): void {
    currentRecord.value = null;
    prescriptions.value = [];
    attachments.value = [];
  }

  return {
    // State
    records,
    currentRecord,
    prescriptions,
    attachments,
    statistics,
    loading,
    prescriptionLoading,
    attachmentLoading,
    pagination,
    filters,
    // Getters
    hasRecords,
    totalRecords,
    hasPrescriptions,
    hasAttachments,
    // Medical Record Actions
    fetchRecords,
    fetchRecordById,
    createRecord,
    updateRecord,
    updateRecordStatus,
    deleteRecord,
    fetchStatistics,
    // Prescription Actions
    fetchPrescriptions,
    addPrescription,
    addPrescriptions,
    editPrescription,
    removePrescription,
    // Attachment Actions
    fetchAttachments,
    uploadFile,
    editAttachment,
    removeAttachment,
    // Utility Actions
    setFilters,
    clearFilters,
    clearCurrentRecord,
  };
});
