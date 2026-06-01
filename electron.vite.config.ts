import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'electron-vite'
import vue from '@vitejs/plugin-vue'
import Icons from 'unplugin-icons/vite'
import Components from 'unplugin-vue-components/vite'
import IconsResolver from 'unplugin-icons/resolver'

const alias = {
  '@': fileURLToPath(new URL('./src', import.meta.url)),
  '@assets': fileURLToPath(new URL('./src/assets', import.meta.url)),
  '@components': fileURLToPath(new URL('./src/components', import.meta.url)),
  '@views': fileURLToPath(new URL('./src/views', import.meta.url)),
  '@utils': fileURLToPath(new URL('./src/utils', import.meta.url)),
  '@stores': fileURLToPath(new URL('./src/stores', import.meta.url)),
}

export default defineConfig({
  main: {
    build: {
      outDir: 'out/main',
      externalizeDeps: false,
      rollupOptions: {
        input: fileURLToPath(new URL('./electron/main.ts', import.meta.url)),
      },
    },
  },
  preload: {
    build: {
      outDir: 'out/preload',
      rollupOptions: {
        input: fileURLToPath(new URL('./electron/preload.ts', import.meta.url)),
      },
    },
  },
  renderer: {
    root: '.',
    base: './',
    worker: {
      format: 'es',
    },
    css: {
      preprocessorOptions: {
        less: {
          additionalData: `@import "@assets/styles/global.less";`,
        },
      },
    },
    plugins: [
      vue(),
      Components({
        resolvers: [
          IconsResolver({
            prefix: 'icon',
            alias: {
              ph: 'ph',
            },
          }),
        ],
      }),
      Icons({
        autoInstall: true,
      }),
    ],
    resolve: {
      alias,
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      rollupOptions: {
        input: fileURLToPath(new URL('./index.html', import.meta.url)),
      },
    },
  },
})
