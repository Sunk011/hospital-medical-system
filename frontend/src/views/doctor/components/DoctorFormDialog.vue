<template>
  <el-dialog
    :model-value="visible"
    :title="mode === 'create' ? $t('doctor.addDoctor') : $t('doctor.editDoctor')"
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
            :label="$t('doctor.name')"
            prop="name"
          >
            <el-input
              v-model="formData.name"
              :placeholder="$t('doctor.enterName')"
              maxlength="50"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            :label="$t('doctor.userAccount')"
            prop="userId"
          >
            <el-select
              v-model="formData.userId"
              :placeholder="$t('doctor.selectUserAccount')"
              :disabled="mode === 'edit'"
              filterable
              style="width: 100%"
            >
              <el-option
                v-for="user in availableUsers"
                :key="user.id"
                :label="`${user.username} (${user.email || $t('doctor.noEmail')})`"
                :value="user.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item
            :label="$t('doctor.department')"
            prop="departmentId"
          >
            <DepartmentSelect
              v-model="formData.departmentId"
              :placeholder="$t('doctor.selectDepartment')"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            :label="$t('doctor.titleLabel')"
            prop="title"
          >
            <el-select
              v-model="formData.title"
              :placeholder="$t('doctor.selectTitle')"
              clearable
              filterable
              allow-create
              style="width: 100%"
            >
              <el-option
                v-for="title in doctorTitles"
                :key="title"
                :label="title"
                :value="title"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item
            :label="$t('doctor.licenseNo')"
            prop="licenseNo"
          >
            <el-input
              v-model="formData.licenseNo"
              :placeholder="$t('doctor.enterLicenseNo')"
              maxlength="50"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            :label="$t('doctor.specialty')"
            prop="specialty"
          >
            <el-input
              v-model="formData.specialty"
              :placeholder="$t('doctor.enterSpecialty')"
              maxlength="200"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item
        :label="$t('doctor.introduction')"
        prop="introduction"
      >
        <el-input
          v-model="formData.introduction"
          type="textarea"
          :placeholder="$t('doctor.enterIntroduction')"
          maxlength="2000"
          :rows="4"
          show-word-limit
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
import { ref, watch, reactive, computed } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import { ElMessage } from 'element-plus';
import { useDoctorStore } from '@/stores/doctor';
import type { Doctor, DoctorCreateData, DoctorUpdateData } from '@/types';
import DepartmentSelect from '@/components/common/DepartmentSelect.vue';
import request from '@/utils/request';
import { logger } from '@/utils';
import { useI18n } from 'vue-i18n';

// Props
const props = defineProps<{
  visible: boolean;
  doctor: Doctor | null;
  mode: 'create' | 'edit';
}>();

// Emits
const emit = defineEmits<{
  'update:visible': [value: boolean];
  success: [];
}>();

const doctorStore = useDoctorStore();
const { t } = useI18n();
const formRef = ref<FormInstance>();
const loading = ref(false);

// Available users with role 'doctor' who don't have a doctor profile yet
const availableUsers = ref<Array<{ id: number; username: string; email: string | null }>>([]);

// Doctor titles
const doctorTitles = computed(() => [
  t('doctor.chiefPhysician'),
  t('doctor.assocChiefPhysician'),
  t('doctor.attendingPhysician'),
  t('doctor.residentPhysician'),
  t('doctor.intern'),
]);

// Form data
const formData = reactive<DoctorCreateData>({
  userId: 0,
  name: '',
  departmentId: null,
  title: null,
  specialty: null,
  licenseNo: null,
  introduction: null,
});

// Validation functions
const validateLicenseNo = (_rule: unknown, value: string, callback: (error?: Error) => void) => {
  if (!value) {
    callback();
    return;
  }
  const licenseRegex = /^[A-Za-z0-9-]{5,50}$/;
  if (!licenseRegex.test(value)) {
    callback(new Error(t('doctor.licenseNoFormat')));
  } else {
    callback();
  }
};

// Form rules
const formRules: FormRules = {
  userId: [
    { required: true, message: () => t('doctor.userAccountRequired'), trigger: 'change' },
  ],
  name: [
    { required: true, message: () => t('doctor.nameRequired'), trigger: 'blur' },
    { min: 2, max: 50, message: () => t('doctor.nameLength'), trigger: 'blur' },
    {
      pattern: /^[\u4e00-\u9fa5a-zA-Z\s]+$/,
      message: () => t('doctor.namePattern'),
      trigger: 'blur',
    },
  ],
  licenseNo: [{ validator: validateLicenseNo, trigger: 'blur' }],
  title: [{ max: 50, message: () => t('doctor.titleLength'), trigger: 'blur' }],
  specialty: [{ max: 200, message: () => t('doctor.specialtyLength'), trigger: 'blur' }],
  introduction: [
    { max: 2000, message: () => t('doctor.introductionLength'), trigger: 'blur' },
  ],
};

// Load available users (users with role 'doctor' without doctor profile)
async function loadAvailableUsers(): Promise<void> {
  try {
    // This would ideally be a dedicated API endpoint
    // For now, we'll use a simple approach
    const response = await request.get('/auth/users', {
      params: { role: 'doctor', hasDoctor: false },
    });
    if (response.data?.data) {
      availableUsers.value = response.data.data;
    }
  } catch (error) {
    logger.error('Failed to load available users', error);
    // If the endpoint doesn't exist, we'll show an empty list
    availableUsers.value = [];
  }
}

// Reset form
function resetForm(): void {
  formData.userId = 0;
  formData.name = '';
  formData.departmentId = null;
  formData.title = null;
  formData.specialty = null;
  formData.licenseNo = null;
  formData.introduction = null;
}

// Populate form with doctor data
function populateForm(doctor: Doctor): void {
  formData.userId = doctor.userId;
  formData.name = doctor.name;
  formData.departmentId = doctor.department?.id || null;
  formData.title = doctor.title;
  formData.specialty = doctor.specialty;
  formData.licenseNo = doctor.licenseNo;
  formData.introduction = doctor.introduction;
}

// Watch for visibility changes
watch(
  () => props.visible,
  (newVal) => {
    if (newVal) {
      if (props.mode === 'edit' && props.doctor) {
        populateForm(props.doctor);
        // Add current user to available users for edit mode
        availableUsers.value = [{
          id: props.doctor.userId,
          username: props.doctor.user.username,
          email: props.doctor.user.email,
        }];
      } else {
        resetForm();
        loadAvailableUsers();
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
    if (props.mode === 'create') {
      const result = await doctorStore.createDoctor(formData);
      if (result) {
        ElMessage.success(t('doctor.doctorCreated'));
        emit('success');
      }
    } else if (props.doctor) {
      const updateData: DoctorUpdateData = {
        name: formData.name,
        departmentId: formData.departmentId,
        title: formData.title,
        specialty: formData.specialty,
        licenseNo: formData.licenseNo,
        introduction: formData.introduction,
      };
      const result = await doctorStore.updateDoctor(props.doctor.id, updateData);
      if (result) {
        ElMessage.success(t('doctor.doctorUpdated'));
        emit('success');
      }
    }
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    ElMessage.error(err.response?.data?.message || t('common.operationFailed'));
  } finally {
    loading.value = false;
  }
}

// Note: loadAvailableUsers is called via watch when dialog becomes visible
// Do NOT call it in onMounted as the dialog may not be visible yet
</script>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
