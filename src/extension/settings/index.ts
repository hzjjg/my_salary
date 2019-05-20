import * as vscode from 'vscode';
import Render from '../../settings_page/settings_render';
import { StatusBar } from '../status_bar';

const optionsName = 'options';


export class SettingsPanel {

    public static currentPanel: SettingsPanel;

    public static readonly viewType = 'settings';

    private readonly panel: vscode.WebviewPanel;
    private static context: vscode.ExtensionContext;
    private readonly extensionPath: string;
    private disposables: vscode.Disposable[] = [];

    public static getInstance(context?: vscode.ExtensionContext) {
        if (this.currentPanel) {
            return this.currentPanel;
        }

        if (!context) {
            console.error('need argument context');
            return;
        }
        this.context = context;
        this.currentPanel = new SettingsPanel();
        return this.currentPanel;
    }

    private static createPanel(): vscode.WebviewPanel {
        const column = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.viewColumn : undefined;
        const panel = vscode.window.createWebviewPanel(this.viewType, 'settings', column || vscode.ViewColumn.One, {
            enableScripts: true,
            localResourceRoots: [
                vscode.Uri.file(SettingsPanel.context.extensionPath)
            ],
        });
        return panel;
    }

    /**
     * 打开webview
     */
    public show() {
        this.panel.reveal();
        this.notifyPanelData();
    }

    public revive() {

    }

    private constructor() {
        this.panel = SettingsPanel.createPanel();
        const context = SettingsPanel.context;
        this.extensionPath = context.extensionPath;

        this.update();

        this.panel.onDidDispose(() => this.dispose(), null, this.disposables);

        this.panel.webview.onDidReceiveMessage(message => {
            this.listenMessgae(message);
        }, null, this.disposables);

        this.notifyPanelData();
    }

    listenMessgae(message: any) {
        switch (message.type) {
            case 'changeOptions':
                this.listenOptionChange(message);
                break;
        }
    }

    listenOptionChange(message: any) {
        const newOptions = message.data;
        SettingsPanel.context.globalState.update(optionsName, newOptions);
        const statusBar = StatusBar.getInstnce();
        statusBar.setOptions(newOptions);

        console.log(SettingsPanel.context.globalState.get(optionsName));

        return;
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
            data: SettingsPanel.context.globalState.get(optionsName)
        });
    }

    public dispose() {
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

export function registerSettings(context:vscode.ExtensionContext) {
    context.subscriptions.push(vscode.commands.registerCommand('extension.openSettings', () => {
        const settingsPanel = SettingsPanel.getInstance(context) as SettingsPanel;
        settingsPanel.show();
    }));
    
    context.subscriptions.push(vscode.commands.registerCommand('extension.doRefactor', () => {
        const settingsPanel = SettingsPanel.getInstance(context) as SettingsPanel;
        settingsPanel.doRefactor();
    }));
    
    if (vscode.window.registerWebviewPanelSerializer) {
        vscode.window.registerWebviewPanelSerializer(SettingsPanel.viewType, {
            deserializeWebviewPanel: async (webviewPanel: vscode.WebviewPanel, state: any) => {
                console.log(`Got state: ${state}`);
                const settingsPanel = SettingsPanel.getInstance(context) as SettingsPanel;
                settingsPanel.revive();
            }
        });
    }
}