import { createApp } from 'vue';
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import ElementPlus from 'element-plus';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import 'element-plus/dist/index.css';

import App from './App.vue';
import router from './router';
import i18n from './locales';
import './styles/index.css';

// Create Vue app
const app = createApp(App);

// Create Pinia store
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

// Register Element Plus icons
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

// Use plugins
app.use(pinia);
app.use(router);
app.use(ElementPlus);
app.use(i18n);

// Mount app
app.mount('#app');
