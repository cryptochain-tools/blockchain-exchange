import React, { useEffect, useState } from 'react'
import { Table, Button, Divider, message, Popconfirm, Tabs } from 'antd'
import { eventBus, WebViewMessage } from '../../../../utils'
import { PlusOutlined } from '@ant-design/icons'
import UnifiedMargin from './UnifiedMargin'
import BinanceSpot from './BinanceSpot'

const ItemsName = {
  key: 'ACTIVE_KEY_OPEN_ORDER',
  bybitUnifiedTrading: 'Bybit-统一交易账户',
  binanceSpot: 'Binance-现货',
}

const OpenOrder = () => {
  const [activeKey, setActiveKey] = useState(() => {
    return localStorage.getItem(ItemsName.key) || ItemsName.bybitUnifiedTrading
  })
  const onChange = (key: any) => {
    localStorage.setItem(ItemsName.key, key)
    setActiveKey(key)
  }
  const [margin, setMargin] = useState(false)
  const [spot, setSpot] = useState(false)
  const [binanceSpot, setBinanceSpot] = useState(false)
  const [page, setPage] = useState({
    bybitUnifiedTrading: [],
    binanceSpot: [],
  })
  useEffect(() => {
    eventBus.on(WebViewMessage.openOrder, ({ type, data }: any) => {
      setPage({
        ...page,
        [type]: data,
      })
    })
    return () => eventBus.off(WebViewMessage.openOrder)
  }, [page])
  const base = [
    {
      title: '现货交易对',
      dataIndex: 'symbol',
      key: 'symbol',
    },
    {
      title: '数量',
      dataIndex: 'orderQty',
      key: 'orderQty',
    },
    {
      title: '价格',
      dataIndex: 'orderPrice',
      key: 'orderPrice',
    },
    {
      title: '类型',
      dataIndex: 'sideCN',
      key: 'sideCN',
    },
    {
      title: '订单类型',
      dataIndex: 'orderType',
      key: 'orderType',
    },
  ]

  const columns = [
    {
      title: '合约',
      dataIndex: 'symbol',
      key: 'symbol',
    },
    {
      title: '数量',
      dataIndex: 'qty',
      key: 'qty',
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
    },
    {
      title: '类型',
      dataIndex: 'sideCN',
      key: 'sideCN',
    },
    {
      title: '订单类型',
      dataIndex: 'orderType',
      key: 'orderType',
    },
    {
      title: '设置',
      dataIndex: 'settings',
      render: (_: any, r: any) => {
        const confirm = () => {
          eventBus.emitVscode(WebViewMessage.bybitDvCancelorder, {
            category: 'linear',
            symbol: r.symbol,
            orderId: r.orderId,
          })
        }
        return (
          <div>
            <Popconfirm
              title={`确定取消 ${r.symbol} 挂单?`}
              onConfirm={confirm}
            >
              <Button type="link">撤单</Button>
            </Popconfirm>
          </div>
        )
      },
    },
  ]
  const binanceSpotColumns = [
    ...base,
    {
      title: '设置',
      dataIndex: 'settings',
      render: (_: string, r: any) => {
        const confirm = () => {
          eventBus.emitVscode(WebViewMessage.binanceSpotCancelorder, {
            orderId: r.orderId,
            symbol: r.symbol,
          })
        }
        return (
          <div>
            <Popconfirm
              title={`确定取消 ${r.symbol} 挂单?`}
              onConfirm={confirm}
            >
              <Button type="link">撤单</Button>
            </Popconfirm>
          </div>
        )
      },
    },
  ]

  const bybitUnifiedTrading = () => {
    return (
      <div>
        <div
          style={{
            textAlign: 'right',
            marginBottom: '10px',
          }}
        >
          <Button
            type="primary"
            icon={<PlusOutlined />}
            disabled
            onClick={() => setMargin(true)}
          >
            统保挂单
          </Button>
        </div>
        <Table
          size="small"
          dataSource={page.bybitUnifiedTrading}
          columns={columns}
          pagination={false}
          showHeader={true}
        />
      </div>
    )
  }

  const spotElement = (dataSource: any, columns: any, _set: any) => {
    return (
      <div>
        <div
          style={{
            textAlign: 'right',
            marginBottom: '10px',
          }}
        >
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => _set(true)}
          >
            现货挂单
          </Button>
        </div>
        <Table
          size="small"
          dataSource={dataSource}
          columns={columns}
          pagination={false}
          showHeader={true}
        />
      </div>
    )
  }

  return (
    <div>
      <Tabs
        tabPosition="top"
        activeKey={activeKey}
        onChange={onChange}
        items={[
          {
            label: ItemsName.bybitUnifiedTrading,
            key: ItemsName.bybitUnifiedTrading,
            children: bybitUnifiedTrading(),
          },
          // {
          //   label: ItemsName.binanceSpot,
          //   key: ItemsName.binanceSpot,
          //   children: spotElement(
          //     page.binanceSpot,
          //     binanceSpotColumns,
          //     setBinanceSpot
          //   ),
          // },
        ]}
      />
      <UnifiedMargin open={margin} setOpen={setMargin} />
      <BinanceSpot open={binanceSpot} setOpen={setBinanceSpot} />
    </div>
  )
}

export default OpenOrder
