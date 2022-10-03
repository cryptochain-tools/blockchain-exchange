# 比特币交易

## 交易:

> 📢 请勿允许提现权限、请勿允许提现权限、请勿允许提现权限
> 📢 代码不会存储你交易所 APIKey，放在本地缓存内部

[Bybit API](https://www.bybit.com/app/user/api-management)

[Binance API](https://www.binance.com/zh-CN/my/settings/api-management)

## Configuration:

修改用户配置，添加你所需要监控的数字货币

```
  /*
   * 说明：配置需要监控的数字货币
   * 规则：BTC(比特币) + USDT(交易对) = BTCUSDT
   */
  "blockchain-exchange.coin": [
    "BTCUSDT",
    "ETHUSDT"
  ],
  /*
   * 说明：配置 Bybit 交易对
   * 规则：BTC(比特币) + USDT(交易对) = BTCUSDT
   * USDC规则: BTC(比特币) + PERP(USDC交易对) = BTCPERP   
   */
  "blockchain-exchange.bybitCoin": [
     "BTCUSDT",
     "ETHUSDT",
     "BITUSDT"
  ],
  /*
   * 说明：配置 Binance(币安) 交易对
   * 规则：BTC(比特币) + BUSD(交易对) = BTCBUSD
   */
  "blockchain-exchange.binanceCoin": [
     "BTCBUSD",
     "ETHBUSD",
     "BNBBUSD"
  ],
  /*
   * 说明：轮询请求API时间
   * 单位：毫秒
   */
  "blockchain-exchange.updateInterval": 10000
```
