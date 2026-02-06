<template>
  <div class="system-management-page">
    <!-- Page Header -->
    <div class="page-header">
      <h2>{{ $t('system.title') }}</h2>
    </div>

    <!-- Tabs -->
    <el-tabs
      v-model="activeTab"
      type="border-card"
    >
      <el-tab-pane
        :label="$t('system.userManagement')"
        name="users"
      >
        <UserManagement />
      </el-tab-pane>
      <el-tab-pane
        :label="$t('system.operationLog')"
        name="logs"
      >
        <OperationLog />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import UserManagement from './tabs/UserManagement.vue';
import OperationLog from './tabs/OperationLog.vue';

const activeTab = ref('users');
</script>

<style scoped>
.system-management-page {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  font-size: 20px;
  color: #303133;
}
</style>
