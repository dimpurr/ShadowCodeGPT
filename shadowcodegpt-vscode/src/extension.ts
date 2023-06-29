import * as path from 'path';
import { workspace as Workspace, window as Window, ExtensionContext, OutputChannel, commands, SecretStorage } from 'vscode';
import { setupLanguageClient, deactivateLanguageClient } from './languageClient';
import AuthSettings from './authSettings';

export function activate(context: ExtensionContext) {
    const outputChannel: OutputChannel = Window.createOutputChannel('lsp-multi-server-example');
    setupLanguageClient(context, outputChannel);

    AuthSettings.init(context);

    context.subscriptions.push(commands.registerCommand('command.storeApiKey', async () => {
        const apiKey = "your-api-key"; // Retrieve API key from user input or configuration
        await AuthSettings.instance.storeApiKey(apiKey);
    }));

    context.subscriptions.push(commands.registerCommand('command.retrieveApiKey', async () => {
        const apiKey = await AuthSettings.instance.retrieveApiKey();
        console.log(apiKey); // Do something with the API key
    }));
}

export function deactivate(): Thenable<void> {
    return deactivateLanguageClient();
}
