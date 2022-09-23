[Comment Translate]        |    Google

# 欢迎使用 VS Code 扩展

##文件夹里有什么

*此文件夹包含扩展所需的所有文件。
*`package.json` -这是你声明扩展和命令的清单文件。
  *示例插件注册一个命令并定义其标题和命令名称。有了这些信息，VS Code 可以在命令面板中显示命令。它还不需要加载插件。
*`src/extension.ts` -这是您将提供命令实现的主文件。
  *该文件导出一个函数，`activate`，在您的扩展程序第一次激活时调用该函数（在这种情况下，通过执行命令）。在 `activate` 函数中，我们调用 `registerCommand`。
  *我们将包含命令实现的函数作为第二个参数传递给`registerCommand`。

## 立马起身跑
*按“F5”打开一个加载了您的扩展程序的新窗口。
*通过按（在 Mac 上按“Ctrl+Shift+P”或“Cmd+Shift+P”）并输入“Hello World”，从命令面板运行您的命令。
*在 `src/extension.ts` 中的代码中设置断点以调试您的扩展。
*在调试控制台中查找扩展的输出。

＃＃ 做出改变

*更改 `src/extension.ts` 中的代码后，您可以从调试工具栏中重新启动扩展。
*您还可以使用您的扩展重新加载（`Ctrl+R` 或`Cmd+R` 在 Mac 上）VS Code 窗口以加载您的更改。

## 探索 API

*您可以在打开文件 `node_modules/@types/vscode/index.d.ts` 时打开我们的全套 API。

## 运行测试

*打开调试视图（Mac 上的`Ctrl+Shift+D` 或`Cmd+Shift+D`）并从启动配置下拉列表中选择`Extension Tests`。
*按 `F5` 在新窗口中运行测试并加载您的扩展程序。
*在调试控制台中查看测试结果的输出。
*更改 `src/test/suite/extension.test.ts` 或在 `test/suite` 文件夹中创建新的测试文件。
  *提供的测试运行器将只考虑匹配名称模式 `**.test.ts` 的文件。
  *您可以在 `test` 文件夹中创建文件夹，以任何您想要的方式构建您的测试。

##走得更远
*[遵循 UX 指南](https://code.visualstudio.com/api/ux-guidelines/overview) 创建与 VS Code 的本机界面和模式无缝集成的扩展。
 *通过 [bundling your extension] (https://code.visualstudio.com/api/working-with-extensions/bundling-extension) 减少扩展大小并缩短启动时间。
 *[发布您的扩展](https://code.visualstudio.com/api/working-with-extensions/publishing-extension) 在 VS Code 扩展市场上。
*通过设置 [持续集成] (https://code.visualstudio.com/api/working-with-extensions/continuous-integration) 自动构建。
