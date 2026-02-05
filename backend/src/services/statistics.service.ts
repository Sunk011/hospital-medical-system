import prisma from '../config/database';
import { logger } from '../utils';

// Date range filter interface
export interface DateRangeFilter {
  startDate?: Date | string;
  endDate?: Date | string;
}

// Dashboard statistics interface
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

// Visit statistics interface
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

// Department statistics interface
export interface DepartmentStatistics {
  id: number;
  name: string;
  code: string | null;
  doctorCount: number;
  recordCount: number;
  patientCount: number;
}

// Doctor statistics interface
export interface DoctorStatistics {
  id: number;
  name: string;
  title: string | null;
  departmentName: string | null;
  recordCount: number;
  patientCount: number;
  averageRecordsPerMonth: number;
}

// Patient statistics interface
export interface PatientStatisticsDetail {
  totalPatients: number;
  newPatientsThisMonth: number;
  newPatientsLastMonth: number;
  growthRate: number;
  bloodTypeDistribution: Record<string, number>;
  ageDistribution: Record<string, number>;
  genderDistribution: Record<string, number>;
}

// Disease statistics interface
export interface DiseaseStatistics {
  diagnosis: string;
  count: number;
  percentage: number;
}

// Prescription statistics interface
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

export class StatisticsService {
  /**
   * Parse date range filter
   */
  private parseDateRange(filter: DateRangeFilter): { startDate: Date; endDate: Date } {
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    if (filter.startDate) {
      startDate = new Date(filter.startDate);
      startDate.setHours(0, 0, 0, 0);
    } else {
      // Default to 30 days ago
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 30);
      startDate.setHours(0, 0, 0, 0);
    }

    if (filter.endDate) {
      endDate = new Date(filter.endDate);
      endDate.setHours(23, 59, 59, 999);
    } else {
      endDate = new Date(now);
      endDate.setHours(23, 59, 59, 999);
    }

