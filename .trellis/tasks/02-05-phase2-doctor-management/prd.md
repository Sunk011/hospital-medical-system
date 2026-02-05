# Phase 2: Doctor Management Module

## Goal
Implement a complete doctor management system that allows administrators to manage doctor profiles, assign departments, and view doctor information.

## Requirements

### 1. Backend API Implementation

#### 1.1 Doctor CRUD Operations
- [ ] **GET /api/v1/doctors** - Get doctor list with pagination and filtering
  - Query parameters: page, pageSize, name, departmentId, title, specialty
  - Support fuzzy search for name and specialty
  - Include department information
  - Include user information
  - Return paginated results

- [ ] **GET /api/v1/doctors/:id** - Get doctor details
  - Return complete doctor information
  - Include department details
  - Include user details
  - Include statistics (total patients, total records)

- [ ] **POST /api/v1/doctors** - Create new doctor
  - Require userId (must be existing user with role 'doctor')
  - Require departmentId (must be existing department)
  - Validate license number uniqueness
  - Auto-link to user account

- [ ] **PUT /api/v1/doctors/:id** - Update doctor information
  - Validate all input fields
  - Allow department change
  - Validate license number uniqueness (excluding current doctor)
  - Log operation in operation_logs

- [ ] **DELETE /api/v1/doctors/:id** - Delete doctor (soft delete)
  - Check if doctor has medical records
  - If has records, prevent deletion or mark as inactive
  - Log operation

#### 1.2 Doctor Statistics
- [ ] **GET /api/v1/doctors/statistics** - Get doctor statistics
  - Total doctors count
  - Doctors by department
  - Doctors by title
  - Active vs inactive doctors

#### 1.3 Doctor-Department Relations
- [ ] **GET /api/v1/departments/:id/doctors** - Get doctors in a department
  - Return list of doctors in the specified department
  - Support pagination

#### 1.4 Data Validation
- [ ] Create doctor validator with express-validator
  - userId: required, must exist in users table, role must be 'doctor'
  - departmentId: required, must exist in departments table
  - name: required, 2-50 characters, Chinese or English
  - title: optional, max 50 characters (e.g., 主任医师, 副主任医师, 主治医师, 住院医师)
  - specialty: optional, max 200 characters
  - licenseNo: required, unique, alphanumeric, 10-20 characters
  - introduction: optional, max 1000 characters

#### 1.5 Business Logic (Service Layer)
- [ ] Implement DoctorService with methods:
  - `createDoctor(data)` - Create doctor and link to user
  - `getDoctorById(id)` - Get doctor with related data
  - `getDoctors(filters, pagination)` - Search and filter doctors
  - `updateDoctor(id, data)` - Update doctor information
  - `deleteDoctor(id)` - Soft delete doctor
  - `getDoctorsByDepartment(departmentId, pagination)` - Get doctors in department
  - `getDoctorStatistics()` - Get statistics
  - `validateLicenseNumber(licenseNo, excludeId?)` - Check license uniqueness

#### 1.6 Error Handling
- [ ] Handle duplicate license number error
- [ ] Handle doctor not found error
- [ ] Handle invalid user ID error
- [ ] Handle invalid department ID error
- [ ] Handle database errors

### 2. Frontend Implementation

#### 2.1 Doctor List Page (`/doctors`)
- [ ] **Layout**:
  - Search bar with filters (name, department, title, specialty)
  - "Add Doctor" button (top right, admin only)
  - Doctor table with columns:
    - Name
    - Department
    - Title
    - Specialty
    - License Number
    - Status
    - Actions (View, Edit, Delete)
  - Pagination controls

- [ ] **Features**:
  - Real-time search with debounce
  - Filter by department (dropdown)
  - Filter by title (dropdown)
  - Sort by columns
  - Responsive design

#### 2.2 Doctor Detail Page (`/doctors/:id`)
- [ ] **Sections**:
  - **Basic Information Card**:
    - Name, Title, Department
    - License Number
    - Specialty
    - Introduction
    - Status
    - Edit button (admin only)

  - **Statistics Card**:
    - Total patients treated
    - Total medical records
    - Years of experience
    - Patient satisfaction (optional for Phase 2)

  - **Recent Medical Records**:
    - List of recent records created by this doctor
    - Link to full medical record
    - Patient name (masked for privacy)

  - **Action Buttons**:
    - Edit Doctor (admin only)
    - View Schedule (future feature)
    - Back to List

