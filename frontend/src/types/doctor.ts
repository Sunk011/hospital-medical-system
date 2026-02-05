// Doctor title type
export type DoctorTitle =
  | 'Chief Physician'
  | 'Associate Chief Physician'
  | 'Attending Physician'
  | 'Resident Physician'
  | 'Intern'
  | string;

// Department interface
export interface Department {
  id: number;
  name: string;
  code: string | null;
  description?: string | null;
  status?: number;
  doctorCount?: number;
  createdAt?: string;
}

// Department list item (for dropdown)
export interface DepartmentListItem {
  id: number;
  name: string;
  code: string | null;
}

// Doctor user info
export interface DoctorUser {
  id: number;
  username: string;
  email: string | null;
  phone: string | null;
  status: string;
}

// Doctor interface
export interface Doctor {
  id: number;
  userId: number;
  name: string;
  title: string | null;
  specialty: string | null;
  licenseNo: string | null;
  introduction: string | null;
  createdAt: string;
  department: {
    id: number;
    name: string;
  } | null;
  user: DoctorUser;
  recordsCount?: number;
}

// Doctor list query parameters
export interface DoctorListParams {
  page?: number;
  pageSize?: number;
  name?: string;
  departmentId?: number;
  title?: string;
  specialty?: string;
  licenseNo?: string;
}

// Doctor create request
export interface DoctorCreateData {
  userId: number;
  name: string;
  departmentId?: number | null;
  title?: string | null;
  specialty?: string | null;
  licenseNo?: string | null;
  introduction?: string | null;
}

// Doctor update request
export interface DoctorUpdateData {
  name: string;
  departmentId?: number | null;
  title?: string | null;
  specialty?: string | null;
  licenseNo?: string | null;
  introduction?: string | null;
}

// Doctor statistics
export interface DoctorStatistics {
  totalDoctors: number;
  newDoctorsThisMonth: number;
  departmentDistribution: Record<string, number>;
  titleDistribution: Record<string, number>;
}

// Doctor list item (simplified for dropdown)
export interface DoctorListItem {
  id: number;
  name: string;
  title: string | null;
}
