import _ from 'lodash';

import Event from '../Event';

export default function Modal(driver) {
  this.event = new Event();

  const init = () => {
    this.active = false; // false or true
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
    activate: (modalName) => {
      if (this.active) {
        // You can only activate if not already active
        console.error('Bug: Trying to create ' + modalName + ' but a modal is already active');
        return Promise.resolve({
          status: 'cancel',
        });
      }

      this.active = true;
      this.event.trigger();
      return new Promise(function(resolve, reject){
        activeResolver = resolve;
      });
    },
    cancel: () => {
      this.active = false;
      activeResolver({
        status: 'cancel',
      });
      this.event.trigger();
    },
    finish: (modalData) => {
      // modalData is what the modal gives us
      this.active = false;
      activeResolver({
        status: 'finish',
        modalData: modalData,
      });
      this.event.trigger();
    },
  };
}
