<template>
  <el-select
    :model-value="modelValue"
    :placeholder="placeholder"
    :disabled="disabled"
    :clearable="clearable"
    :loading="loading"
    :filterable="filterable"
    style="width: 100%"
    @update:model-value="$emit('update:modelValue', $event)"
    @change="$emit('change', $event)"
  >
    <el-option
      v-for="dept in departments"
      :key="dept.id"
      :label="dept.name"
      :value="dept.id"
    >
      <span>{{ dept.name }}</span>
      <span
        v-if="showCode && dept.code"
        class="department-code"
      >
        ({{ dept.code }})
      </span>
    </el-option>
  </el-select>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { DepartmentListItem } from '@/types';
import { getActiveDepartments } from '@/api/doctor';
import { logger } from '@/utils';

// Props
const props = withDefaults(
  defineProps<{
    modelValue?: number | null;
    placeholder?: string;
    disabled?: boolean;
    clearable?: boolean;
    filterable?: boolean;
    showCode?: boolean;
    autoLoad?: boolean;
  }>(),
  {
    modelValue: null,
    placeholder: 'Select department',
    disabled: false,
    clearable: true,
    filterable: true,
    showCode: false,
    autoLoad: true,
  }
);

// Emits
defineEmits<{
  'update:modelValue': [value: number | null];
  change: [value: number | null];
}>();

// State
const departments = ref<DepartmentListItem[]>([]);
const loading = ref(false);

// Load departments
async function loadDepartments(): Promise<void> {
  loading.value = true;
  try {
    const response = await getActiveDepartments();
    if (response.data) {
      departments.value = response.data;
    }
  } catch (error) {
    logger.error('Failed to load departments', error);
  } finally {
    loading.value = false;
  }
}

// Auto load on mount
onMounted(() => {
  if (props.autoLoad) {
    loadDepartments();
  }
});

// Expose refresh method
defineExpose({
  refresh: loadDepartments,
});
</script>

<style scoped>
.department-code {
  color: #909399;
  font-size: 12px;
  margin-left: 8px;
}
</style>
