import { createI18n } from 'vue-i18n';
import en from './en';
import zhCN from './zh-CN';

export type MessageSchema = typeof en;

const messages = {
  'en-US': en,
  'zh-CN': zhCN,
};

const getLocale = (): string => {
  const stored = localStorage.getItem('locale');
  if (stored && Object.keys(messages).includes(stored)) {
    return stored;
  }
  const browserLang = navigator.language.toLowerCase();
  if (browserLang.startsWith('zh')) {
    return 'zh-CN';
  }
  return 'en-US';
};

const i18n = createI18n<{ en: MessageSchema }, 'en-US' | 'zh-CN'>({
  legacy: false,
  locale: getLocale(),
  fallbackLocale: 'en-US',
  messages,
});

export default i18n;
