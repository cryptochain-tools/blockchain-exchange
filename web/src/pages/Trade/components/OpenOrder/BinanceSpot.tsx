import { Modal, Form, InputNumber, Select, Radio } from "antd"
import { eventBus, WebViewMessage } from "../../../../utils"
import useCoin from "../../useCoin"

import React, { FC } from "react"
const BinanceSpot: FC<any> = ({ open, setOpen }) => {
  const coin = useCoin(WebViewMessage.readBinanceCoin)
  const [form] = Form.useForm()
  const handleOk = async () => {
    const data = await form.validateFields()

    eventBus.emitVscode(WebViewMessage.binanceSpotPlaceorder, {
      ...data,
      ...(data.type === "LIMIT" ? { timeInForce: "GTC" } : {}),
    })
    setOpen(false)
  }

  const handleCancel = () => {
    setOpen(false)
  }
  return (
    <div>
      <Modal
        title="Binance-现货挂单"
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
            label="仓位方向"
            name="side"
            rules={[{ required: true, message: "类型必填！" }]}
          >
            <Radio.Group>
              <Radio value="BUY"> 买入 </Radio>
              <Radio value="SELL"> 卖出 </Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item
            label="订单类型"
            name="type"
            rules={[{ required: true, message: "订单类型必填！" }]}
          >
            <Radio.Group>
              <Radio value="LIMIT"> 限价单 </Radio>
              <Radio value="MARKET"> 市价单 </Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item
            label="挂单数量"
            name="quantity"
            rules={[{ required: true, message: "挂单数量必填！" }]}
          >
            <InputNumber />
          </Form.Item>
          {form.getFieldValue("type") === "MARKET" ? null : (
            <Form.Item label="价格" name="price">
              <InputNumber />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  )
}

export default BinanceSpot
