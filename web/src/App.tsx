import { useState, useEffect } from 'react'
import { ConfigProvider, theme } from 'antd'
import zhCN from 'antd/es/locale/zh_CN'
import Trade from './pages/Trade'
import eventBus from './utils/eventBus'

function App() {
  const [type, setType] = useState('trade')
  useEffect(() => {
    window.addEventListener('message', (event) => {
      const message = event.data
      eventBus.emit(message.command, message.data)
    })
  })
  const pages = () => {
    switch (type) {
      case 'trade':
        return <Trade />

      default:
        return null
    }
  }

  return (
    <ConfigProvider
      locale={zhCN}
      componentSize="small"
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#75715e',
        },
      }}
    >
      <div className="app">{pages()}</div>
    </ConfigProvider>
  )
}

export default App
