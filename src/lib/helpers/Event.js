/*
  This is how to use it in your jsx component

  constructor(props) {
    super(props);
    this.unsub = this.props.d.orderbook.event.sub(() => {this.forceUpdate()});
  }
  componentWillUnmount() {
    this.unsub();
  }

*/

export default function Event() {
    // This will break at approximately 9007199254740992+1 listens :P
    let nextIndex = 0;
    const listeners = []; // stores callbacks
    const specialListeners = {};

    // returns a event id reference that can be used to unlisten
    // DEPRECATED: Use sub() instead since it's much easier
    this.listen = cb => {
        const listenerId = nextIndex;
        listeners[listenerId] = cb;
        nextIndex += 1;
        return listenerId;
    };

    // TODO: REFACTOR: Use this sub pattern more often
    this.sub = cb => {
        const listenerId = nextIndex;
        listeners[listenerId] = cb;
        nextIndex += 1;
        return () => {
            this.unlisten(listenerId);
        };
    };

    this.subscribeOn = (action, cb) => {
        if (!action || typeof action !== 'string') {
            throw new Error(`Expect action to be string. Recived: ${action}`);
        }

        if (!specialListeners[action]) {
            specialListeners[action] = [];
        }
        specialListeners[action].push(cb);
        return () => this.off(action, cb);
    };

    this.off = (action, cb) => {
        if (!action || !specialListeners[action]) { return; }
        const index = specialListeners[action].findIndex(cb);

        if (index === -1) { return; }
        specialListeners[action].splice(index, 1);
    };

    this.triggerSpecial = (action, data) => {
        if (!action || typeof action !== 'string') {
            throw new Error(`Expect action to be string. Recived: ${action}`);
        }

        if (!specialListeners[action]) { return; }
        specialListeners[action].forEach(cb => cb(data));
    };

    this.unlisten = listenerId => {
        if (!isFinite(listenerId)) {
            throw new Error('Listener ID must be a number');
        }
        if (listenerId > nextIndex) {
            throw new Error('Listener ID out of range');
        }
        listeners[listenerId] = null;
    };

    // Trigger can be called with an object that is passed to the listener
    // eslint-disable-next-line func-names
    this.trigger = function (...args) {
        listeners.forEach(cb => {
            if (cb) {
                cb(...args);
            }
        });
    };
}
