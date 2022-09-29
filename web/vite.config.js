import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import { createStyleImportPlugin } from "vite-plugin-style-import"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    createStyleImportPlugin({
      libs: [
        {
          libraryName: "antd",
          resolveStyle: (name) => {
            return `antd/es/${name}/style`
          },
          resolveComponent: (name) => {
            return `antd/es/${name}/`
          },
        },
      ],
    }),
  ],
  build: {
    outDir: "../out/webDist",
  },

  css: {
    preprocessorOptions: {
      less: {
        modifyVars: {
          "primary-color": "#75715e",
        },
        javascriptEnabled: true,
      },
    },
  },
})