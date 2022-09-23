import * as vscode from 'vscode'
import axios from 'axios'
import { util } from './utils'
// const {GET_EXCHANGE_INFO} = require('./config/index')
import { GET_EXCHANGE_INFO } from './config'
import { TreeProvider } from './treeProvider'
import { error } from 'console'

export class App {
    private activateContext: vscode.ExtensionContext
    private statusBarItems: any
    private coins: any
    private updateInterval: any
    private timer: any
    private API_ADDRESS: string
    private HUOBI_LINK: string
    constructor(context: vscode.ExtensionContext){
        this.activateContext = context
        this.statusBarItems = {}
        this.coins = util.getConfigurationCoin()
        this.updateInterval = util.getConfigurationTime()
        this.timer = null
        this.API_ADDRESS = '' // 交易对地址
        this.HUOBI_LINK = '' // 火币网真实交易地址
        this.init()
        context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(() => this.handleConfigChange()))
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
        // @ts-ignore
        axios.get(this.API_ADDRESS)
        .then((rep) => {
            // console.log('this.API_ADDRESS', this.API_ADDRESS)
            const result = rep.data
            if (result.status === 'ok' && result.data.length) {
                this.updateStatusBar(result.data)
                this.updateActivityBar(result.data)
            }
        }).
        catch((error) => {
            console.error(error)
        })
    }
    /**
     * 格式化数据
     * @param {Array} data 
     */
    formatCoinData(data: any) {
        data = data.sort(util.sortObj("close"))
        let coinArr: any = {
            'USDT': [],
            'ETH' : [],
            'BTC' : [],
            'TOOL' : []
        }
        
        data.forEach((item: any) => {
            const { symbol } = item
            const coinInfo = util.getHuobiCoinInfo(symbol.toUpperCase())
            const trading = coinInfo[1]
            const link = `${this.HUOBI_LINK}${coinInfo.join('_').toLowerCase()}`
            const isFocus = this.coins.indexOf(symbol) === -1 ? 0 : 1

            if(trading === 'ETH' || trading === 'USDT' || trading === 'BTC'){
                const newItem = {
                    label: `「${coinInfo[0]}」${item.close} ${item.close > item.open ? '📈' : '📉'} ${((item.close - item.open) / item.open * 100).toFixed(2)}%`,
                    icon: `star${isFocus}.png`,
                    symbol: symbol,
                    link: link,
                    extension: "coin.focus"
                }
                // 只显示激活的
                if(isFocus === 1){
                    coinArr[trading].push(newItem)
                }
                
            }
        })
        coinArr['TOOL'].unshift({
            label: `配置`,
            icon: `cointool.png`,
            symbol: 'cointool',
            link: '',
            extension: "tool.webview"
        })
        return coinArr
    }
    /*
     * 更新 ActivityBar
     */
    updateActivityBar(data: any) {
        const coinData = this.formatCoinData(data)
        // console.log(coinData['USDT'])
        let provider: any = new TreeProvider(vscode.workspace.rootPath, coinData['USDT'], this.activateContext)
        vscode.window.registerTreeDataProvider("USDT", provider)
        let providerTool: any = new TreeProvider(vscode.workspace.rootPath, coinData['TOOL'], this.activateContext)
        vscode.window.registerTreeDataProvider("TOOL", providerTool)
    }
    /*
     * 更新底部 StatusBar
     */
    updateStatusBar(data: any) {
        data.forEach((item: any) => {
            const { symbol } = item
            const coinInfo = util.getHuobiCoinInfo(symbol.toUpperCase())
            if (this.coins.indexOf(symbol) !== -1) {
                const statusBarItemsText = `「${coinInfo[0]}」${item.close} ${coinInfo[1]} ${item.close > item.open ? '📈' : '📉'} ${((item.close - item.open) / item.open * 100).toFixed(2)}%`
                if (this.statusBarItems[symbol]) {
                    this.statusBarItems[symbol].text = statusBarItemsText
                } else {
                    this.statusBarItems[symbol] = this.createStatusBarItem(statusBarItemsText)
                }
            }
        })
    }
    /**
     * 创建statusBar 
     * @param {string} text 
     */
    createStatusBarItem(text = '') {
        const barItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left)
        barItem.text = text
        barItem.show()
        return barItem
    }
    /**
     * 动态获取交易所api地址
     */
    watcher(){
        /* 每次init重新更新配置文件的内容 */
        this.coins = util.getConfigurationCoin()
        this.updateInterval = util.getConfigurationTime()

        this.fetchAllData()
        this.timer = setInterval(() => {
            this.fetchAllData()
        }, this.updateInterval)
    }
    init() {
        // @ts-ignore
        axios.get(GET_EXCHANGE_INFO)
        .then((res) => {
            this.API_ADDRESS = res.data.API_ADDRESS
            this.HUOBI_LINK = res.data.HUOBI_LINK
            this.watcher()
        }, (error) =>{
            console.log(error)
        })
    }
}