#### 2.3 Doctor Form (Create/Edit)
- [ ] **Form Fields**:
  - User Account* (required, dropdown of users with role 'doctor')
  - Name* (required, auto-filled from user)
  - Department* (required, dropdown)
  - Title (dropdown: 主任医师, 副主任医师, 主治医师, 住院医师, 医师)
  - Specialty (text input, e.g., "心血管疾病, 高血压")
  - License Number* (required, unique)
  - Introduction (textarea, max 1000 chars)
  - Status (active/inactive, switch)

- [ ] **Validation**:
  - Client-side validation with Element Plus rules
  - Real-time validation feedback
  - License number uniqueness check
  - User must have 'doctor' role

- [ ] **Features**:
  - Auto-fill name from selected user
  - Cancel confirmation
  - Success/error notifications
  - Loading states

#### 2.4 Doctor Search Component
- [ ] **Search Filters**:
  - Name (text input with fuzzy search)
  - Department (dropdown, multi-select)
  - Title (dropdown, multi-select)
  - Specialty (text input)
  - Status (active/inactive)

- [ ] **Features**:
  - Advanced search toggle
  - Clear all filters
  - Export search results (optional)

#### 2.5 State Management (Pinia)
- [ ] Create `doctorStore` with:
  - State:
    - `doctors` - List of doctors
    - `currentDoctor` - Selected doctor details
    - `loading` - Loading state
    - `pagination` - Pagination info
    - `filters` - Current search filters
    - `departments` - List of departments for filter

  - Actions:
    - `fetchDoctors(filters)` - Load doctor list
    - `fetchDoctorById(id)` - Load doctor details
    - `createDoctor(data)` - Create new doctor
    - `updateDoctor(id, data)` - Update doctor
    - `deleteDoctor(id)` - Delete doctor
    - `searchDoctors(query)` - Search doctors
    - `fetchDepartments()` - Load departments for filter
    - `clearFilters()` - Reset filters

#### 2.6 API Service Layer
- [ ] Create `doctor.ts` API service:
  - `getDoctors(params)` - GET /api/v1/doctors
  - `getDoctorById(id)` - GET /api/v1/doctors/:id
  - `createDoctor(data)` - POST /api/v1/doctors
  - `updateDoctor(id, data)` - PUT /api/v1/doctors/:id
  - `deleteDoctor(id)` - DELETE /api/v1/doctors/:id
  - `getDoctorStatistics()` - GET /api/v1/doctors/statistics
  - `getDoctorsByDepartment(departmentId, params)` - GET /api/v1/departments/:id/doctors

#### 2.7 TypeScript Types
- [ ] Define types in `types/doctor.ts`:
  ```typescript
  interface Doctor {
    id: number;
    userId: number;
    departmentId: number;
    name: string;
    title?: string;
    specialty?: string;
    licenseNo: string;
    introduction?: string;
    createdAt: Date;
    updatedAt: Date;
    user?: User;
    department?: Department;
  }

  interface DoctorListParams {
    page?: number;
    pageSize?: number;
    name?: string;
    departmentId?: number;
    title?: string;
    specialty?: string;
  }

  interface DoctorStatistics {
    totalDoctors: number;
    doctorsByDepartment: Record<string, number>;
    doctorsByTitle: Record<string, number>;
    activeDoctors: number;
    inactiveDoctors: number;
  }
  ```

### 3. Department Management (Basic)

Since doctors are linked to departments, we need basic department management:

#### 3.1 Backend API
- [ ] **GET /api/v1/departments** - Get all departments
  - Return list of all departments
  - Include doctor count for each department

- [ ] **GET /api/v1/departments/:id** - Get department details
  - Return department information
  - Include list of doctors in the department

#### 3.2 Frontend
- [ ] Department dropdown component for doctor form
- [ ] Department filter in doctor list
- [ ] Department display in doctor details

