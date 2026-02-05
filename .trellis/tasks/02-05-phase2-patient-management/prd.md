# Phase 2: Patient Management Module

## Goal
Implement a complete patient management system that allows hospital staff to register, search, view, edit, and manage patient information and medical history.

## Requirements

### 1. Backend API Implementation

#### 1.1 Patient CRUD Operations
- [ ] **GET /api/v1/patients** - Get patient list with pagination and filtering
  - Query parameters: page, pageSize, name, idCard, phone, medicalNo
  - Support fuzzy search for name
  - Return paginated results with patient summary

- [ ] **GET /api/v1/patients/:id** - Get patient details
  - Return complete patient information
  - Include medical history summary
  - Include recent medical records count

- [ ] **POST /api/v1/patients** - Create new patient
  - Auto-generate unique medical number (format: P + timestamp + random)
  - Validate ID card format (18 digits)
  - Validate phone number format
  - Check for duplicate ID card

- [ ] **PUT /api/v1/patients/:id** - Update patient information
  - Validate all input fields
  - Prevent changing medical number
  - Log operation in operation_logs

- [ ] **DELETE /api/v1/patients/:id** - Delete patient (soft delete)
  - Check if patient has medical records
  - If has records, prevent deletion or mark as inactive
  - Log operation

#### 1.2 Patient Medical History
- [ ] **GET /api/v1/patients/:id/records** - Get patient's medical records
  - Return list of medical records for the patient
  - Include doctor and department information
  - Support pagination

- [ ] **GET /api/v1/patients/:id/history** - Get patient's medical history summary
  - Return allergies, chronic conditions, past surgeries
  - Return medication history
  - Return visit statistics

#### 1.3 Patient Statistics
- [ ] **GET /api/v1/patients/statistics** - Get patient statistics
  - Total patients count
  - New patients this month
  - Patients by blood type
  - Patients by age group

#### 1.4 Data Validation
- [ ] Create patient validator with express-validator
  - Name: required, 2-50 characters, Chinese or English
  - ID card: optional, 18 digits, valid format
  - Phone: required, 11 digits
  - Gender: required, enum (M, F)
  - Birth date: optional, valid date, not future
  - Blood type: optional, enum (A, B, AB, O, Unknown)
  - Address: optional, max 255 characters
  - Emergency contact: optional, max 50 characters
  - Emergency phone: optional, 11 digits

#### 1.5 Business Logic (Service Layer)
- [ ] Implement PatientService with methods:
  - `createPatient(data)` - Create patient with auto medical number
  - `getPatientById(id)` - Get patient with related data
  - `getPatients(filters, pagination)` - Search and filter patients
  - `updatePatient(id, data)` - Update patient information
  - `deletePatient(id)` - Soft delete patient
  - `getPatientRecords(id, pagination)` - Get patient's records
  - `getPatientHistory(id)` - Get medical history summary
  - `generateMedicalNumber()` - Generate unique medical number

#### 1.6 Error Handling
- [ ] Handle duplicate ID card error
- [ ] Handle patient not found error
- [ ] Handle invalid input errors
- [ ] Handle database errors

### 2. Frontend Implementation

#### 2.1 Patient List Page (`/patients`)
- [ ] **Layout**:
  - Search bar with filters (name, ID card, phone, medical number)
  - "Add Patient" button (top right)
  - Patient table with columns:
    - Medical Number
    - Name
    - Gender
    - Age
    - Phone
    - Last Visit Date
    - Actions (View, Edit, Delete)
  - Pagination controls

- [ ] **Features**:
  - Real-time search with debounce
  - Filter by multiple criteria
  - Sort by columns
  - Export to Excel (optional for Phase 2)
  - Responsive design

