// Visit type
export type VisitType = 'outpatient' | 'emergency' | 'inpatient';

// Record status
export type RecordStatus = 'draft' | 'confirmed' | 'archived';

// Medical record interface
export interface MedicalRecord {
  id: number;
  recordNo: string;
  patientId: number;
  doctorId: number;
  departmentId: number | null;
  visitType: VisitType | null;
  visitDate: string;
  chiefComplaint: string | null;
  presentIllness: string | null;
  physicalExam: string | null;
  diagnosis: string | null;
  treatmentPlan: string | null;
  prescription: string | null;
  notes: string | null;
  status: RecordStatus;
  createdAt: string;
  updatedAt: string;
  patient?: {
    id: number;
    medicalNo: string;
    name: string;
    gender: string | null;
    birthDate: string | null;
    phone: string | null;
  };
  doctor?: {
    id: number;
    name: string;
    title: string | null;
  };
  department?: {
    id: number;
    name: string;
  } | null;
  prescriptions?: Prescription[];
  attachments?: Attachment[];
  _count?: {
    prescriptions: number;
    attachments: number;
  };
}

// Medical record list query parameters
export interface MedicalRecordListParams {
  page?: number;
  pageSize?: number;
  recordNo?: string;
  patientId?: number;
  patientName?: string;
  doctorId?: number;
  doctorName?: string;
  departmentId?: number;
  visitType?: VisitType;
  status?: RecordStatus;
  startDate?: string;
  endDate?: string;
}

// Medical record create/update request
export interface MedicalRecordFormData {
  patientId: number;
  doctorId: number;
  departmentId?: number | null;
  visitType?: VisitType;
  visitDate: string;
  chiefComplaint?: string | null;
  presentIllness?: string | null;
  physicalExam?: string | null;
  diagnosis?: string | null;
  treatmentPlan?: string | null;
  prescription?: string | null;
  notes?: string | null;
}

// Medical record statistics
export interface MedicalRecordStatistics {
  totalRecords: number;
  recordsThisMonth: number;
  statusDistribution: Record<string, number>;
  visitTypeDistribution: Record<string, number>;
  departmentDistribution: Array<{
    departmentId: number;
    departmentName: string;
    count: number;
  }>;
}

// Prescription interface
export interface Prescription {
  id: number;
  recordId: number;
  medicineName: string;
  specification: string | null;
  dosage: string | null;
  frequency: string | null;
  duration: string | null;
  quantity: number | null;
  notes: string | null;
  createdAt: string;
}

// Prescription create/update request
export interface PrescriptionFormData {
  recordId?: number;
  medicineName: string;
  specification?: string | null;
  dosage?: string | null;
  frequency?: string | null;
  duration?: string | null;
  quantity?: number | null;
  notes?: string | null;
}

// Attachment interface
export interface Attachment {
  id: number;
  recordId: number;
  fileName: string;
  filePath: string;
  fileType: string | null;
  fileSize: number | null;
  description: string | null;
  createdAt: string;
}

// Attachment update request
export interface AttachmentUpdateData {
  description?: string | null;
}

// Visit type options for select
export const visitTypeOptions = [
  { value: 'outpatient', label: 'Outpatient' },
  { value: 'emergency', label: 'Emergency' },
  { value: 'inpatient', label: 'Inpatient' },
];

// Record status options for select
export const recordStatusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'archived', label: 'Archived' },
];

// Status color mapping
export const statusColorMap: Record<RecordStatus, string> = {
  draft: 'info',
  confirmed: 'success',
  archived: 'warning',
};

// Visit type color mapping
export const visitTypeColorMap: Record<VisitType, string> = {
  outpatient: 'primary',
  emergency: 'danger',
  inpatient: 'warning',
};
