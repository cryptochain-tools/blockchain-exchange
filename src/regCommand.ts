import * as vscode from "vscode"
import * as open from "open"
import { TemplatePanel } from "./templatePanel"
import { Bybit } from "./bybit"

export function regCommand(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand("coin.focus", (link) => {
      open(link)
    })
  )
  context.subscriptions.push(
    vscode.commands.registerCommand("tool.webview", (link) => {
        new Bybit()
      TemplatePanel.show(context)
    })
  )
}
