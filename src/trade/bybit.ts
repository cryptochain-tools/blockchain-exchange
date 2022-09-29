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
} from "bybit-api"
import { WebViewMessage } from "../config/constants"
import eventBus, { EventBusConstants } from "../utils/eventBus"

const BYBIT_KEY = 'bybit_key'
const BYBIT_SECRET = 'bybit_secret'
const BYBIT_NETWORK_TYPE = 'bybit_network_type'

import * as vscode from "vscode"
import { DataType } from "./enum"
import { sleep } from "../utils/sleep"

export class Bybit {
  private static current: Bybit | undefined
  private client: UnifiedMarginClient
  private spotClient: SpotClientV3
  private accountClient: AccountAssetClient
  private time: NodeJS.Timer | null
  private context: vscode.ExtensionContext
  constructor(context: vscode.ExtensionContext) {
    this.context = context
    // this.initClient()
    this.onVebView()
  }

  initClient(){
    const clientConfig: RestClientOptions = {
      testnet: this.context.globalState.get(BYBIT_NETWORK_TYPE) as boolean ,
      key: this.context.globalState.get(BYBIT_KEY) as string ,
      secret: this.context.globalState.get(BYBIT_SECRET) as string 
    }
    if(clientConfig.key && clientConfig.secret){
      this.client = new UnifiedMarginClient(clientConfig)
      this.spotClient = new SpotClientV3(clientConfig)
      this.accountClient = new AccountAssetClient(clientConfig)
    }else {
      vscode.window.showErrorMessage('未配置 Bybit API Key，请去设置界面配置！')
    }
 
  }

  async getDataAll() {
    if(this.client){
      this.getPositions()
      await sleep(0.2)
      this.getActiveOrders()
      await sleep(0.2)
      this.getBalances()
      await sleep(0.2)
      this.getSpotBalances()
      await sleep(0.2)
      this.getSpotActiveOrders()
    }

  }
  static start() {
    vscode.window.showInformationMessage('激活 Bybit 成功！')
    Bybit.current.initClient()
    Bybit.current.getDataAll()
    Bybit.current.time = setInterval(() => {
      Bybit.current.getDataAll()
    }, 3000)
  }

  static clear() {
    if(Bybit.current.time){
      vscode.window.showInformationMessage('清理 Bybit 成功！')
      clearInterval(Bybit.current.time)
      Bybit.current.time = null
      // Bybit.current = null
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

      if(res.retCode === 0){
        vscode.window.showInformationMessage('取消成功！')
      }else {
        vscode.window.showErrorMessage(res.retMsg)
      }
    })
    eventBus.on(WebViewMessage.bybitDvPlaceorder, async (data: any) => {
      const res = await this.client.submitOrder(data)
      if(res.retCode === 0){
        vscode.window.showInformationMessage('提交成功！')
      }else {
        vscode.window.showErrorMessage(res.retMsg)
      }
      
    })
    eventBus.on(WebViewMessage.bybitTransfer, async (data: any) => {
      const res = await this.accountClient.createInternalTransfer(data)
      if(res.ret_code === 0){
        vscode.window.showInformationMessage('划转成功！')
      }else {
        vscode.window.showErrorMessage(res.ret_msg)
      }
    })

    eventBus.on(WebViewMessage.bybitSpotCancelorder, async (data: any) => {
      const res = await this.spotClient.cancelOrder(data)
      if(res.retCode === 0){
        vscode.window.showInformationMessage('取消成功！')
      }else {
        vscode.window.showErrorMessage(res.retMsg)
      }
    })

    eventBus.on(WebViewMessage.bybitSpotPlaceorder, async (data: any) => {
      const res = await this.spotClient.submitOrder(data)
      if(res.retCode === 0){
        vscode.window.showInformationMessage('提交成功！')
      }else {
        vscode.window.showErrorMessage(res.retMsg)
      }
    })


    eventBus.on(WebViewMessage.setBybitConfig, async (data: any) => {
      if(data.key){
        this.context.globalState.update(BYBIT_KEY, data.key)
      }
      if(data.secret){
        this.context.globalState.update(BYBIT_SECRET, data.secret)
      }
      if(data.testnet !== undefined && data.testnet !== null){
        this.context.globalState.update(BYBIT_NETWORK_TYPE, data.testnet)
      }
      this.initClient()
      vscode.window.showInformationMessage('配置成功！')
    })


  }

  emitVebView(command, type, data) {
    eventBus.emit(EventBusConstants.SEND_VEBVIEW_MESSAGE, {
      command,
      data: {
        type,
        data,
      },
    })
  }

  private async getBalances() {
    const data = await this.client.getBalances()
    if (data.retCode === 0) {
      this.emitVebView(
        WebViewMessage.account,
        DataType.bybitUnifiedMargin,
        data.result
      )
    }
  }

  private async getSpotBalances() {
    const data = await this.spotClient.getBalances()
    if (data.retCode === 0) {
      this.emitVebView(
        WebViewMessage.account,
        DataType.bybitSpot,
        data.result.balances
      )
    }
  }

  async getPositions() {
    const data = await this.client.getPositions({ category: "linear" })
    if (data.retCode === 0) {
      this.emitVebView(
        WebViewMessage.positions,
        DataType.bybitUnifiedMargin,
        data.result.list
      )
    }
  }

  async getSpotActiveOrders() {
    const data = await this.spotClient.getOpenOrders()
    if (data.retCode === 0) {
      this.emitVebView(
        WebViewMessage.openOrder,
        DataType.bybitSpot,
        data.result.list
      )
    }
  }

  async getActiveOrders() {
    const data = await this.client.getActiveOrders({ category: "linear" })
    if (data.retCode === 0) {
      let list = data.result.list.filter((x) => x.orderStatus === "New")
      list = list.map((x) => {
        return {
          ...x,
          price: Number(x.price),
          qty: Number(x.qty),
          sideCN: x.side === "Buy" ? "买入/做多" : "卖出/做空",
        }
      })

      this.emitVebView(
        WebViewMessage.openOrder,
        DataType.bybitUnifiedMargin,
        list
      )
    }
  }
}
