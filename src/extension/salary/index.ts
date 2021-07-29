import * as vscode from 'vscode';
import { timestampOf } from '../utils';

/**
 * 状态栏
 */
export class Salary {

    private statusBar: vscode.StatusBarItem;

    private config: vscode.WorkspaceConfiguration;

    private context: vscode.ExtensionContext;

    private salaryTimmer: any = 0;

    public static salary: Salary;

    public static getInstnce(context?: vscode.ExtensionContext) {
        if (context && !this.salary) {
            this.salary = new Salary(context);
        }
        return this.salary || null;
    }

    private constructor(context: vscode.ExtensionContext) {
        this.config = vscode.workspace.getConfiguration('mySalary')
        this.context = context;

        this.statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
        const subscriptions = context.subscriptions;
        subscriptions.push(this.statusBar);

        this.registerCommands()
        this.start();

        /**
         * 监听配置更新
         */
        vscode.workspace.onDidChangeConfiguration((e) => {
            console.log(e.affectsConfiguration('mySalary'));

            if (!e.affectsConfiguration('mySalary')) return

            this.config = vscode.workspace.getConfiguration('mySalary')
            this.start()
        })

        this.statusBar.command = 'extension.openSettings'
    }

    /**
     * 计一天上班的毫秒数
     */
    get workingTimeOfDay() {
        return this.endWorkingTime - this.startWorkingTime;
    }

    get startWorkingTime() {
        return timestampOf(this.config.get('workingHours.from') as string);
    }

    get endWorkingTime() {
        return timestampOf(this.config.get('workingHours.to') as string);
    }

    private registerCommands() {

        this.context.subscriptions.push(
            vscode.commands.registerCommand('extension.showMySalary', () => {
                this.start()
            }),

            vscode.commands.registerCommand('extension.hideMySalary', () => {
                this.stop()
                this.statusBar.hide()
            }),
            
            vscode.commands.registerCommand('extension.openSettings', () => {
                vscode.commands.executeCommand('workbench.action.openSettings', 'mySalary')
            }),
        )
    }

    /**
     * 获取今日此时的工资数
     */
    private nowSalary() {
        const now = Date.now();
        const dailyWages = this.config.get('dailyWages') as number

        if (isNaN(dailyWages) || dailyWages == 0) return 0

        if (now < this.startWorkingTime) return 0;
        if (now > this.endWorkingTime) return dailyWages

        const passedTime = now - this.startWorkingTime;
        const salary = passedTime / this.workingTimeOfDay * dailyWages;

        return salary.toFixed(this.config.get('decimal'));
    }

    private statusBarText() {
        const salary = this.nowSalary();

        if (salary == 0) {
            return '请先设置日工资'
        }

        return `${this.config.get('prefix')}${salary}${this.config.get('unit')}`;
    }

    /**
     * 更新数据
     */
    private updateText() {
        this.statusBar.text = this.statusBarText()
    }

    /**
     * 开始显示数据
     */
    private start() {
        this.stop()
        this.salaryTimmer = setInterval(() => {
            this.updateText();
        }, Math.max(16.7, this.config.get('updateInterval') as number));
        this.statusBar.show()
    }

    private stop() {
        this.salaryTimmer && clearImmediate(this.salaryTimmer)
    }

}