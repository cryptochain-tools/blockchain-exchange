import React, { useEffect, useState } from "react"
import { Table, Button, Divider, Popconfirm, message, Tabs } from "antd"
import { eventBus, WebViewMessage } from "../../../../utils"


const Position = () => {
    const [page, setPage] = useState({
        bybitUnifiedMargin: [],
        bybitSpot: []
    })
    useEffect(() => {
        eventBus.on(WebViewMessage.positions, ({type, data}: any) => {
            setPage({
                ...page,
                [type]:data
            })
        })
        return () => eventBus.off(WebViewMessage.positions)
    }, [])

    const columns = [
        {
            title: "合约",
            dataIndex: "symbol",
            key: "symbol",
        },
        {
            title: "数量",
            dataIndex: "size",
            key: "size",
        },
        {
            title: "类型",
            dataIndex: "side",
            key: "side",
        },
        {
            title: "入场价格",
            dataIndex: "entryPrice",
            key: "entryPrice",
        },
        {
            title: "标记价格",
            dataIndex: "markPrice",
            key: "markPrice",
        },
        {
            title: "仓位保证金",
            dataIndex: "positionIM",
            key: "positionIM",
        },
        {
            title: "未结盈亏 (%)",
            dataIndex: "unrealisedPnl",
            key: "unrealisedPnl",
        },
        {
            title: "平仓",
            dataIndex: "settings",
            render: (_: any, r:any) => {
                const confirm = () => {
                    eventBus.emitVscode(WebViewMessage.bybitDvPlaceorder, {
                        category: 'linear',
                        symbol: r.symbol,
                        side: r.side === 'Buy' ? 'Sell' : 'Buy',
                        orderType: 'Market',
                        qty: String(Math.abs(Number(r.size))),
                        timeInForce: 'GoodTillCancel'
                    })
                    
                }
                return (
                    <div>
                        <Button type="link" disabled>限价</Button>
                        <Popconfirm
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
        <div style={{
            paddingBottom: "50px"
        }}>
            <Tabs
                tabPosition="top"
                items={[
                    {
                        label: 'Bybit-统一保证金',
                        key: 'Bybit-统一保证金',
                        children: <Table
                            size="small"
                            dataSource={page.bybitUnifiedMargin}
                            columns={columns}
                            pagination={false}
                            showHeader={true}
                        />,
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
