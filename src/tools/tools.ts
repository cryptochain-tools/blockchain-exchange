import * as vscode from 'vscode'
export class Tools {
  private static current: Tools | undefined
  private readonly context: vscode.ExtensionContext

  constructor(context: vscode.ExtensionContext) {
    this.context = context
  }
  start() {}
  static show(context: vscode.ExtensionContext) {
    if (Tools.current) {
      return Tools.current
    }

    Tools.current = new Tools(context)
    return Tools.current
  }
}
