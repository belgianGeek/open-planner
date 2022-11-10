import { createApp } from 'vue';
import App from './App.vue';
import axios from 'axios';
// import './registerServiceWorker';
import router from './router';
import i18n from './i18n';

import { createPinia } from 'pinia';
const pinia = createPinia();

// axios.defaults.withCredentials = true;
axios.defaults.baseURL = 'http://localhost:3000';

createApp(App).use(pinia).use(i18n).use(router).mount('#app');
