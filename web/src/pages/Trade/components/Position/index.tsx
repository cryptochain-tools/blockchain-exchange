import React, { useEffect, useState } from 'react'
import { Table, Button, Divider, Popconfirm, message, Tabs } from 'antd'
import { eventBus, WebViewMessage, formatPercentage } from '../../../../utils'

const Position = () => {
  const [page, setPage] = useState({
    bybitUnifiedTrading: [],
  })
  useEffect(() => {
    eventBus.on(WebViewMessage.positions, ({ type, data = [] }: any) => {
      const d = data.map((i: any) => {
        return {
          ...i,
          avgPrice: formatPercentage(i.avgPrice),
          markPrice: formatPercentage(i.markPrice),
          positionIM: formatPercentage(i.positionIM),
          unrealisedPnl: formatPercentage(i.unrealisedPnl),
          cumRealisedPnl: formatPercentage(i.cumRealisedPnl),
        }
      })
      setPage({
        ...page,
        [type]: d,
      })
    })
    return () => eventBus.off(WebViewMessage.positions)
  }, [])

  const columns = [
    {
      title: '合约',
      dataIndex: 'symbol',
      key: 'symbol',
    },
    {
      title: '数量',
      dataIndex: 'size',
      key: 'size',
    },
    {
      title: '类型',
      dataIndex: 'side',
      key: 'side',
    },
    {
      title: '入场价格',
      dataIndex: 'avgPrice',
      key: 'avgPrice',
    },
    {
      title: '标记价格',
      dataIndex: 'markPrice',
      key: 'markPrice',
    },
    {
      title: '仓位保证金',
      dataIndex: 'positionIM',
      key: 'positionIM',
    },
    {
      title: '未结盈亏 (USD)',
      dataIndex: 'unrealisedPnl',
      key: 'unrealisedPnl',
    },
    {
      title: '已结盈亏 (USD)',
      dataIndex: 'cumRealisedPnl',
      key: 'cumRealisedPnl',
    },
    {
      title: '平仓',
      dataIndex: 'settings',
      render: (_: any, r: any) => {
        const confirm = () => {
          eventBus.emitVscode(WebViewMessage.bybitDvPlaceorder, {
            category: 'linear',
            symbol: r.symbol,
            side: r.side === 'Buy' ? 'Sell' : 'Buy',
            orderType: 'Market',
            qty: String(Math.abs(Number(r.size))),
            timeInForce: 'GoodTillCancel',
          })
        }
        return (
          <div>
            <Button type="link" disabled>
              限价
            </Button>
            <Popconfirm
              disabled
              title={`确定平仓 ${r.symbol} ?`}
              onConfirm={confirm}
            >
              <Button type="link" danger>
                市价
              </Button>
            </Popconfirm>
          </div>
        )
      },
    },
  ]

  return (
    <div
      style={{
        paddingBottom: '50px',
      }}
    >
      <Tabs
        tabPosition="top"
        items={[
          {
            label: 'Bybit-统一交易账户',
            key: 'Bybit-统一交易账户',
            children: (
              <Table
                size="small"
                dataSource={page.bybitUnifiedTrading}
                columns={columns}
                pagination={false}
                showHeader={true}
              />
            ),
          },
          // {
          //     label: 'Binance-合约',
          //     key: 'Binance-现货',
          //     children: <Table
          //         size="small"
          //         dataSource={[]}
          //         columns={columns}
          //         pagination={false}
          //         showHeader={true}
          //     />,
          // },
        ]}
      />
    </div>
  )
}

export default Position
