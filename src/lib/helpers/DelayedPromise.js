export default class DelayedPromise {
    constructor(delay, data) {
        this.delay = delay;
        this.timeout = null;

        this.promiseValue = new Promise(resolve => {
            this.resolve = resolve;
        });

        this.reset(data);
    }

    get promise() {
        return this.promiseValue;
    }

    immediatelyResolve(data) {
        if (this.timeout) {
            clearTimeout(this.timeout);
        }

        this.resolve(data);
    }

    reset(data) {
        if (this.timeout) {
            clearTimeout(this.timeout);
        }

        this.timeout = setTimeout(() => {
            this.resolve(data);
        }, this.delay);
    }
}
