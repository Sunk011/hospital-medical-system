<template>
  <el-dialog
    :model-value="visible"
    :title="mode === 'create' ? 'Create Medical Record' : 'Edit Medical Record'"
    width="800px"
    :close-on-click-modal="false"
    @update:model-value="$emit('update:visible', $event)"
    @closed="handleClosed"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="140px"
      @submit.prevent="handleSubmit"
    >
      <!-- Patient and Doctor Selection -->
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item
            label="Patient"
            prop="patientId"
          >
            <el-select
              v-model="formData.patientId"
              filterable
              remote
              reserve-keyword
              placeholder="Search patient..."
              :remote-method="searchPatients"
              :loading="patientLoading"
              style="width: 100%"
            >
              <el-option
                v-for="patient in patientOptions"
                :key="patient.id"
                :label="`${patient.name} (${patient.medicalNo})`"
                :value="patient.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="Doctor"
            prop="doctorId"
          >
            <el-select
              v-model="formData.doctorId"
              filterable
              remote
              reserve-keyword
              placeholder="Search doctor..."
              :remote-method="searchDoctors"
              :loading="doctorLoading"
              style="width: 100%"
            >
              <el-option
                v-for="doctor in doctorOptions"
                :key="doctor.id"
                :label="`${doctor.name}${doctor.title ? ' (' + doctor.title + ')' : ''}`"
                :value="doctor.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item
            label="Department"
            prop="departmentId"
          >
            <DepartmentSelect
              v-model="formData.departmentId"
              placeholder="Select department"
              clearable
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="Visit Type"
            prop="visitType"
          >
            <el-select
              v-model="formData.visitType"
              placeholder="Select visit type"
              style="width: 100%"
            >
              <el-option
                v-for="item in visitTypeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item
            label="Visit Date"
            prop="visitDate"
          >
            <el-date-picker
              v-model="formData.visitDate"
              type="datetime"
              placeholder="Select visit date"
              value-format="YYYY-MM-DDTHH:mm:ss"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-divider content-position="left">
        Medical Information
      </el-divider>

      <el-form-item
        label="Chief Complaint"
        prop="chiefComplaint"
      >
        <el-input
          v-model="formData.chiefComplaint"
          type="textarea"
          :rows="2"
          placeholder="Enter chief complaint"
          maxlength="2000"
          show-word-limit
        />
      </el-form-item>

      <el-form-item
        label="Present Illness"
        prop="presentIllness"
      >
        <el-input
          v-model="formData.presentIllness"
          type="textarea"
          :rows="3"
          placeholder="Enter present illness history"
          maxlength="5000"
          show-word-limit
        />
      </el-form-item>

      <el-form-item
        label="Physical Exam"
        prop="physicalExam"
      >
        <el-input
          v-model="formData.physicalExam"
          type="textarea"
          :rows="3"
          placeholder="Enter physical examination findings"
          maxlength="5000"
          show-word-limit
        />
      </el-form-item>

      <el-form-item
        label="Diagnosis"
        prop="diagnosis"
      >
        <el-input
          v-model="formData.diagnosis"
          type="textarea"
          :rows="2"
          placeholder="Enter diagnosis"
          maxlength="2000"
          show-word-limit
        />
      </el-form-item>

      <el-form-item
        label="Treatment Plan"
        prop="treatmentPlan"
      >
        <el-input
          v-model="formData.treatmentPlan"
          type="textarea"
          :rows="3"
          placeholder="Enter treatment plan"
          maxlength="5000"
          show-word-limit
        />
      </el-form-item>

      <el-form-item
        label="Notes"
        prop="notes"
      >
        <el-input
          v-model="formData.notes"
          type="textarea"
          :rows="2"
          placeholder="Enter additional notes"
          maxlength="2000"
          show-word-limit
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="$emit('update:visible', false)">
        Cancel
      </el-button>
      <el-button
        type="primary"
        :loading="submitting"
        @click="handleSubmit"
      >
        {{ mode === 'create' ? 'Create' : 'Save' }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, reactive } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import { ElMessage } from 'element-plus';
import { useMedicalRecordStore } from '@/stores/medicalRecord';
import type { MedicalRecord, MedicalRecordFormData, VisitType } from '@/types';
import { visitTypeOptions } from '@/types';
import { getPatients } from '@/api/patient';
import { getDoctors } from '@/api/doctor';
import DepartmentSelect from '@/components/common/DepartmentSelect.vue';

interface Props {
  visible: boolean;
  record?: MedicalRecord | null;
  mode: 'create' | 'edit';
}

const props = withDefaults(defineProps<Props>(), {
  record: null,
});

const emit = defineEmits<{
  'update:visible': [value: boolean];
  success: [];
}>();

