# Phase 3: Statistics and Analytics Module

## Goal
Implement a comprehensive statistics and analytics system with data visualization to provide insights into hospital operations, patient visits, doctor performance, and department workload.

## Requirements

### 1. Backend API Implementation

#### 1.1 Dashboard Statistics
- [ ] **GET /api/v1/statistics/dashboard** - Get dashboard overview statistics
  - Total patients count
  - Total doctors count
  - Total medical records count
  - New patients this month
  - New records this month
  - Active doctors count
  - Recent activities (last 10 operations)

#### 1.2 Visit Statistics
- [ ] **GET /api/v1/statistics/visits** - Get visit statistics
  - Query parameters: startDate, endDate, groupBy (day/week/month)
  - Total visits in period
  - Visits by visit type (outpatient/emergency/inpatient)
  - Visits by status (draft/confirmed/archived)
  - Visits trend over time (for charts)
  - Average visits per day

- [ ] **GET /api/v1/statistics/visits/trend** - Get visit trend data
  - Query parameters: startDate, endDate, interval (daily/weekly/monthly)
  - Return time series data for charts
  - Group by date intervals

#### 1.3 Department Statistics
- [ ] **GET /api/v1/statistics/departments** - Get department statistics
  - Query parameters: startDate, endDate
  - Visits by department
  - Doctors count by department
  - Patients count by department
  - Department workload ranking
  - Department performance metrics

- [ ] **GET /api/v1/statistics/departments/:id** - Get specific department statistics
  - Department details
  - Total visits
  - Total patients
  - Doctor list with visit counts
  - Visit trend for the department

#### 1.4 Doctor Statistics
- [ ] **GET /api/v1/statistics/doctors** - Get doctor statistics
  - Query parameters: startDate, endDate, departmentId
  - Total records by doctor
  - Total patients by doctor
  - Average records per doctor
  - Top performing doctors (by record count)
  - Doctor workload distribution

- [ ] **GET /api/v1/statistics/doctors/:id** - Get specific doctor statistics
  - Doctor details
  - Total records created
  - Total patients treated
  - Records by visit type
  - Records by status
  - Visit trend over time
  - Patient satisfaction (optional for Phase 3)

#### 1.5 Patient Statistics
- [ ] **GET /api/v1/statistics/patients** - Get patient statistics
  - Query parameters: startDate, endDate
  - Total patients
  - New patients in period
  - Patients by gender
  - Patients by age group (0-18, 19-35, 36-50, 51-65, 66+)
  - Patients by blood type
  - Geographic distribution (by address, optional)

#### 1.6 Disease Statistics
- [ ] **GET /api/v1/statistics/diseases** - Get disease/diagnosis statistics
  - Query parameters: startDate, endDate, limit
  - Top diagnoses (extracted from medical records)
  - Diagnosis frequency
  - Diagnosis trend over time
  - Seasonal patterns (optional)

#### 1.7 Prescription Statistics
- [ ] **GET /api/v1/statistics/prescriptions** - Get prescription statistics
  - Query parameters: startDate, endDate, limit
  - Total prescriptions count
  - Top prescribed medicines
  - Medicine frequency
  - Prescriptions by doctor
  - Average prescriptions per record

#### 1.8 Report Generation
- [ ] **GET /api/v1/reports/summary** - Generate summary report
  - Query parameters: startDate, endDate, format (json/pdf)
  - Comprehensive report with all statistics
  - Export to PDF (optional for Phase 3)

- [ ] **GET /api/v1/reports/department/:id** - Generate department report
  - Department-specific report
  - Export to PDF (optional)

- [ ] **GET /api/v1/reports/doctor/:id** - Generate doctor report
  - Doctor-specific report
  - Export to PDF (optional)

#### 1.9 Data Validation
- [ ] Validate date ranges (startDate <= endDate)
- [ ] Validate date format (ISO 8601)
- [ ] Validate groupBy parameter (day/week/month)
- [ ] Validate interval parameter (daily/weekly/monthly)
- [ ] Validate limit parameter (positive integer, max 100)

#### 1.10 Business Logic (Service Layer)
- [ ] Implement StatisticsService with methods:
  - `getDashboardStatistics()` - Get overview stats
  - `getVisitStatistics(filters)` - Get visit stats
  - `getVisitTrend(filters)` - Get time series data
  - `getDepartmentStatistics(filters)` - Get department stats
  - `getDepartmentById(id, filters)` - Get specific department stats
  - `getDoctorStatistics(filters)` - Get doctor stats
  - `getDoctorById(id, filters)` - Get specific doctor stats
  - `getPatientStatistics(filters)` - Get patient stats
  - `getDiseaseStatistics(filters)` - Get disease stats
  - `getPrescriptionStatistics(filters)` - Get prescription stats
  - `generateSummaryReport(filters)` - Generate report
  - `generateDepartmentReport(id, filters)` - Generate dept report
  - `generateDoctorReport(id, filters)` - Generate doctor report

