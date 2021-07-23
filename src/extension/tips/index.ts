import * as vscode from 'vscode';

/**
 * 小提示
 */
export class Tips {

    public static tips: Tips

    private config: vscode.WorkspaceConfiguration

    public static getInstances(context?: vscode.ExtensionContext) {
        if (context && !this.tips) {
            this.tips = new Tips(context);
        }
        return this.tips || null;
    }

    private constructor(context: vscode.ExtensionContext) {
        this.config = vscode.workspace.getConfiguration('mySalary')
    }
}