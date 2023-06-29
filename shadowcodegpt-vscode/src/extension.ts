import * as path from 'path';
import { workspace as Workspace, window as Window, ExtensionContext, OutputChannel, commands } from 'vscode';
import { setupLanguageClient, deactivateLanguageClient } from './languageClient';
import AuthSettings from './authSettings';
import { chatWithGPT } from './GPTUtils/ChatGPT'; // Add this import

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

    // Register the chatWithGPT command
    context.subscriptions.push(commands.registerCommand('shadowcodegpt.helloWorld', async () => {
        chatWithGPT(message => Window.showInformationMessage(message));
    }));
}

export function deactivate(): Thenable<void> {
    return deactivateLanguageClient();
}
