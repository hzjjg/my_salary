/** window */
declare const acquireVsCodeApi: any;

class SettingsPage {

    private vscode: any;

    private oldState: any;

    private options: Options;

    constructor() {
        this.vscode = acquireVsCodeApi();
        this.oldState = this.vscode.getState();
        this.options = {
            updateInterval: 100,
            dailySalary: 600,
            unit: '元',
            startWorkingTime: '9:30',
            endWorkingTime: '18:30',
        };

        this.init();
    }

    setOptions(options: Options) {
        Object.assign(this.options, options);
    }

    initMessageListener() {
        window.addEventListener('message', event => {
            const message = event.data;
            console.log(message);
            this.setOptions(message);
        });
    }

    bindDom() {
        for (const key in this.options) {
            if (this.options.hasOwnProperty(key)) {
                const dom = document.getElementById(key) as HTMLElement;
                dom.onchange = (event) => {
                    console.log(event);
                    (<any>this.options)[key] = (<any>event.target).value;
                    this.save();
                };

                Reflect.defineProperty(this.options, key, {
                    set(v) {
                        (<HTMLInputElement>dom).value = v;
                    }
                });
            }
        }
    }

    save() {
        this.vscode.postMessage({
            command: 'options',
            data: this.options
        });
    }

    init() {
        this.bindDom();
        this.initMessageListener();
    }
}

interface Options {
    updateInterval: number;
    dailySalary: number;
    unit: string;
    startWorkingTime: string;
    endWorkingTime: string;
}

new SettingsPage();