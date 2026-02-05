# Phase 2: Medical Record Management Module

## Goal
Implement a comprehensive medical record management system that allows doctors to create, view, edit, and manage patient medical records with prescriptions and attachments.

## Requirements

### 1. Backend API Implementation

#### 1.1 Medical Record CRUD Operations
- [ ] **GET /api/v1/medical-records** - Get medical record list with pagination and filtering
  - Query parameters: page, pageSize, patientId, doctorId, departmentId, visitType, status, startDate, endDate
  - Support search by record number
  - Include patient, doctor, and department information
  - Return paginated results

- [ ] **GET /api/v1/medical-records/:id** - Get medical record details
  - Return complete medical record information
  - Include patient details
  - Include doctor details
  - Include department details
  - Include prescriptions list
  - Include attachments list

- [ ] **POST /api/v1/medical-records** - Create new medical record
  - Auto-generate unique record number (format: MR + timestamp + random)
  - Require patientId (must exist)
  - Require doctorId (must exist)
  - Require departmentId (must exist)
  - Set initial status to 'draft'
  - Log operation

- [ ] **PUT /api/v1/medical-records/:id** - Update medical record
  - Validate all input fields
  - Only allow updates if status is 'draft' or 'confirmed'
  - Prevent updates if status is 'archived'
  - Log operation

- [ ] **DELETE /api/v1/medical-records/:id** - Delete medical record (soft delete)
  - Only allow deletion if status is 'draft'
  - Prevent deletion if status is 'confirmed' or 'archived'
  - Log operation

- [ ] **PUT /api/v1/medical-records/:id/status** - Update record status
  - Allow status transitions: draft → confirmed → archived
  - Prevent reverse transitions
  - Log operation

#### 1.2 Prescription Management
- [ ] **GET /api/v1/medical-records/:id/prescriptions** - Get prescriptions for a record
  - Return list of prescriptions
  - Include medicine details

- [ ] **POST /api/v1/medical-records/:id/prescriptions** - Add prescription to record
  - Validate medicine name, dosage, frequency
  - Link to medical record
  - Log operation

- [ ] **PUT /api/v1/prescriptions/:id** - Update prescription
  - Validate input
  - Only allow if record status is 'draft'
  - Log operation

- [ ] **DELETE /api/v1/prescriptions/:id** - Delete prescription
  - Only allow if record status is 'draft'
  - Log operation

#### 1.3 Attachment Management
- [ ] **GET /api/v1/medical-records/:id/attachments** - Get attachments for a record
  - Return list of attachments with metadata

- [ ] **POST /api/v1/medical-records/:id/attachments** - Upload attachment
  - Support file types: PDF, JPG, PNG, DICOM
  - Max file size: 10MB
  - Store file in uploads directory
  - Save metadata to database
  - Log operation

- [ ] **DELETE /api/v1/attachments/:id** - Delete attachment
  - Delete file from filesystem
  - Delete metadata from database
  - Only allow if record status is 'draft'
  - Log operation

- [ ] **GET /api/v1/attachments/:id/download** - Download attachment
  - Stream file to client
  - Set appropriate content-type
  - Log access

#### 1.4 Medical Record Statistics
- [ ] **GET /api/v1/medical-records/statistics** - Get statistics
  - Total records count
  - Records by visit type
  - Records by status
  - Records by department
  - Records this month

#### 1.5 Data Validation
- [ ] Create medical record validator with express-validator
  - patientId: required, must exist
  - doctorId: required, must exist
  - departmentId: required, must exist
  - visitType: required, enum (outpatient, emergency, inpatient)
  - visitDate: required, valid date, not future
  - chiefComplaint: optional, max 500 characters
  - presentIllness: optional, max 2000 characters
  - physicalExam: optional, max 2000 characters
  - diagnosis: optional, max 1000 characters
  - treatmentPlan: optional, max 2000 characters
  - notes: optional, max 1000 characters
  - status: enum (draft, confirmed, archived)

