import * as vscode from 'vscode'
import { WebViewPanel } from './webViewPanel'
import { Trade } from './trade/trade'
import { Tools } from './tools/tools'
import open from './utils/open'

export function regCommand(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand('coin.focus', (link) => {
      open(link)
    })
  )
  context.subscriptions.push(
    vscode.commands.registerCommand('tool.webview', (link, label) => {
      Trade.show(label, context)
      WebViewPanel.show(context)
      // Tools.show(context)
    })
  )
}
