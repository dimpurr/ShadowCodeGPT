import * as vscode from 'vscode';
import AuthSettings from './authSettings';

export function activate(context: vscode.ExtensionContext) {
    console.log('Congratulations, your extension "shadowcodegpt" is now active!');

    // Initialize AuthSettings
    AuthSettings.init(context);
    const settings = AuthSettings.instance;

    // Register the helloWorld command
    let helloWorldDisposable = vscode.commands.registerCommand('shadowcodegpt.helloWorld', () => {
        vscode.window.showInformationMessage('Hello World from ShadowCodeGPT!');
    });

    // Register the storeApiKey command
    let storeApiKeyDisposable = vscode.commands.registerCommand('shadowcodegpt.storeApiKey', async () => {
        const apiKey = await vscode.window.showInputBox({ prompt: 'Please enter your API key' });
        if (apiKey) {
            await settings.storeApiKey(apiKey);
            vscode.window.showInformationMessage('API key successfully stored!');
        }
    });

    // Register the retrieveApiKey command
    let retrieveApiKeyDisposable = vscode.commands.registerCommand('shadowcodegpt.retrieveApiKey', async () => {
        const apiKey = await settings.retrieveApiKey();
        if (apiKey) {
            vscode.window.showInformationMessage(apiKey);
        } else {
            vscode.window.showWarningMessage('No API key found, please store it first.');
        }
    });

    // Add the disposables to the context.subscriptions array
    context.subscriptions.push(helloWorldDisposable, storeApiKeyDisposable, retrieveApiKeyDisposable);
}

export function deactivate() {}
