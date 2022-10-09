import { Modal, Form, Button, Input, Radio } from "antd"
import React, { useEffect } from "react"
import { eventBus, WebViewMessage } from "../../../../utils"
const All = () => {
  const [form] = Form.useForm()
  // useEffect(() => {
  //   form.setFieldsValue({
  //       testnet: false, 
  //   })
  // }, [])
  const handleOk = async () => {
    const data = await form.validateFields()
      eventBus.emitVscode(WebViewMessage.setAllConfig, data)
  }


  return (
    <div>
      <Form
        layout="horizontal"
        form={form}
        labelAlign="right"
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 16 }}
      >
        
        <Form.Item
          label="监控交易所"
          name="activeExchange"
          rules={[{ required: true, message: "Key 必填！" }]}
        >
              <Radio.Group>
            <Radio value="Bybit"> Bybit </Radio>
            <Radio value="Binance"> Binance </Radio>
            <Radio value="All"> 全部 </Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item wrapperCol={{ offset: 4, span: 16 }}>
        <Button type="primary" onClick={handleOk}>
          保存
        </Button>
      </Form.Item>
      </Form>
    </div>
  )
}

export default All
