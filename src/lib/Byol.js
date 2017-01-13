export default function Byol() {
  const events = {}; // Build your own listener
  // returns a event id reference that can be used to unlisten
  this.listen = (eventName, cb) => {
    if (!events[eventName]) {
      events[eventName] = {
        nextIndex: 0,
        listeners: [], // stores callbacks
      };
    }
    const listenerIndex = events[eventName].nextIndex;
    events[eventName].nextIndex += 1;
    events[eventName].listeners[listenerIndex] = cb;
    return listenerIndex;
  };

  this.unlisten = (eventName, id) => {
    if (!isFinite(id)) {
      throw new Error('Invalid unlisten id');
    }
    events[eventName] = null;
  };

  // Organized way to trigger things (single source of truth)
  // Using trigger directly is not allowed
  this.trigger = (eventName) => {
    if (!events[eventName]) {
      return;
    }
    for (let i = 0; i < events[eventName].nextIndex; i += 1) {
      const listener = events[eventName].listeners[i];
      if (listener) {
        listener();
      }
    }
  };
}
