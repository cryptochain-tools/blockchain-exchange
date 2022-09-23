# Blockchain-Watch


## Configuration:
修改用户配置，添加你所需要监控的数字货币
```
  /* 
   * 说明：配置需要监控的数字货币 
   * 规则：btc(比特币) + usdt(交易对) = btcusdt
   */
  "blockchain-watch.coin": [
    "btcusdt"
  ],
  /*
   * 说明：轮询请求API时间
   * 单位：毫秒
   */
  "blockchain-watch.updateInterval": 10000
```