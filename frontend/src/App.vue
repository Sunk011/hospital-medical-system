<template>
  <el-config-provider :locale="elementLocale">
    <router-view />
  </el-config-provider>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ElConfigProvider } from 'element-plus';
import zhCn from 'element-plus/es/locale/lang/zh-cn';
import en from 'element-plus/es/locale/lang/en';
import { useLanguageStore } from '@/stores';

const languageStore = useLanguageStore();

const elementLocale = computed(() => {
  return languageStore.isChinese ? zhCn : en;
});
</script>

<style>
#app {
  width: 100%;
  height: 100%;
}
</style>
