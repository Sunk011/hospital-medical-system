<template>
  <el-dialog
    :model-value="visible"
    :title="mode === 'create' ? $t('department.addDepartment') : $t('department.editDepartment')"
    width="500px"
    @update:model-value="$emit('update:visible', $event)"
    @closed="handleClosed"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="80px"
    >
      <el-form-item
        :label="$t('department.name')"
        prop="name"
      >
        <el-input
          v-model="formData.name"
          :placeholder="$t('department.enterName')"
        />
      </el-form-item>
      <el-form-item
        :label="$t('department.code')"
        prop="code"
      >
        <el-input
          v-model="formData.code"
          :placeholder="$t('department.enterCode')"
        />
      </el-form-item>
      <el-form-item
        :label="$t('department.description')"
        prop="description"
      >
        <el-input
          v-model="formData.description"
          type="textarea"
          :rows="3"
          :placeholder="$t('department.enterDescription')"
        />
      </el-form-item>
      <el-form-item
        :label="$t('department.status')"
        prop="status"
      >
        <el-switch
          v-model="statusActive"
          :active-text="$t('department.active')"
          :inactive-text="$t('department.inactive')"
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
import { ref, reactive, watch, computed } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import { ElMessage } from 'element-plus';
import { useDepartmentStore } from '@/stores/department';
import type { Department } from '@/types';
import { useI18n } from 'vue-i18n';

// Props
const props = defineProps<{
  visible: boolean;
  department: Department | null;
  mode: 'create' | 'edit';
}>();

// Emits
const emit = defineEmits<{
  'update:visible': [value: boolean];
  success: [];
}>();

const { t } = useI18n();
const departmentStore = useDepartmentStore();
const formRef = ref<FormInstance>();
const loading = ref(false);

// Form data
const formData = reactive({
  name: '',
  code: '' as string | null,
  description: '' as string | null,
  status: 1,
});

// Status computed
const statusActive = computed({
  get: () => formData.status === 1,
  set: (val) => {
    formData.status = val ? 1 : 0;
  },
});

// Form rules
const formRules: FormRules = {
  name: [
    { required: true, message: () => t('department.nameRequired'), trigger: 'blur' },
    { min: 2, max: 100, message: () => t('department.nameLength'), trigger: 'blur' },
  ],
  code: [
    { min: 2, max: 20, message: () => t('department.codeLength'), trigger: 'blur' },
    {
      pattern: /^[A-Za-z0-9-]*$/,
      message: () => t('department.codePattern'),
      trigger: 'blur',
    },
  ],
  description: [
    { max: 500, message: () => t('department.descriptionLength'), trigger: 'blur' },
  ],
};

// Reset form
function resetForm(): void {
  formData.name = '';
  formData.code = null;
  formData.description = null;
  formData.status = 1;
}

// Populate form
function populateForm(dept: Department): void {
  formData.name = dept.name;
  formData.code = dept.code;
  formData.description = dept.description || null;
  formData.status = dept.status ?? 1;
}

// Watch visibility
watch(
  () => props.visible,
  (newVal) => {
    if (newVal) {
      if (props.mode === 'edit' && props.department) {
        populateForm(props.department);
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
    if (props.mode === 'create') {
      const result = await departmentStore.createDepartment({
        name: formData.name,
        code: formData.code || null,
        description: formData.description || null,
        status: formData.status,
      });
      if (result) {
        ElMessage.success(t('department.departmentCreated'));
        emit('success');
      }
    } else if (props.department) {
      const result = await departmentStore.updateDepartment(props.department.id, {
        name: formData.name,
        code: formData.code || null,
        description: formData.description || null,
        status: formData.status,
      });
      if (result) {
        ElMessage.success(t('department.departmentUpdated'));
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
</script>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
