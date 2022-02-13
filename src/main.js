import { createApp } from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import store from './store'
import vueI18n from 'vue-i18n';
import { locale_en } from './locales/en';
import { locale_fr } from './locales/fr';

const locales = {
  en: locale_en,
  fr: locale_fr
}

const i18n = new vueI18n({
  locale: 'en',
  messages: locales
})

createApp(App).use(store).use(i18n).use(router).mount('#app')
