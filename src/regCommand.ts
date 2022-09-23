import * as vscode from 'vscode'
import * as open from 'open'

export function regCommand(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.commands.registerCommand('coin.focus', (link) => {
        open(link)
    }))
    context.subscriptions.push(vscode.commands.registerCommand('tool.webview', (link) => {
        // open(link)
        vscode.window.showInformationMessage('Hello World from !')
        const panel = vscode.window.createWebviewPanel(
            'testWebview', // viewType
            "工具", // 视图标题
            vscode.ViewColumn.One, // 显示在编辑器的哪个部位
            {
                enableScripts: true, // 启用JS，默认禁用
                retainContextWhenHidden: true, // webview被隐藏时保持状态，避免被重置
            }
        )
        panel.webview.html = `<html><body>你好，我是Webview</body></html>`
    }))
}