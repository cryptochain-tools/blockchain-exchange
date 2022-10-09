export const WebViewMessage = {
  market: "market",
  positions: "positions",
  openOrder: "openOrder",
  account: "account",
  // activeType: "activeType",

  // 发送到vscode
  readVscodeConfig: "readVscodeConfig",
  // 获取激活type
  readActiveType: "readActiveType",
  readBybitCoin: "readBybitCoin",
  readBinanceCoin: "readBinanceCoin",

  // 取消挂单
  bybitDvCancelorder: "bybitDvCancelorder",
  bybitSpotCancelorder: "bybitSpotCancelorder",
  binanceSpotCancelorder: "binanceSpotCancelorder",

  // 创建委托订单
  bybitDvPlaceorder: "bybitDvPlaceorder",
  bybitSpotPlaceorder: "bybitSpotPlaceorder",
  binanceSpotPlaceorder: "binanceSpotPlaceorder",
  //   划转
  bybitTransfer: "bybitTransfer",
  // 设置by配置
  setBybitConfig: "setBybitConfig",
  setBinanceConfig: "setBinanceConfig",
  setAllConfig: "setAllConfig",
}