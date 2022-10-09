import React, { useEffect, useState } from "react"
import { Table, Button, Divider, message, Popconfirm, Tabs, Modal } from "antd"
import { eventBus, WebViewMessage } from "../../../../utils"
import Transfer from "../Transfer"
const ItemsName = {
  key: 'ACTIVE_KEY_ACCOUNT',
  bybitUnifiedMargin: 'Bybit-统一保证金',
  bybitSpot: 'Bybit-现货',
  binanceSpot: 'Binance-现货',
}

const Account = () => {
  const [activeKey, setActiveKey] = useState(() => {
    return localStorage.getItem(ItemsName.key) || ItemsName.bybitUnifiedMargin
})
const onChange = (key: string) => {
    localStorage.setItem(ItemsName.key, key)
    setActiveKey(key)
}
  const [isTransfer, setIsTransfer] = useState(false)
  const [page, setPage] = useState({
    bybitUnifiedMargin: [],
    bybitSpot: [],
    binanceSpot:[]
  })
  useEffect(() => {
    eventBus.on(WebViewMessage.account, ({ type, data }: any) => {
      setPage({
        ...page,
        [type]: data,
      })
    })
    return () => eventBus.off(WebViewMessage.account)
  }, [page])
  const base = [
    {
      title: "币种",
      dataIndex: "coin",
      key: "coin",
    },
    {
      title: "可用余额",
      dataIndex: "free",
      key: "free",
    },
    {
      title: "冻结余额",
      dataIndex: "locked",
      key: "locked",
    },
    {
      title: "总金额",
      dataIndex: "total",
      key: "total",
    }
  ]

  const columns = [
    {
      title: "币种",
      dataIndex: "currencyCoin",
      key: "currencyCoin",
    },
    {
      title: "数量",
      dataIndex: "equity",
      key: "equity",
    },
    {
      title: "价值(USD)",
      dataIndex: "usdValue",
      key: "usdValue",
    },
    {
      title: "可用余额",
      dataIndex: "availableBalanceWithoutConvert",
      key: "availableBalanceWithoutConvert",
    },
    {
      title: "设置",
      dataIndex: "settings",
      render: (_: string, r: any) => {
        return (
          <div>
            <Button type="link" onClick={() => setIsTransfer(true)}>
              划转
            </Button>
          </div>
        )
      },
    },
  ]
  const bybitSpotColumns = [
    ...base,
    {
      title: "设置",
      dataIndex: "settings",
      render: (_: string, r: any) => {
        return (
          <div>
            <Button type="link" onClick={() => setIsTransfer(true)}>
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
      title: "设置",
      dataIndex: "settings",
      render: (_: string, r: any) => {
        return (
          <div>
            <Button type="link" disabled>
              划转
            </Button>
          </div>
        )
      },
    },
  ]

  return (
    <div
      style={{
        paddingBottom: "50px",
      }}
    >
      <div>
        <Tabs
          tabPosition="top"
          activeKey={activeKey}
          onChange={onChange}
          items={[
            {
              label: ItemsName.bybitUnifiedMargin,
              key: ItemsName.bybitUnifiedMargin,
              children: (
                <Table
                  size="small"
                  dataSource={page.bybitUnifiedMargin}
                  columns={columns}
                  pagination={false}
                  showHeader={true}
                />
              ),
            },
            {
              label: ItemsName.bybitSpot,
              key: ItemsName.bybitSpot,
              children: (
                <Table
                  size="small"
                  dataSource={page.bybitSpot}
                  columns={bybitSpotColumns}
                  pagination={false}
                  showHeader={true}
                />
              ),
            },
            {
              label: ItemsName.binanceSpot,
              key: ItemsName.binanceSpot,
              children: (
                <Table
                  size="small"
                  dataSource={page.binanceSpot}
                  columns={binanceSpotColumns}
                  pagination={false}
                  showHeader={true}
                />
              ),
            },
          ]}
        />
      </div>
      <Transfer
        isTransfer={isTransfer}
        coin={page.bybitUnifiedMargin}
        setIsTransfer={setIsTransfer}
      />
    </div>
  )
}

export default Account
