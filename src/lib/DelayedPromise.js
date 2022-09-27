export default class DelayedPromise {
    constructor(delay) {
        this.delay = delay;
        this.timeout = null;

        this.promiseValue = new Promise(resolve => {
            this.resolve = resolve;
        });

        this.reset();
    }

    get promise() {
        return this.promiseValue;
    }

    reset() {
        if (this.timeout) {
            clearTimeout(this.timeout);
        }

        this.timeout = setTimeout(() => {
            this.resolve();
        }, this.delay);
    }
}
