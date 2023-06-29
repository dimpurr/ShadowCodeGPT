import * as path from 'path';
import { workspace as Workspace, window as Window, ExtensionContext, OutputChannel, commands } from 'vscode';
import { setupLanguageClient, deactivateLanguageClient } from './languageClient';
import AuthSettings from './authSettings';

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
}

export function deactivate(): Thenable<void> {
    return deactivateLanguageClient();
}
