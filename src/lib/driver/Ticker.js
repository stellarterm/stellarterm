import req from '../req.js';
import Event from '../Event';


export default function Ticker() {
  this.event = new Event();

  this.ready = false;
  this.data = {};

  this.load();
}

const MAX_ATTEMPTS = 5;

Ticker.prototype.load = function(attempt) {
  if (attempt >= MAX_ATTEMPTS) {
    return;
  }
  req.getJson('https://api.stellarterm.com/v1/ticker.json')
  .then(tickerData => {
    this.ready = true;
    this.data = tickerData;
    this.event.trigger();
  })
  .catch(e => {
    console.log('Unable to load ticker');
    if (!attempt) {
      attempt = 0;
    }
    setTimeout(() => {
      this.load(attempt + 1);
    }, 100)
  })
}