- [ ] Create prescription validator
  - medicineName: required, 2-100 characters
  - specification: optional, max 100 characters
  - dosage: required, max 50 characters
  - frequency: required, max 50 characters
  - duration: optional, max 50 characters
  - quantity: optional, positive integer
  - notes: optional, max 255 characters

#### 1.6 Business Logic (Service Layer)
- [ ] Implement MedicalRecordService with methods:
  - `createMedicalRecord(data)` - Create record with auto record number
  - `getMedicalRecordById(id)` - Get record with all related data
  - `getMedicalRecords(filters, pagination)` - Search and filter records
  - `updateMedicalRecord(id, data)` - Update record
  - `deleteMedicalRecord(id)` - Soft delete record
  - `updateRecordStatus(id, status)` - Update status with validation
  - `generateRecordNumber()` - Generate unique record number
  - `getMedicalRecordStatistics()` - Get statistics

- [ ] Implement PrescriptionService with methods:
  - `createPrescription(recordId, data)` - Add prescription
  - `getPrescriptionsByRecordId(recordId)` - Get prescriptions
  - `updatePrescription(id, data)` - Update prescription
  - `deletePrescription(id)` - Delete prescription

- [ ] Implement AttachmentService with methods:
  - `uploadAttachment(recordId, file, description)` - Upload file
  - `getAttachmentsByRecordId(recordId)` - Get attachments
  - `deleteAttachment(id)` - Delete file and metadata
  - `getAttachmentById(id)` - Get attachment metadata
  - `downloadAttachment(id)` - Stream file

#### 1.7 Error Handling
- [ ] Handle record not found error
- [ ] Handle patient not found error
- [ ] Handle doctor not found error
- [ ] Handle invalid status transition error
- [ ] Handle file upload errors
- [ ] Handle file not found errors
- [ ] Handle database errors

### 2. Frontend Implementation

#### 2.1 Medical Record List Page (`/medical-records`)
- [ ] **Layout**:
  - Search bar with filters (patient name, doctor name, record number, date range, status)
  - "Create Record" button (top right, doctors only)
  - Medical record table with columns:
    - Record Number
    - Patient Name
    - Doctor Name
    - Department
    - Visit Type
    - Visit Date
    - Status
    - Actions (View, Edit, Delete)
  - Pagination controls

- [ ] **Features**:
  - Real-time search with debounce
  - Filter by multiple criteria
  - Date range picker
  - Status filter (draft, confirmed, archived)
  - Visit type filter
  - Sort by columns
  - Export to PDF (optional for Phase 2)
  - Responsive design

#### 2.2 Medical Record Detail Page (`/medical-records/:id`)
- [ ] **Sections**:
  - **Header**:
    - Record Number, Status Badge
    - Patient Name, Medical Number
    - Doctor Name, Department
    - Visit Date, Visit Type
    - Action buttons (Edit, Print, Archive)

  - **Basic Information Card**:
    - Chief Complaint
    - Present Illness History
    - Physical Examination
    - Diagnosis
    - Treatment Plan
    - Notes

  - **Prescriptions Card**:
    - List of prescriptions
    - Medicine name, dosage, frequency, duration
    - Add/Edit/Delete prescription buttons (if draft)

  - **Attachments Card**:
    - List of attachments with thumbnails
    - File name, type, size, upload date
    - Upload/Download/Delete buttons
    - Image preview for JPG/PNG

  - **Timeline Card** (optional for Phase 2):
    - Record creation
    - Status changes
    - Modifications history