### 4. UI/UX Requirements

#### 4.1 Design Principles
- Consistent with patient management module
- Professional medical interface
- Easy navigation
- Clear visual hierarchy

#### 4.2 Icons
- Doctor list: Stethoscope icon
- Add doctor: Plus icon
- Department: Building icon
- Title: Badge icon
- Specialty: Tag icon

### 5. Security & Permissions

#### 5.1 Access Control
- [ ] All doctor endpoints require authentication
- [ ] Role-based access:
  - **Admin**: Full access (CRUD)
  - **Doctor**: Read only (can view other doctors)
  - **Nurse**: Read only
  - **Receptionist**: Read only

#### 5.2 Data Privacy
- [ ] Log all doctor data access
- [ ] Mask sensitive information in list view (license number)

### 6. Testing Requirements

#### 6.1 Backend Testing
- [ ] Unit tests for DoctorService
- [ ] Integration tests for API endpoints
- [ ] Validation tests for input data
- [ ] Error handling tests

#### 6.2 Frontend Testing
- [ ] Component unit tests (optional for Phase 2)
- [ ] Manual testing checklist

### 7. Performance Requirements

- [ ] Doctor list should load within 1 second
- [ ] Search results should appear within 500ms
- [ ] Support pagination for large datasets (100+ doctors)
- [ ] Optimize database queries with indexes

## Acceptance Criteria

### Backend
- [ ] All API endpoints work correctly
- [ ] Input validation prevents invalid data
- [ ] License number uniqueness is enforced
- [ ] Pagination works correctly
- [ ] Search and filtering work as expected
- [ ] Error responses are consistent and informative
- [ ] Operation logs are created for all changes
- [ ] Doctor-user relationship is properly maintained
- [ ] Doctor-department relationship is properly maintained

### Frontend
- [ ] Doctor list displays correctly with pagination
- [ ] Search and filters work smoothly
- [ ] Create doctor form validates input
- [ ] Edit doctor form pre-fills data correctly
- [ ] Delete confirmation works
- [ ] Doctor details page shows all information
- [ ] Department dropdown loads correctly
- [ ] Navigation between pages is smooth
- [ ] Loading states are shown appropriately
- [ ] Error messages are user-friendly
- [ ] Responsive design works on tablets

### Integration
- [ ] Frontend successfully communicates with backend
- [ ] Authentication is enforced
- [ ] Data flows correctly between layers
- [ ] Error handling works end-to-end

## Technical Notes

### Database Considerations
- The `doctors` table already exists in the schema
- Add indexes on frequently queried fields:
  - `license_no` (unique index)
  - `department_id` (index)
  - `user_id` (unique index)
  - `name` (index for search)

### License Number Format
- Alphanumeric
- 10-20 characters
- Unique across all doctors
- Example: DOC2024001234

### Title Options (Chinese Medical System)
- 主任医师 (Chief Physician)
- 副主任医师 (Associate Chief Physician)
- 主治医师 (Attending Physician)
- 住院医师 (Resident Physician)
- 医师 (Physician)

## Implementation Order

1. **Backend First**:
   - Department service and routes (basic)
   - Doctor service layer
   - Doctor controller
   - Doctor routes
   - Doctor validators
   - Test with Postman

2. **Frontend Second**:
   - Doctor types
   - Doctor API service
   - Doctor store
   - Doctor list page
   - Doctor form (create/edit)
   - Doctor detail page

3. **Integration & Testing**:
   - Connect frontend to backend
   - Test all workflows
   - Fix bugs
   - Optimize performance

## Dependencies

- Phase 1 foundation (authentication, database)
- Patient management module (for medical records reference)
- Department data (basic department CRUD)
- User data (for doctor-user linking)

## Estimated Effort

- Backend: 3-4 hours
- Frontend: 4-5 hours
- Testing & Integration: 1-2 hours
- **Total**: 8-11 hours

## Future Enhancements (Post Phase 2)

- Doctor schedule management
- Doctor availability calendar
- Doctor performance metrics
- Patient reviews and ratings
- Doctor photo upload
- Appointment booking integration
- Doctor workload statistics
- Multi-department assignment
