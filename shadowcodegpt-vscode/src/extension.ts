import * as path from 'path';
let panel: vscode.WebviewPanel | undefined = undefined;
import { workspace as Workspace, window as Window, ExtensionContext, OutputChannel, commands } from 'vscode';
import * as vscode from 'vscode';
import { setupLanguageClient, deactivateLanguageClient } from './languageClient';
import AuthSettings from './authSettings';
import { chatWithGPT } from './GPTUtils/ChatGPT'; // Add this import
import * as fs from 'fs';


export function activate(context: ExtensionContext) {
    const outputChannel: OutputChannel = Window.createOutputChannel('lsp-multi-server-example');
    setupLanguageClient(context, outputChannel);

    AuthSettings.init(context);

    context.subscriptions.push(commands.registerCommand('shadowcodegpt.storeApiKey', async () => {
        const apiKey = await Window.showInputBox({ prompt: 'Enter your API key' });
        if (apiKey) {
            await AuthSettings.instance.storeApiKey(apiKey);
            Window.showInformationMessage('API key stored successfully.');
        } else {
            Window.showInformationMessage('No API key entered.');
        }
    }));

    context.subscriptions.push(commands.registerCommand('shadowcodegpt.retrieveApiKey', async () => {
        const apiKey = await AuthSettings.instance.retrieveApiKey();
        if (apiKey) {
            Window.showInformationMessage(`Your API key is: ${apiKey}`);
        } else {
            Window.showInformationMessage('No API key found.');
        }
    }));

    context.subscriptions.push(vscode.commands.registerCommand('shadowcodegpt.analyzeFile', async () => {
        const activeEditor = vscode.window.activeTextEditor;
        if (activeEditor) {
            const document = activeEditor.document;
            const text = document.getText();

            const result = await chatWithGPT(text); // 调用 chatWithGPT 函数，并获取结果

            // 向侧边栏发送消息，传递结果
            panel!.webview.postMessage({
                command: 'showResult',
                result: result
            });

        }
    }));

    // // Register the chatWithGPT command
    // context.subscriptions.push(commands.registerCommand('shadowcodegpt.helloWorld', async () => {
    //     chatWithGPT(message => Window.showInformationMessage(message));
    // }));


    context.subscriptions.push(vscode.commands.registerCommand('shadowcodegpt.helloWorld', async () => {
        if (panel) {
            panel.reveal(vscode.ViewColumn.Beside);
        } else {
            panel = vscode.window.createWebviewPanel(
                'shadowcodegptSidebar', // 唯一标识符，用于区分不同的面板
                'ShadowCode GPT', // 面板标题
                vscode.ViewColumn.Beside, // 面板打开的位置
                {
                    enableScripts: true // 允许在 Webview 中运行脚本
                }
            );

            panel.webview.html = getWebviewContent(context.extensionPath, panel.webview);

            panel.onDidDispose(() => {
                panel = undefined;
            });
        }
    }));


}

function getWebviewContent(extensionPath: string, webview: vscode.Webview) {
    const htmlFilePath = path.join(extensionPath, 'src/sidebar/sidebar.html');
    const htmlContent = fs.readFileSync(htmlFilePath, 'utf-8');
    return htmlContent;
}

export function deactivate(): Thenable<void> {
    return deactivateLanguageClient();
}
