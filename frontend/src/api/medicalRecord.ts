import request from '@/utils/request';
import type {
  ApiResponse,
  PaginatedResponse,
  MedicalRecord,
  MedicalRecordListParams,
  MedicalRecordFormData,
  MedicalRecordStatistics,
  Prescription,
  PrescriptionFormData,
  Attachment,
  AttachmentUpdateData,
  RecordStatus,
} from '@/types';

// ==================== Medical Record APIs ====================

/**
 * Get medical record list with pagination and filtering
 */
export function getMedicalRecords(
  params: MedicalRecordListParams
): Promise<ApiResponse<PaginatedResponse<MedicalRecord>>> {
  return request.get('/medical-records', { params }).then((res) => res.data);
}

/**
 * Get medical record by ID
 */
export function getMedicalRecordById(id: number): Promise<ApiResponse<MedicalRecord>> {
  return request.get(`/medical-records/${id}`).then((res) => res.data);
}

/**
 * Create new medical record
 */
export function createMedicalRecord(data: MedicalRecordFormData): Promise<ApiResponse<MedicalRecord>> {
  return request.post('/medical-records', data).then((res) => res.data);
}

/**
 * Update medical record
 */
export function updateMedicalRecord(
  id: number,
  data: Partial<MedicalRecordFormData>
): Promise<ApiResponse<MedicalRecord>> {
  return request.put(`/medical-records/${id}`, data).then((res) => res.data);
}

/**
 * Update medical record status
 */
export function updateMedicalRecordStatus(
  id: number,
  status: RecordStatus
): Promise<ApiResponse<MedicalRecord>> {
  return request.patch(`/medical-records/${id}/status`, { status }).then((res) => res.data);
}

/**
 * Delete medical record
 */
export function deleteMedicalRecord(id: number): Promise<ApiResponse<null>> {
  return request.delete(`/medical-records/${id}`).then((res) => res.data);
}

/**
 * Get medical record statistics
 */
export function getMedicalRecordStatistics(): Promise<ApiResponse<MedicalRecordStatistics>> {
  return request.get('/medical-records/statistics').then((res) => res.data);
}

// ==================== Prescription APIs ====================

/**
 * Get prescriptions by medical record ID
 */
export function getPrescriptionsByRecordId(recordId: number): Promise<ApiResponse<Prescription[]>> {
  return request.get(`/medical-records/${recordId}/prescriptions`).then((res) => res.data);
}

/**
 * Get prescription by ID
 */
export function getPrescriptionById(id: number): Promise<ApiResponse<Prescription>> {
  return request.get(`/prescriptions/${id}`).then((res) => res.data);
}

/**
 * Create new prescription
 */
export function createPrescription(data: PrescriptionFormData): Promise<ApiResponse<Prescription>> {
  return request.post('/prescriptions', data).then((res) => res.data);
}

/**
 * Create multiple prescriptions at once
 */
export function createPrescriptions(
  recordId: number,
  prescriptions: Omit<PrescriptionFormData, 'recordId'>[]
): Promise<ApiResponse<Prescription[]>> {
  return request
    .post(`/medical-records/${recordId}/prescriptions/batch`, { prescriptions })
    .then((res) => res.data);
}

/**
 * Update prescription
 */
export function updatePrescription(
  id: number,
  data: Partial<PrescriptionFormData>
): Promise<ApiResponse<Prescription>> {
  return request.put(`/prescriptions/${id}`, data).then((res) => res.data);
}

/**
 * Delete prescription
 */
export function deletePrescription(id: number): Promise<ApiResponse<null>> {
  return request.delete(`/prescriptions/${id}`).then((res) => res.data);
}

/**
 * Delete all prescriptions for a medical record
 */
export function deletePrescriptionsByRecordId(
  recordId: number
): Promise<ApiResponse<{ deletedCount: number }>> {
  return request.delete(`/medical-records/${recordId}/prescriptions`).then((res) => res.data);
}

// ==================== Attachment APIs ====================

/**
 * Get attachments by medical record ID
 */
export function getAttachmentsByRecordId(recordId: number): Promise<ApiResponse<Attachment[]>> {
  return request.get(`/medical-records/${recordId}/attachments`).then((res) => res.data);
}

/**
 * Get attachment by ID
 */
export function getAttachmentById(id: number): Promise<ApiResponse<Attachment>> {
  return request.get(`/attachments/${id}`).then((res) => res.data);
}

/**
 * Upload attachment for a medical record
 */
export function uploadAttachment(
  recordId: number,
  file: File,
  description?: string
): Promise<ApiResponse<Attachment>> {
  const formData = new FormData();
  formData.append('file', file);
  if (description) {
    formData.append('description', description);
  }

  return request
    .post(`/medical-records/${recordId}/attachments`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    .then((res) => res.data);
}

/**
 * Update attachment description
 */
export function updateAttachment(
  id: number,
  data: AttachmentUpdateData
): Promise<ApiResponse<Attachment>> {
  return request.put(`/attachments/${id}`, data).then((res) => res.data);
}

/**
 * Delete attachment
 */
export function deleteAttachment(id: number): Promise<ApiResponse<null>> {
  return request.delete(`/attachments/${id}`).then((res) => res.data);
}

/**
 * Get attachment download URL
 */
export function getAttachmentDownloadUrl(id: number): string {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api/v1';
  return `${baseUrl}/attachments/${id}/download`;
}

/**
 * Download attachment
 */
export async function downloadAttachment(id: number, fileName: string): Promise<void> {
  const response = await request.get(`/attachments/${id}/download`, {
    responseType: 'blob',
  });

  // Create download link
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