const medicalRecordStore = useMedicalRecordStore();
const formRef = ref<FormInstance>();
const submitting = ref(false);

// Patient search
const patientLoading = ref(false);
const patientOptions = ref<Array<{ id: number; name: string; medicalNo: string }>>([]);

// Doctor search
const doctorLoading = ref(false);
const doctorOptions = ref<Array<{ id: number; name: string; title: string | null }>>([]);

// Form data
const formData = reactive<MedicalRecordFormData>({
  patientId: 0,
  doctorId: 0,
  departmentId: null,
  visitType: 'outpatient',
  visitDate: new Date().toISOString(),
  chiefComplaint: '',
  presentIllness: '',
  physicalExam: '',
  diagnosis: '',
  treatmentPlan: '',
  notes: '',
});

// Validation rules
const rules: FormRules = {
  patientId: [
    { required: true, message: 'Please select a patient', trigger: 'change' },
  ],
  doctorId: [
    { required: true, message: 'Please select a doctor', trigger: 'change' },
  ],
  visitType: [
    { required: true, message: 'Please select visit type', trigger: 'change' },
  ],
  visitDate: [
    { required: true, message: 'Please select visit date', trigger: 'change' },
  ],
};

// Search patients
async function searchPatients(query: string): Promise<void> {
  if (!query) {
    patientOptions.value = [];
    return;
  }

  patientLoading.value = true;
  try {
    const response = await getPatients({ name: query, pageSize: 20 });
    if (response.data) {
      patientOptions.value = response.data.list.map((p) => ({
        id: p.id,
        name: p.name,
        medicalNo: p.medicalNo,
      }));
    }
  } catch {
    patientOptions.value = [];
  } finally {
    patientLoading.value = false;
  }
}

// Search doctors
async function searchDoctors(query: string): Promise<void> {
  if (!query) {
    doctorOptions.value = [];
    return;
  }

  doctorLoading.value = true;
  try {
    const response = await getDoctors({ name: query, pageSize: 20 });
    if (response.data) {
      doctorOptions.value = response.data.list.map((d) => ({
        id: d.id,
        name: d.name,
        title: d.title,
      }));
    }
  } catch {
    doctorOptions.value = [];
  } finally {
    doctorLoading.value = false;
  }
}

// Reset form
function resetForm(): void {
  formData.patientId = 0;
  formData.doctorId = 0;
  formData.departmentId = null;
  formData.visitType = 'outpatient';
  formData.visitDate = new Date().toISOString();
  formData.chiefComplaint = '';
  formData.presentIllness = '';
  formData.physicalExam = '';
  formData.diagnosis = '';
  formData.treatmentPlan = '';
  formData.notes = '';
  patientOptions.value = [];
  doctorOptions.value = [];
}

// Populate form with record data
function populateForm(record: MedicalRecord): void {
  formData.patientId = record.patientId;
  formData.doctorId = record.doctorId;
  formData.departmentId = record.departmentId;
  formData.visitType = record.visitType as VisitType || 'outpatient';
  formData.visitDate = record.visitDate;
  formData.chiefComplaint = record.chiefComplaint || '';
  formData.presentIllness = record.presentIllness || '';
  formData.physicalExam = record.physicalExam || '';
  formData.diagnosis = record.diagnosis || '';
  formData.treatmentPlan = record.treatmentPlan || '';
  formData.notes = record.notes || '';

  // Set patient option
  if (record.patient) {
    patientOptions.value = [{
      id: record.patient.id,
      name: record.patient.name,
      medicalNo: record.patient.medicalNo,
    }];
  }

  // Set doctor option
  if (record.doctor) {
    doctorOptions.value = [{
      id: record.doctor.id,
      name: record.doctor.name,
      title: record.doctor.title,
    }];
  }
}

// Watch for dialog open
watch(
  () => props.visible,
  (newVal) => {
    if (newVal) {
      if (props.mode === 'edit' && props.record) {
        populateForm(props.record);
      } else {
        resetForm();
      }
    }
  }
);

// Handle dialog closed
function handleClosed(): void {
  formRef.value?.resetFields();
  resetForm();
}

// Handle form submit
async function handleSubmit(): Promise<void> {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
  } catch {
    return;
  }

  submitting.value = true;

  try {
    let result;

    if (props.mode === 'create') {
      result = await medicalRecordStore.createRecord(formData);
    } else if (props.record) {
      result = await medicalRecordStore.updateRecord(props.record.id, formData);
    }

    if (result) {
      ElMessage.success(
        props.mode === 'create'
          ? 'Medical record created successfully'
          : 'Medical record updated successfully'
      );
      emit('success');
    }
  } finally {
    submitting.value = false;
  }
}
</script>

<style scoped>
.el-divider {
  margin: 20px 0;
}
</style>