#### 1.11 Performance Optimization
- [ ] Use database aggregation queries
- [ ] Implement caching for frequently accessed statistics (optional)
- [ ] Optimize date range queries with indexes
- [ ] Limit result sets with pagination

### 2. Frontend Implementation

#### 2.1 Dashboard Page (`/dashboard`)
- [ ] **Layout**:
  - **Statistics Cards Row**:
    - Total Patients (with icon, count, trend)
    - Total Doctors (with icon, count, trend)
    - Total Records (with icon, count, trend)
    - New Patients This Month (with icon, count, percentage change)

  - **Charts Section**:
    - Visit Trend Chart (Line chart, last 30 days)
    - Visit Type Distribution (Pie chart)
    - Department Workload (Bar chart, top 10 departments)
    - Doctor Performance (Bar chart, top 10 doctors)

  - **Recent Activities**:
    - List of recent operations (last 10)
    - User, action, target, timestamp

  - **Quick Actions**:
    - Create Patient
    - Create Medical Record
    - View Reports

- [ ] **Features**:
  - Date range selector (last 7 days, last 30 days, last 3 months, custom)
  - Auto-refresh statistics (every 5 minutes, optional)
  - Export dashboard to PDF (optional)
  - Responsive design

#### 2.2 Statistics Page (`/statistics`)
- [ ] **Tabs**:
  - Overview
  - Visits
  - Departments
  - Doctors
  - Patients
  - Diseases
  - Prescriptions

- [ ] **Overview Tab**:
  - Summary statistics cards
  - Key metrics
  - Trend charts

- [ ] **Visits Tab**:
  - Visit trend chart (line chart with date range selector)
  - Visit type distribution (pie chart)
  - Visit status distribution (pie chart)
  - Visits by department (bar chart)
  - Data table with visit details

- [ ] **Departments Tab**:
  - Department workload chart (bar chart)
  - Department comparison table
  - Department details (click to view)
  - Export to Excel (optional)

- [ ] **Doctors Tab**:
  - Doctor performance chart (bar chart)
  - Doctor workload distribution
  - Doctor ranking table
  - Doctor details (click to view)

- [ ] **Patients Tab**:
  - Patient demographics (age distribution, gender distribution)
  - Blood type distribution (pie chart)
  - New patients trend (line chart)
  - Patient growth chart

- [ ] **Diseases Tab**:
  - Top diagnoses chart (bar chart)
  - Disease frequency table
  - Disease trend over time
  - Search and filter

- [ ] **Prescriptions Tab**:
  - Top medicines chart (bar chart)
  - Prescription frequency table
  - Prescriptions by doctor
  - Medicine usage trend

#### 2.3 Reports Page (`/reports`)
- [ ] **Report Types**:
  - Summary Report
  - Department Report
  - Doctor Report
  - Custom Report

- [ ] **Report Generator**:
  - Select report type
  - Select date range
  - Select filters (department, doctor, etc.)
  - Preview report
  - Export to PDF (optional)
  - Export to Excel (optional)

- [ ] **Report History**:
  - List of generated reports
  - Download previous reports
  - Delete old reports

#### 2.4 Chart Components

- [ ] **LineChart Component**:
  - Reusable line chart with ECharts
  - Support multiple series
  - Responsive design
  - Tooltip with data
  - Legend
  - Zoom and pan (optional)

- [ ] **BarChart Component**:
  - Reusable bar chart with ECharts
  - Horizontal and vertical orientation
  - Responsive design
  - Tooltip with data
  - Legend

- [ ] **PieChart Component**:
  - Reusable pie chart with ECharts
  - Responsive design
  - Tooltip with percentage
  - Legend
  - Label formatting

- [ ] **StatCard Component**:
  - Reusable statistics card
  - Icon, title, value, trend
  - Color coding (success, warning, danger)
  - Click action (optional)

