import Event from '../Event';

export default function Modal() {
    this.event = new Event();
    this.active = false;
    this.modalName = '';
    this.inputData = null;
    this.activeResolver = () => {};
    this.txStatus = false;

    this.handlers = {
        // To activate a modal, use d.modal.activate
        // The callback will give you an object that always contains status
        activate: (modalName, inputData) => {
            this.txStatus = false;
            if (this.active) {
                // You can only activate if not already active
                console.error(`Bug: Trying to create ${modalName} but a modal is already active`);

                return Promise.resolve({
                    status: 'cancel',
                });
            }

            this.active = true;
            this.modalName = modalName;
            this.inputData = inputData;
            this.event.trigger();

            return new Promise((resolve) => {
                this.activeResolver = resolve;
            });
        },

        cancel: () => {
            this.active = false;
            this.modalName = '';
            this.activeResolver({
                status: 'cancel',
            });
            this.event.trigger();
        },

        waitLedger: (output) => {
            this.activeResolver({
                status: 'finish',
                output,
            });
            this.event.trigger();
        },

        ledgerFinish: (result) => {
            this.txStatus = result;
            switch (result) {
            case 'clickOK':
                this.active = false;
                this.modalName = '';
                clearTimeout(this.timeoutClose);
                this.event.trigger();
                break;
            case 'error':
                this.event.trigger();
                break;
            case true:
                this.timeoutClose = setTimeout(() => {
                    this.active = false;
                    this.modalName = '';
                    this.event.trigger();
                }, 3000);
                break;
            default:
                break;
            }
        },

        finish: (output) => {
            this.active = false;
            this.modalName = '';
            this.activeResolver({
                status: 'finish',
                output,
            });
            this.event.trigger();
        },
    };
}
