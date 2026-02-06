<template>
  <el-dialog
    :model-value="visible"
    :title="mode === 'create' ? $t('system.addUser') : $t('system.editUser')"
    width="500px"
    @update:model-value="$emit('update:visible', $event)"
    @closed="handleClosed"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
    >
      <el-form-item
        :label="$t('system.username')"
        prop="username"
      >
        <el-input
          v-model="formData.username"
          :disabled="mode === 'edit'"
          :placeholder="$t('system.enterUsername')"
        />
      </el-form-item>
      <el-form-item
        v-if="mode === 'create'"
        :label="$t('system.password')"
        prop="password"
      >
        <el-input
          v-model="formData.password"
          type="password"
          show-password
          :placeholder="$t('system.enterPassword')"
        />
      </el-form-item>
      <el-form-item
        :label="$t('system.role')"
        prop="role"
      >
        <el-select
          v-model="formData.role"
          :placeholder="$t('system.selectRole')"
          style="width: 100%"
        >
          <el-option :label="$t('system.admin')" value="admin" />
          <el-option :label="$t('system.doctor')" value="doctor" />
          <el-option :label="$t('system.nurse')" value="nurse" />
          <el-option :label="$t('system.receptionist')" value="receptionist" />
        </el-select>
      </el-form-item>
      <el-form-item
        :label="$t('system.email')"
        prop="email"
      >
        <el-input
          v-model="formData.email"
          :placeholder="$t('system.enterEmail')"
        />
      </el-form-item>
      <el-form-item
        :label="$t('system.phone')"
        prop="phone"
      >
        <el-input
          v-model="formData.phone"
          :placeholder="$t('system.enterPhone')"
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
import { ref, reactive, watch } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import { ElMessage } from 'element-plus';
import { useSystemStore } from '@/stores/system';
import type { SystemUser } from '@/types/system';
import { useI18n } from 'vue-i18n';

// Props
const props = defineProps<{
  visible: boolean;
  user: SystemUser | null;
  mode: 'create' | 'edit';
}>();

// Emits
const emit = defineEmits<{
  'update:visible': [value: boolean];
  success: [];
}>();

const { t } = useI18n();
const systemStore = useSystemStore();
const formRef = ref<FormInstance>();
const loading = ref(false);

// Form data
const formData = reactive({
  username: '',
  password: '',
  role: 'receptionist',
  email: '' as string | null,
  phone: '' as string | null,
});

// Form rules
const formRules: FormRules = {
  username: [
    { required: true, message: () => t('system.usernameRequired'), trigger: 'blur' },
    { min: 3, max: 50, message: () => t('system.usernameLength'), trigger: 'blur' },
  ],
  password: [
    { required: true, message: () => t('system.passwordRequired'), trigger: 'blur' },
    { min: 6, max: 100, message: () => t('system.passwordLength'), trigger: 'blur' },
  ],
  role: [
    { required: true, message: () => t('system.selectRole'), trigger: 'change' },
  ],
};

// Reset form
function resetForm(): void {
  formData.username = '';
  formData.password = '';
  formData.role = 'receptionist';
  formData.email = null;
  formData.phone = null;
}

// Watch visibility
watch(
  () => props.visible,
  (newVal) => {
    if (newVal) {
      if (props.mode === 'edit' && props.user) {
        formData.username = props.user.username;
        formData.password = '';
        formData.role = props.user.role;
        formData.email = props.user.email;
        formData.phone = props.user.phone;
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
      const result = await systemStore.createUser({
        username: formData.username,
        password: formData.password,
        role: formData.role,
        email: formData.email || null,
        phone: formData.phone || null,
      });
      if (result) {
        ElMessage.success(t('system.userCreated'));
        emit('success');
      }
    } else if (props.user) {
      const result = await systemStore.updateUser(props.user.id, {
        role: formData.role,
        email: formData.email || null,
        phone: formData.phone || null,
      });
      if (result) {
        ElMessage.success(t('system.userUpdated'));
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
