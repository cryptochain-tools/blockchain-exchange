import {
  InverseClient,
  LinearClient,
  InverseFuturesClient,
  SpotClientV3,
  UnifiedMarginClient,
  USDCOptionClient,
  USDCPerpetualClient,
  AccountAssetClient,
  CopyTradingClient,
  RestClientOptions,
  WebsocketClient,
  RestClientV5,
} from 'bybit-api'
import { WebViewMessage } from '../config/constants'
import eventBus, { EventBusConstants } from '../utils/eventBus'

import { enc, AES, mode, pad, DES } from 'crypto-js'

const BYBIT_TOKEN = 'bybit_token'
const BYBIT_SECRET = 'bybit_secret'
const BYBIT_NETWORK_TYPE = 'bybit_network_type'

import * as vscode from 'vscode'
import { DataType } from './enum'
import { sleep } from '../utils/sleep'

export class Bybit {
  private static current: Bybit | undefined
  private client: UnifiedMarginClient
  private clientV5: RestClientV5
  private spotClient: SpotClientV3
  private accountClient: AccountAssetClient
  private unifiedWS: WebsocketClient
  private time: NodeJS.Timer | null
  private context: vscode.ExtensionContext
  private password: string
  constructor(context: vscode.ExtensionContext) {
    this.context = context
    // this.initClient()
    this.onVebView()
  }

  initClient() {
    const clientConfig: RestClientOptions = {
      testnet: this.context.globalState.get(BYBIT_NETWORK_TYPE) as boolean,
      key: '',
      secret: '',
    }
    const token = this.context.globalState.get(BYBIT_TOKEN) as string
    if (token) {
      try {
        // 解密得到明文
        const bytes = AES.decrypt(token, this.password)
        const { key, secret } = JSON.parse(bytes.toString(enc.Utf8))
        clientConfig.key = key
        clientConfig.secret = secret
      } catch (error) {
        // 要求客户端弹出密码输入框
        this.emitVebView(WebViewMessage.showPassword)
      }
    } else {
      // vscode.window.showErrorMessage(
      //   "未配置 Bybit API Key，请去设置界面配置！"
      // )
    }

    if (clientConfig.key && clientConfig.secret) {
      console.log('data322323', clientConfig)
      this.client = new UnifiedMarginClient(clientConfig)
      this.spotClient = new SpotClientV3(clientConfig)
      this.accountClient = new AccountAssetClient(clientConfig)
      this.clientV5 = new RestClientV5(clientConfig)
    }
  }

  async getDataAll() {
    if (this.client) {
      this.getPositions()
      await sleep(0.2)
      this.getActiveOrders()
      await sleep(0.2)
      this.getUnifiedTradingBalances()
      await sleep(0.2)
      this.getFundingBalances()
      await sleep(0.2)
      this.getSpotActiveOrders()
    } else {
      this.initClient()
    }
  }
  static start() {
    if (!Bybit.current.time) {
      Bybit.current.initClient()
      Bybit.current.getDataAll()
      Bybit.current.time = setInterval(() => {
        Bybit.current.getDataAll()
      }, 2000)
    }
  }

  static clear() {
    if (Bybit.current.time) {
      clearInterval(Bybit.current.time as unknown as number)
      Bybit.current.time = null
    }
  }

  public static show(context: vscode.ExtensionContext) {
    if (Bybit.current) {
      return Bybit.current
    }

    Bybit.current = new Bybit(context)
    return Bybit.current
  }

