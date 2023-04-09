import {
  fileURLToPath,
  URL
} from 'node:url';

import {
  resolve,
  dirname
} from 'node:path';

import {
  defineConfig
} from 'vite';

import vue from '@vitejs/plugin-vue';
import vueI18n from '@intlify/vite-plugin-vue-i18n';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueI18n({
      include: resolve(dirname(fileURLToPath(import.meta.url)), './src/locales/**')
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src',
        import.meta.url))
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/scss/index.scss";`
      }
    }
  }
});