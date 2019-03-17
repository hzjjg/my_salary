import * as path from 'path';
import * as vscode from 'vscode';

export default (extensionPath: string) => {

    const scriptPathOnDisk = vscode.Uri.file(path.join(
        extensionPath,
        'src/extension/settings_page',
        'index.js'));
    const scriptUri = scriptPathOnDisk.with({ scheme: 'vscode-resource' });

    const nonce = getNonce();

    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src vscode-resource: https:; script-src 'nonce-${nonce}';">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>config</title>

        <style type="text/css">
            .config-input{
                height:100px;
            }
        </style>
    </head>

    <body>
        <h1>设置</h1>
        
        <div class="config-item">
            <h3 class="config-title">日工资</h3>
            <p class="config-desc">就是日工资啊</p>
            <div class="config-input">
                <input type="text" id="dailySalary" />
            </div>
        </div>

        <div class="config-item">
            <h3 class="config-title">每日工作时间</h3>
            <p class="config-desc">格式 HH:mm 例如 9:30</p>
            <div class="config-input">
                <input type="text" placeholder="上班时间" id="startWorkingTime" />
                -
                <input type="text" placeholder="下班时间" id="endWorkingTime" />
            </div>
        </div>

        <div class="config-item">
            <h3 class="config-title">货币单位（后缀）</h3>
            <p class="config-desc">会显示在工资后面，例如“元” “包狗粮”</p>
            <div class="config-input">
                <input type="text" id="unit"/>
            </div>
        </div>

        <div class="config-item">
            <h3 class="config-title">刷新金额时间间隔</h3>
            <p class="config-desc">单位ms 范围16.7 - 5000 ，default 100</p>
            <div class="config-input">
                <input type="text" id="updateInterval" />
            </div>
        </div>

    </body>

    <script nonce="${nonce}" src="${scriptUri}"></script>
    </html>`;
};


function getNonce() {
    let text = "";
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;

}