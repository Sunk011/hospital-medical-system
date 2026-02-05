<template>
  <div class="dashboard-container">
    <div class="welcome-section">
      <h1 class="welcome-title">
        Welcome, {{ authStore.username }}
      </h1>
      <p class="welcome-subtitle">
        Hospital Medical Record Management System
      </p>
    </div>

    <el-row
      :gutter="20"
      class="stats-row"
    >
      <el-col
        :xs="24"
        :sm="12"
        :md="6"
      >
        <el-card
          class="stat-card"
          shadow="hover"
        >
          <div class="stat-content">
            <el-icon
              class="stat-icon"
              :size="40"
              color="#409EFF"
            >
              <User />
            </el-icon>
            <div class="stat-info">
              <div class="stat-value">
                1,234
              </div>
              <div class="stat-label">
                Total Patients
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col
        :xs="24"
        :sm="12"
        :md="6"
      >
        <el-card
          class="stat-card"
          shadow="hover"
        >
          <div class="stat-content">
            <el-icon
              class="stat-icon"
              :size="40"
              color="#67C23A"
            >
              <Document />
            </el-icon>
            <div class="stat-info">
              <div class="stat-value">
                5,678
              </div>
              <div class="stat-label">
                Medical Records
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col
        :xs="24"
        :sm="12"
        :md="6"
      >
        <el-card
          class="stat-card"
          shadow="hover"
        >
          <div class="stat-content">
            <el-icon
              class="stat-icon"
              :size="40"
              color="#E6A23C"
            >
              <UserFilled />
            </el-icon>
            <div class="stat-info">
              <div class="stat-value">
                56
              </div>
              <div class="stat-label">
                Doctors
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col
        :xs="24"
        :sm="12"
        :md="6"
      >
        <el-card
          class="stat-card"
          shadow="hover"
        >
          <div class="stat-content">
            <el-icon
              class="stat-icon"
              :size="40"
              color="#F56C6C"
            >
              <OfficeBuilding />
            </el-icon>
            <div class="stat-info">
              <div class="stat-value">
                12
              </div>
              <div class="stat-label">
                Departments
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row
      :gutter="20"
      class="content-row"
    >
      <el-col
        :xs="24"
        :lg="16"
      >
        <el-card
          class="content-card"
          shadow="hover"
        >
          <template #header>
            <div class="card-header">
              <span>Recent Activities</span>
            </div>
          </template>
          <el-empty description="No recent activities" />
        </el-card>
      </el-col>

      <el-col
        :xs="24"
        :lg="8"
      >
        <el-card
          class="content-card"
          shadow="hover"
        >
          <template #header>
            <div class="card-header">
              <span>Quick Actions</span>
            </div>
          </template>
          <div class="quick-actions">
            <el-button
              type="primary"
              class="action-btn"
              disabled
            >
              <el-icon><Plus /></el-icon>
              New Patient
            </el-button>
            <el-button
              type="success"
              class="action-btn"
              disabled
            >
              <el-icon><Document /></el-icon>
              New Record
            </el-button>
            <el-button
              type="warning"
              class="action-btn"
              disabled
            >
              <el-icon><Search /></el-icon>
              Search Records
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { User, Document, UserFilled, OfficeBuilding, Plus, Search } from '@element-plus/icons-vue';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
}

.welcome-section {
  margin-bottom: 30px;
}

.welcome-title {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px 0;
}

.welcome-subtitle {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  margin-bottom: 20px;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 20px;
}

.stat-icon {
  flex-shrink: 0;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
  line-height: 1.2;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
}

.content-row {
  margin-top: 20px;
}

.content-card {
  margin-bottom: 20px;
  min-height: 300px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.action-btn {
  width: 100%;
  justify-content: flex-start;
}
</style>
