import _ from 'lodash';

import Event from '../Event';

export default function Modal(driver) {
  this.event = new Event();

  const init = () => {
    this.active = false; // false or true
    this.modalName = '';
    this.inputData = null;
  };
  init();

  let activeResolver = () => {};

  // setInterval(() => {
  //   this.active = !this.active;
  //   this.event.trigger();
  // }, 1000);

  this.handlers = {
    // To activate a modal, use d.modal.activate
    // The callback will give you an object that always contains status
    activate: (modalName, inputData) => {
      if (this.active) {
        // You can only activate if not already active
        console.error('Bug: Trying to create ' + modalName + ' but a modal is already active');
        return Promise.resolve({
          status: 'cancel',
        });
      }

      this.active = true;
      this.modalName = modalName;
      this.inputData = inputData;
      this.event.trigger();
      return new Promise(function(resolve, reject){
        activeResolver = resolve;
      });
    },
    cancel: () => {
      this.active = false;
      this.modalName = '';
      activeResolver({
        status: 'cancel',
      });
      this.event.trigger();
    },
    finish: (output) => {
      // output is what the modal gives us
      this.active = false;
      activeResolver({
        status: 'finish',
        output: output,
      });
      this.event.trigger();
    },
  };
}
