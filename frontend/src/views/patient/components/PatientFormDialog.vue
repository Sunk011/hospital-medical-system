<template>
  <el-dialog
    :model-value="visible"
    :title="mode === 'create' ? $t('patient.addPatient') : $t('patient.editPatient')"
    width="700px"
    :close-on-click-modal="false"
    @update:model-value="$emit('update:visible', $event)"
    @closed="handleClosed"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="140px"
      label-position="right"
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item
            :label="$t('patient.name')"
            prop="name"
          >
            <el-input
              v-model="formData.name"
              :placeholder="$t('patient.enterName')"
              maxlength="50"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            :label="$t('patient.gender')"
            prop="gender"
          >
            <el-radio-group v-model="formData.gender">
              <el-radio value="M">
                {{ $t('patient.male') }}
              </el-radio>
              <el-radio value="F">
                {{ $t('patient.female') }}
              </el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item
            :label="$t('patient.birthDate')"
            prop="birthDate"
          >
            <el-date-picker
              v-model="formData.birthDate"
              type="date"
              :placeholder="$t('patient.selectBirthDate')"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              :disabled-date="disableFutureDate"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            :label="$t('patient.bloodType')"
            prop="bloodType"
          >
            <el-select
              v-model="formData.bloodType"
              :placeholder="$t('patient.selectBloodType')"
              clearable
              style="width: 100%"
            >
              <el-option
                label="A"
                value="A"
              />
              <el-option
                label="B"
                value="B"
              />
              <el-option
                label="AB"
                value="AB"
              />
              <el-option
                label="O"
                value="O"
              />
              <el-option
                label="Unknown"
                value="Unknown"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item
            :label="$t('patient.idCard')"
            prop="idCard"
          >
            <el-input
              v-model="formData.idCard"
              :placeholder="$t('patient.enterIdCard')"
              maxlength="18"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            :label="$t('patient.phone')"
            prop="phone"
          >
            <el-input
              v-model="formData.phone"
              :placeholder="$t('patient.enterPhone')"
              maxlength="11"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item
            :label="$t('patient.emergencyContact')"
            prop="emergencyContact"
          >
            <el-input
              v-model="formData.emergencyContact"
              :placeholder="$t('patient.enterEmergencyContact')"
              maxlength="50"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            :label="$t('patient.emergencyPhone')"
            prop="emergencyPhone"
          >
            <el-input
              v-model="formData.emergencyPhone"
              :placeholder="$t('patient.enterEmergencyPhone')"
              maxlength="11"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item
        :label="$t('patient.address')"
        prop="address"
      >
        <el-input
          v-model="formData.address"
          type="textarea"
          :placeholder="$t('patient.enterAddress')"
          maxlength="255"
          :rows="2"
        />
      </el-form-item>

      <el-form-item
        :label="$t('patient.allergies')"
        prop="allergies"
      >
        <el-input
          v-model="formData.allergies"
          type="textarea"
          :placeholder="$t('patient.enterAllergies')"
          maxlength="1000"
          :rows="2"
        />
      </el-form-item>

      <el-form-item
        :label="$t('patient.medicalHistory')"
        prop="medicalHistory"
      >
        <el-input
          v-model="formData.medicalHistory"
          type="textarea"
          :placeholder="$t('patient.enterMedicalHistory')"
          maxlength="2000"
          :rows="3"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="$emit('update:visible', false)">
          {{ $t('common.cancel') }}
        </el-button>
        <el-button
          type="primary"
          :loading="loading"
          @click="handleSubmit"
        >
          {{ mode === 'create' ? $t('common.create') : $t('common.save') }}
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, reactive } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import { ElMessage } from 'element-plus';
import { usePatientStore } from '@/stores/patient';
import type { Patient, PatientFormData, Gender, BloodType } from '@/types';
import { useI18n } from 'vue-i18n';

// Props
const props = defineProps<{
  visible: boolean;
  patient: Patient | null;
  mode: 'create' | 'edit';
}>();

