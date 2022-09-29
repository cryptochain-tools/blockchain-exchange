import { MainClient, RestClientOptions } from "binance"
import { WebViewMessage } from "../config/constants"
import eventBus, { EventBusConstants } from "../utils/eventBus"

const BINANCE_KEY = "binance_key"
const BINANCE_SECRET = "binance_secret"
const BINANCE_NETWORK_TYPE = "binance_network_type"

import * as vscode from "vscode"
import { DataType } from "./enum"
import { sleep } from "../utils/sleep"

export class Binance {
  private static current: Binance | undefined | null
  private client: MainClient
  private time: NodeJS.Timer | null
  private context: vscode.ExtensionContext
  constructor(context: vscode.ExtensionContext) {
    this.context = context
    // this.initClient()
    this.onVebView()
  }

  initClient() {
    const clientConfig: RestClientOptions = {
      api_key: this.context.globalState.get(BINANCE_KEY) as string,
      api_secret: this.context.globalState.get(BINANCE_SECRET) as string,
    }
    if (clientConfig.api_key && clientConfig.api_secret) {
      this.client = new MainClient(clientConfig)
    } else {
      vscode.window.showErrorMessage(
        "未配置 Binance API Key，请去设置界面配置 ！"
      )
    }
  }

  async getDataAll() {
    if (this.client) {
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
    if(!Binance.current.time){
      Binance.current.initClient()
      Binance.current.getDataAll()
      Binance.current.time = setInterval(() => {
        Binance.current.getDataAll()
      }, 2000)
    }

  }

  static clear() {
    if(Binance.current.time){
      // vscode.window.showInformationMessage('清理 Binance 成功！')
      clearInterval(Binance.current.time)
      Binance.current.time = null
      // Bybit.current = null
    }

  }

  public static show(context: vscode.ExtensionContext) {
    if (Binance.current) {
      return Binance.current
    }

    Binance.current = new Binance(context)
    return Binance.current
  }

  onVebView() {
    // eventBus.on(WebViewMessage.BinanceDvCancelorder, async (data: any) => {
    //   const res = await this.client.cancelOrder(data)
    //   if(res.retCode === 0){
    //     vscode.window.showInformationMessage('取消成功！')
    //   }else {
    //     vscode.window.showErrorMessage(res.retMsg)
    //   }
    // })
    eventBus.on(WebViewMessage.binanceSpotPlaceorder, async (data: any) => {
      try {
        // 测试订单
        // const _data = await this.client.testNewOrder(data)
        await this.client.submitNewOrder(data)
        vscode.window.showInformationMessage("提交成功！")
      } catch (error) {
        vscode.window.showErrorMessage("提交失败！")
      }

      // if(res.retCode === 0){
      //   vscode.window.showInformationMessage('提交成功！')
      // }else {
      //   vscode.window.showErrorMessage(res.retMsg)
      // }
    })
    // eventBus.on(WebViewMessage.BinanceTransfer, async (data: any) => {
    //   const res = await this.accountClient.createInternalTransfer(data)
    //   if(res.ret_code === 0){
    //     vscode.window.showInformationMessage('划转成功！')
    //   }else {
    //     vscode.window.showErrorMessage(res.ret_msg)
    //   }
    // })
    eventBus.on(WebViewMessage.binanceSpotCancelorder, async (data: any) => {
      try {
        await this.client.cancelOrder(data)

        vscode.window.showInformationMessage("取消成功！")
      } catch (error) {
        vscode.window.showErrorMessage("取消失败！")
      }
    })
    // eventBus.on(WebViewMessage.BinanceSpotPlaceorder, async (data: any) => {
    //   const res = await this.spotClient.submitOrder(data)
    //   if(res.retCode === 0){
    //     vscode.window.showInformationMessage('提交成功！')
    //   }else {
    //     vscode.window.showErrorMessage(res.retMsg)
    //   }
    // })
    eventBus.on(WebViewMessage.setBinanceConfig, async (data: any) => {
      if (data.api_key) {
        this.context.globalState.update(BINANCE_KEY, data.api_key)
      }
      if (data.api_secret) {
        this.context.globalState.update(BINANCE_SECRET, data.api_secret)
      }
      this.initClient()
      vscode.window.showInformationMessage("配置成功！")
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

  private async getSpotBalances() {
    const data = await this.client.postPrivate("/sapi/v3/asset/getUserAsset")
    const result = data.map((item) => {
      return {
        ...item,
        coin: item.asset,
        locked: Number(item.locked).toFixed(2),
        free: Number(item.free).toFixed(2),
        total: Number(Number(item.free) + Number(item.locked)).toFixed(2),
      }
    })

    this.emitVebView(WebViewMessage.account, DataType.binanceSpot, result)
  }

  private async getBalances() {
    // const data = await this.spotClient.getBalances()
    // if (data.retCode === 0) {
    //   this.emitVebView(
    //     WebViewMessage.account,
    //     DataType.BinanceSpot,
    //     data.result.balances
    //   )
    // }
  }

  async getPositions() {
    // const data = await this.client.getPositions({ category: "linear" })
    // if (data.retCode === 0) {
    //   this.emitVebView(
    //     WebViewMessage.positions,
    //     DataType.BinanceUnifiedMargin,
    //     data.result.list
    //   )
    // }
  }

  async getSpotActiveOrders() {
    // testNewOrder
    const data = await this.client.getOpenOrders()
    const result = data.map((item) => {
      return {
        ...item,
        orderQty: Number(item.origQty).toFixed(2),
        orderPrice: Number(item.price).toFixed(2),
        orderType: item.type,
      }
    })
    this.emitVebView(WebViewMessage.openOrder, DataType.binanceSpot, result)
  }

  async getActiveOrders() {
    // const data = await this.client.getActiveOrders({ category: "linear" })
    // if (data.retCode === 0) {
    //   let list = data.result.list.filter((x) => x.orderStatus === "New")
    //   list = list.map((x) => {
    //     return {
    //       ...x,
    //       price: Number(x.price),
    //       qty: Number(x.qty),
    //       sideCN: x.side === "Buy" ? "买入/做多" : "卖出/做空",
    //     }
    //   })
    //   this.emitVebView(
    //     WebViewMessage.openOrder,
    //     DataType.BinanceUnifiedMargin,
    //     list
    //   )
    // }
  }
}