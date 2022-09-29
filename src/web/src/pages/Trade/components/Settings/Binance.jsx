import { Modal, Form, Button, Input, Radio } from "antd"
import React, { useEffect } from "react"
import { eventBus, WebViewMessage } from "../../../../utils/"
const Binance = () => {
  const [form] = Form.useForm()
  // useEffect(() => {
  //   form.setFieldsValue({
  //       testnet: false, 
  //   })
  // }, [])
  const handleOk = async () => {
    const data = await form.validateFields()
      eventBus.emitVscode(WebViewMessage.setBinanceConfig, data)
  }


  return (
    <div>
      <Form
        layout="horizontal"
        form={form}
        labelAlign="right"
        labelCol={{ span: 3 }}
        wrapperCol={{ span: 16 }}
      >
        
        <Form.Item
          label="注意"
        >
          <h4 className="red">OpenApi 申请时候请勿申请带有提现权限的 API</h4>
        </Form.Item>
        <Form.Item
          label="APIKey"
          name="api_key"
          rules={[{ required: true, message: "Key 必填！" }]}
        >
          <Input /> 
        </Form.Item>
        <Form.Item
          label="APISecret"
          name="api_secret"
          rules={[{ required: true, message: "Secret必填！" }]}
        >
          <Input /> 
        </Form.Item>
        <Form.Item wrapperCol={{ offset: 3, span: 16 }}>
        <Button type="primary" onClick={handleOk}>
          保存
        </Button>
      </Form.Item>
      </Form>
    </div>
  )
}

export default Binance
