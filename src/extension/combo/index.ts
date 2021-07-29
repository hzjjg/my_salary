import * as vscode from 'vscode';

export default class Combo {

    static combo: Combo

    private context: vscode.ExtensionContext

    static getInstance(context?: vscode.ExtensionContext) {
        if (this.combo) return this.combo
        if (!context) throw new Error('param "context" is required');
        this.combo = new Combo(context)
        return this.combo
    }

    private constructor(context: vscode.ExtensionContext) {
        this.context = context

        vscode.window.createTextEditorDecorationType({

        })
    }
}