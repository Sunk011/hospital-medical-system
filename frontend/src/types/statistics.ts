// Date range filter
export interface DateRangeFilter {
  startDate?: string;
  endDate?: string;
}

// Dashboard statistics
export interface DashboardStatistics {
  totalPatients: number;
  totalDoctors: number;
  totalDepartments: number;
  totalMedicalRecords: number;
  todayVisits: number;
  monthlyVisits: number;
  newPatientsThisMonth: number;
  pendingRecords: number;
}

// Visit statistics
export interface VisitStatistics {
  totalVisits: number;
  visitsByType: Record<string, number>;
  visitsByStatus: Record<string, number>;
  averageVisitsPerDay: number;
}

// Visit trend data point
export interface VisitTrendPoint {
  date: string;
  count: number;
  outpatient: number;
  emergency: number;
  inpatient: number;
}

// Department statistics
export interface DepartmentStatistics {
  id: number;
  name: string;
  code: string | null;
  doctorCount: number;
  recordCount: number;
  patientCount: number;
}

// Doctor statistics
export interface DoctorStatisticsItem {
  id: number;
  name: string;
  title: string | null;
  departmentName: string | null;
  recordCount: number;
  patientCount: number;
  averageRecordsPerMonth: number;
}

// Patient statistics detail
export interface PatientStatisticsDetail {
  totalPatients: number;
  newPatientsThisMonth: number;
  newPatientsLastMonth: number;
  growthRate: number;
  bloodTypeDistribution: Record<string, number>;
  ageDistribution: Record<string, number>;
  genderDistribution: Record<string, number>;
}

// Disease statistics
export interface DiseaseStatistics {
  diagnosis: string;
  count: number;
  percentage: number;
}

// Prescription statistics
export interface PrescriptionStatistics {
  totalPrescriptions: number;
  uniqueMedicines: number;
  topMedicines: Array<{
    medicineName: string;
    count: number;
    percentage: number;
  }>;
  averagePrescriptionsPerRecord: number;
}

// Full report
export interface StatisticsReport {
  generatedAt: string;
  dateRange: {
    startDate: string;
    endDate: string;
  };
  dashboard: DashboardStatistics;
  visits: VisitStatistics;
  patients: PatientStatisticsDetail;
  departments: DepartmentStatistics[];
  topDoctors: DoctorStatisticsItem[];
  topDiseases: DiseaseStatistics[];
  prescriptions: PrescriptionStatistics;
}

// Chart data types
export interface ChartDataItem {
  name: string;
  value: number;
}

export interface LineChartData {
  xAxis: string[];
  series: Array<{
    name: string;
    data: number[];
  }>;
}

export interface BarChartData {
  xAxis: string[];
  series: Array<{
    name: string;
    data: number[];
  }>;
}

export interface PieChartData {
  data: ChartDataItem[];
}