// Emits
const emit = defineEmits<{
  'update:visible': [value: boolean];
  success: [];
}>();

const patientStore = usePatientStore();
const formRef = ref<FormInstance>();
const loading = ref(false);
const { t } = useI18n();

// Form data
const formData = reactive<PatientFormData>({
  name: '',
  gender: null,
  birthDate: null,
  bloodType: null,
  idCard: null,
  phone: null,
  emergencyContact: null,
  emergencyPhone: null,
  address: null,
  allergies: null,
  medicalHistory: null,
});

// Validation functions
const validateIdCard = (_rule: unknown, value: string, callback: (error?: Error) => void) => {
  if (!value) {
    callback();
    return;
  }
  const idCardRegex = /^[1-9]\d{5}(19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/;
  if (!idCardRegex.test(value)) {
    callback(new Error(t('patient.invalidIdCard')));
  } else {
    callback();
  }
};

const validatePhone = (_rule: unknown, value: string, callback: (error?: Error) => void) => {
  if (!value) {
    callback();
    return;
  }
  const phoneRegex = /^1[3-9]\d{9}$/;
  if (!phoneRegex.test(value)) {
    callback(new Error(t('patient.invalidPhone')));
  } else {
    callback();
  }
};

// Form rules
const formRules: FormRules = {
  name: [
    { required: true, message: () => t('patient.nameRequired'), trigger: 'blur' },
    { min: 2, max: 50, message: () => t('patient.nameLength'), trigger: 'blur' },
    {
      pattern: /^[\u4e00-\u9fa5a-zA-Z\s]+$/,
      message: () => t('patient.namePattern'),
      trigger: 'blur',
    },
  ],
  idCard: [{ validator: validateIdCard, trigger: 'blur' }],
  phone: [{ validator: validatePhone, trigger: 'blur' }],
  emergencyPhone: [{ validator: validatePhone, trigger: 'blur' }],
  address: [{ max: 255, message: () => t('patient.addressLength'), trigger: 'blur' }],
  allergies: [{ max: 1000, message: () => t('patient.allergiesLength'), trigger: 'blur' }],
  medicalHistory: [
    { max: 2000, message: () => t('patient.medicalHistoryLength'), trigger: 'blur' },
  ],
};

// Disable future dates
function disableFutureDate(date: Date): boolean {
  return date > new Date();
}

// Reset form
function resetForm(): void {
  formData.name = '';
  formData.gender = null;
  formData.birthDate = null;
  formData.bloodType = null;
  formData.idCard = null;
  formData.phone = null;
  formData.emergencyContact = null;
  formData.emergencyPhone = null;
  formData.address = null;
  formData.allergies = null;
  formData.medicalHistory = null;
}

// Populate form with patient data
function populateForm(patient: Patient): void {
  formData.name = patient.name;
  formData.gender = patient.gender as Gender | null;
  formData.birthDate = patient.birthDate ? patient.birthDate.split('T')[0] : null;
  formData.bloodType = patient.bloodType as BloodType | null;
  formData.idCard = patient.idCard;
  formData.phone = patient.phone;
  formData.emergencyContact = patient.emergencyContact;
  formData.emergencyPhone = patient.emergencyPhone;
  formData.address = patient.address;
  formData.allergies = patient.allergies;
  formData.medicalHistory = patient.medicalHistory;
}

// Watch for patient changes
watch(
  () => props.visible,
  (newVal) => {
    if (newVal) {
      if (props.mode === 'edit' && props.patient) {
        populateForm(props.patient);
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

  loading.value = true;
  try {
    let result;
    if (props.mode === 'create') {
      result = await patientStore.createPatient(formData);
      if (result) {
        ElMessage.success(t('patient.patientCreated'));
        emit('success');
      }
    } else if (props.patient) {
      result = await patientStore.updatePatient(props.patient.id, formData);
      if (result) {
        ElMessage.success(t('patient.patientUpdated'));
        emit('success');
      }
    }
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