#### 2.5 State Management (Pinia)
- [ ] Create `statisticsStore` with:
  - State:
    - `dashboardStats` - Dashboard statistics
    - `visitStats` - Visit statistics
    - `departmentStats` - Department statistics
    - `doctorStats` - Doctor statistics
    - `patientStats` - Patient statistics
    - `diseaseStats` - Disease statistics
    - `prescriptionStats` - Prescription statistics
    - `loading` - Loading state
    - `dateRange` - Selected date range

  - Actions:
    - `fetchDashboardStats()` - Load dashboard stats
    - `fetchVisitStats(filters)` - Load visit stats
    - `fetchVisitTrend(filters)` - Load visit trend
    - `fetchDepartmentStats(filters)` - Load department stats
    - `fetchDoctorStats(filters)` - Load doctor stats
    - `fetchPatientStats(filters)` - Load patient stats
    - `fetchDiseaseStats(filters)` - Load disease stats
    - `fetchPrescriptionStats(filters)` - Load prescription stats
    - `setDateRange(range)` - Update date range
    - `refreshStats()` - Refresh all statistics

#### 2.6 API Service Layer
- [ ] Create `statistics.ts` API service:
  - `getDashboardStatistics()` - GET /api/v1/statistics/dashboard
  - `getVisitStatistics(params)` - GET /api/v1/statistics/visits
  - `getVisitTrend(params)` - GET /api/v1/statistics/visits/trend
  - `getDepartmentStatistics(params)` - GET /api/v1/statistics/departments
  - `getDepartmentById(id, params)` - GET /api/v1/statistics/departments/:id
  - `getDoctorStatistics(params)` - GET /api/v1/statistics/doctors
  - `getDoctorById(id, params)` - GET /api/v1/statistics/doctors/:id
  - `getPatientStatistics(params)` - GET /api/v1/statistics/patients
  - `getDiseaseStatistics(params)` - GET /api/v1/statistics/diseases
  - `getPrescriptionStatistics(params)` - GET /api/v1/statistics/prescriptions
  - `generateSummaryReport(params)` - GET /api/v1/reports/summary
  - `generateDepartmentReport(id, params)` - GET /api/v1/reports/department/:id
  - `generateDoctorReport(id, params)` - GET /api/v1/reports/doctor/:id

#### 2.7 TypeScript Types
- [ ] Define types in `types/statistics.ts`:
  ```typescript
  interface DashboardStatistics {
    totalPatients: number;
    totalDoctors: number;
    totalRecords: number;
    newPatientsThisMonth: number;
    newRecordsThisMonth: number;
    activeDoctors: number;
    recentActivities: Activity[];
  }

  interface VisitStatistics {
    totalVisits: number;
    visitsByType: Record<string, number>;
    visitsByStatus: Record<string, number>;
    visitsByDepartment: Record<string, number>;
    visitTrend: TrendData[];
    averageVisitsPerDay: number;
  }

  interface TrendData {
    date: string;
    count: number;
    label?: string;
  }

  interface DepartmentStatistics {
    departmentId: number;
    departmentName: string;
    totalVisits: number;
    totalPatients: number;
    doctorCount: number;
    workloadRank: number;
  }

  interface DoctorStatistics {
    doctorId: number;
    doctorName: string;
    totalRecords: number;
    totalPatients: number;
    recordsByType: Record<string, number>;
    performanceRank: number;
  }

  interface PatientStatistics {
    totalPatients: number;
    newPatients: number;
    patientsByGender: Record<string, number>;
    patientsByAgeGroup: Record<string, number>;
    patientsByBloodType: Record<string, number>;
  }

  interface DiseaseStatistics {
    diagnosis: string;
    count: number;
    percentage: number;
    trend?: TrendData[];
  }

  interface PrescriptionStatistics {
    totalPrescriptions: number;
    topMedicines: MedicineStats[];
    prescriptionsByDoctor: Record<string, number>;
    averagePerRecord: number;
  }

  interface MedicineStats {
    medicineName: string;
    count: number;
    percentage: number;
  }
  ```

### 3. Data Visualization (ECharts)

#### 3.1 Chart Configuration
- [ ] Install ECharts: `npm install echarts`
- [ ] Install Vue ECharts: `npm install vue-echarts`
- [ ] Configure ECharts theme (medical theme with blue colors)
- [ ] Create chart wrapper components

#### 3.2 Chart Types
- [ ] Line Chart - For trends over time
- [ ] Bar Chart - For comparisons
- [ ] Pie Chart - For distributions
- [ ] Stacked Bar Chart - For multi-category data (optional)
- [ ] Heatmap - For time-based patterns (optional)

#### 3.3 Chart Features
- [ ] Responsive design (resize on window resize)
- [ ] Tooltip with detailed information
- [ ] Legend with toggle
- [ ] Data zoom (for large datasets)
- [ ] Export chart as image (optional)
- [ ] Animation on load

