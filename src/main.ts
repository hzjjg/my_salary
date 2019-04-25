import * as vscode from 'vscode';
import { StatusBar, Settings } from './extension';

export function activate(context: vscode.ExtensionContext) {

	console.log('Congratulations, your extension "mysalary" is now active!');

	StatusBar.getInstnce(context);
	new Settings(context);
}

export function deactivate() { }
