import * as vscode from 'vscode'
import { RestClientV5 } from 'bybit-api'
import { util } from './utils'
import axios from 'axios'
import { TreeProvider } from './treeProvider'
import { UI_LINK } from './config'

export class MarketMonitoring {
  private activateContext: vscode.ExtensionContext
  private client: RestClientV5
  private updateInterval: any
  private timer: any
  private marketCoin: Array<string>
  private map: Map<string, number>
  private mapList: Map<string, any>
  constructor(context: vscode.ExtensionContext) {
    this.activateContext = context
    this.map = new Map()
    this.mapList = new Map()
    this.client = new RestClientV5({
      testnet: true,
    })
    this.marketCoin = util.getConfigurationMarketCoin() as Array<string>
    this.updateInterval = util.getConfigurationTime()
    context.subscriptions.push(
      vscode.workspace.onDidChangeConfiguration(() => this.handleConfigChange())
    )
    this.watcher()
  }

  /*
   * 更新 ActivityBar
   */
  updateActivityBar() {
    const data = Array.from(this.mapList).map(([_, i]) => {
      const [coin, trading] = util.getCoinInfo(i.coin.toUpperCase())
      const link = `${UI_LINK}${coin}/${trading}`
      return {
        label: `「${i.coin.replace('USDT', '')}」${i.time} 分钟 ${
          i.change > 0 ? '📈' : '📉'
        } ${i.change.toFixed(2)}%`,
        icon: `star1.png`,
        symbol: '',
        link,
        extension: 'coin.focus',
      }
    })
    const rootPath = vscode.workspace.workspaceFolders

    const provider = new TreeProvider(rootPath, data, this.activateContext)
    vscode.window.registerTreeDataProvider(
      'MONITORING',
      provider as unknown as vscode.TreeDataProvider<any>
    )
  }

  // 更新配置文件
  handleConfigChange() {
    this.timer && clearInterval(this.timer)
    this.watcher()
  }

  watcher() {
    /* 每次init重新更新配置文件的内容 */
    this.marketCoin = util.getConfigurationMarketCoin() as Array<string>
    this.updateInterval = util.getConfigurationTime()
    const list = this.marketCoin.map((item) => {
      const [coin, time, change, interval] = item.split('_')
      return `${coin.replace(
        'USDT',
        ''
      )} 每 ${time} 分钟，变化超过 ${change}% 间隔 ${interval} 秒`
    })
    vscode.window.showInformationMessage(
      `配置初始化，如需调整请修改[blockchain-tools.marketCoin]`,
      ...list
    )
    this.getIndexPriceKline()
    this.timer = setInterval(() => {
      this.getIndexPriceKline()
    }, this.updateInterval)
  }

  async getKline(params = {}) {
    const { data } = await axios.get('https://api.bybit.com/v5/market/kline', {
      params,
    })
    return data
  }

  async getIndexPriceKline() {
    this.updateActivityBar()
    this.marketCoin.forEach(async (item) => {
      const [coin, time, change, interval] = item.split('_')
      const data: any = await this.getKline({
        category: 'spot',
        symbol: `${coin}`,
        interval: '1',
        limit: 100,
      })
      if (data.retCode === 0) {
        const list = data.result.list
        const start = Number(list[0][1])
        const end = Number(list[Number(time)][1])
        const _change = ((start - end) / end) * 100
        this.mapList.set(coin, {
          coin,
          time,
          start,
          end,
          change: _change,
        })
        if (Math.abs(_change) > Number(change)) {
          if (
            Number(this.map.get(coin) || 0) + Number(interval) * 1000 <
            Date.now()
          ) {
            this.map.set(coin, Date.now())
            const text = `${coin.replace(
              'USDT',
              ''
            )} ${time} 分钟，从 ${start.toFixed(3)} ${
              _change > 0 ? '上涨' : '下跌'
            }到 ${end.toFixed(3)}，${
              _change > 0 ? '涨' : '跌'
            }幅 ${_change.toFixed(2)}%`
            vscode.window.showWarningMessage(text)
          } else {
            console.log(
              '时间没有到',
              Number(this.map.get(coin)) + Number(interval) * 1000
            )
          }
        }
      }
    })
  }
}
