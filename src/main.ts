import 'iconify-icon';
import './assets/main.css';
import './assets/shared.css';

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import Toast, { type PluginOptions, POSITION } from 'vue-toastification';
import 'vue-toastification/dist/index.css';
import App from './App.vue';
import { useThemeStore } from './stores/theme';

const app = createApp(App);
const pinia = createPinia();

const toastOptions: PluginOptions = {
  position: POSITION.BOTTOM_RIGHT,
  timeout: 4000,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  showCloseButtonOnHover: false,
  hideProgressBar: false,
  closeButton: 'button',
  icon: true,
  rtl: false,
};

app.use(pinia);
app.use(Toast, toastOptions);

// Initialize theme settings
const themeStore = useThemeStore();
themeStore.loadSettings();

app.mount('#app');
