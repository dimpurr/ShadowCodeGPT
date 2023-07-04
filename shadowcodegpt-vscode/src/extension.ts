import * as path from 'path';
import * as vscode from 'vscode';
import { setupLanguageClient, deactivateLanguageClient } from './languageClient';
import AuthSettings from './authSettings';
// import { chatWithGPT } from './GPTUtils/ChatGPT';
import { WebviewProvider } from './WebviewProvider';
import { getLatestCacheTimestampNumber } from './cache';

export function activate(context: vscode.ExtensionContext) {
    const outputChannel: vscode.OutputChannel = vscode.window.createOutputChannel('lsp-multi-server-example');
    setupLanguageClient(context, outputChannel);

    AuthSettings.init(context);

    context.subscriptions.push(vscode.commands.registerCommand('shadowcodegpt.storeApiKey', async () => {
        const apiKey = await vscode.window.showInputBox({ prompt: 'Enter your API key' });
        if (apiKey) {
            await AuthSettings.instance.storeApiKey(apiKey);
            vscode.window.showInformationMessage('API key stored successfully.');
        } else {
            vscode.window.showInformationMessage('No API key entered.');
        }
    }));

    context.subscriptions.push(vscode.commands.registerCommand('shadowcodegpt.retrieveApiKey', async () => {
        const apiKey = await AuthSettings.instance.retrieveApiKey();
        if (apiKey) {
            vscode.window.showInformationMessage(`Your API key is: ${apiKey}`);
        } else {
            vscode.window.showInformationMessage('No API key found.');
        }
    }));

    const webviewProvider = new WebviewProvider(context);
    context.subscriptions.push(vscode.commands.registerCommand('shadowcodegpt.analyzeFile', webviewProvider.analyzeFile, webviewProvider));
     context.subscriptions.push(
        vscode.commands.registerCommand('shadowcodegpt.checkFileCache', () => {
            const activeEditor = vscode.window.activeTextEditor;
            if (activeEditor) {
                const workspaceFolders = vscode.workspace.workspaceFolders;
                if (workspaceFolders && workspaceFolders.length > 0) {
                    const workspaceRoot = workspaceFolders[0].uri.fsPath;
                    const relativePath = vscode.workspace.asRelativePath(activeEditor.document.fileName, false);
                    const latestTimestamp = getLatestCacheTimestampNumber(workspaceRoot, relativePath);
                    
                    if (latestTimestamp !== null) {
                        vscode.window.showInformationMessage(`Latest cache timestamp: ${latestTimestamp}`);
                    } else {
                        vscode.window.showInformationMessage("No cache.");
                    }
                }
            }
        })
     );
    
    context.subscriptions.push(vscode.commands.registerCommand('shadowcodegpt.helloWorld', () => {
        webviewProvider.openPanel();
    }));
}

export function deactivate(): Thenable<void> {
    return deactivateLanguageClient();
}
