<template>
  <el-dialog
    :model-value="visible"
    title="Upload Attachment"
    width="500px"
    :close-on-click-modal="false"
    @update:model-value="$emit('update:visible', $event)"
    @closed="handleClosed"
  >
    <el-form
      ref="formRef"
      :model="formData"
      label-width="100px"
    >
      <el-form-item
        label="File"
        required
      >
        <el-upload
          ref="uploadRef"
          class="upload-area"
          drag
          :auto-upload="false"
          :limit="1"
          :on-change="handleFileChange"
          :on-exceed="handleExceed"
          :before-upload="beforeUpload"
          accept=".pdf,.jpg,.jpeg,.png"
        >
          <div v-if="!selectedFile">
            <el-icon class="el-icon--upload">
              <Upload />
            </el-icon>
            <div class="el-upload__text">
              Drop file here or <em>click to upload</em>
            </div>
          </div>
          <div
            v-else
            class="selected-file"
          >
            <el-icon :size="40">
              <Document v-if="selectedFile.name.endsWith('.pdf')" />
              <Picture v-else />
            </el-icon>
            <div class="file-info">
              <span class="file-name">{{ selectedFile.name }}</span>
              <span class="file-size">{{ formatFileSize(selectedFile.size) }}</span>
            </div>
            <el-button
              type="danger"
              :icon="Delete"
              circle
              size="small"
              @click.stop="handleRemoveFile"
            />
          </div>
          <template #tip>
            <div
              v-if="!selectedFile"
              class="el-upload__tip"
            >
              Allowed types: PDF, JPG, PNG. Max size: 10MB
            </div>
          </template>
        </el-upload>
      </el-form-item>

      <el-form-item label="Description">
        <el-input
          v-model="formData.description"
          type="textarea"
          :rows="2"
          placeholder="Optional description for this attachment"
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
        :loading="uploading"
        :disabled="!selectedFile"
        @click="handleUpload"
      >
        Upload
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import type { UploadInstance, UploadFile, UploadRawFile } from 'element-plus';
import { ElMessage } from 'element-plus';
import { Upload, Document, Picture, Delete } from '@element-plus/icons-vue';
import { useMedicalRecordStore } from '@/stores/medicalRecord';

interface Props {
  visible: boolean;
  recordId: number;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:visible': [value: boolean];
  success: [];
}>();

const medicalRecordStore = useMedicalRecordStore();
const uploadRef = ref<UploadInstance>();
const uploading = ref(false);
const selectedFile = ref<File | null>(null);

// Form data
const formData = reactive({
  description: '',
});

// Allowed file types
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Format file size
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Before upload validation
function beforeUpload(file: UploadRawFile): boolean {
  // Check file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    ElMessage.error('Invalid file type. Allowed types: PDF, JPG, PNG');
    return false;
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    ElMessage.error('File size exceeds maximum limit of 10MB');
    return false;
  }

  return true;
}

// Handle file change
function handleFileChange(uploadFile: UploadFile): void {
  if (uploadFile.raw) {
    if (beforeUpload(uploadFile.raw)) {
      selectedFile.value = uploadFile.raw;
    } else {
      uploadRef.value?.clearFiles();
    }
  }
}

// Handle exceed limit
function handleExceed(): void {
  ElMessage.warning('Only one file can be uploaded at a time');
}

// Handle remove file
function handleRemoveFile(): void {
  selectedFile.value = null;
  uploadRef.value?.clearFiles();
}

// Reset form
function resetForm(): void {
  selectedFile.value = null;
  formData.description = '';
  uploadRef.value?.clearFiles();
}

// Handle dialog closed
function handleClosed(): void {
  resetForm();
}

// Handle upload
async function handleUpload(): Promise<void> {
  if (!selectedFile.value) {
    ElMessage.warning('Please select a file to upload');
    return;
  }

  uploading.value = true;

  try {
    const result = await medicalRecordStore.uploadFile(
      props.recordId,
      selectedFile.value,
      formData.description || undefined
    );

    if (result) {
      ElMessage.success('File uploaded successfully');
      emit('success');
    }
  } finally {
    uploading.value = false;
  }
}

// Expose functions and icons used in template bindings for vue-tsc
defineExpose({
  formatFileSize,
  handleFileChange,
  handleExceed,
  handleRemoveFile,
  handleClosed,
  handleUpload,
  // Icons used in template
  Upload,
  Document,
  Picture,
  Delete,
});
</script>

<style scoped>
.upload-area {
  width: 100%;
}

.upload-area :deep(.el-upload) {
  width: 100%;
}

.upload-area :deep(.el-upload-dragger) {
  width: 100%;
}

.selected-file {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  width: 100%;
}

.file-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow: hidden;
}

.file-name {
  font-weight: 500;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-size {
  font-size: 12px;
  color: #909399;
}
</style>
