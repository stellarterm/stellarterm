// Use this over Byol. This only supports one event. It turned out that
// we really only need 1 event per category since performance is not an issue.

export default function Event() {
  // This will break at approximately 9007199254740992+1 listens :P
  let nextIndex = 0;
  let listeners = []; // stores callbacks

  // returns a event id reference that can be used to unlisten
  this.listen = cb => {
    const listenerId = nextIndex;
    listeners[listenerId] = cb;
    nextIndex += 1;
    return listenerId;
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

  this.trigger = opts => {
    listeners.forEach(cb => {
      if (cb) {
        cb();
      }
    })
  };
}
