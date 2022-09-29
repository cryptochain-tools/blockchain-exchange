import React, { useEffect, useState } from "react"
import { Table, Button, Tabs } from "antd"
import { eventBus, WebViewMessage } from "../../../../utils/"
import Bybit from './Bybit'
import Binance from './Binance'
import All from './All'

const Settings = () => {
  const [data, setData] = useState([])
  useEffect(() => {
    eventBus.on("settings", (data) => setData(data))
  }, [])

  const [activeKey, setActiveKey] = useState('All')
  const onChange = (key) => setActiveKey(key)

  return (
    <div>
      <Tabs
      activeKey={activeKey}
      destroyInactiveTabPane={true}
      onChange={onChange}
      tabPosition="left"
      items={[
        {
          label: "通用设置",
          key: "All",
          children: <All />,
        },
        {
          label: "Bybit 设置",
          key: "Bybit",
          children: <Bybit />,
        },
        {
          label: "Binance 设置",
          key: "Binance",
          children: <Binance />,
        },
      ]}
    />
    </div>
  )
}

export default Settings
