import * as vscode from "vscode"
import * as path from "path"
class ItemLucky extends vscode.TreeItem {
  public command: vscode.Command
  public iconPath: string

  constructor(
    label: any,
    collapsibleState: any,
    command: any,
    iconPath: any
  ) {
    super(label, collapsibleState)
    this.label = label
    this.collapsibleState = collapsibleState
    this.command = command
    this.contextValue = ""
    this.iconPath = iconPath
  }
}

export class TreeProvider {
  private workspaceRoot: any
  private data: any
  private context: any
  private _onDidChangeTreeData: any
  private onDidChangeTreeData: vscode.Event<any>
  private isRefresh: boolean
  constructor(workspace: any, data: any, context: vscode.ExtensionContext) {
    this.data = data
    this.workspaceRoot = workspace
    this.context = context
    this._onDidChangeTreeData = new vscode.EventEmitter()
    this.onDidChangeTreeData = this._onDidChangeTreeData.event
    this.isRefresh = false
  }

  refresh() {
    this.isRefresh = true
    this._onDidChangeTreeData.fire()
  }

  getTreeItem(item: any) {
    return item
  }

  getChildren() {
    return this.data.map((item: any) => {
      return this.newLuckyItem(item)
    })
  }

  newLuckyItem(item: any) {
    const { label, extension, icon, link } = item

    let darkIcon = path.join(__dirname, "..", "img", icon)
    let lightIcon = path.join(__dirname, "..", "img", icon)

    return new ItemLucky(
      label,
      vscode.TreeItemCollapsibleState.None,
      {
        title: label,
        command: extension,
        arguments: [link, label],
      },
      {
        dark: darkIcon,
        light: lightIcon,
      }
    )
  }
}
