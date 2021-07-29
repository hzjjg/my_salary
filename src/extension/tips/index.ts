import * as vscode from 'vscode';
import { timestampOf } from '../utils';

enum WorkingTimeStatus {
    /** 刚上班 */
    notYetStart = 'notYetStart',
    /** 刚上班 */
    justStart = 'justStart',
    /** 正常时间 */
    normal = 'normal',
    /** 下午茶时间 */
    teaTime = 'teaTime',
    /** 快要下班 */
    soonGetOff = 'soonGetOff',
    /** 加班时间 */
    overTime = 'overTime',
}

/**
 * 小提示
 */
export class Tips {

    public static tips: Tips

    private config: vscode.WorkspaceConfiguration

    private statusBar: vscode.StatusBarItem

    private context: vscode.ExtensionContext

    private active = true

    public workingStatus = WorkingTimeStatus.justStart

    private timmer: any = 0

    public static getInstances(context?: vscode.ExtensionContext) {
        if (context && !this.tips) {
            this.tips = new Tips(context);
        }
        return this.tips || null
    }

    private constructor(context: vscode.ExtensionContext) {
        this.context = context
        this.config = vscode.workspace.getConfiguration('mySalary')
        this.statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
        const subscriptions = context.subscriptions;
        subscriptions.push(this.statusBar);
        this.registerCommands()
        this.start()

        /**
         * 监听配置更新
         */
        vscode.workspace.onDidChangeConfiguration((e) => {
            console.log(e.affectsConfiguration('mySalary'));

            if (!e.affectsConfiguration('mySalary')) return

            this.config = vscode.workspace.getConfiguration('mySalary')
            this.active = this.config.get('tips.showTips') as boolean
            this.start()
        })
    }

    get startWorkingTime() {
        return timestampOf(this.config.get('workingHours.from') as string);
    }

    get endWorkingTime() {
        return timestampOf(this.config.get('workingHours.to') as string);
    }


    private registerCommands() {
        this.context.subscriptions.push(
            vscode.commands.registerCommand('extension.showTips', () => this.statusBar.show()),
            vscode.commands.registerCommand('extension.hideTips', () => this.statusBar.hide()),
        )
    }

    getWorkingStatus() {
        const currTime = Date.now()

        const halfHour = 30 * 60 * 1000

        if (currTime < this.startWorkingTime) return WorkingTimeStatus.notYetStart
        else if (currTime - this.startWorkingTime < halfHour) return WorkingTimeStatus.justStart

        else if (new Date().getHours() === 15) return WorkingTimeStatus.teaTime

        else if (currTime > this.endWorkingTime) return WorkingTimeStatus.overTime
        else if (this.endWorkingTime - currTime < halfHour) return WorkingTimeStatus.soonGetOff

        return WorkingTimeStatus.normal
    }

    statusBarText(workingStatus: WorkingTimeStatus) {
        const tips = this.config.get('tips.tips') as Record<WorkingTimeStatus, string>
        return tips[workingStatus]
    }

    updateStatusBar() {
        this.workingStatus = this.getWorkingStatus()
        this.statusBar.text = this.statusBarText(this.workingStatus)
        if (!this.statusBar.text) {
            this.statusBar.hide()
        } else {
            this.statusBar.show()
        }
    }

    start() {
        if (!this.active) {
            this.statusBar.hide()
            return
        }

        clearInterval(this.timmer)
        this.updateStatusBar()
        this.timmer = setInterval(this.updateStatusBar.bind(this), 30 * 1000)
    }
}