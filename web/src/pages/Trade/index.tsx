import React, { useEffect, useState } from "react"
import { Tabs } from "antd"
import { WebViewMessage, eventBus } from '../../utils'
import Market from './components/Market'
import OpenOrder from './components/OpenOrder'
import Position from './components/Position'
import Account from './components/Account'
import Settings from './components/Settings'
import Tools from './components/Tools'

const ItemsName = {
  tools: 'Tools',
  market: 'Market',
  openOrder: 'Open Orders',
  position: 'Position',
  account: 'Account',
  settings: 'Settings'
}

const Trade = () => {
  const [activeKey, setActiveKey] = useState<string>('')
  const onChange = (key: string) => setActiveKey(key)
  useEffect(() => {
    eventBus.on(WebViewMessage.readActiveType, (label: any) => {
      setActiveKey(label)
    })
    
    eventBus.emitVscode(WebViewMessage.readVscodeConfig, WebViewMessage.readActiveType)
    
    return () => eventBus.off(WebViewMessage.readActiveType)
  }, [])
  return (
    <div>
      <Tabs
        activeKey={activeKey}
        destroyInactiveTabPane={true}
        onChange={onChange}
        items={[
          {
            label: ItemsName.tools,
            key: ItemsName.tools,
            children: <Tools />,
          },
          {
            label: ItemsName.market,
            key: ItemsName.market,
            children: <Market />,
          },
          {
            label: ItemsName.openOrder,
            key: ItemsName.openOrder,
            children: <OpenOrder />,
          },
          {
            label: ItemsName.position,
            key: ItemsName.position,
            children: <Position />,
          },
          {
            label: ItemsName.account,
            key: ItemsName.account,
            children: <Account />,
          },
          {
            label: ItemsName.settings,
            key: ItemsName.settings,
            children: <Settings />,
          },
        ]}
      />
    </div>
  )
}

export default Trade
