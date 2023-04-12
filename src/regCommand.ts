import * as vscode from 'vscode'
import { WebViewPanel } from './webViewPanel'
import open from './utils/open'

export function regCommand(context: vscode.ExtensionContext) {
  WebViewPanel.show(context)
  context.subscriptions.push(
    vscode.commands.registerCommand('coin.focus', (link) => {
      open(link)
    })
  )
  context.subscriptions.push(
    vscode.commands.registerCommand('tool.webview', (link, label) => {
      WebViewPanel.show(context)
    })
  )
}