#### 2.2 Patient Detail Page (`/patients/:id`)
- [ ] **Sections**:
  - **Basic Information Card**:
    - Medical Number, Name, Gender, Age
    - ID Card, Phone, Address
    - Blood Type, Allergies
    - Emergency Contact Info
    - Edit button

  - **Medical History Card**:
    - Chronic conditions
    - Past surgeries
    - Medication history
    - Allergies and contraindications

  - **Recent Medical Records**:
    - List of recent visits
    - Link to full medical record
    - Quick stats (total visits, last visit date)

  - **Action Buttons**:
    - Edit Patient
    - Create Medical Record
    - View Full History
    - Back to List

#### 2.3 Patient Form (Create/Edit)
- [ ] **Form Fields**:
  - Medical Number (auto-generated, read-only for edit)
  - Name* (required)
  - Gender* (required, radio buttons)
  - Birth Date (date picker)
  - ID Card (with format validation)
  - Phone* (required, with format validation)
  - Address (textarea)
  - Blood Type (dropdown)
  - Allergies (textarea with tags)
  - Medical History (textarea)
  - Emergency Contact Name
  - Emergency Contact Phone

- [ ] **Validation**:
  - Client-side validation with Element Plus rules
  - Real-time validation feedback
  - ID card format check
  - Phone number format check
  - Age calculation from birth date

- [ ] **Features**:
  - Auto-save draft (optional)
  - Cancel confirmation
  - Success/error notifications
  - Loading states

#### 2.4 Patient Search Component
- [ ] **Search Filters**:
  - Name (text input with fuzzy search)
  - Medical Number (exact match)
  - ID Card (exact match)
  - Phone (exact match)
  - Date range (registration date)
  - Blood type filter
  - Gender filter

- [ ] **Features**:
  - Advanced search toggle
  - Clear all filters
  - Search history (optional)
  - Export search results

#### 2.5 State Management (Pinia)
- [ ] Create `patientStore` with:
  - State:
    - `patients` - List of patients
    - `currentPatient` - Selected patient details
    - `loading` - Loading state
    - `pagination` - Pagination info
    - `filters` - Current search filters

  - Actions:
    - `fetchPatients(filters)` - Load patient list
    - `fetchPatientById(id)` - Load patient details
    - `createPatient(data)` - Create new patient
    - `updatePatient(id, data)` - Update patient
    - `deletePatient(id)` - Delete patient
    - `searchPatients(query)` - Search patients
    - `clearFilters()` - Reset filters

#### 2.6 API Service Layer
- [ ] Create `patient.ts` API service:
  - `getPatients(params)` - GET /api/v1/patients
  - `getPatientById(id)` - GET /api/v1/patients/:id
  - `createPatient(data)` - POST /api/v1/patients
  - `updatePatient(id, data)` - PUT /api/v1/patients/:id
  - `deletePatient(id)` - DELETE /api/v1/patients/:id
  - `getPatientRecords(id, params)` - GET /api/v1/patients/:id/records
  - `getPatientHistory(id)` - GET /api/v1/patients/:id/history
  - `getPatientStatistics()` - GET /api/v1/patients/statistics

#### 2.7 TypeScript Types
- [ ] Define types in `types/patient.ts`:
  ```typescript
  interface Patient {
    id: number;
    medicalNo: string;
    name: string;
    idCard?: string;
    gender: 'M' | 'F';
    birthDate?: Date;
    age?: number;
    phone: string;
    emergencyContact?: string;
    emergencyPhone?: string;
    address?: string;
    bloodType?: 'A' | 'B' | 'AB' | 'O' | 'Unknown';
    allergies?: string;
    medicalHistory?: string;
    createdAt: Date;
    updatedAt: Date;
  }

  interface PatientListParams {
    page?: number;
    pageSize?: number;
    name?: string;
    idCard?: string;
    phone?: string;
    medicalNo?: string;
  }

  interface PatientStatistics {
    totalPatients: number;
    newPatientsThisMonth: number;
    bloodTypeDistribution: Record<string, number>;
    ageDistribution: Record<string, number>;
  }
  ```

### 3. UI/UX Requirements

