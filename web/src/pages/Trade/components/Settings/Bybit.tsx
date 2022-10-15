import { Modal, Form, Button, Input, Radio } from "antd"
import React, { useEffect } from "react"
import { eventBus, WebViewMessage } from "../../../../utils"
const Bybit = () => {
  const [form] = Form.useForm()
  // useEffect(() => {
  //   form.setFieldsValue({
  //       testnet: false, 
  //   })
  // }, [])
  const handleOk = async () => {
    const data = await form.validateFields()
      eventBus.emitVscode(WebViewMessage.setBybitConfig, data)
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
          name="key"
        >
          <Input /> 
        </Form.Item>
        <Form.Item
          label="APISecret"
          name="secret"
        >
          <Input /> 
        </Form.Item>
        <Form.Item
          label="密码"
          name="password"
          rules={[{ required: true, message: "密码必填！" }]}
        >
          <Input type="password" /> 
        </Form.Item>
        <Form.Item
          label="网络"
          name="testnet"
          rules={[{ required: true, message: "网络必填！" }]}
        >
          <Radio.Group>
            <Radio value={true}> TestNet </Radio>
            <Radio value={false}> Main </Radio>
          </Radio.Group>
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

export default Bybit
