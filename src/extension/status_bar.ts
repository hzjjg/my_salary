import * as vscode from 'vscode';

const defaultOptions: Options = {
    updateInterval: 100,
    dailySalary: 600,
    unit: '元',
    startWorkingTime: '9:30',
    endWorkingTime: '18:30',
};

/**
 * 状态栏
 */
export class StatusBar {

    /** 底部barItem对象 */
    private text: vscode.StatusBarItem;
    /** 一天的上班的总毫秒数 */
    private dayTime: number = 0;
    /** 今天日期的字符串 2019-3-16 */
    private todayDateString: string = 'null';
    /** 开始上班的时间戳 */
    private startWorkingTime: number = 0;
    /** 结束上班的时间戳 */
    private endWorkingTime: number = 0;

    private options: Options;

    private context: vscode.ExtensionContext;

    constructor(context: vscode.ExtensionContext) {
        const statedOptions = context.globalState.get('options') as Options;
        const options = Object.assign(defaultOptions, statedOptions || {});
        console.log(options);

        this.context = context;
        this.registerCommand();
        this.options = options;

        this.text = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
        const subscriptions = context.subscriptions;
        subscriptions.push(this.text);
        this.initData();

        this.start();
    }

    /** 根据配置设置初始化的数据 */
    private initData() {
        this.todayDateString = this.getTodayDateString();
        this.startWorkingTime = this.getTime(this.options.startWorkingTime);
        this.endWorkingTime = this.getTime(this.options.endWorkingTime);
        this.dayTime = this.getDayTime();
    }

    /**
     * 重新设置配置
     * @param options 配置
     */
    public setOptions(options: Options) {
        this.options = options;
        this.initData();
    }

    private registerCommand() {
        let disposable = vscode.commands.registerCommand('extension.showMySalary', () => {
            vscode.window.showInformationMessage('已显示你的工资!');
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
        const dailySalary = this.options.dailySalary;

        if (now < this.startWorkingTime) return 0;
        if (now > this.endWorkingTime) return this.options.dailySalary;

        const passedTime = now - this.startWorkingTime;
        const salary = passedTime / this.dayTime * dailySalary;

        return salary.toFixed(4);

    }

    /**
     * 更新数据
     */
    private updateText() {
        const salary = this.getNowSalary();
        this.text.text = `${salary}${this.options.unit}`;

        this.text.show();
    }

    /**
     * 开始显示数据
     */
    private start() {
        setInterval(() => {
            this.updateText();
        }, this.options.updateInterval);
    }

}