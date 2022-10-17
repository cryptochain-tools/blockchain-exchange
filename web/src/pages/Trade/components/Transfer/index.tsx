import { Modal, Form, Input, Select } from 'antd'
import { eventBus, WebViewMessage } from '../../../../utils'
import { v4 as uuidv4 } from 'uuid'

import React, { FC } from 'react'
const Transfer: FC<any> = ({ isTransfer, coin, setIsTransfer }) => {
  const [form] = Form.useForm()
  const handleOk = async () => {
    const data = await form.validateFields()
    eventBus.emitVscode(WebViewMessage.bybitTransfer, {
      ...data,
      transfer_id: uuidv4(),
    })
    setIsTransfer(false)
  }

  const handleCancel = () => {
    setIsTransfer(false)
  }
  return (
    <div>
      <Modal
        title="Bybit-划转"
        open={isTransfer}
        onOk={handleOk}
        onCancel={handleCancel}
        destroyOnClose={true}
      >
        <Form layout="horizontal" form={form}>
          <Form.Item
            label="选择币种"
            name="coin"
            rules={[{ required: true, message: '币种必填！' }]}
          >
            <Select>
              {coin.map((item: any) => (
                <Select.Option value={item.currencyCoin}>
                  {item.currencyCoin}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="划转金额"
            name="amount"
            rules={[{ required: true, message: '划转金额必填！' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="转出账户"
            name="from_account_type"
            rules={[{ required: true, message: '转出账户必填！' }]}
          >
            <Select>
              <Select.Option value="SPOT">现货</Select.Option>
              <Select.Option value="UNIFIED">统一保证金</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="转入账户"
            name="to_account_type"
            rules={[{ required: true, message: '转入账户必填！' }]}
          >
            <Select>
              <Select.Option value="SPOT">现货</Select.Option>
              <Select.Option value="UNIFIED">统一保证金</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default Transfer
