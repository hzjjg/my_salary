import * as path from 'path';
import * as vscode from 'vscode';
import { getNonce } from "../script/utils";
import { Template } from '../script/template';

const scriptPath = 'dist/extension/settings_page/index.js';
export class Page extends Template {

    private extensionPath: string;
    private scriptPathOnDisk: vscode.Uri;
    private nonce = getNonce();
    private bodyTemplate: string;

    constructor(bodyTemplate: string, extensionPath: string) {
        super();
        this.bodyTemplate = bodyTemplate;
        this.extensionPath = extensionPath;
        this.scriptPathOnDisk = this.getScriptPath();
    }

    /**
     * 获取js文件在磁盘位置
     */
    getScriptPath() {
        return vscode.Uri.file(path.join(this.extensionPath, scriptPath));
    }

    getScriptUri() {
        return this.scriptPathOnDisk.with({ scheme: 'vscode-resource' });
    }

    protected getTemplate() {
        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src vscode-resource: https:; script-src 'nonce-${this.nonce}';">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>mySalary config</title>
    
            <style type="text/css">
                .config-input{
                    height:100px;
                }
            </style>

        </head>
    
        <body>
                ${this.bodyTemplate}
        </body>
    
        <script nonce="${this.nonce}" src="${this.getScriptUri()}"></script>
        </html>`;
    }
}