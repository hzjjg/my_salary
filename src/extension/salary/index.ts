import * as vscode from 'vscode';

/**
 * 状态栏
 */
export class Salary {

    /** 底部barItem对象 */
    private statusBar: vscode.StatusBarItem;
    /** 一天的上班的总毫秒数 */
    private dayTime: number = 0;
    /** 今天日期的字符串 2019-3-16 */
    private todayDateString: string = 'null';
    /** 开始上班的时间戳 */
    private startWorkingTime: number = 0;
    /** 结束上班的时间戳 */
    private endWorkingTime: number = 0;

    private config: vscode.WorkspaceConfiguration;

    private context: vscode.ExtensionContext;

    private timmer: any = 0;

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
        this.registerCommands()

        this.statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
        const subscriptions = context.subscriptions;
        subscriptions.push(this.statusBar);
        this.initData();
        this.start();

        /**
         * 监听配置更新
         */
        vscode.workspace.onDidChangeConfiguration((e) => {
            console.log(e.affectsConfiguration('mySalary'));
            
            if (!e.affectsConfiguration('mySalary')) return

            this.config = vscode.workspace.getConfiguration('mySalary')
            this.initData()
            this.start()
        })
    }

    /** 根据配置设置初始化的数据 */
    private initData() {
        this.todayDateString = this.getTodayDateString();
        this.startWorkingTime = this.getTime(this.config.get('workingHours.from') as string);
        this.endWorkingTime = this.getTime(this.config.get('workingHours.to') as string);
        this.dayTime = this.getDayTime();
    }

    private registerCommands() {

        this.context.subscriptions.push(
            vscode.commands.registerCommand('extension.showMySalary', () => {
                vscode.window.showInformationMessage('已显示你的工资!');
            }),

            vscode.commands.registerCommand('extension.hideMySalary', () => {
                vscode.window.showInformationMessage('已隐藏你的工资!');
            }),
        )
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
        const timeArr = timeString.split(':')
        if (timeArr.length !== 2) {
            throw new Error("时间格式错误");
        }

        let [hour, minute] = timeArr as unknown[]

        if (isNaN(hour as number) || hour as number > 24 || hour as number < 0) {
            throw new Error("时间格式错误");
        }

        if (isNaN(minute as number) || minute as number > 60 || minute as number < 0) {
            throw new Error("时间格式错误");
        }

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
    private nowSalary() {
        const now = Date.now();
        const dailyWages = this.config.get('dailyWages') as number

        if (now < this.startWorkingTime) return 0;
        if (now > this.endWorkingTime) return dailyWages

        const passedTime = now - this.startWorkingTime;
        const salary = passedTime / this.dayTime * dailyWages;

        return salary.toFixed(this.config.get('decimal'));
    }

    private statusBarText() {
        const salary = this.nowSalary();
        return `${salary}${this.config.get('unit')}`;
    }

    /**
     * 更新数据
     */
    private updateText() {
        this.statusBar.text = this.statusBarText()
        this.statusBar.show();
    }

    /**
     * 开始显示数据
     */
    private start() {
        this.timmer && clearInterval(this.timmer);
        this.timmer = setInterval(() => {
            this.updateText();
        }, Math.max(16.7, this.config.get('updateInterval') as number));
    }

}