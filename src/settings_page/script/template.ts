export abstract class Template {

    public get value() {
        return this.getTemplate();
    }

    protected abstract getTemplate(): string;
}