import * as vscode from "vscode"
import { WebViewMessage } from "../config/constants"
import eventBus, { EventBusConstants } from "../utils/eventBus"
import { Bybit } from "./bybit"
import { Binance } from "./binance"
import { util } from "../utils"
const ACTIVE_EXCHANGE = "active.exchange"
enum Exchange {
  Bybit = "Bybit",
  Binance = "Binance",
  All = "All",
}
export class Trade {
  private static currentTrade: Trade | undefined
  private label: string
  private readonly context: vscode.ExtensionContext
  constructor(label: string, context: vscode.ExtensionContext) {
    this.label = label
    this.context = context
    this.onVebView()
  }
  private onVebView() {
    eventBus.on(WebViewMessage.readVscodeConfig, (type) => {
      if(type === WebViewMessage.readActiveType) {
        eventBus.emit(EventBusConstants.SEND_VEBVIEW_MESSAGE, {
          command: WebViewMessage.readActiveType,
          data: this.label,
        })
      }

      if(type === WebViewMessage.readBybitCoin) {
        eventBus.emit(EventBusConstants.SEND_VEBVIEW_MESSAGE, {
          command: WebViewMessage.readBybitCoin,
          data: util.getConfigurationBybitCoin(),
        })
      }

      if(type === WebViewMessage.readBinanceCoin) {
        eventBus.emit(EventBusConstants.SEND_VEBVIEW_MESSAGE, {
          command: WebViewMessage.readBinanceCoin,
          data: util.getConfigurationBinanceCoin(),
        })
      }
  
    })
    // , WebViewMessage.readActiveType
    eventBus.on(WebViewMessage.setAllConfig, (data: any) => {
      if(data.activeExchange){
        vscode.window.showInformationMessage('成功！')
        this.setActiveExchange(data.activeExchange)
        Trade.start(this.context)
      }
      
    })
  }

  private setActiveExchange(
    value: string
  ) {
    return this.context.globalState.update(ACTIVE_EXCHANGE, value)
  }
  setLabel(label: string) {
    this.label = label
  }
  private static readActiveExchange(context: vscode.ExtensionContext) {
    return context.globalState.get(ACTIVE_EXCHANGE) || Exchange.Binance
  }
  static show(label: string, context: vscode.ExtensionContext) {
    if (Trade.currentTrade) {
      Trade.currentTrade.setLabel(label)
      eventBus.emit(EventBusConstants.SEND_VEBVIEW_MESSAGE, {
        command: WebViewMessage.readActiveType,
        data: label,
      })
      return
    }
    Bybit.show(context)
    Binance.show(context)
    Trade.start(context)

    Trade.currentTrade = new Trade(label, context)
    
  }

  static start(context: vscode.ExtensionContext) {
    Binance.clear()
    Bybit.clear()
    const exchange = Trade.readActiveExchange(context)
    switch (exchange) {
      case Exchange.Bybit:
        Bybit.start()
        break
      case Exchange.Binance:
        Binance.start()
        break
      case Exchange.All:
        Binance.start()
        Bybit.start()
        break
    }
  }
}
