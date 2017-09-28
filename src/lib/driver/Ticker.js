import req from '../req.js';
import Event from '../Event';

const RETRY_INTERVAL = 1000; // ms

export default function Ticker() {
  this.event = new Event();

  this.ready = false;
  this.data = {};

  this.load();
}

Ticker.prototype.load = function() {
  req.getJson('https://api.stellarterm.com/v1/ticker.json')
  .then(tickerData => {
    this.ready = true;
    this.data = tickerData;
    this.event.trigger();
  })
  .catch(e => {
    console.log('Unable to load ticker');
    setTimeout(() => {
      this.load();
    }, RETRY_INTERVAL)
  })
}
