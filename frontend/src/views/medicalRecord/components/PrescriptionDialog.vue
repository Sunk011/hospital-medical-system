<template>
  <el-dialog
    :model-value="visible"
    :title="mode === 'create' ? $t('prescription.addPrescription') : $t('prescription.editPrescription')"
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
        :label="$t('prescription.medicineName')"
        prop="medicineName"
      >
        <el-input
          v-model="formData.medicineName"
          :placeholder="$t('prescription.enterMedicineName')"
          maxlength="100"
        />
      </el-form-item>

      <el-form-item
        :label="$t('prescription.specification')"
        prop="specification"
      >
        <el-input
          v-model="formData.specification"
          :placeholder="$t('prescription.enterSpecification')"
          maxlength="100"
        />
      </el-form-item>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item
            :label="$t('prescription.dosage')"
            prop="dosage"
          >
            <el-input
              v-model="formData.dosage"
              :placeholder="$t('prescription.enterDosage')"
              maxlength="50"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            :label="$t('prescription.frequency')"
            prop="frequency"
          >
            <el-select
              v-model="formData.frequency"
              :placeholder="$t('prescription.selectFrequency')"
              style="width: 100%"
              allow-create
              filterable
            >
              <el-option
                :label="$t('prescription.onceDaily')"
                value="Once daily"
              />
              <el-option
                :label="$t('prescription.twiceDaily')"
                value="Twice daily"
              />
              <el-option
                :label="$t('prescription.threeTimesDaily')"
                value="Three times daily"
              />
              <el-option
                :label="$t('prescription.fourTimesDaily')"
                value="Four times daily"
              />
              <el-option
                :label="$t('prescription.every4Hours')"
                value="Every 4 hours"
              />
              <el-option
                :label="$t('prescription.every6Hours')"
                value="Every 6 hours"
              />
              <el-option
                :label="$t('prescription.every8Hours')"
                value="Every 8 hours"
              />
              <el-option
                :label="$t('prescription.every12Hours')"
                value="Every 12 hours"
              />
              <el-option
                :label="$t('prescription.asNeeded')"
                value="As needed"
              />
              <el-option
                :label="$t('prescription.beforeMeals')"
                value="Before meals"
              />
              <el-option
                :label="$t('prescription.afterMeals')"
                value="After meals"
              />
              <el-option
                :label="$t('prescription.atBedtime')"
                value="At bedtime"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item
            :label="$t('prescription.duration')"
            prop="duration"
          >
            <el-select
              v-model="formData.duration"
              :placeholder="$t('prescription.selectDuration')"
              style="width: 100%"
              allow-create
              filterable
            >
              <el-option
                :label="$t('prescription.threeDays')"
                value="3 days"
              />
              <el-option
                :label="$t('prescription.fiveDays')"
                value="5 days"
              />
              <el-option
                :label="$t('prescription.sevenDays')"
                value="7 days"
              />
              <el-option
                :label="$t('prescription.tenDays')"
                value="10 days"
              />
              <el-option
                :label="$t('prescription.fourteenDays')"
                value="14 days"
              />
              <el-option
                :label="$t('prescription.oneMonth')"
                value="1 month"
              />
              <el-option
                :label="$t('prescription.twoMonths')"
                value="2 months"
              />
              <el-option
                :label="$t('prescription.threeMonths')"
                value="3 months"
              />
              <el-option
                :label="$t('prescription.longTerm')"
                value="Long-term"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            :label="$t('prescription.quantity')"
            prop="quantity"
          >
            <el-input-number
              v-model="formData.quantity"
              :min="1"
              :max="9999"
              :placeholder="$t('prescription.quantity')"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item
        :label="$t('prescription.notes')"
        prop="notes"
      >
        <el-input
          v-model="formData.notes"
          type="textarea"
          :rows="2"
          :placeholder="$t('prescription.enterNotes')"
          maxlength="255"
          show-word-limit
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="$emit('update:visible', false)">
        {{ $t('common.cancel') }}
      </el-button>
      <el-button
        type="primary"
        :loading="submitting"
        @click="handleSubmit"
      >
        {{ mode === 'create' ? $t('common.create') : $t('common.save') }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
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

const { t } = useI18n();
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
    { required: true, message: () => t('prescription.medicineNameRequired'), trigger: 'blur' },
    { min: 1, max: 100, message: () => t('prescription.medicineNameLength'), trigger: 'blur' },
  ],
  specification: [
    { max: 100, message: () => t('prescription.specificationLength'), trigger: 'blur' },
  ],
  dosage: [
    { max: 50, message: () => t('prescription.dosageLength'), trigger: 'blur' },
  ],
  frequency: [
    { max: 50, message: () => t('prescription.frequencyLength'), trigger: 'blur' },
  ],
  duration: [
    { max: 50, message: () => t('prescription.durationLength'), trigger: 'blur' },
  ],
  quantity: [
    { type: 'number', min: 1, message: () => t('prescription.quantityMin'), trigger: 'blur' },
  ],
  notes: [
    { max: 255, message: () => t('prescription.notesLength'), trigger: 'blur' },
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
          ? t('prescription.addSuccess')
          : t('prescription.updateSuccess')
      );
      emit('success');
    }
  } finally {
    submitting.value = false;
  }
}
</script>
