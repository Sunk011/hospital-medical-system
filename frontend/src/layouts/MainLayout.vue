<template>
  <el-container class="main-layout">
    <!-- Sidebar -->
    <el-aside
      :width="isCollapsed ? '64px' : '220px'"
      class="sidebar"
    >
      <div class="logo-container">
        <el-icon
          :size="28"
          color="#409EFF"
        >
          <FirstAidKit />
        </el-icon>
        <span
          v-show="!isCollapsed"
          class="logo-text"
        >HMS</span>
      </div>

      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapsed"
        :collapse-transition="false"
        class="sidebar-menu"
        router
      >
        <el-menu-item index="/">
          <el-icon><HomeFilled /></el-icon>
          <template #title>
            {{ $t('nav.dashboard') }}
          </template>
        </el-menu-item>

        <el-menu-item index="/patients">
          <el-icon><User /></el-icon>
          <template #title>
            {{ $t('nav.patients') }}
          </template>
        </el-menu-item>

        <el-menu-item index="/medical-records">
          <el-icon><Document /></el-icon>
          <template #title>
            {{ $t('nav.medicalRecords') }}
          </template>
        </el-menu-item>

        <el-menu-item
          index="/doctors"
        >
          <el-icon><UserFilled /></el-icon>
          <template #title>
            {{ $t('nav.doctors') }}
          </template>
        </el-menu-item>

        <el-menu-item
          index="/departments"
          disabled
        >
          <el-icon><OfficeBuilding /></el-icon>
          <template #title>
            {{ $t('nav.departments') }}
          </template>
        </el-menu-item>

        <el-menu-item
          index="/statistics"
        >
          <el-icon><DataAnalysis /></el-icon>
          <template #title>
            {{ $t('nav.statistics') }}
          </template>
        </el-menu-item>

        <el-menu-item
          v-if="authStore.isAdmin()"
          index="/system"
          disabled
        >
          <el-icon><Setting /></el-icon>
          <template #title>
            {{ $t('nav.system') }}
          </template>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <!-- Main Content -->
    <el-container class="main-container">
      <!-- Header -->
      <el-header class="header">
        <div class="header-left">
          <el-button
            :icon="isCollapsed ? Expand : Fold"
            text
            @click="toggleSidebar"
          />
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">
              {{ $t('nav.dashboard') }}
            </el-breadcrumb-item>
            <el-breadcrumb-item v-if="currentRoute !== '/'">
              {{ currentPageTitle }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>

        <div class="header-right">
          <el-button
            :icon="languageStore.isChinese ? 'ChatLineRound' : 'ChatDotRound'"
            circle
            @click="languageStore.toggleLanguage()"
          >
            <span class="lang-icon">{{ languageStore.isChinese ? 'EN' : '中' }}</span>
          </el-button>
          <el-dropdown
            trigger="click"
            @command="handleCommand"
          >
            <div class="user-info">
              <el-avatar
                :size="32"
                :icon="UserFilled"
              />
              <span class="username">{{ authStore.username }}</span>
              <el-icon><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">
                  <el-icon><User /></el-icon>
                  {{ $t('nav.profile') }}
                </el-dropdown-item>
                <el-dropdown-item command="password">
                  <el-icon><Lock /></el-icon>
                  {{ $t('nav.changePassword') }}
                </el-dropdown-item>
                <el-dropdown-item
                  divided
                  command="logout"
                >
                  <el-icon><SwitchButton /></el-icon>
                  {{ $t('auth.logout') }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- Main Content Area -->
      <el-main class="main-content">
        <router-view />
      </el-main>

      <!-- Footer -->
      <el-footer class="footer">
        <span>{{ $t('footer.copyright') }}</span>
      </el-footer>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessageBox, ElMessage } from 'element-plus';
import {
  HomeFilled,
  User,
  UserFilled,
  Document,
  OfficeBuilding,
  DataAnalysis,
  Setting,
  Fold,
  Expand,
  ArrowDown,
  Lock,
  SwitchButton,
  FirstAidKit,
} from '@element-plus/icons-vue';
import { useAuthStore, useLanguageStore } from '@/stores';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const languageStore = useLanguageStore();

const isCollapsed = ref(false);

const activeMenu = computed(() => route.path);
const currentRoute = computed(() => route.path);
const currentPageTitle = computed(() => {
  const titleKey = route.meta.title as string;
  return titleKey ? t(titleKey) : 'Page';
});

function toggleSidebar() {
  isCollapsed.value = !isCollapsed.value;
}

async function handleCommand(command: string) {
  switch (command) {
    case 'profile':
      ElMessage.info(t('common.comingSoon'));
      break;
    case 'password':
      ElMessage.info(t('common.comingSoon'));
      break;
    case 'logout':
      try {
        await ElMessageBox.confirm(
          t('auth.confirmLogout'),
          t('auth.confirmLogoutTitle'),
          {
            confirmButtonText: t('auth.logout'),
            cancelButtonText: t('common.cancel'),
            type: 'warning',
          }
        );
        await authStore.logout();
        router.push('/login');
        ElMessage.success(t('auth.loggedOutSuccess'));
      } catch {
        // User cancelled
      }
      break;
  }
}
</script>

<style scoped>
.main-layout {
  height: 100vh;
}

.sidebar {
  background: #001529;
  transition: width 0.3s;
  overflow: hidden;
}

.logo-container {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: rgba(255, 255, 255, 0.05);
}

.logo-text {
  font-size: 18px;
  font-weight: 600;
  color: #fff;
}

.sidebar-menu {
  border-right: none;
  background: transparent;
}

.sidebar-menu:not(.el-menu--collapse) {
  width: 220px;
}

:deep(.el-menu) {
  background-color: transparent;
}

:deep(.el-menu-item) {
  color: rgba(255, 255, 255, 0.65);
}

:deep(.el-menu-item:hover) {
  background-color: rgba(255, 255, 255, 0.08);
}

:deep(.el-menu-item.is-active) {
  color: #fff;
  background-color: #409EFF;
}

:deep(.el-menu-item.is-disabled) {
  opacity: 0.5;
}

.main-container {
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  padding: 0 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 15px;
}

.lang-icon {
  font-size: 12px;
  font-weight: 600;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 5px 10px;
  border-radius: 4px;
  transition: background 0.3s;
}

.user-info:hover {
  background: #f5f7fa;
}

.username {
  font-size: 14px;
  color: #303133;
}

.main-content {
  background: #f5f7fa;
  overflow-y: auto;
}

.footer {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  font-size: 12px;
  color: #909399;
  border-top: 1px solid #e4e7ed;
}
</style>
