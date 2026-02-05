<template>
  <el-dialog
    :model-value="visible"
    :title="mode === 'create' ? 'Add New Doctor' : 'Edit Doctor'"
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
            label="Name"
            prop="name"
          >
            <el-input
              v-model="formData.name"
              placeholder="Enter doctor name"
              maxlength="50"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="User Account"
            prop="userId"
          >
            <el-select
              v-model="formData.userId"
              placeholder="Select user account"
              :disabled="mode === 'edit'"
              filterable
              style="width: 100%"
            >
              <el-option
                v-for="user in availableUsers"
                :key="user.id"
                :label="`${user.username} (${user.email || 'No email'})`"
                :value="user.id"
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
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="Title"
            prop="title"
          >
            <el-select
              v-model="formData.title"
              placeholder="Select title"
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
            label="License No."
            prop="licenseNo"
          >
            <el-input
              v-model="formData.licenseNo"
              placeholder="Medical license number"
              maxlength="50"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="Specialty"
            prop="specialty"
          >
            <el-input
              v-model="formData.specialty"
              placeholder="e.g., Cardiology, Pediatrics"
              maxlength="200"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item
        label="Introduction"
        prop="introduction"
      >
        <el-input
          v-model="formData.introduction"
          type="textarea"
          placeholder="Enter doctor's professional introduction, education background, achievements, etc."
          maxlength="2000"
          :rows="4"
          show-word-limit
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="$emit('update:visible', false)">
          Cancel
        </el-button>
        <el-button
          type="primary"
          :loading="loading"
          @click="handleSubmit"
        >
          {{ mode === 'create' ? 'Create' : 'Save' }}
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, reactive, onMounted } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import { ElMessage } from 'element-plus';
import { useDoctorStore } from '@/stores/doctor';
import type { Doctor, DoctorCreateData, DoctorUpdateData } from '@/types';
import DepartmentSelect from '@/components/common/DepartmentSelect.vue';
import request from '@/utils/request';
import { logger } from '@/utils';

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
const formRef = ref<FormInstance>();
const loading = ref(false);

// Available users with role 'doctor' who don't have a doctor profile yet
const availableUsers = ref<Array<{ id: number; username: string; email: string | null }>>([]);

// Doctor titles
const doctorTitles = [
  'Chief Physician',
  'Associate Chief Physician',
  'Attending Physician',
  'Resident Physician',
  'Intern',
];

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
    callback(new Error('License number must be 5-50 alphanumeric characters'));
  } else {
    callback();
  }
};

// Form rules
const formRules: FormRules = {
  userId: [
    { required: true, message: 'User account is required', trigger: 'change' },
  ],
  name: [
    { required: true, message: 'Name is required', trigger: 'blur' },
    { min: 2, max: 50, message: 'Name must be 2-50 characters', trigger: 'blur' },
    {
      pattern: /^[\u4e00-\u9fa5a-zA-Z\s]+$/,
      message: 'Name can only contain Chinese/English characters',
      trigger: 'blur',
    },
  ],
  licenseNo: [{ validator: validateLicenseNo, trigger: 'blur' }],
  title: [{ max: 50, message: 'Title must not exceed 50 characters', trigger: 'blur' }],
  specialty: [{ max: 200, message: 'Specialty must not exceed 200 characters', trigger: 'blur' }],
  introduction: [
    { max: 2000, message: 'Introduction must not exceed 2000 characters', trigger: 'blur' },
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
        ElMessage.success('Doctor created successfully');
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
        ElMessage.success('Doctor updated successfully');
        emit('success');
      }
    }
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    ElMessage.error(err.response?.data?.message || 'Operation failed');
  } finally {
    loading.value = false;
  }
}

// Load available users on mount
onMounted(() => {
  if (props.mode === 'create') {
    loadAvailableUsers();
  }
});
</script>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
