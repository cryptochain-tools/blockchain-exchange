import { Modal, Form, InputNumber, Select, Radio } from "antd"
import { eventBus, WebViewMessage } from "../../../../utils"
import useCoin from '../../useCoin'

import React, { FC } from "react"
const UnifiedMargin: FC<any> = ({ open, setOpen }) => {
  const coin = useCoin(WebViewMessage.readBybitCoin)
  const [form] = Form.useForm()
  const handleOk = async () => {
    const data = await form.validateFields()

    eventBus.emitVscode(WebViewMessage.bybitDvPlaceorder, {
      ...data,
      category: "linear",
      qty: String(data.qty),
      price: String(data.price),
      timeInForce: "GoodTillCancel",
    })
    setOpen(false)
  }

  const handleCancel = () => {
    setOpen(false)
  }
  return (
    <div>
      <Modal
        title="Bybit-统保挂单"
        open={open}
        onOk={handleOk}
        onCancel={handleCancel}
        destroyOnClose={true}
      >
        <Form
          layout="horizontal"
          form={form}
          labelAlign="right"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
        >
          <Form.Item
            label="选择币种"
            name="symbol"
            rules={[{ required: true, message: "币种必填！" }]}
          >
            <Select>
              {coin.map((item: any) => (
                <Select.Option value={item}>{item}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="挂单数量"
            name="qty"
            rules={[{ required: true, message: "挂单数量必填！" }]}
          >
            <InputNumber />
          </Form.Item>
          <Form.Item label="价格" name="price">
            <InputNumber />
          </Form.Item>
          <Form.Item
            label="仓位方向"
            name="side"
            rules={[{ required: true, message: "类型必填！" }]}
          >
            <Radio.Group>
              <Radio value="Buy"> 买入/做多 </Radio>
              <Radio value="Sell"> 卖出/做空 </Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item
            label="订单类型"
            name="orderType"
            rules={[{ required: true, message: "订单类型必填！" }]}
          >
            <Radio.Group>
              <Radio value="Limit"> 限价单 </Radio>
              <Radio value="Market"> 市价单 </Radio>
            </Radio.Group>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default UnifiedMargin
