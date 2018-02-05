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
  let listeners = []; // stores callbacks

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
      this.unlisten(listenerId)
    }
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
  this.trigger = (data) => {
    listeners.forEach(cb => {
      if (cb) {
        cb(data);
      }
    })
  };
}
