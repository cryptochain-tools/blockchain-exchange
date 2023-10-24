import React, { useEffect, useState } from 'react'
import { Table, Button, Divider, message, Popconfirm, Tabs, Modal } from 'antd'
import { eventBus, WebViewMessage, formatPercentage } from '../../../../utils'
import Transfer from '../Transfer'
const ItemsName = {
  key: 'ACTIVE_KEY_ACCOUNT',
  bybitUnifiedTrading: 'Bybit-统一交易账户',
  bybitFunding: 'Bybit-资金账户',
  binanceSpot: 'Binance-现货',
}

const Account = () => {
  const [activeKey, setActiveKey] = useState(() => {
    return localStorage.getItem(ItemsName.key) || ItemsName.bybitUnifiedTrading
  })
  const onChange = (key: string) => {
    localStorage.setItem(ItemsName.key, key)
    setActiveKey(key)
  }
  const [isTransfer, setIsTransfer] = useState(false)
  const [page, setPage] = useState({
    bybitUnifiedTrading: [],
    bybitFunding: [],
    binanceSpot: [],
  })
  const [data, setData] = useState<any>({})
  useEffect(() => {
    eventBus.on(WebViewMessage.account, ({ type, data }: any) => {
      if (type === 'bybitUnifiedTrading') {
        setPage({
          ...page,
          [type]: data.result,
        })
        setData(data)
      } else {
        setPage({
          ...page,
          [type]: data,
        })
      }
    })
    return () => eventBus.off(WebViewMessage.account)
  }, [page])
  const base = [
    {
      title: '币种',
      dataIndex: 'coin',
      key: 'coin',
    },
    {
      title: '钱包余额',
      dataIndex: 'walletBalance',
      key: 'walletBalance',
    },
    {
      title: '可划余额',
      dataIndex: 'transferBalance',
      key: 'transferBalance',
    },
    {
      title: '总金额',
      dataIndex: 'walletBalance',
      key: 'walletBalance',
    },
  ]

  const columns = [
    {
      title: '币种',
      dataIndex: 'coin',
      key: 'coin',
    },
    {
      title: '数量',
      dataIndex: 'equity',
      key: 'equity',
    },
    {
      title: '价值(USD)',
      dataIndex: 'usdValue',
      key: 'usdValue',
    },
    {
      title: '可划转提现金额',
      dataIndex: 'availableToWithdraw',
      key: 'availableToWithdraw',
    },
    {
      title: '设置',
      dataIndex: 'settings',
      render: (_: string, r: any) => {
        return (
          <div>
            <Button disabled type="link" onClick={() => setIsTransfer(true)}>
              划转
            </Button>
          </div>
        )
      },
    },
  ]
  const bybitFundingColumns = [
    ...base,
    {
      title: '设置',
      dataIndex: 'settings',
      render: (_: string, r: any) => {
        return (
          <div>
            <Button disabled type="link" onClick={() => setIsTransfer(true)}>
              划转
            </Button>
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
        return (
          <div>
            <Button disabled type="link">
              划转
            </Button>
          </div>
        )
      },
    },
  ]

  return (
    <>
      <div
        style={{
          paddingBottom: '50px',
        }}
      >
        {activeKey === ItemsName.bybitUnifiedTrading ? (
          <>
            <div className="flex" style={{ marginBottom: 20 }}>
              <div style={{ marginRight: 20 }}>
                IM: {formatPercentage(data.accountIMRate, 100, 2)} %
              </div>
              <div style={{ marginRight: 20 }}>
                MM: {formatPercentage(data.accountMMRate, 100, 2)} %
              </div>
              <div style={{ marginRight: 20 }}>
                总资产: {formatPercentage(data.totalEquity)}
              </div>
              <div style={{ marginRight: 20 }}>
                保证金余额: {formatPercentage(data.totalMarginBalance)}
              </div>
              <div style={{ marginRight: 20 }}>
                未结盈亏：{formatPercentage(data.totalPerpUPL)}
              </div>
            </div>
          </>
        ) : null}

        <Tabs
          tabPosition="top"
          activeKey={activeKey}
          onChange={onChange}
          items={[
            {
              label: ItemsName.bybitUnifiedTrading,
              key: ItemsName.bybitUnifiedTrading,
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
            {
              label: ItemsName.bybitFunding,
              key: ItemsName.bybitFunding,
              children: (
                <Table
                  size="small"
                  dataSource={page.bybitFunding}
                  columns={bybitFundingColumns}
                  pagination={false}
                  showHeader={true}
                />
              ),
            },
            // {
            //   label: ItemsName.binanceSpot,
            //   key: ItemsName.binanceSpot,
            //   children: (
            //     <Table
            //       size="small"
            //       dataSource={page.binanceSpot}
            //       columns={binanceSpotColumns}
            //       pagination={false}
            //       showHeader={true}
            //     />
            //   ),
            // },
          ]}
        />
        <Transfer
          isTransfer={isTransfer}
          coin={page.bybitUnifiedTrading}
          setIsTransfer={setIsTransfer}
        />
      </div>
    </>
  )
}

export default Account
