import * as vscode from 'vscode';
import Render from './settings_page/settings_render';
import { StatusBar } from './status_bar';

const optionsName = 'options';

export class Settings {

    constructor(context: vscode.ExtensionContext) {
        context.subscriptions.push(vscode.commands.registerCommand('extension.openSettings', () => {
            SettingsPanel.createOrShow(context);

        }));

        context.subscriptions.push(vscode.commands.registerCommand('extension.doRefactor', () => {
            SettingsPanel.currentPanel && SettingsPanel.currentPanel.doRefactor();
        }));

        if (vscode.window.registerWebviewPanelSerializer) {
            vscode.window.registerWebviewPanelSerializer(SettingsPanel.viewType, {
                async deserializeWebviewPanel(webviewPanel: vscode.WebviewPanel, state: any) {
                    console.log(`Got state: ${state}`);
                    SettingsPanel.revive(webviewPanel, context.extensionPath);
                }
            });
        }
    }


}

class SettingsPanel {

    public static currentPanel: SettingsPanel | undefined;

    public static readonly viewType = 'settings';

    private readonly panel: vscode.WebviewPanel;
    private readonly context: vscode.ExtensionContext;
    private readonly extensionPath: string;
    private disposables: vscode.Disposable[] = [];

    /**
     * 创建并且打开webview
     * @param context
     */
    public static createOrShow(context: vscode.ExtensionContext) {
        const column = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.viewColumn : undefined;

        if (this.currentPanel) {
            this.currentPanel.panel.reveal();
            this.currentPanel.notifyPanelData();
            return;
        }

        const panel = vscode.window.createWebviewPanel(this.viewType, 'settings', column || vscode.ViewColumn.One, {
            enableScripts: true,
            localResourceRoots: [
                vscode.Uri.file(context.extensionPath)
            ],
        });

        this.currentPanel = new SettingsPanel(panel, context);
        this.currentPanel.notifyPanelData();
    }

    public static revive(panel: vscode.WebviewPanel, extensionPath: string) {

    }

    private constructor(panel: vscode.WebviewPanel, context: vscode.ExtensionContext) {
        this.panel = panel;
        this.context = context;
        this.extensionPath = context.extensionPath;

        this.update();

        this.panel.onDidDispose(() => this.dispose(), null, this.disposables);

        this.panel.webview.onDidReceiveMessage(message => {
            //TODO 事件监听分离
            switch (message.type) {
                case 'changeOptions':
                    const newOptions = message.data;
                    this.context.globalState.update(optionsName, newOptions);
                    StatusBar.getInstnce().setOptions(newOptions);
                    console.log(this.context.globalState.get(optionsName));
                    return;
            }
        }, null, this.disposables);
    }

    public doRefactor() {
        this.panel.webview.postMessage({ command: 'refactor' });
    }

    /**
     * 通知webview 修改设置数据
     */
    private notifyPanelData() {
        this.panel.webview.postMessage({
            type: 'options',
            data: this.context.globalState.get(optionsName)
        });
    }

    public dispose() {
        SettingsPanel.currentPanel = undefined;
        this.panel.dispose();

        while (this.disposables.length) {
            const x = this.disposables.pop();
            x && x.dispose();
        }
    }

    private async update() {
        this.panel.title = 'settings';
        this.panel.webview.html = this.getHtmlForWebview();
    }

    private getHtmlForWebview() {
        return Render(this.extensionPath);
    }
}