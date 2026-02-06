import type { StatisticsReport } from '@/types';
import i18n from '@/locales';

/**
 * Generate CSV content from statistics report data
 */
function generateReportCSV(report: StatisticsReport): string {
  const t = i18n.global.t;
  const lines: string[] = [];

  // BOM for Excel UTF-8 compatibility
  const addSection = (title: string, headers: string[], rows: string[][]) => {
    lines.push('');
    lines.push(title);
    lines.push(headers.map(escapeCSV).join(','));
    rows.forEach((row) => lines.push(row.map(escapeCSV).join(',')));
  };

  // Report header
  lines.push(t('statistics.reportTitle'));
  lines.push(`${t('statistics.generatedAt')}: ${new Date(report.generatedAt).toLocaleString()}`);
  lines.push(`${t('statistics.dateRange')}: ${report.dateRange.startDate} ${t('common.to')} ${report.dateRange.endDate}`);

  // === Section 1: Dashboard Overview ===
  addSection(
    `=== ${t('statistics.overview')} ===`,
    [t('statistics.metric'), t('statistics.value')],
    [
      [t('statistics.totalPatients'), String(report.dashboard.totalPatients)],
      [t('statistics.totalDoctors'), String(report.dashboard.totalDoctors)],
      [t('statistics.totalDepartments'), String(report.dashboard.totalDepartments)],
      [t('statistics.totalRecords'), String(report.dashboard.totalMedicalRecords)],
      [t('statistics.todayVisits'), String(report.dashboard.todayVisits)],
      [t('statistics.monthlyVisits'), String(report.dashboard.monthlyVisits)],
      [t('statistics.newPatientsThisMonth'), String(report.dashboard.newPatientsThisMonth)],
      [t('statistics.pendingRecords'), String(report.dashboard.pendingRecords)],
    ]
  );

  // === Section 2: Visit Statistics ===
  addSection(
    `=== ${t('statistics.visits')} ===`,
    [t('statistics.metric'), t('statistics.value')],
    [
      [t('statistics.totalVisits'), String(report.visits.totalVisits)],
      [t('statistics.avgVisitsPerDay'), String(report.visits.averageVisitsPerDay)],
    ]
  );

  // Visits by type
  if (report.visits.visitsByType && Object.keys(report.visits.visitsByType).length > 0) {
    addSection(
      `--- ${t('statistics.visitsByType')} ---`,
      [t('statistics.visitType'), t('statistics.count')],
      Object.entries(report.visits.visitsByType).map(([type, count]) => [type, String(count)])
    );
  }

  // Visits by status
  if (report.visits.visitsByStatus && Object.keys(report.visits.visitsByStatus).length > 0) {
    addSection(
      `--- ${t('statistics.visitsByStatus')} ---`,
      [t('common.status'), t('statistics.count')],
      Object.entries(report.visits.visitsByStatus).map(([status, count]) => [status, String(count)])
    );
  }

  // === Section 3: Patient Statistics ===
  addSection(
    `=== ${t('statistics.patients')} ===`,
    [t('statistics.metric'), t('statistics.value')],
    [
      [t('statistics.totalPatients'), String(report.patients.totalPatients)],
      [t('statistics.newPatientsThisMonth'), String(report.patients.newPatientsThisMonth)],
      [t('statistics.newPatientsLastMonth'), String(report.patients.newPatientsLastMonth)],
      [t('statistics.growthRate'), `${report.patients.growthRate}%`],
    ]
  );

  // Gender distribution
  if (report.patients.genderDistribution) {
    addSection(
      `--- ${t('statistics.genderDistribution')} ---`,
      [t('statistics.gender'), t('statistics.count')],
      Object.entries(report.patients.genderDistribution).map(([g, c]) => [g, String(c)])
    );
  }

  // Age distribution
  if (report.patients.ageDistribution) {
    addSection(
      `--- ${t('statistics.ageDistribution')} ---`,
      [t('statistics.ageGroup'), t('statistics.count')],
      Object.entries(report.patients.ageDistribution).map(([g, c]) => [g, String(c)])
    );
  }

  // Blood type distribution
  if (report.patients.bloodTypeDistribution) {
    addSection(
      `--- ${t('statistics.bloodTypeDistribution')} ---`,
      [t('statistics.bloodType'), t('statistics.count')],
      Object.entries(report.patients.bloodTypeDistribution).map(([g, c]) => [g, String(c)])
    );
  }

  // === Section 4: Department Statistics ===
  if (report.departments.length > 0) {
    addSection(
      `=== ${t('statistics.departments')} ===`,
      [
        t('department.name'),
        t('department.code'),
        t('statistics.doctorCount'),
        t('statistics.recordCount'),
        t('statistics.patientCount'),
      ],
      report.departments.map((d) => [
        d.name,
        d.code || '-',
        String(d.doctorCount),
        String(d.recordCount),
        String(d.patientCount),
      ])
    );
  }

  // === Section 5: Top Doctors ===
  if (report.topDoctors.length > 0) {
    addSection(
      `=== ${t('statistics.doctors')} ===`,
      [
        t('doctor.name'),
        t('doctor.title'),
        t('department.name'),
        t('statistics.recordCount'),
        t('statistics.patientCount'),
        t('statistics.avgRecordsPerMonth'),
      ],
      report.topDoctors.map((d) => [
        d.name,
        d.title || '-',
        d.departmentName || '-',
        String(d.recordCount),
        String(d.patientCount),
        String(d.averageRecordsPerMonth),
      ])
    );
  }

  // === Section 6: Top Diseases ===
  if (report.topDiseases.length > 0) {
    addSection(
      `=== ${t('statistics.diseases')} ===`,
      [t('statistics.diagnosis'), t('statistics.count'), t('statistics.percentage')],
      report.topDiseases.map((d) => [
        d.diagnosis,
        String(d.count),
        `${d.percentage}%`,
      ])
    );
  }

  // === Section 7: Prescription Statistics ===
  addSection(
    `=== ${t('statistics.prescriptions')} ===`,
    [t('statistics.metric'), t('statistics.value')],
    [
      [t('statistics.totalPrescriptions'), String(report.prescriptions.totalPrescriptions)],
      [t('statistics.uniqueMedicines'), String(report.prescriptions.uniqueMedicines)],
      [t('statistics.avgPrescriptionsPerRecord'), String(report.prescriptions.averagePrescriptionsPerRecord)],
    ]
  );

  // Top medicines
  if (report.prescriptions.topMedicines.length > 0) {
    addSection(
      `--- ${t('statistics.topMedicines')} ---`,
      [t('statistics.medicineName'), t('statistics.count'), t('statistics.percentage')],
      report.prescriptions.topMedicines.map((m) => [
        m.medicineName,
        String(m.count),
        `${m.percentage}%`,
      ])
    );
  }

  return lines.join('\n');
}

/**
 * Escape a CSV field value
 */
function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Trigger browser file download
 */
function downloadFile(content: string, filename: string, mimeType: string): void {
  // Add BOM for UTF-8 CSV compatibility with Excel
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();

  // Clean up
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 100);
}

/**
 * Download statistics report as CSV file
 */
export function downloadReportAsCSV(report: StatisticsReport): void {
  const csvContent = generateReportCSV(report);
  const dateStr = new Date().toISOString().split('T')[0];
  const filename = `hospital-statistics-report-${dateStr}.csv`;
  downloadFile(csvContent, filename, 'text/csv');
}
