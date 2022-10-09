declare module '*.svg'
declare module '*.png'
declare module '@bitverse/jsbridge'

/// <reference types="vite-plugin-svgr/client" />
/// <reference types="vite/client" />

interface Window {
  vscode: any
  acquireVsCodeApi: any
}
