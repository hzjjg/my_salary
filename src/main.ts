import * as vscode from 'vscode';
import { Salary } from './extension/salary';

export function activate(context: vscode.ExtensionContext) {

	console.log('activate');
	console.log(Salary);
	

	Salary.getInstnce(context);
}

export function deactivate() { }
