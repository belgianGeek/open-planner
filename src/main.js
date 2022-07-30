import { createApp } from 'vue';
import App from './App.vue';
import axios from 'axios';
// import './registerServiceWorker';
import router from './router';
import store from './store';
// import i18n from './i18n';
// import installI18n from './lang/index'
// installI18n(app)

// import socket from './socket';
// createApp.prototype.$socket = socket;

// axios.defaults.withCredentials = true;
axios.defaults.baseURL = 'http://localhost:3000';

createApp(App).use(store).use(router).mount('#app');
