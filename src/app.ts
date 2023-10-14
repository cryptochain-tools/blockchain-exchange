import * as vscode from 'vscode'
import axios from 'axios'
import { util } from './utils'
import { UI_LINK, API_ADDRESS } from './config'
import { TreeProvider } from './treeProvider'
import eventBus, { EventBusConstants } from './utils/eventBus'
import { WebViewMessage } from './config/constants'

export class App {
  private activateContext: vscode.ExtensionContext
  private statusBarItems: any
  private coins: any
  private updateInterval: any
  private timer: any
  private API_ADDRESS: string
  constructor(context: vscode.ExtensionContext) {
    this.activateContext = context
    this.statusBarItems = {}
    this.coins = util.getConfigurationCoin()
    this.updateInterval = util.getConfigurationTime()
    this.timer = null
    this.API_ADDRESS = '' // 交易对地址
    this.init()
    this.initBar()
    context.subscriptions.push(
      vscode.workspace.onDidChangeConfiguration(() => this.handleConfigChange())
    )
  }
  /*
   * 配置文件改变触发
   */
  handleConfigChange() {
    this.timer && clearInterval(this.timer)
    const codes: any = util.getConfigurationCoin()
    Object.keys(this.statusBarItems).forEach((item) => {
      if (codes.indexOf(item) === -1) {
        this.statusBarItems[item].hide()
        this.statusBarItems[item].dispose()
        delete this.statusBarItems[item]
      }
    })
    this.init()
  }
  /**
   * 获取接口数据
   */
  fetchAllData() {
    axios
      .get(this.API_ADDRESS)
      .then((rep) => {
        const result = rep.data
        if (result.status === 'ok' && result.data.length) {
          this.updateStatusBar(result.data)
          this.updateActivityBar(result.data)
        }
      })
      .catch((error) => {
        // api 错误
        // vscode.window.showErrorMessage('Api 请求出错了！', this.API_ADDRESS)
        console.error(error, 'APIERROR')
      })
  }
  /**
   * 格式化数据
   * @param {Array} data
   */
  formatCoinData(data: any) {
    data = data.sort(util.sortObj('close'))
    const coinArr = {
      USDT: [],
      ETH: [],
      BTC: [],
      TOOL: [],
    }

    data.forEach((item) => {
      const { symbol } = item
      const [coin, trading] = util.getCoinInfo(symbol.toUpperCase())
      const link = `${UI_LINK}${coin}/${trading}`
      const isFocus = this.coins.indexOf(symbol.toUpperCase()) === -1 ? 0 : 1

      const newItem = {
        label: `「${trading === 'USDT' ? coin : coin + '/' + trading}」${
          item.close
        } ${item.close > item.open ? '📈' : '📉'} ${util.formatNumber(
          (item.close - item.open) / item.open,
          100
        )}%`,
        icon: `star${isFocus}.png`,
        isFocus,
        price: item.close,
        type: `${item.close > item.open ? '📈' : '📉'} ${util.formatNumber(
          (item.close - item.open) / item.open,
          100
        )}%`,
        coin,
        symbol,
        link,
        extension: 'coin.focus',
      }
      // 只显示激活的币种

      if (isFocus === 1) {
        coinArr[trading].push(newItem)
      }
    })
    eventBus.emit(EventBusConstants.SEND_VEBVIEW_MESSAGE, {
      command: WebViewMessage.market,
      data: [...coinArr['USDT'], ...coinArr['ETH'], ...coinArr['BTC']],
    })
    return coinArr
  }
  /*
   * 更新 ActivityBar
   */
  updateActivityBar(data?: any) {
    const coinData = this.formatCoinData(data)
    const rootPath = vscode.workspace.workspaceFolders

    const provider = new TreeProvider(
      rootPath,
      [...coinData['USDT'], ...coinData['ETH'], ...coinData['BTC']],
      this.activateContext
    )
    vscode.window.registerTreeDataProvider(
      'MARKET',
      provider as unknown as vscode.TreeDataProvider<any>
    )
  }
  /*
   * 更新底部 StatusBar
   */
  updateStatusBar(data: any) {
    data.forEach((item: any) => {
      const { symbol } = item
      const [coin, trading] = util.getCoinInfo(symbol.toUpperCase())
      if (this.coins.includes(symbol.toUpperCase())) {
        const statusBarItemsText = `「${
          trading === 'USDT' ? coin : coin + '/' + trading
        }」${util.formatNumber(item.close, 1, 3)} ${util.formatNumber(
          (item.close - item.open) / item.open,
          100
        )}%`
        if (this.statusBarItems[symbol]) {
          this.statusBarItems[symbol].text = statusBarItemsText
        } else {
          this.statusBarItems[symbol] = this.createStatusBarItem(
            statusBarItemsText,
            coin,
            trading
          )
        }
      }
    })
  }

  /**
   * 创建statusBar
   * @param {string} text
   */
  createStatusBarItem(text = '', coin, trading) {
    const barItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Left
    )
    barItem.text = text
    barItem.show()
    barItem.tooltip = `点击查看 ${coin} 行情`
    const link = `${UI_LINK}${coin}/${trading}`
    barItem.command = {
      title: '',
      command: 'coin.focus',
      arguments: [link],
    }
    return barItem
  }

  /**
   * 动态获取交易所api地址
   */
  watcher() {
    /* 每次init重新更新配置文件的内容 */
    this.coins = util.getConfigurationCoin()
    this.updateInterval = util.getConfigurationTime()

    this.fetchAllData()
    this.timer = setInterval(() => {
      this.fetchAllData()
    }, this.updateInterval)
  }
  init() {
    this.API_ADDRESS = API_ADDRESS
    this.watcher()
  }

  initBar() {
    const coinArr = [
      {
        label: `Market`,
        icon: `cointool.png`,
        symbol: 'cointool',
        link: '',
        extension: 'local.webview',
      },
      {
        label: `Open Orders`,
        icon: `cointool.png`,
        symbol: 'cointool',
        link: '',
        extension: 'local.webview',
      },
      {
        label: `Position`,
        icon: `cointool.png`,
        symbol: 'cointool',
        link: '',
        extension: 'local.webview',
      },
      {
        label: `Account`,
        icon: `cointool.png`,
        symbol: 'cointool',
        link: '',
        extension: 'local.webview',
      },
      {
        label: `Settings`,
        icon: `cointool.png`,
        symbol: 'cointool',
        link: '',
        extension: 'local.webview',
      },
      {
        label: `Funding Rate`,
        icon: `cointool.png`,
        symbol: 'cointool',
        link: 'https://www.fundingrate.cn/',
        extension: 'tool.webview',
      },
      {
        label: `Tools`,
        icon: `cointool.png`,
        symbol: 'cointool',
        link: 'https://www.fundingrate.cn/tools',
        extension: 'tool.webview',
      },
      {
        label: `WX`,
        icon: `cointool.png`,
        symbol: 'cointool',
        link: 'https://wx.qq.com',
        extension: 'tool.webview',
      },
    ]
    const rootPath = vscode.workspace.workspaceFolders
    const providerTool: any = new TreeProvider(
      rootPath,
      coinArr,
      this.activateContext
    )
    vscode.window.registerTreeDataProvider('EXCHANGE', providerTool)
  }
}
