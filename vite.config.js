import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    solid({
      babel: {
        plugins: [
          ["@treelocator/babel-jsx/dist", { env: "development" }],
        ],
      },
    }),
  ],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        blackhole: resolve(__dirname, 'blackhole.html'),
        noTailwind: resolve(__dirname, 'index-no-tw.html'),
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
  },
})