#### 2.3 Medical Record Form (Create/Edit)
- [ ] **Form Sections**:

  **Section 1: Basic Information**
  - Patient* (searchable dropdown)
  - Doctor* (auto-filled from current user if doctor)
  - Department* (dropdown)
  - Visit Type* (radio: outpatient, emergency, inpatient)
  - Visit Date* (date-time picker)

  **Section 2: Medical Information**
  - Chief Complaint (textarea, max 500 chars)
  - Present Illness (rich text editor, max 2000 chars)
  - Physical Examination (textarea, max 2000 chars)
  - Diagnosis (textarea, max 1000 chars)
  - Treatment Plan (textarea, max 2000 chars)
  - Notes (textarea, max 1000 chars)

  **Section 3: Prescriptions**
  - Dynamic prescription list
  - Add prescription button
  - Each prescription:
    - Medicine Name*
    - Specification
    - Dosage*
    - Frequency*
    - Duration
    - Quantity
    - Notes

  **Section 4: Attachments**
  - File upload area (drag & drop)
  - Supported formats: PDF, JPG, PNG
  - Max size: 10MB per file
  - Description for each file

- [ ] **Validation**:
  - Client-side validation with Element Plus rules
  - Real-time validation feedback
  - Required field indicators
  - Character count for text areas

- [ ] **Features**:
  - Auto-save draft (optional)
  - Save as draft button
  - Submit for confirmation button
  - Cancel with confirmation
  - Success/error notifications
  - Loading states

#### 2.4 Medical Record Search Component
- [ ] **Search Filters**:
  - Record Number (exact match)
  - Patient Name (fuzzy search)
  - Doctor Name (fuzzy search)
  - Department (dropdown)
  - Visit Type (dropdown)
  - Status (dropdown)
  - Date Range (date range picker)

- [ ] **Features**:
  - Advanced search toggle
  - Clear all filters
  - Search history (optional)
  - Export search results

#### 2.5 Prescription Dialog Component
- [ ] **Form Fields**:
  - Medicine Name* (autocomplete with common medicines)
  - Specification (e.g., "500mg/片")
  - Dosage* (e.g., "2片")
  - Frequency* (e.g., "每日3次")
  - Duration (e.g., "7天")
  - Quantity (e.g., "42片")
  - Notes

- [ ] **Features**:
  - Medicine name autocomplete
  - Common dosage templates
  - Validation
  - Add/Edit modes

#### 2.6 Attachment Upload Component
- [ ] **Features**:
  - Drag and drop upload
  - File type validation
  - File size validation
  - Upload progress
  - Preview for images
  - Description input
  - Multiple file upload

#### 2.7 State Management (Pinia)
- [ ] Create `medicalRecordStore` with:
  - State:
    - `medicalRecords` - List of records
    - `currentRecord` - Selected record details
    - `loading` - Loading state
    - `pagination` - Pagination info
    - `filters` - Current search filters
    - `prescriptions` - Prescriptions for current record
    - `attachments` - Attachments for current record

  - Actions:
    - `fetchMedicalRecords(filters)` - Load record list
    - `fetchMedicalRecordById(id)` - Load record details
    - `createMedicalRecord(data)` - Create new record
    - `updateMedicalRecord(id, data)` - Update record
    - `deleteMedicalRecord(id)` - Delete record
    - `updateRecordStatus(id, status)` - Update status
    - `fetchPrescriptions(recordId)` - Load prescriptions
    - `addPrescription(recordId, data)` - Add prescription
    - `updatePrescription(id, data)` - Update prescription
    - `deletePrescription(id)` - Delete prescription
    - `fetchAttachments(recordId)` - Load attachments
    - `uploadAttachment(recordId, file, description)` - Upload file
    - `deleteAttachment(id)` - Delete attachment
    - `downloadAttachment(id)` - Download file
    - `clearFilters()` - Reset filters

