/**
 * 设置页面webview 的script
 */
declare const acquireVsCodeApi: any;

const defaultOptions: Options = {
    updateInterval: 100,
    dailySalary: 600,
    unit: '元',
    startWorkingTime: '9:30',
    endWorkingTime: '18:30',
};

class SettingsPage {

    private vscode: any;

    private oldOptions: any;

    private options: Options;

    constructor() {
        this.vscode = acquireVsCodeApi();
        // this.vscode.setState(defaultOptions);
        this.oldOptions = this.vscode.getState();
        console.log('oldState');
        console.log(this.oldOptions);

        this.options = this.oldOptions || defaultOptions;

        this.init();
    }

    setOptions(options: Options) {
        this.options = Object.assign(this.options, options);
    }

    initMessageListener() {
        window.addEventListener('message', message => {
            const { type, data } = message.data;
            console.log('webview receive message');

            //TODO 写事件处理器
            switch (type) {
                case 'options':
                    this.setOptions(data);
                    this.setFormValue(this.options);
                    break;
                default:
                    break;
            }
        });
    }

    bindDom() {
        for (const key in this.options) {
            if (this.options.hasOwnProperty(key)) {
                const formItem = this.getFormItem(key);

                formItem.onchange = (event) => {
                    const target = event.target as HTMLInputElement;
                    (<any>this.options)[key] = target.value;
                    this.saveState();
                    this.emitOptionChange();
                };
            }
        }
    }

    getFormItem(formId: string) {
        return document.getElementById(formId) as HTMLInputElement;
    }

    setFormValue(options: Options) {
        for (const key in options) {
            if (options.hasOwnProperty(key)) {
                const element = (options as any)[key];
                const formItem = this.getFormItem(key);
                formItem.value = element;
            }
        }
    }

    saveState() {
        this.vscode.setState(this.options);
    }

    emitOptionChange() {
        this.vscode.postMessage({
            type: 'changeOptions',
            data: Object.assign({}, this.options)
        });
    }

    init() {
        this.setFormValue(this.options);
        this.bindDom();
        this.initMessageListener();
    }
}

new SettingsPage();