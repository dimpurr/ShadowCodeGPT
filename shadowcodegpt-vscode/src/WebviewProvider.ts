import * as vscode from 'vscode';
import { chatWithGPT } from './GPTUtils/ChatGPT';
import * as path from 'path';
import * as fs from 'fs';


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
                    enableScripts: true
                }
            );

            this.panel.webview.html = this.getWebviewContent();
            this.panel.webview.onDidReceiveMessage(
                message => {
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
        const htmlContent = `<!DOCTYPE html>
        <html>
        <head>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/showdown/1.9.1/showdown.min.js"></script>
            <style>
                .result {
                    margin-top: 10px;
                    padding: 10px;
                    background-color: #F6F6F6;
                    border-radius: 4px;
                }
            </style>
        </head>
        <body>
            <button id="analyzeButton">分析当前文件</button>
            <div class="result" id="resultArea"></div>
            <script>
                ${this.getJavaScriptContent()}
            </script>
        </body>
        </html>`;

        return htmlContent;
    }

    private getJavaScriptContent() {
    return `window.onload = function () {
        const vscode = acquireVsCodeApi();

        const analyzeButton = document.getElementById('analyzeButton');
        const resultArea = document.getElementById('resultArea');

        analyzeButton.addEventListener('click', function () {
            resultArea.innerHTML = 'Analyzing...';
            vscode.postMessage({
                command: 'analyzeFile'
            });
        });

        // 监听来自扩展的消息
        window.addEventListener('message', function (event) {
            const message = event.data;
            if (message.command === 'showResult') {
                fetch(\`file://\${message.resultPath}\`)
                    .then(response => response.text())
                    .then(text => {
                        const converter = new showdown.Converter();
                        resultArea.innerHTML = converter.makeHtml(text);
                    });
            }
        });
    };`;
}


    public async analyzeFile() {
    console.log("analyzeFile method called");

    const activeEditor = vscode.window.activeTextEditor;
    if (activeEditor) {
        console.log("Active editor found");

        const document = activeEditor.document;
        const text = document.getText();

        console.log("Sending text to GPT");
        const result = await chatWithGPT(text);
        console.log("Result from GPT received:", result);

        // 获取文件的相对路径
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (workspaceFolders && workspaceFolders.length > 0) {
            const workspaceRoot = workspaceFolders[0].uri.fsPath;
            const relativePath = path.relative(workspaceRoot, document.fileName);
            const timestamp = new Date().toISOString().replace(/[-:.]/g, "").slice(0, -1);
            const resultPath = path.join(workspaceRoot, '.vscode', 'shadowcodegpt', 'analyze', relativePath + `.manualAnalyze.${timestamp}.md`);

            // 创建目录
            const resultDir = path.dirname(resultPath);
            fs.mkdirSync(resultDir, { recursive: true });

            // 保存结果到 .md 文件
            fs.writeFileSync(resultPath, result);

            // 向侧边栏发送消息，传递结果文件路径
            if (this.panel && this.panel.webview) {
                console.log("Sending message to panel");
                this.panel.webview.postMessage({
                    command: 'showResult',
                    resultPath: resultPath
                });
            } else {
                console.log("Panel not available");
            }
        } else {
            console.log("No workspace folder found");
        }

    } else {
        console.log("No active editor");
    }
}


}
