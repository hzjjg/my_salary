import { Template } from "../script/template";

export class Body extends Template {

    private tempaltes: string[];

    constructor(templates: string[]) {
        super();
        this.tempaltes = templates;
    }

    protected getTemplate() {
        return this.tempaltes.reduce((value, item) => value + item);
    }
}