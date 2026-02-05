// Gender type
export type Gender = 'M' | 'F';

// Blood type
export type BloodType = 'A' | 'B' | 'AB' | 'O' | 'Unknown';

// Patient interface
export interface Patient {
  id: number;
  medicalNo: string;
  name: string;
  idCard: string | null;
  gender: Gender | null;
  birthDate: string | null;
  age: number | null;
  phone: string | null;
  emergencyContact: string | null;
  emergencyPhone: string | null;
  address: string | null;
  bloodType: BloodType | null;
  allergies: string | null;
  medicalHistory: string | null;
  createdAt: string;
  updatedAt: string;
  recordsCount?: number;
  lastVisitDate?: string | null;
}

// Patient list query parameters
export interface PatientListParams {
  page?: number;
  pageSize?: number;
  name?: string;
  idCard?: string;
  phone?: string;
  medicalNo?: string;
  gender?: Gender;
  bloodType?: BloodType;
}

// Patient create/update request
export interface PatientFormData {
  name: string;
  idCard?: string | null;
  gender?: Gender | null;
  birthDate?: string | null;
  phone?: string | null;
  emergencyContact?: string | null;
  emergencyPhone?: string | null;
  address?: string | null;
  bloodType?: BloodType | null;
  allergies?: string | null;
  medicalHistory?: string | null;
}

// Patient statistics
export interface PatientStatistics {
  totalPatients: number;
  newPatientsThisMonth: number;
  bloodTypeDistribution: Record<string, number>;
  ageDistribution: Record<string, number>;
  genderDistribution: Record<string, number>;
}

// Patient medical record (simplified)
export interface PatientMedicalRecord {
  id: number;
  recordNo: string;
  visitType: string | null;
  visitDate: string;
  diagnosis: string | null;
  status: string;
  doctor: {
    id: number;
    name: string;
  } | null;
  department: {
    id: number;
    name: string;
  } | null;
  createdAt: string;
}

// Patient history response
export interface PatientHistory {
  patient: Patient;
  visitStats: {
    totalVisits: number;
    lastVisitDate: string | null;
    visitsByType: Record<string, number>;
  };
  recentDiagnoses: string[];
}
