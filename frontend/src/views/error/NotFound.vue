<template>
  <div class="not-found-container">
    <div class="not-found-content">
      <h1 class="error-code">
        404
      </h1>
      <h2 class="error-title">
        Page Not Found
      </h2>
      <p class="error-message">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <el-button
        type="primary"
        size="large"
        @click="goHome"
      >
        <el-icon><HomeFilled /></el-icon>
        Back to Home
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { HomeFilled } from '@element-plus/icons-vue';

const router = useRouter();

function goHome() {
  router.push('/');
}
</script>

<style scoped>
.not-found-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  padding: 20px;
}

.not-found-content {
  text-align: center;
  max-width: 500px;
}

.error-code {
  font-size: 120px;
  font-weight: 700;
  color: #409EFF;
  margin: 0;
  line-height: 1;
}

.error-title {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin: 20px 0 10px;
}

.error-message {
  font-size: 14px;
  color: #909399;
  margin: 0 0 30px;
  line-height: 1.6;
}
</style>