    return { startDate, endDate };
  }

  /**
   * Get start of today
   */
  private getStartOfToday(): Date {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  }

  /**
   * Get start of current month
   */
  private getStartOfMonth(): Date {
    const date = new Date();
    date.setDate(1);
    date.setHours(0, 0, 0, 0);
    return date;
  }

  /**
   * Get start of last month
   */
  private getStartOfLastMonth(): Date {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    date.setDate(1);
    date.setHours(0, 0, 0, 0);
    return date;
  }

  /**
   * Get end of last month
   */
  private getEndOfLastMonth(): Date {
    const date = new Date();
    date.setDate(0); // Last day of previous month
    date.setHours(23, 59, 59, 999);
    return date;
  }

  /**
   * Calculate age from birth date
   */
  private calculateAge(birthDate: Date | null): number | null {
    if (!birthDate) return null;

    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age;
  }

  /**
   * Get dashboard statistics
   */
  async getDashboardStatistics(): Promise<DashboardStatistics> {
    const startOfToday = this.getStartOfToday();
    const startOfMonth = this.getStartOfMonth();

    // Execute all queries in parallel
    const [
      totalPatients,
      totalDoctors,
      totalDepartments,
      totalMedicalRecords,
      todayVisits,
      monthlyVisits,
      newPatientsThisMonth,
      pendingRecords,
    ] = await Promise.all([
      prisma.patient.count(),
      prisma.doctor.count(),
      prisma.department.count({ where: { status: 1 } }),
      prisma.medicalRecord.count(),
      prisma.medicalRecord.count({
        where: {
          visitDate: { gte: startOfToday },
        },
      }),
      prisma.medicalRecord.count({
        where: {
          visitDate: { gte: startOfMonth },
        },
      }),
      prisma.patient.count({
        where: {
          createdAt: { gte: startOfMonth },
        },
      }),
      prisma.medicalRecord.count({
        where: { status: 'draft' },
      }),
    ]);

    return {
      totalPatients,
      totalDoctors,
      totalDepartments,
      totalMedicalRecords,
      todayVisits,
      monthlyVisits,
      newPatientsThisMonth,
      pendingRecords,
    };
  }

  /**
   * Get visit statistics
   */
  async getVisitStatistics(filter: DateRangeFilter = {}): Promise<VisitStatistics> {
    const { startDate, endDate } = this.parseDateRange(filter);

    // Get total visits in date range
    const totalVisits = await prisma.medicalRecord.count({
      where: {
        visitDate: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // Get visits by type
    const visitTypeGroups = await prisma.medicalRecord.groupBy({
      by: ['visitType'],
      where: {
        visitDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      _count: true,
    });

    const visitsByType: Record<string, number> = {};
    for (const group of visitTypeGroups) {
      visitsByType[group.visitType || 'unknown'] = group._count;
    }

    // Get visits by status
    const visitStatusGroups = await prisma.medicalRecord.groupBy({
      by: ['status'],
      where: {
        visitDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      _count: true,
    });

    const visitsByStatus: Record<string, number> = {};
    for (const group of visitStatusGroups) {
      visitsByStatus[group.status] = group._count;
    }

    // Calculate average visits per day
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const averageVisitsPerDay = daysDiff > 0 ? Math.round((totalVisits / daysDiff) * 100) / 100 : 0;

    return {
      totalVisits,
      visitsByType,
      visitsByStatus,
      averageVisitsPerDay,
    };
  }

  /**
   * Get visit trend data
   */
  async getVisitTrend(filter: DateRangeFilter = {}): Promise<VisitTrendPoint[]> {
    const { startDate, endDate } = this.parseDateRange(filter);

    // Get all records in date range
    const records = await prisma.medicalRecord.findMany({
      where: {
        visitDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        visitDate: true,
        visitType: true,
      },
      orderBy: { visitDate: 'asc' },
    });

    // Group by date
    const trendMap = new Map<string, VisitTrendPoint>();

    // Initialize all dates in range
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      trendMap.set(dateStr, {
        date: dateStr,
        count: 0,
        outpatient: 0,
        emergency: 0,
        inpatient: 0,
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Aggregate records
    for (const record of records) {
      const dateStr = record.visitDate.toISOString().split('T')[0];
      const point = trendMap.get(dateStr);
      if (point) {
        point.count++;
        if (record.visitType === 'outpatient') {
          point.outpatient++;
        } else if (record.visitType === 'emergency') {
          point.emergency++;
        } else if (record.visitType === 'inpatient') {
          point.inpatient++;
        }
      }
    }

    return Array.from(trendMap.values());
  }

  /**
   * Get department statistics
   */
  async getDepartmentStatistics(): Promise<DepartmentStatistics[]> {
    const departments = await prisma.department.findMany({
      where: { status: 1 },
      include: {
        _count: {
          select: {
            doctors: true,
            medicalRecords: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    // Get unique patient counts per department
    const departmentStats: DepartmentStatistics[] = [];

    for (const dept of departments) {
      // Count unique patients for this department
      const uniquePatients = await prisma.medicalRecord.findMany({
        where: { departmentId: dept.id },
        select: { patientId: true },
        distinct: ['patientId'],
      });

      departmentStats.push({
        id: dept.id,
        name: dept.name,
        code: dept.code,
        doctorCount: dept._count.doctors,
        recordCount: dept._count.medicalRecords,
        patientCount: uniquePatients.length,
      });
    }

    // Sort by record count descending
    departmentStats.sort((a, b) => b.recordCount - a.recordCount);

    return departmentStats;
  }

  /**
   * Get doctor statistics
   */
  async getDoctorStatistics(limit: number = 10): Promise<DoctorStatistics[]> {
    const doctors = await prisma.doctor.findMany({
      include: {
        department: {
          select: { name: true },
        },
        _count: {
          select: { medicalRecords: true },
        },
      },
      orderBy: {
        medicalRecords: {
          _count: 'desc',
        },
      },
      take: limit,
    });

    const doctorStats: DoctorStatistics[] = [];

    for (const doctor of doctors) {
      // Count unique patients for this doctor
      const uniquePatients = await prisma.medicalRecord.findMany({
        where: { doctorId: doctor.id },
        select: { patientId: true },
        distinct: ['patientId'],
      });

      // Calculate average records per month (based on doctor creation date)
      const monthsSinceCreation = Math.max(
        1,
        Math.ceil(
          (new Date().getTime() - doctor.createdAt.getTime()) / (1000 * 60 * 60 * 24 * 30)
        )
      );
      const averageRecordsPerMonth =
        Math.round((doctor._count.medicalRecords / monthsSinceCreation) * 100) / 100;

      doctorStats.push({
        id: doctor.id,
        name: doctor.name,
        title: doctor.title,
        departmentName: doctor.department?.name || null,
        recordCount: doctor._count.medicalRecords,
        patientCount: uniquePatients.length,
        averageRecordsPerMonth,
      });
    }

    return doctorStats;
  }

  /**
   * Get patient statistics
   */
  async getPatientStatistics(): Promise<PatientStatisticsDetail> {
    const startOfMonth = this.getStartOfMonth();
    const startOfLastMonth = this.getStartOfLastMonth();
    const endOfLastMonth = this.getEndOfLastMonth();

    // Get counts
    const [totalPatients, newPatientsThisMonth, newPatientsLastMonth] = await Promise.all([
      prisma.patient.count(),
      prisma.patient.count({
        where: { createdAt: { gte: startOfMonth } },
      }),
      prisma.patient.count({
        where: {
          createdAt: {
            gte: startOfLastMonth,
            lte: endOfLastMonth,
          },
        },
      }),
    ]);

    // Calculate growth rate
    const growthRate =
      newPatientsLastMonth > 0
        ? Math.round(((newPatientsThisMonth - newPatientsLastMonth) / newPatientsLastMonth) * 10000) / 100
        : newPatientsThisMonth > 0
          ? 100
          : 0;

    // Get blood type distribution
    const bloodTypeGroups = await prisma.patient.groupBy({
      by: ['bloodType'],
      _count: true,
    });

    const bloodTypeDistribution: Record<string, number> = {};
    for (const group of bloodTypeGroups) {
      bloodTypeDistribution[group.bloodType || 'Unknown'] = group._count;
    }

    // Get gender distribution
    const genderGroups = await prisma.patient.groupBy({
      by: ['gender'],
      _count: true,
    });

    const genderDistribution: Record<string, number> = {};
    for (const group of genderGroups) {
      genderDistribution[group.gender || 'Unknown'] = group._count;
    }

    // Get age distribution
    const patients = await prisma.patient.findMany({
      select: { birthDate: true },
    });

    const ageDistribution: Record<string, number> = {
      '0-17': 0,
      '18-30': 0,
      '31-45': 0,
      '46-60': 0,
      '61+': 0,
      'Unknown': 0,
    };

    for (const patient of patients) {
      const age = this.calculateAge(patient.birthDate);
      if (age === null) {
        ageDistribution['Unknown']++;
      } else if (age < 18) {
        ageDistribution['0-17']++;
      } else if (age <= 30) {
        ageDistribution['18-30']++;
      } else if (age <= 45) {
        ageDistribution['31-45']++;
      } else if (age <= 60) {
        ageDistribution['46-60']++;
      } else {
        ageDistribution['61+']++;
      }
    }

    return {
      totalPatients,
      newPatientsThisMonth,
      newPatientsLastMonth,
      growthRate,
      bloodTypeDistribution,
      ageDistribution,
      genderDistribution,
    };
  }

  /**
   * Get disease statistics (top diagnoses)
   */
  async getDiseaseStatistics(filter: DateRangeFilter = {}, limit: number = 10): Promise<DiseaseStatistics[]> {
    const { startDate, endDate } = this.parseDateRange(filter);

    // Get all diagnoses in date range
    const records = await prisma.medicalRecord.findMany({
      where: {
        visitDate: {
          gte: startDate,
          lte: endDate,
        },
        diagnosis: {
          not: null,
        },
      },
      select: { diagnosis: true },
    });

    // Count diagnoses
    const diagnosisCount = new Map<string, number>();
    let totalDiagnoses = 0;

    for (const record of records) {
      if (record.diagnosis) {
        // Split by common delimiters and count each diagnosis
        const diagnoses = record.diagnosis.split(/[,;，；、\n]/).map((d) => d.trim()).filter((d) => d);
        for (const diagnosis of diagnoses) {
          diagnosisCount.set(diagnosis, (diagnosisCount.get(diagnosis) || 0) + 1);
          totalDiagnoses++;
        }
      }
    }

    // Sort and get top diagnoses
    const sortedDiagnoses = Array.from(diagnosisCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit);

    return sortedDiagnoses.map(([diagnosis, count]) => ({
      diagnosis,
      count,
      percentage: totalDiagnoses > 0 ? Math.round((count / totalDiagnoses) * 10000) / 100 : 0,
    }));
  }

  /**
   * Get prescription statistics
   */
  async getPrescriptionStatistics(filter: DateRangeFilter = {}): Promise<PrescriptionStatistics> {
    const { startDate, endDate } = this.parseDateRange(filter);

    // Get prescriptions in date range
    const prescriptions = await prisma.prescription.findMany({
      where: {
        medicalRecord: {
          visitDate: {
            gte: startDate,
            lte: endDate,
          },
        },
      },
      select: { medicineName: true },
    });

    const totalPrescriptions = prescriptions.length;

    // Count medicines
    const medicineCount = new Map<string, number>();
    for (const prescription of prescriptions) {
      medicineCount.set(
        prescription.medicineName,
        (medicineCount.get(prescription.medicineName) || 0) + 1
      );
    }

    const uniqueMedicines = medicineCount.size;

    // Get top medicines
    const sortedMedicines = Array.from(medicineCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    const topMedicines = sortedMedicines.map(([medicineName, count]) => ({
      medicineName,
      count,
      percentage: totalPrescriptions > 0 ? Math.round((count / totalPrescriptions) * 10000) / 100 : 0,
    }));

    // Calculate average prescriptions per record
    const recordsWithPrescriptions = await prisma.medicalRecord.count({
      where: {
        visitDate: {
          gte: startDate,
          lte: endDate,
        },
        prescriptions: {
          some: {},
        },
      },
    });

    const averagePrescriptionsPerRecord =
      recordsWithPrescriptions > 0
        ? Math.round((totalPrescriptions / recordsWithPrescriptions) * 100) / 100
        : 0;

    return {
      totalPrescriptions,
      uniqueMedicines,
      topMedicines,
      averagePrescriptionsPerRecord,
    };
  }

  /**
   * Generate basic report data
   */
  async generateReport(filter: DateRangeFilter = {}): Promise<{
    generatedAt: string;
    dateRange: { startDate: string; endDate: string };
    dashboard: DashboardStatistics;
    visits: VisitStatistics;
    patients: PatientStatisticsDetail;
    departments: DepartmentStatistics[];
    topDoctors: DoctorStatistics[];
    topDiseases: DiseaseStatistics[];
    prescriptions: PrescriptionStatistics;
  }> {
    const { startDate, endDate } = this.parseDateRange(filter);

    logger.info(`Generating statistics report for ${startDate.toISOString()} to ${endDate.toISOString()}`);

    const [dashboard, visits, patients, departments, topDoctors, topDiseases, prescriptions] =
      await Promise.all([
        this.getDashboardStatistics(),
        this.getVisitStatistics(filter),
        this.getPatientStatistics(),
        this.getDepartmentStatistics(),
        this.getDoctorStatistics(10),
        this.getDiseaseStatistics(filter, 10),
        this.getPrescriptionStatistics(filter),
      ]);

    return {
      generatedAt: new Date().toISOString(),
      dateRange: {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      },
      dashboard,
      visits,
      patients,
      departments,
      topDoctors,
      topDiseases,
      prescriptions,
    };
  }
}

export const statisticsService = new StatisticsService();