#### 3.1 Design Principles
- Clean and professional medical interface
- Easy navigation and intuitive workflows
- Clear visual hierarchy
- Responsive design for tablets
- Accessibility considerations

#### 3.2 Color Scheme
- Primary: Medical blue (#409EFF)
- Success: Green (#67C23A)
- Warning: Orange (#E6A23C)
- Danger: Red (#F56C6C)
- Info: Gray (#909399)

#### 3.3 Icons
- Patient list: User icon
- Add patient: Plus icon
- Edit: Edit icon
- Delete: Delete icon
- Search: Search icon
- Medical history: Document icon

### 4. Security & Permissions

#### 4.1 Access Control
- [ ] All patient endpoints require authentication
- [ ] Role-based access:
  - **Admin**: Full access (CRUD)
  - **Doctor**: Read, Create, Update
  - **Nurse**: Read, Create, Update
  - **Receptionist**: Read, Create, Update

#### 4.2 Data Privacy
- [ ] Mask sensitive information in list view
- [ ] Log all patient data access
- [ ] Encrypt sensitive fields (optional for Phase 2)

### 5. Testing Requirements

#### 5.1 Backend Testing
- [ ] Unit tests for PatientService
- [ ] Integration tests for API endpoints
- [ ] Validation tests for input data
- [ ] Error handling tests

#### 5.2 Frontend Testing
- [ ] Component unit tests (optional for Phase 2)
- [ ] E2E tests for critical flows (optional for Phase 2)
- [ ] Manual testing checklist

### 6. Performance Requirements

- [ ] Patient list should load within 1 second
- [ ] Search results should appear within 500ms
- [ ] Support pagination for large datasets (1000+ patients)
- [ ] Optimize database queries with indexes

## Acceptance Criteria

### Backend
- [ ] All API endpoints work correctly
- [ ] Input validation prevents invalid data
- [ ] Medical number is unique and auto-generated
- [ ] Pagination works correctly
- [ ] Search and filtering work as expected
- [ ] Error responses are consistent and informative
- [ ] Operation logs are created for all changes

### Frontend
- [ ] Patient list displays correctly with pagination
- [ ] Search and filters work smoothly
- [ ] Create patient form validates input
- [ ] Edit patient form pre-fills data correctly
- [ ] Delete confirmation works
- [ ] Patient details page shows all information
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
- The `patients` table already exists in the schema
- Add indexes on frequently queried fields:
  - `medical_no` (unique index)
  - `id_card` (unique index)
  - `phone` (index)
  - `name` (index for search)

### Medical Number Format
- Format: `P{YYYYMMDD}{HHMMSS}{RANDOM}`
- Example: `P202602051430001234`
- Ensures uniqueness and sortability

### ID Card Validation
- 18 digits
- Last digit can be X
- Validate checksum (optional for Phase 2)

### Phone Number Format
- 11 digits
- Starts with 1
- Format: 13812345678

## Implementation Order

1. **Backend First**:
   - Patient service layer
   - Patient controller
   - Patient routes
   - Patient validators
   - Test with Postman

2. **Frontend Second**:
   - Patient types
   - Patient API service
   - Patient store
   - Patient list page
   - Patient form (create/edit)
   - Patient detail page

3. **Integration & Testing**:
   - Connect frontend to backend
   - Test all workflows
   - Fix bugs
   - Optimize performance

## Dependencies

- Phase 1 foundation (authentication, database, basic structure)
- Element Plus components (Table, Form, Dialog, Pagination)
- Axios for API calls
- Pinia for state management

## Estimated Effort

- Backend: 4-6 hours
- Frontend: 6-8 hours
- Testing & Integration: 2-3 hours
- **Total**: 12-17 hours

## Future Enhancements (Post Phase 2)

- Patient photo upload
- QR code for patient ID
- Patient portal for self-service
- Advanced analytics and reports
- Export to PDF/Excel
- Batch import patients
- Patient merge functionality
- Appointment scheduling integration
