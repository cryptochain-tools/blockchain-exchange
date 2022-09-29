import React, { useEffect, useState } from "react"
import { Table, Button, Divider, message, Popconfirm, Tabs } from "antd"
import { eventBus, WebViewMessage } from "../../../../utils/"
import { PlusOutlined } from "@ant-design/icons"
import UnifiedMargin from "./UnifiedMargin"
import Spot from "./Spot"
import BinanceSpot from "./BinanceSpot"

const ItemsName = {
  key: "ACTIVE_KEY_OPEN_ORDER",
  bybitUnifiedMargin: "Bybit-统一保证金",
  bybitSpot: "Bybit-现货",
  binanceSpot: "Binance-现货",
}

const OpenOrder = () => {
  const [activeKey, setActiveKey] = useState(() => {
    return localStorage.getItem(ItemsName.key) || ItemsName.bybitUnifiedMargin
  })
  const onChange = (key) => {
    localStorage.setItem(ItemsName.key, key)
    setActiveKey(key)
  }
  const [margin, setMargin] = useState(false)
  const [spot, setSpot] = useState(false)
  const [binanceSpot, setBinanceSpot] = useState(false)
  const [page, setPage] = useState({
    bybitUnifiedMargin: [],
    bybitSpot: [],
    binanceSpot: [],
  })
  useEffect(() => {
    eventBus.on(WebViewMessage.openOrder, ({ type, data }) => {
      setPage({
        ...page,
        [type]: data,
      })
    })
    return () => eventBus.off(WebViewMessage.openOrder)
  }, [page])
  const base = [
    {
      title: "现货交易对",
      dataIndex: "symbol",
      key: "symbol",
    },
    {
      title: "数量",
      dataIndex: "orderQty",
      key: "orderQty",
    },
    {
      title: "价格",
      dataIndex: "orderPrice",
      key: "orderPrice",
    },
    {
      title: "类型",
      dataIndex: "side",
      key: "side",
    },
    {
      title: "订单类型",
      dataIndex: "orderType",
      key: "orderType",
    },
  ]

  const columns = [
    {
      title: "合约",
      dataIndex: "symbol",
      key: "symbol",
    },
    {
      title: "数量",
      dataIndex: "qty",
      key: "qty",
    },
    {
      title: "价格",
      dataIndex: "price",
      key: "price",
    },
    {
      title: "类型",
      dataIndex: "sideCN",
      key: "sideCN",
    },
    {
      title: "订单类型",
      dataIndex: "orderType",
      key: "orderType",
    },
    {
      title: "设置",
      dataIndex: "settings",
      render: (text, r) => {
        const confirm = () => {
          eventBus.emitVscode(WebViewMessage.bybitDvCancelorder, {
            category: "linear",
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
  const bybitSpotColumns = [
    ...base,
    {
      title: "设置",
      dataIndex: "settings",
      render: (text, r) => {
        const confirm = () => {
          eventBus.emitVscode(WebViewMessage.bybitSpotCancelorder, {
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
      title: "设置",
      dataIndex: "settings",
      render: (text, r) => {
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

  const bybitUnifiedMargin = () => {
    return (
      <div>
        <div
          style={{
            textAlign: "right",
            marginBottom: "10px",
          }}
        >
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setMargin(true)}
          >
            统保挂单
          </Button>
        </div>
        <Table
          size="small"
          dataSource={page.bybitUnifiedMargin}
          columns={columns}
          pagination={false}
          showHeader={true}
        />
      </div>
    )
  }

  const spotElement = (dataSource, columns, _set) => {
    return (
      <div>
        <div
          style={{
            textAlign: "right",
            marginBottom: "10px",
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
            label: ItemsName.bybitUnifiedMargin,
            key: ItemsName.bybitUnifiedMargin,
            children: bybitUnifiedMargin(),
          },
          {
            label: ItemsName.bybitSpot,
            key: ItemsName.bybitSpot,
            children: spotElement(page.bybitSpot, bybitSpotColumns, setSpot),
          },
          // {
          //     label: 'Binance-合约',
          //     key: 'Binance-合约',
          //     children: <Table
          //         size="small"
          //         dataSource={[]}
          //         columns={columns}
          //         pagination={false}
          //         showHeader={true}
          //     />,
          // },
          {
            label: ItemsName.binanceSpot,
            key: ItemsName.binanceSpot,
            children: spotElement(
              page.binanceSpot,
              binanceSpotColumns,
              setBinanceSpot
            ),
          },
        ]}
      />
      <UnifiedMargin open={margin} setOpen={setMargin} />
      <Spot open={spot} setOpen={setSpot} />
      <BinanceSpot open={binanceSpot} setOpen={setBinanceSpot} />
    </div>
  )
}

export default OpenOrder
