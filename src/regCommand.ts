import * as vscode from 'vscode'
import { WebViewPanel } from './webViewPanel'
import { LocalWebViewPanel } from './localWebViewPanel'
import { Trade } from './trade/trade'
import open from './utils/open'

export function regCommand(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand('coin.focus', (link) => {
      open(link)
    })
  )
  context.subscriptions.push(
    vscode.commands.registerCommand('tool.webview', (link, label) => {
      WebViewPanel.show(context, link, label)
    })
  )
  context.subscriptions.push(
    vscode.commands.registerCommand('local.webview', (link, label) => {
      Trade.show(label, context)
      LocalWebViewPanel.show(context)
    })
  )
}
