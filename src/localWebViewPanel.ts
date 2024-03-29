import * as vscode from 'vscode'
import { util } from './utils'
import * as path from 'path'
import * as fse from 'fs-extra'
import eventBus, { EventBusConstants } from './utils/eventBus'
import { Binance } from './trade/binance'
import { Bybit } from './trade/bybit'

export class LocalWebViewPanel {
  private static currentPanel: LocalWebViewPanel | undefined
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
    this._panel.onDidDispose(
      () => {
        this.dispose()
      },
      null,
      this._disposables
    )
    this._panel.webview.onDidReceiveMessage(
      async (message) => {
        eventBus.emit(message.command, message.data)
      },
      null,
      this._disposables
    )

    eventBus.on(
      EventBusConstants.SEND_VEBVIEW_MESSAGE,
      (data: { command: string; data: any }) => {
        this._panel.webview.postMessage({
          command: data.command,
          data: data.data,
        })
      }
    )
    this._panel.webview.html = await getWebviewContent(
      this._extensionPath,
      this._panel
    )
  }

  public static show(context: vscode.ExtensionContext) {
    if (LocalWebViewPanel.currentPanel) {
      const column = vscode.window.activeTextEditor
        ? vscode.window.activeTextEditor.viewColumn
        : undefined
      LocalWebViewPanel.currentPanel._panel.reveal(column)
      return
    }
    const panel = vscode.window.createWebviewPanel(
      'Template',
      util.localize('template'),
      vscode.ViewColumn.Active,
      {
        // 启用JS，默认禁用
        enableScripts: true,
        // webview被隐藏时保持状态，避免被重置
        retainContextWhenHidden: true,
        // localResourceRoots: [
        //   vscode.Uri.file(
        //     path.join(context.extensionPath, 'out/webDist/assets')
        //   ),
        // ],
      }
    )

    LocalWebViewPanel.currentPanel = new LocalWebViewPanel(panel, context)
  }

  public dispose() {
    LocalWebViewPanel.currentPanel = undefined
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

async function getWebviewContent(
  extensionPath: string,
  panel: vscode.WebviewPanel
) {
  const distPath = vscode.Uri.file(
    path.join(extensionPath, 'out/webDist')
  ).with({ scheme: 'vscode-webview-resource' })
  let html = await fse.readFile(path.join(__dirname, 'webDist/index.html'))

  // Get path to resource on disk
  const css = vscode.Uri.file(
    path.join(extensionPath, 'out/webDist/assets', 'index.css')
  )
  const js = vscode.Uri.file(
    path.join(extensionPath, 'out/webDist/assets', 'index.js')
  )

  // And get the special URI to use with the webview
  const cssSrc = panel.webview.asWebviewUri(css).toString()
  const jsSrc = panel.webview.asWebviewUri(js).toString()
  const hrefReg = /href=(["']{1})\/{1}([^\/])/gi
  const srcReg = /src=(["']{1})\/{1}([^\/])/gi
  const str = html
    .toString()
    .replace('/assets/index.css', cssSrc)
    .replace('/assets/index.js', jsSrc)

  return str
}

/**
 * 将目标文本中的指定内容替换为对象的元素
 * @param obj js对象形如{key1,key2,key3...}
 * @param str 包含${key}的目标文本
 */
export function replaceTarget(obj: any, str: string) {
  for (let k in obj) {
    const target = new RegExp('\\${' + k + '}', 'g')
    // console.log("target=" + target);
    str = str.replace(target, obj[k])
  }
  return str
}

export function getNonce() {
  let text = ''
  const possible =
    'ABCDEFGHIJKLMNOPQRSTUVWXYCabcdefghijklmnopqrstuvwxyz0123456789'
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  }
  return text
}
