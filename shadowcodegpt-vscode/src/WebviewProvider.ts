import * as vscode from 'vscode';
import { chatWithGPT } from './GPTUtils/ChatGPT';

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
                resultArea.innerHTML = 'FINPO...';
            });

            // 监听来自扩展的消息
            window.addEventListener('message', function (event) {
                const message = event.data;
                if (message.command === 'showResult') {
                    resultArea.innerHTML = message.result;
                }
            });
        };`;
    }

    public async analyzeFile() {
        console.log("analyzeFile method called"); // 确认此方法被调用

        const activeEditor = vscode.window.activeTextEditor;
        if (activeEditor) {
            console.log("Active editor found"); // 确认找到活动编辑器

            const document = activeEditor.document;
            const text = document.getText();

            console.log("Sending text to GPT"); // 确认正在发送文本到 GPT
            const result = await chatWithGPT(text); // 调用 chatWithGPT 函数，并获取结果
            console.log("Result from GPT received:", result); // 打印从 GPT 接收到的结果

            // 向侧边栏发送消息，传递结果
            if (this.panel && this.panel.webview) {
                console.log("Sending message to panel"); // 确认正在发送消息到面板
                this.panel.webview.postMessage({
                    command: 'showResult',
                    result: result
                });
            } else {
                console.log("Panel not available"); // 如果面板不可用，则记录
            }
        } else {
            console.log("No active editor"); // 如果没有活动编辑器，则记录
        }
    }

}
