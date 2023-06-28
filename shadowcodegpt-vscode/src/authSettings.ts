import { ExtensionContext, SecretStorage } from "vscode";

export default class AuthSettings {
    private static _instance: AuthSettings;

    constructor(private secretStorage: SecretStorage) {}

    static init(context: ExtensionContext): void {
        AuthSettings._instance = new AuthSettings(context.secrets);
    }

    static get instance(): AuthSettings {
        return AuthSettings._instance;
    }

    async storeApiKey(apiKey?: string): Promise<void> {
        if (apiKey) {
            await this.secretStorage.store("shadowcodegpt.apiKey", apiKey);
        }
    }

    async retrieveApiKey(): Promise<string | undefined> {
        return await this.secretStorage.get("shadowcodegpt.apiKey");
    }
}
