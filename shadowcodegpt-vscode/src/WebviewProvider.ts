import * as vscode from 'vscode';
import { chatWithGPT } from './GPTUtils/ChatGPT';
import * as path from 'path';
import * as fs from 'fs';
import { getWebviewHTML } from './WebviewContent'; // 新增导入
import {
  createMarkdown,
  appendMarkdown,
  getLatestCacheTimestamp,
} from './cache'; // 更新导入

export class WebviewProvider {
  private panel: vscode.WebviewPanel | undefined = undefined;
  private readonly context: vscode.ExtensionContext;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
  }

  public openPanel() {
    if (this.panel) {
      this.panel.reveal(vscode.ViewColumn.Beside);
    } else {
      this.panel = vscode.window.createWebviewPanel(
        'shadowcodegptSidebar',
        'ShadowCode GPT',
        vscode.ViewColumn.Beside,
        {
          enableScripts: true,
        }
      );

      this.panel.webview.html = this.getWebviewContent();
      this.panel.webview.onDidReceiveMessage(
        (message) => {
          switch (message.command) {
            case 'analyzeFile':
              this.analyzeFile();
              return;
          }
        },
        undefined,
        this.context.subscriptions
      );
      this.panel.onDidDispose(() => {
        this.panel = undefined;
      });
    }
  }

  private getWebviewContent() {
    return getWebviewHTML(); // 使用从WebviewContent.ts导入的函数
  }

  public async analyzeFile() {
    console.log('analyzeFile method called');

    const activeEditor = vscode.window.activeTextEditor;
    if (activeEditor) {
      console.log('Active editor found');

      const document = activeEditor.document;
      const text = document.getText();
      console.log('Sending text to GPT');

      const workspaceFolders = vscode.workspace.workspaceFolders;
      if (workspaceFolders && workspaceFolders.length > 0) {
        const workspaceRoot = workspaceFolders[0].uri.fsPath;
        const relativePath = path.relative(workspaceRoot, document.fileName);

        let resultPath = '';
        chatWithGPT(text, (batchNumber, totalBatches, content) => {
          if (batchNumber === 1) {
            // 注意这里我使用了 1 而不是 0
            resultPath = createMarkdown(workspaceRoot, relativePath); // 创建新的Markdown文件
          }

          appendMarkdown(resultPath, content); // 将内容追加到Markdown文件

          if (this.panel) {
            this.panel.webview.postMessage({
              type: 'batch-update',
              batchNumber,
              totalBatches,
              content,
            });
          }

          const latestTimestamp = getLatestCacheTimestamp(
            workspaceRoot,
            relativePath
          );
          console.log(`Latest cache timestamp: ${latestTimestamp}`);
        });
      }
    }
  }
}
