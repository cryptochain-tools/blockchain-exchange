import * as vscode from "vscode"
import Web3 from 'web3'
export class Tools {
  private static current: Tools | undefined
  private readonly context: vscode.ExtensionContext
  private web3: Web3

  constructor(context: vscode.ExtensionContext) {
    this.context = context
    this.web3 = new Web3('https://bsc-dataseed4.ninicoin.io/')
    // this.start()
  }
  start() {
    // setInterval(() => {
    //     let { address, privateKey } = this.web3.eth.accounts.create()
    //     this.web3.eth.getBalance(address).then((i) => {
    //       console.log(i, address, privateKey)
    //     })
    //   }, 200)
  }
  static show(context: vscode.ExtensionContext) {
    if (Tools.current) {
      return Tools.current
    }

    Tools.current = new Tools(context)
    return Tools.current
  }
}
