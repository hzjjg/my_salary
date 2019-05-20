import * as vscode from 'vscode';
import { SettingsPanel, registerSettings } from "./extension/settings/index";
import { StatusBar } from './extension/status_bar';

export function activate(context: vscode.ExtensionContext) {

	console.log('activate');
	console.log(StatusBar);
	

	StatusBar.getInstnce(context);
	registerSettings(context);
}

export function deactivate() { }
