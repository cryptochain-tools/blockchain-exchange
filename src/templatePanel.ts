import * as vscode from "vscode"
import { util } from "./utils"
import * as path from "path"
import * as fse from "fs-extra"
import eventBus, { EventBusConstants } from "./utils/eventBus"
import { Binance } from "./trade/binance"
import { Bybit } from "./trade/bybit"

export class TemplatePanel {
  private static currentPanel: TemplatePanel | undefined
  private readonly _panel: vscode.WebviewPanel
  private readonly _context: vscode.ExtensionContext
  private readonly _extensionPath: string
  private _disposables: vscode.Disposable[] = []

  private constructor(
    panel: vscode.WebviewPanel,
    context: vscode.ExtensionContext
  ) {
    this._panel = panel
    this._context = context
    this._extensionPath = context.extensionPath
    this.initialize()
  }

  private async initialize() {
    this._panel.onDidDispose(() => {
      this.dispose()
    }, null, this._disposables)
    this._panel.webview.onDidReceiveMessage(
      async (message) => {
        eventBus.emit(message.command, message.data)
      },
      null,
      this._disposables
    )
    eventBus.on(EventBusConstants.SEND_VEBVIEW_MESSAGE, (data: {
      command: string,
      data: any
    }) => {
      this._panel.webview.postMessage({
        command: data.command,
        data: data.data,
      })
    })
    this._panel.webview.html = await getWebviewContent(this._extensionPath)
  }

  public static show(context: vscode.ExtensionContext) {
   
    if (TemplatePanel.currentPanel) {
      const column = vscode.window.activeTextEditor
        ? vscode.window.activeTextEditor.viewColumn
        : undefined
      TemplatePanel.currentPanel._panel.reveal(column)
      return
    }

    const panel = vscode.window.createWebviewPanel(
      "Template",
      util.localize("template"),
      vscode.ViewColumn.Active,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [
          vscode.Uri.file(
            path.join(context.extensionPath, "src/web/dist/assets")
          ),
          vscode.Uri.file(path.join(context.extensionPath, "src/web", "dist")),
        ],
      }
    )

    TemplatePanel.currentPanel = new TemplatePanel(panel, context)
  }

  public dispose() {
    TemplatePanel.currentPanel = undefined
    Binance.clear()
    Bybit.clear()
    eventBus.off(EventBusConstants.SEND_VEBVIEW_MESSAGE)
    // this._panel.dispose()
    while (this._disposables.length) {
      const x = this._disposables.pop()
      if (x) {
        x.dispose()
      }
    }
  }
}

async function getWebviewContent(extensionPath: string) {
  const distPath = vscode.Uri.file(
    path.join(extensionPath, "src/web/dist")
  ).with({ scheme: "vscode-resource" })
  let html = await fse.readFile(
    path.join(__dirname, "../src/web/dist/index.html")
  )
  const hrefReg = /href=(["']{1})\/{1}([^\/])/gi
  const srcReg = /src=(["']{1})\/{1}([^\/])/gi
  let str = html
    .toString()
    .replace(hrefReg, `href=$1${distPath}/$2`)
    .replace(srcReg, `src=$1${distPath}/$2`)
  return str
}

/**
 * 将目标文本中的指定内容替换为对象的元素
 * @param obj js对象形如{key1,key2,key3...}
 * @param str 包含${key}的目标文本
 */
export function replaceTarget(obj: any, str: string) {
  for (let k in obj) {
    const target = new RegExp("\\${" + k + "}", "g")
    // console.log("target=" + target);
    str = str.replace(target, obj[k])
  }
  return str
}

export function getNonce() {
  let text = ""
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYCabcdefghijklmnopqrstuvwxyz0123456789"
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  }
  return text
}