### 4. UI/UX Requirements

#### 4.1 Design Principles
- Clean and professional dashboard design
- Clear data visualization
- Easy to understand metrics
- Consistent color scheme
- Responsive design

#### 4.2 Color Scheme
- Primary: Medical blue (#409EFF)
- Success: Green (#67C23A)
- Warning: Orange (#E6A23C)
- Danger: Red (#F56C6C)
- Info: Gray (#909399)
- Chart colors: Use ECharts default palette

#### 4.3 Icons
- Dashboard: Dashboard icon
- Statistics: Chart icon
- Reports: Document icon
- Trend up: Arrow up icon
- Trend down: Arrow down icon

### 5. Security & Permissions

#### 5.1 Access Control
- [ ] All statistics endpoints require authentication
- [ ] Role-based access:
  - **Admin**: Full access to all statistics
  - **Doctor**: Can view own statistics and department statistics
  - **Nurse**: Read-only access to basic statistics
  - **Receptionist**: Read-only access to basic statistics

#### 5.2 Data Privacy
- [ ] Mask sensitive patient information in statistics
- [ ] Aggregate data to prevent individual identification
- [ ] Log all statistics access

### 6. Performance Requirements

- [ ] Dashboard should load within 2 seconds
- [ ] Statistics queries should complete within 1 second
- [ ] Charts should render within 500ms
- [ ] Support date ranges up to 1 year
- [ ] Optimize database queries with aggregation
- [ ] Use indexes on date fields

### 7. Testing Requirements

#### 7.1 Backend Testing
- [ ] Unit tests for StatisticsService
- [ ] Integration tests for API endpoints
- [ ] Performance tests for large datasets
- [ ] Date range validation tests

#### 7.2 Frontend Testing
- [ ] Component unit tests (optional for Phase 3)
- [ ] Chart rendering tests (optional)
- [ ] Manual testing checklist

## Acceptance Criteria

### Backend
- [ ] All API endpoints work correctly
- [ ] Statistics calculations are accurate
- [ ] Date range filtering works correctly
- [ ] Aggregation queries are optimized
- [ ] Error responses are consistent
- [ ] Performance meets requirements

### Frontend
- [ ] Dashboard displays correctly with all statistics
- [ ] Charts render correctly with data
- [ ] Date range selector works
- [ ] Statistics page tabs work correctly
- [ ] All chart types display properly
- [ ] Responsive design works on tablets
- [ ] Loading states are shown appropriately
- [ ] Error messages are user-friendly

### Integration
- [ ] Frontend successfully communicates with backend
- [ ] Authentication is enforced
- [ ] Data flows correctly between layers
- [ ] Charts update when date range changes

## Technical Notes

### Database Aggregation
- Use SQL aggregation functions (COUNT, SUM, AVG, GROUP BY)
- Optimize with indexes on:
  - `medical_records.visit_date`
  - `medical_records.status`
  - `medical_records.visit_type`
  - `patients.created_at`
  - `prescriptions.created_at`

### Date Range Handling
- Default date range: Last 30 days
- Support custom date ranges
- Validate date ranges (max 1 year)
- Use UTC for consistency

### ECharts Integration
```typescript
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { LineChart, BarChart, PieChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components';

use([
  CanvasRenderer,
  LineChart,
  BarChart,
  PieChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
]);
```

## Implementation Order

1. **Backend First**:
   - Statistics service layer
   - Statistics controller
   - Statistics routes
   - Test with Postman

2. **Frontend Second**:
   - Statistics types
   - Statistics API service
   - Statistics store
   - Chart components (Line, Bar, Pie)
   - Dashboard page
   - Statistics page
   - Reports page (basic)

3. **Integration & Testing**:
   - Connect frontend to backend
   - Test all charts with real data
   - Test date range filtering
   - Optimize performance
   - Fix bugs

## Dependencies

- Phase 1 foundation (authentication, database)
- Phase 2 modules (patient, doctor, medical record data)
- ECharts library for data visualization
- Element Plus components (Card, DatePicker, Tabs)

## Estimated Effort

- Backend: 4-5 hours
- Frontend: 6-8 hours
- Testing & Integration: 2-3 hours
- **Total**: 12-16 hours

## Future Enhancements (Post Phase 3)

- Real-time statistics with WebSocket
- Advanced analytics with machine learning
- Predictive analytics (patient volume forecasting)
- Custom dashboard builder
- Scheduled report generation
- Email report delivery
- Mobile app for statistics viewing
- Export to multiple formats (PDF, Excel, CSV)
- Data warehouse integration
- Business intelligence tools integration
