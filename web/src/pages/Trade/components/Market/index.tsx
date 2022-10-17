import React, { useEffect, useState } from 'react'
import { Table, Button } from 'antd'
import { eventBus, WebViewMessage } from '../../../../utils'
import { PlusOutlined } from '@ant-design/icons'

const Market = () => {
  const [data, setData] = useState<any>([])
  useEffect(() => {
    eventBus.on(WebViewMessage.market, (data) => setData(data))
    return () => eventBus.off(WebViewMessage.market)
  }, [])

  const columns = [
    {
      title: 'Coin',
      dataIndex: 'coin',
      key: 'coin',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
    },
    {
      title: 'Settings',
      dataIndex: 'settings',
      render: () => {
        return (
          <div>
            <Button type="link" disabled>
              监控
            </Button>
            <Button type="link" danger disabled>
              删除
            </Button>
          </div>
        )
      },
    },
  ]

  return (
    <div>
      <div
        style={{
          textAlign: 'right',
          marginBottom: '10px',
        }}
      >
        <Button type="primary" icon={<PlusOutlined />} disabled>
          新增币种
        </Button>
      </div>
      <Table
        size="small"
        dataSource={data}
        columns={columns}
        pagination={false}
        showHeader={true}
      />
    </div>
  )
}

export default Market
