class settingsPage {

    constructor() {
        this.vscode = acquireVsCodeApi();
        this.oldState = this.vscode.getState();

        this.options = {
            updateInterval: 100,
            dailySalary: 600,
            unit: '元',
            startWorkingTime: '9:30',
            endWorkingTime: '18:30',
        }

        this.init();
    }

    setOptions(options) {
        this.options.updateInterval = options.updateInterval;
        this.options.dailySalary = options.dailySalary;
        this.options.unit = options.unit;
        this.options.startWorkingTime = options.startWorkingTime;
        this.options.endWorkingTime = options.endWorkingTime;
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
                const dom = document.getElementById(key);
                dom.onchange = (event) => {
                    console.log(event);
                    this.options[key] = event.target.value;
                    this.save();
                }

                Reflect.defineProperty(this.options, key, {
                    set(v) {
                        dom.value = v;
                    }
                })
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

new settingsPage();