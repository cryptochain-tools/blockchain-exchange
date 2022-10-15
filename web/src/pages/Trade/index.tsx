import React, { useEffect, useState } from "react"
import { Form, Input, Modal, Tabs } from "antd"
import { WebViewMessage, eventBus } from "../../utils"
import Market from "./components/Market"
import OpenOrder from "./components/OpenOrder"
import Position from "./components/Position"
import Account from "./components/Account"
import Settings from "./components/Settings"
import Tools from "./components/Tools"

const ItemsName = {
  tools: "Tools",
  market: "Market",
  openOrder: "Open Orders",
  position: "Position",
  account: "Account",
  settings: "Settings",
}

const Trade = () => {
  const [activeKey, setActiveKey] = useState<string>("")
  const [open, setOpen] = useState<boolean>(false)
  const [form] = Form.useForm()
  const onChange = (key: string) => setActiveKey(key)

  const handleOk = async () => {
    const data = await form.validateFields()
      eventBus.emitVscode(WebViewMessage.showPassword, data.password)
      setOpen(false)
  }

  useEffect(() => {
    eventBus.on(WebViewMessage.readActiveType, (label: any) => {
      setActiveKey(label)
    })
    eventBus.on(WebViewMessage.showPassword, () => {
      setOpen(true)
    })
    // 询问vscode 激活的type
    eventBus.emitVscode(
      WebViewMessage.readVscodeConfig,
      WebViewMessage.readActiveType
    )

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
      <Modal title="校验密码" open={open} onOk={handleOk} onCancel={() => setOpen(false)}>
        <Form
          layout="horizontal"
          form={form}
          labelAlign="right"
          labelCol={{ span: 3 }}
          wrapperCol={{ span: 16 }}
        >
          <Form.Item
            label="密码"
            name="password"
            rules={[{ required: true, message: "密码必填！" }]}
          >
            <Input type="password" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default Trade
