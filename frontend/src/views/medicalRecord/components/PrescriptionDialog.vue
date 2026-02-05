<template>
  <el-dialog
    :model-value="visible"
    :title="mode === 'create' ? 'Add Prescription' : 'Edit Prescription'"
    width="600px"
    :close-on-click-modal="false"
    @update:model-value="$emit('update:visible', $event)"
    @closed="handleClosed"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="120px"
      @submit.prevent="handleSubmit"
    >
      <el-form-item
        label="Medicine Name"
        prop="medicineName"
      >
        <el-input
          v-model="formData.medicineName"
          placeholder="Enter medicine name"
          maxlength="100"
        />
      </el-form-item>

      <el-form-item
        label="Specification"
        prop="specification"
      >
        <el-input
          v-model="formData.specification"
          placeholder="e.g., 500mg, 10ml"
          maxlength="100"
        />
      </el-form-item>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item
            label="Dosage"
            prop="dosage"
          >
            <el-input
              v-model="formData.dosage"
              placeholder="e.g., 1 tablet, 5ml"
              maxlength="50"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="Frequency"
            prop="frequency"
          >
            <el-select
              v-model="formData.frequency"
              placeholder="Select frequency"
              style="width: 100%"
              allow-create
              filterable
            >
              <el-option
                label="Once daily"
                value="Once daily"
              />
              <el-option
                label="Twice daily"
                value="Twice daily"
              />
              <el-option
                label="Three times daily"
                value="Three times daily"
              />
              <el-option
                label="Four times daily"
                value="Four times daily"
              />
              <el-option
                label="Every 4 hours"
                value="Every 4 hours"
              />
              <el-option
                label="Every 6 hours"
                value="Every 6 hours"
              />
              <el-option
                label="Every 8 hours"
                value="Every 8 hours"
              />
              <el-option
                label="Every 12 hours"
                value="Every 12 hours"
              />
              <el-option
                label="As needed"
                value="As needed"
              />
              <el-option
                label="Before meals"
                value="Before meals"
              />
              <el-option
                label="After meals"
                value="After meals"
              />
              <el-option
                label="At bedtime"
                value="At bedtime"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item
            label="Duration"
            prop="duration"
          >
            <el-select
              v-model="formData.duration"
              placeholder="Select duration"
              style="width: 100%"
              allow-create
              filterable
            >
              <el-option
                label="3 days"
                value="3 days"
              />
              <el-option
                label="5 days"
                value="5 days"
              />
              <el-option
                label="7 days"
                value="7 days"
              />
              <el-option
                label="10 days"
                value="10 days"
              />
              <el-option
                label="14 days"
                value="14 days"
              />
              <el-option
                label="1 month"
                value="1 month"
              />
              <el-option
                label="2 months"
                value="2 months"
              />
              <el-option
                label="3 months"
                value="3 months"
              />
              <el-option
                label="Long-term"
                value="Long-term"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="Quantity"
            prop="quantity"
          >
            <el-input-number
              v-model="formData.quantity"
              :min="1"
              :max="9999"
              placeholder="Quantity"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item
        label="Notes"
        prop="notes"
      >
        <el-input
          v-model="formData.notes"
          type="textarea"
          :rows="2"
          placeholder="Additional instructions or notes"
          maxlength="255"
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
        {{ mode === 'create' ? 'Add' : 'Save' }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, reactive } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import { ElMessage } from 'element-plus';
import { useMedicalRecordStore } from '@/stores/medicalRecord';
import type { Prescription, PrescriptionFormData } from '@/types';

interface Props {
  visible: boolean;
  prescription?: Prescription | null;
  recordId: number;
  mode: 'create' | 'edit';
}

const props = withDefaults(defineProps<Props>(), {
  prescription: null,
});

const emit = defineEmits<{
  'update:visible': [value: boolean];
  success: [];
}>();

const medicalRecordStore = useMedicalRecordStore();
const formRef = ref<FormInstance>();
const submitting = ref(false);

// Form data
const formData = reactive<PrescriptionFormData>({
  recordId: 0,
  medicineName: '',
  specification: '',
  dosage: '',
  frequency: '',
  duration: '',
  quantity: undefined,
  notes: '',
});

// Validation rules
const rules: FormRules = {
  medicineName: [
    { required: true, message: 'Please enter medicine name', trigger: 'blur' },
    { min: 1, max: 100, message: 'Medicine name must be between 1 and 100 characters', trigger: 'blur' },
  ],
  specification: [
    { max: 100, message: 'Specification must not exceed 100 characters', trigger: 'blur' },
  ],
  dosage: [
    { max: 50, message: 'Dosage must not exceed 50 characters', trigger: 'blur' },
  ],
  frequency: [
    { max: 50, message: 'Frequency must not exceed 50 characters', trigger: 'blur' },
  ],
  duration: [
    { max: 50, message: 'Duration must not exceed 50 characters', trigger: 'blur' },
  ],
  quantity: [
    { type: 'number', min: 1, message: 'Quantity must be at least 1', trigger: 'blur' },
  ],
  notes: [
    { max: 255, message: 'Notes must not exceed 255 characters', trigger: 'blur' },
  ],
};

// Reset form
function resetForm(): void {
  formData.recordId = props.recordId;
  formData.medicineName = '';
  formData.specification = '';
  formData.dosage = '';
  formData.frequency = '';
  formData.duration = '';
  formData.quantity = undefined;
  formData.notes = '';
}

// Populate form with prescription data
function populateForm(prescription: Prescription): void {
  formData.recordId = prescription.recordId;
  formData.medicineName = prescription.medicineName;
  formData.specification = prescription.specification || '';
  formData.dosage = prescription.dosage || '';
  formData.frequency = prescription.frequency || '';
  formData.duration = prescription.duration || '';
  formData.quantity = prescription.quantity || undefined;
  formData.notes = prescription.notes || '';
}

// Watch for dialog open
watch(
  () => props.visible,
  (newVal) => {
    if (newVal) {
      if (props.mode === 'edit' && props.prescription) {
        populateForm(props.prescription);
      } else {
        resetForm();
      }
    }
  }
);

// Watch for recordId changes
watch(
  () => props.recordId,
  (newVal) => {
    formData.recordId = newVal;
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
      result = await medicalRecordStore.addPrescription({
        ...formData,
        recordId: props.recordId,
      });
    } else if (props.prescription) {
      result = await medicalRecordStore.editPrescription(props.prescription.id, formData);
    }

    if (result) {
      ElMessage.success(
        props.mode === 'create'
          ? 'Prescription added successfully'
          : 'Prescription updated successfully'
      );
      emit('success');
    }
  } finally {
    submitting.value = false;
  }
}
</script>
