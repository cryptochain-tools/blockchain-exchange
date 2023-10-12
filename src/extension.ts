import * as vscode from 'vscode'
import { App } from './app'
import { regCommand } from './regCommand'
import { MarketMonitoring } from './marketMonitoring'

// 当您的扩展程序被激活时调用此方法
// 您的扩展在第一次执行命令时被激活
export function activate(context: vscode.ExtensionContext) {
  // // Use the console to output diagnostic information (console.log) and errors (console.error)
  // // This line of code will only be executed once when your extension is activated
  // console.log('Congratulations, your extension "btc" is now active!');

  // // The command has been defined in the package.json file
  // // Now provide the implementation of the command with registerCommand
  // // The commandId parameter must match the command field in package.json
  // let disposable = vscode.commands.registerCommand('btc.helloWorld', () => {
  // 	// The code you place here will be executed every time your command is executed
  // 	// Display a message box to the user
  // 	vscode.window.showInformationMessage('Hello World from !');
  // });

  // context.subscriptions.push(disposable);
  regCommand(context)
  new App(context)
  new MarketMonitoring(context)
}

// this method is called when your extension is deactivated
export function deactivate() {
  console.log('您的扩展已被释放！')
}