#### 2.8 API Service Layer
- [ ] Create `medical-record.ts` API service:
  - `getMedicalRecords(params)` - GET /api/v1/medical-records
  - `getMedicalRecordById(id)` - GET /api/v1/medical-records/:id
  - `createMedicalRecord(data)` - POST /api/v1/medical-records
  - `updateMedicalRecord(id, data)` - PUT /api/v1/medical-records/:id
  - `deleteMedicalRecord(id)` - DELETE /api/v1/medical-records/:id
  - `updateRecordStatus(id, status)` - PUT /api/v1/medical-records/:id/status
  - `getMedicalRecordStatistics()` - GET /api/v1/medical-records/statistics
  - `getPrescriptions(recordId)` - GET /api/v1/medical-records/:id/prescriptions
  - `addPrescription(recordId, data)` - POST /api/v1/medical-records/:id/prescriptions
  - `updatePrescription(id, data)` - PUT /api/v1/prescriptions/:id
  - `deletePrescription(id)` - DELETE /api/v1/prescriptions/:id
  - `getAttachments(recordId)` - GET /api/v1/medical-records/:id/attachments
  - `uploadAttachment(recordId, formData)` - POST /api/v1/medical-records/:id/attachments
  - `deleteAttachment(id)` - DELETE /api/v1/attachments/:id
  - `downloadAttachment(id)` - GET /api/v1/attachments/:id/download

#### 2.9 TypeScript Types
- [ ] Define types in `types/medical-record.ts`:
  ```typescript
  interface MedicalRecord {
    id: number;
    recordNo: string;
    patientId: number;
    doctorId: number;
    departmentId: number;
    visitType: 'outpatient' | 'emergency' | 'inpatient';
    visitDate: Date;
    chiefComplaint?: string;
    presentIllness?: string;
    physicalExam?: string;
    diagnosis?: string;
    treatmentPlan?: string;
    notes?: string;
    status: 'draft' | 'confirmed' | 'archived';
    createdAt: Date;
    updatedAt: Date;
    patient?: Patient;
    doctor?: Doctor;
    department?: Department;
    prescriptions?: Prescription[];
    attachments?: Attachment[];
  }

  interface Prescription {
    id: number;
    recordId: number;
    medicineName: string;
    specification?: string;
    dosage: string;
    frequency: string;
    duration?: string;
    quantity?: number;
    notes?: string;
    createdAt: Date;
  }

  interface Attachment {
    id: number;
    recordId: number;
    fileName: string;
    filePath: string;
    fileType: string;
    fileSize: number;
    description?: string;
    createdAt: Date;
  }
  ```

### 3. UI/UX Requirements

#### 3.1 Design Principles
- Consistent with patient and doctor management modules
- Professional medical interface
- Easy data entry for doctors
- Clear information hierarchy
- Responsive design