  onVebView() {
    eventBus.on(WebViewMessage.bybitDvCancelorder, async (data: any) => {
      const res = await this.client.cancelOrder(data)

      if (res.retCode === 0) {
        vscode.window.showInformationMessage('取消成功！')
      } else {
        vscode.window.showErrorMessage(res.retMsg)
      }
    })
    eventBus.on(WebViewMessage.bybitDvPlaceorder, async (data: any) => {
      const res = await this.client.submitOrder(data)
      if (res.retCode === 0) {
        vscode.window.showInformationMessage('提交成功！')
      } else {
        vscode.window.showErrorMessage(res.retMsg)
      }
    })
    eventBus.on(WebViewMessage.bybitTransfer, async (data: any) => {
      const res = await this.accountClient.createInternalTransfer(data)
      if (res.ret_code === 0) {
        vscode.window.showInformationMessage('划转成功！')
      } else {
        vscode.window.showErrorMessage(res.ret_msg)
      }
    })

    eventBus.on(WebViewMessage.bybitFundingCancelorder, async (data: any) => {
      const res = await this.spotClient.cancelOrder(data)
      if (res.retCode === 0) {
        vscode.window.showInformationMessage('取消成功！')
      } else {
        vscode.window.showErrorMessage(res.retMsg)
      }
    })

    eventBus.on(WebViewMessage.bybitFundingPlaceorder, async (data: any) => {
      const res = await this.spotClient.submitOrder(data)
      if (res.retCode === 0) {
        vscode.window.showInformationMessage('提交成功！')
      } else {
        vscode.window.showErrorMessage(res.retMsg)
      }
    })

    eventBus.on(WebViewMessage.showPassword, (password: string) => {
      if (password) {
        this.password = String(password)
      }
    })

    eventBus.on(
      WebViewMessage.setBybitConfig,
      async (data: {
        key: string
        secret: string
        password: string
        testnet: boolean
      }) => {
        if (data.key && data.secret && data.password) {
          // 加密生成密文
          const token = AES.encrypt(
            JSON.stringify({
              key: data.key,
              secret: data.secret,
            }),
            String(data.password)
          ).toString()
          this.context.globalState.update(BYBIT_TOKEN, token)
        }

        if (data.testnet !== undefined && data.testnet !== null) {
          this.context.globalState.update(BYBIT_NETWORK_TYPE, data.testnet)
        }
        this.initClient()
        vscode.window.showInformationMessage('配置成功！')
      }
    )
  }

  emitVebView(command, type = '', data: any = '') {
    eventBus.emit(EventBusConstants.SEND_VEBVIEW_MESSAGE, {
      command,
      data: {
        type,
        data,
      },
    })
  }

  private async getUnifiedTradingBalances() {
    const data = await this.clientV5.getWalletBalance({
      accountType: 'UNIFIED',
    })

    if (data.retCode === 0) {
      const res = data.result.list[0]
      const result = res.coin.map((item) => {
        return {
          ...item,
          equity: Number(item.equity).toFixed(2),
          usdValue: Number(item.usdValue).toFixed(2),
          availableToWithdraw: Number(item.availableToWithdraw).toFixed(2),
        }
      })
      const d = {
        result,
        ...res,
      }
      this.emitVebView(WebViewMessage.account, DataType.bybitUnifiedTrading, d)
    }
  }

  private async getFundingBalances() {
    const data = await this.clientV5.getAllCoinsBalance({
      accountType: 'FUND',
    })

    if (data.retCode === 0) {
      const res = data.result.balance
      const result = res.map((item) => {
        return {
          ...item,
          walletBalance: Number(item.walletBalance).toFixed(2),
          transferBalance: Number(item.transferBalance).toFixed(2),
        }
      })
      const r = result.filter((i: any) => Number(i.walletBalance) > 0.1)
      this.emitVebView(WebViewMessage.account, DataType.bybitFunding, r)
    }
  }

  async getPositions() {
    const data = await this.clientV5.getPositionInfo({
      category: 'linear',
      settleCoin: 'USDT',
    })
    if (data.retCode === 0) {
      this.emitVebView(
        WebViewMessage.positions,
        DataType.bybitUnifiedTrading,
        data.result.list
      )
    }
  }

  async getSpotActiveOrders() {
    const data = await this.spotClient.getOpenOrders()
    let list = data.result.list.sort((a, b) => b.orderPrice - a.orderPrice)
    list = list.map((x) => {
      return {
        ...x,
        sideCN: x.side === 'BUY' ? '买入' : '卖出',
      }
    })
    if (data.retCode === 0) {
      // this.emitVebView(WebViewMessage.openOrder, DataType.bybitFunding, list)
    }
  }

  async getActiveOrders() {
    const data = await this.client.getActiveOrders({ category: 'linear' })
    if (data.retCode === 0) {
      let list = data.result.list.filter((x) => x.orderStatus === 'New')
      list = list.map((x) => {
        return {
          ...x,
          price: Number(x.price),
          qty: Number(x.qty),
          sideCN: x.side === 'Buy' ? '买入/做多' : '卖出/做空',
        }
      })
      list = list.sort((a, b) => Number(b.price) - Number(a.price))

      this.emitVebView(
        WebViewMessage.openOrder,
        DataType.bybitUnifiedTrading,
        list
      )
    }
  }
}
