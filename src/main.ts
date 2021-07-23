import * as vscode from 'vscode';
import { Salary } from './extension/salary';
import { Tips } from './extension/tips';

export function activate(context: vscode.ExtensionContext) {
	Tips.getInstances(context)
	Salary.getInstnce(context)
}

export function deactivate() { }
