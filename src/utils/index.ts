import * as vscode from 'vscode'
import * as path from 'path'
import * as fs from 'fs'

export const util = {
  /**
   * @调用 arr.sort(util.sortObj("age"))
   * @param {string} propertyName 属性名称
   * @param {string} sortType asce = 升序，desc = 降序
   */
  sortObj(propertyName: string, sortType = 'asce') {
    return (obj1: any, obj2: any) => {
      let val1 = obj1[propertyName]
      let val2 = obj2[propertyName]
      if (val2 < val1) {
        return sortType === 'asce' ? -1 : 1
      } else if (val2 > val1) {
        return sortType === 'asce' ? 1 : -1
      } else {
        return 0
      }
    }
  },
  /**
   * 获取配置文件的 Bybit 币对
   */
  getConfigurationBybitCoin() {
    const config = vscode.workspace.getConfiguration()
    return config.get('blockchain-tools.bybitCoin')
  },

  /**
   * 获取配置文件的市场币对
   */
  getConfigurationMarketCoin() {
    const config = vscode.workspace.getConfiguration()
    return config.get('blockchain-tools.marketCoin')
  },

  /**
   * 获取配置文件的 Binance 币对
   */
  getConfigurationBinanceCoin() {
    const config = vscode.workspace.getConfiguration()
    return config.get('blockchain-tools.binanceCoin')
  },
  /**
   * 获取配置文件的监听币种
   */
  getConfigurationCoin() {
    const config = vscode.workspace.getConfiguration()
    return config.get('blockchain-tools.coin')
  },
  /**
   * 获取配置文件的更新时间
   */
  getConfigurationTime() {
    const config = vscode.workspace.getConfiguration()
    return config.get('blockchain-tools.updateInterval')
  },
  /**
   * 获取分割 symbol信息
   * 例：btcusdt = ['btc', 'usdt']
   * @param {*} symbol
   */
  getCoinInfo(symbol: string) {
    let trading: any
    if (symbol.slice(-3) === 'ETH') {
      trading = 'ETH'
    } else if (symbol.slice(-3) === 'BTC') {
      trading = 'BTC'
    } else if (symbol.slice(-4) === 'USDT') {
      trading = 'USDT'
    }
    return [symbol.split(trading)[0], trading]
  },

  /**
   * 从某个HTML文件读取能被Webview加载的HTML内容
   * @param {*} context 上下文
   * @param {*} templatePath 相对于插件根目录的html文件相对路径
   */
  getWebViewContent(context: vscode.ExtensionContext, templatePath: string) {
    const resourcePath = path.join(context.extensionPath, templatePath)
    const dirPath = path.dirname(resourcePath)
    let html = fs.readFileSync(resourcePath, 'utf-8')
    // vscode不支持直接加载本地资源，需要替换成其专有路径格式，这里只是简单的将样式和JS的路径替换
    html = html.replace(
      /(<link.+?href="|<script.+?src="|<img.+?src=")(.+?)"/g,
      (m, $1, $2) => {
        return (
          $1 +
          vscode.Uri.file(path.resolve(dirPath, $2))
            .with({ scheme: 'vscode-resource' })
            .toString() +
          '"'
        )
      }
    )
    return html
  },

  localize(key: string) {
    // let lan = JSON.parse(process.env.VSCODE_NLS_CONFIG || `{locale: 'zh-cn'}`);
    // if (lan.locale.toLowerCase() === 'zh-cn') {
    //     return language[key].chinese;
    // } else {
    //     return language[key].english;
    // }
    return 'Exchange'
  },

  getLanguage(): string {
    let lan = JSON.parse(process.env.VSCODE_NLS_CONFIG || `{locale: 'zh-CN'}`)
    return lan.locale
  },

  formatPercentage(num: any, x = 1, fixed = 2) {
    if (num) {
      const _num = Number(Number(Number(num) * x)).toFixed(fixed)
      return Number(_num)
    } else {
      return 0
    }
  },

  toFixed(v: string | number | null = 0, d = 0, max = 4) {
    const newV = Number(v)
    if (newV < 1) {
      return newV.toFixed(max)
    } else {
      return newV.toFixed(d)
    }
  },
}
