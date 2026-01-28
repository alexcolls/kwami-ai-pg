import 'iconify-icon';
import './assets/main.css';
import './assets/shared.css';

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import { useThemeStore } from './stores/theme';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);

// Initialize theme settings
const themeStore = useThemeStore();
themeStore.loadSettings();

app.mount('#app');
