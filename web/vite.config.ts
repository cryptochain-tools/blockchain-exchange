import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
// import { createStyleImportPlugin } from "vite-plugin-style-import"

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: [{ find: '@/', replacement: path.resolve(__dirname, 'src') + '/' }],
  },
  plugins: [
    react(),
    // createStyleImportPlugin({
    //   libs: [
    //     {
    //       libraryName: "antd",
    //       resolveStyle: (name) => {
    //         return `antd/es/${name}/style`
    //       },
    //       resolveComponent: (name) => {
    //         return `antd/es/${name}/`
    //       },
    //     },
    //   ],
    // }),
  ],
  build: {
    outDir: '../out/webDist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        // 重点在这里哦
        // entryFileNames: `assets/[name].${timestamp}.js`,
        // chunkFileNames: `assets/[name].${timestamp}.js`,
        // assetFileNames: `assets/[name].${timestamp}.[ext]`
        entryFileNames: `assets/[name].js`,
        chunkFileNames: `assets/[name].js`,
        assetFileNames: `assets/[name].[ext]`,
      },
    },
  },
})
