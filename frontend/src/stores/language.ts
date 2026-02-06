import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useLanguageStore = defineStore('language', () => {
  const locale = ref(localStorage.getItem('locale') || 'zh-CN');

  const languageName = computed(() => {
    return locale.value === 'zh-CN' ? '中文' : 'English';
  });

  const isChinese = computed(() => locale.value === 'zh-CN');

  function setLanguage(lang: string) {
    locale.value = lang;
    localStorage.setItem('locale', lang);
    document.documentElement.lang = lang;
  }

  function toggleLanguage() {
    const newLang = locale.value === 'zh-CN' ? 'en-US' : 'zh-CN';
    setLanguage(newLang);
    window.location.reload();
  }

  return {
    locale,
    languageName,
    isChinese,
    setLanguage,
    toggleLanguage,
  };
});
