import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    solid({
      babel: {
        plugins: [
          ["@locator/babel-jsx/dist", { env: "development" }],
        ],
      },
    }),
  ],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        blackhole: resolve(__dirname, 'blackhole.html'),
        hexgrid: resolve(__dirname, 'hex-grid.html'),
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    exclude: ['**/node_modules/**', '**/e2e/**'],
    setupFiles: ['./src/setupTests.js'],
  },
})