#### 3.2 Status Colors
- Draft: Gray (#909399)
- Confirmed: Blue (#409EFF)
- Archived: Green (#67C23A)

#### 3.3 Icons
- Medical record: Document icon
- Prescription: Pills icon
- Attachment: Paperclip icon
- Upload: Upload icon
- Download: Download icon

### 4. Security & Permissions

#### 4.1 Access Control
- [ ] All medical record endpoints require authentication
- [ ] Role-based access:
  - **Admin**: Full access (CRUD)
  - **Doctor**: Can create, read, update own records
  - **Nurse**: Read only
  - **Receptionist**: Read only

#### 4.2 Data Privacy
- [ ] Log all medical record access
- [ ] Mask sensitive patient information in list view
- [ ] Encrypt attachments (optional for Phase 2)

### 5. File Upload Configuration

#### 5.1 Backend (Multer)
- [ ] Configure multer for file uploads
- [ ] Set upload directory: `backend/uploads/attachments/`
- [ ] File size limit: 10MB
- [ ] Allowed file types: PDF, JPG, PNG, DICOM
- [ ] Generate unique file names
- [ ] Store original file name in database

#### 5.2 Frontend
- [ ] Use Element Plus Upload component
- [ ] Show upload progress
- [ ] Validate file type and size before upload
- [ ] Preview images before upload
- [ ] Handle upload errors

### 6. Testing Requirements

#### 6.1 Backend Testing
- [ ] Unit tests for MedicalRecordService
- [ ] Unit tests for PrescriptionService
- [ ] Unit tests for AttachmentService
- [ ] Integration tests for API endpoints
- [ ] File upload tests
- [ ] Validation tests

#### 6.2 Frontend Testing
- [ ] Component unit tests (optional for Phase 2)
- [ ] Manual testing checklist

### 7. Performance Requirements

- [ ] Medical record list should load within 1 second
- [ ] Search results should appear within 500ms
- [ ] File upload should show progress
- [ ] Support pagination for large datasets (1000+ records)
- [ ] Optimize database queries with indexes

## Acceptance Criteria

### Backend
- [ ] All API endpoints work correctly
- [ ] Input validation prevents invalid data
- [ ] Record number is unique and auto-generated
- [ ] Status transitions are enforced
- [ ] Pagination works correctly
- [ ] Search and filtering work as expected
- [ ] File upload works correctly
- [ ] File download works correctly
- [ ] Error responses are consistent and informative
- [ ] Operation logs are created for all changes

### Frontend
- [ ] Medical record list displays correctly with pagination
- [ ] Search and filters work smoothly
- [ ] Create record form validates input
- [ ] Edit record form pre-fills data correctly
- [ ] Prescription management works
- [ ] Attachment upload/download works
- [ ] Status updates work correctly
- [ ] Delete confirmation works
- [ ] Medical record details page shows all information
- [ ] Navigation between pages is smooth
- [ ] Loading states are shown appropriately
- [ ] Error messages are user-friendly
- [ ] Responsive design works on tablets

### Integration
- [ ] Frontend successfully communicates with backend
- [ ] Authentication is enforced
- [ ] Data flows correctly between layers
- [ ] Error handling works end-to-end
- [ ] File upload/download works end-to-end

## Technical Notes

### Database Considerations
- The `medical_records`, `prescriptions`, and `attachments` tables already exist
- Add indexes on frequently queried fields:
  - `record_no` (unique index)
  - `patient_id` (index)
  - `doctor_id` (index)
  - `department_id` (index)
  - `visit_date` (index)
  - `status` (index)

### Record Number Format
- Format: `MR{YYYYMMDD}{HHMMSS}{RANDOM}`
- Example: `MR202602051430001234`
- Ensures uniqueness and sortability

### File Storage
- Store files in: `backend/uploads/attachments/{year}/{month}/`
- Generate unique file names: `{timestamp}-{random}-{originalname}`
- Store metadata in database

### Status Workflow
- Draft → Confirmed → Archived
- No reverse transitions allowed
- Only draft records can be edited/deleted

## Implementation Order

1. **Backend First**:
   - Medical record service layer
   - Prescription service layer
   - Attachment service layer (with multer)
   - Controllers
   - Routes
   - Validators
   - Test with Postman

2. **Frontend Second**:
   - Medical record types
   - API service layer
   - Medical record store
   - Medical record list page
   - Medical record form (create/edit)
   - Medical record detail page
   - Prescription dialog
   - Attachment upload component

3. **Integration & Testing**:
   - Connect frontend to backend
   - Test all workflows
   - Test file upload/download
   - Fix bugs
   - Optimize performance

## Dependencies

- Phase 1 foundation (authentication, database)
- Patient management module (for patient selection)
- Doctor management module (for doctor selection)
- Department management module (for department selection)
- Multer for file uploads
- Element Plus Upload component

## Estimated Effort

- Backend: 6-8 hours
- Frontend: 8-10 hours
- Testing & Integration: 3-4 hours
- **Total**: 17-22 hours

## Future Enhancements (Post Phase 2)

- Electronic signature for doctors
- Medical record templates
- Voice-to-text for dictation
- Medical record printing with custom templates
- Medical record export to PDF
- Medical record sharing with other hospitals
- Medical record version history
- Medical record approval workflow
- Integration with medical devices (DICOM)
- AI-assisted diagnosis suggestions
