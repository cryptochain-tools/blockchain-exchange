import * as vscode from 'vscode'
import { util } from './utils'
import * as path from 'path'
import * as fse from 'fs-extra'
import eventBus, { EventBusConstants } from './utils/eventBus'

export class WebViewPanel {
  private static currentPanel: WebViewPanel | undefined
  private readonly _panel: vscode.WebviewPanel
  private readonly _context: vscode.ExtensionContext
  private readonly _extensionPath: string
  private _disposables: vscode.Disposable[] = []

  private constructor(
    panel: vscode.WebviewPanel,
    context: vscode.ExtensionContext,
    link: string
  ) {
    this._panel = panel
    this._context = context
    this._extensionPath = context.extensionPath
    this.initialize(link)
  }

  private async initialize(link: string) {
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

    this._panel.webview.html = `
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
      <meta charset="UTF-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body{
          height: 100vh;
        }
      </style>
    </head>
    <body>
      <iframe
      width="100%"
      height="100%"
      frameborder="no"
      sandbox="allow-forms allow-modals allow-popups allow-scripts allow-same-origin allow-popups-to-escape-sandbox allow-top-navigation "
      src="${link}"
    >
    </iframe>
      
    </body>
    </html>
    

    `
  }

  public static show(
    context: vscode.ExtensionContext,
    link: string,
    label: string
  ) {
    if (WebViewPanel.currentPanel) {
      const column = vscode.window.activeTextEditor
        ? vscode.window.activeTextEditor.viewColumn
        : undefined
      WebViewPanel.currentPanel._panel.reveal(column)
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
      }
    )

    WebViewPanel.currentPanel = new WebViewPanel(panel, context, link)
  }

  public dispose() {
    WebViewPanel.currentPanel = undefined
    eventBus.off(EventBusConstants.SEND_VEBVIEW_MESSAGE)
    while (this._disposables.length) {
      const x = this._disposables.pop()
      if (x) {
        x.dispose()
      }
    }
  }
}
