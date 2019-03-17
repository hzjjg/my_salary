import * as vscode from 'vscode';
import options from './config';

export class StatusBar {

    /** 底部barItem对象 */
    private text: vscode.StatusBarItem;
    /** 一天的上班的总毫秒数 */
    private dayTime: number;
    /** 今天日期的字符串 2019-3-16 */
    private todayDateString: string;
    /** 开始上班的时间戳 */
    private startWorkingTime: number;
    /** 结束上班的时间戳 */
    private endWorkingTime: number;

    private context: vscode.ExtensionContext;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.registerCommand();

        this.text = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
        this.todayDateString = this.getTodayDateString();
        this.startWorkingTime = this.getTime(options.startWorkingTime);
        this.endWorkingTime = this.getTime(options.endWorkingTime);
        this.dayTime = this.getDayTime();

        const subscriptions = context.subscriptions;
        subscriptions.push(this.text);

        this.start();
    }

    private registerCommand() {
        let disposable = vscode.commands.registerCommand('extension.helloWorld', () => {
            vscode.window.showInformationMessage('hzjjg!');
        });

        this.context.subscriptions.push(disposable);
    }

    /**
     * 获取今日日期的字符串: 2019-3-16
     */
    private getTodayDateString() {
        const today = new Date();
        return `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
    }

    /**
     * 获取某个时间在当天的时间戳
     * @param timeString 时间 如 9:00
     */
    private getTime(timeString: string) {
        return new Date(`${this.todayDateString} ${timeString}`).getTime();
    }

    /**
     * 计算一天上班的毫秒数
     */
    private getDayTime() {
        return this.endWorkingTime - this.startWorkingTime;
    }

    /**
     * 获取今日此时的工资数
     */
    private getNowSalary() {
        const now = Date.now();
        const dailySalary = options.dailySalary;

        if (now < this.startWorkingTime) return 0;
        if (now > this.endWorkingTime) return options.dailySalary;

        const passedTime = now - this.startWorkingTime;
        const salary = passedTime / this.dayTime * dailySalary;

        return salary.toFixed(4);

    }

    /**
     * 更新数据
     */
    private updateText() {
        const salary = this.getNowSalary();
        this.text.text = `${salary}${options.unit}`;

        this.text.show();
    }

    /**
     * 开始显示数据
     */
    private start() {
        setInterval(() => {
            this.updateText();
        }, options.updateInterval);
    }

}