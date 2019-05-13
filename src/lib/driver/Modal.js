import Event from '../Event';

export default function Modal() {
    this.event = new Event();
    this.active = false;
    this.modalName = '';
    this.inputData = null;
    this.activeResolver = () => {};

    this.handlers = {
        // To activate a modal, use d.modal.activate
        // The callback will give you an object that always contains status
        activate: (modalName, inputData) => {
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
