import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

import '../node_modules/antd/dist/antd.dark.less' // 引入官方提供的 less 样式入口文件
import "./App.less"

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
