import req from '../req.js';
import Event from '../Event';


export default function Ticker() {
  this.event = new Event();

  this.ready = false;
  this.data = {};

  this.load();
}

const MAX_ATTEMPTS = 120;

Ticker.prototype.load = function(attempt) {
  if (attempt >= MAX_ATTEMPTS) {
    return;
  }
  req.getJson('https://api.stellarterm.com/v1/ticker.json')
  .then(tickerData => {
    this.ready = true;
    this.data = tickerData;
    console.log('Loaded ticker. Data generated ' + Math.round((new Date() - this.data._meta.start * 1000)/1000) + ' seconds ago.')
    this.event.trigger();
    setTimeout(() => {this.load()}, 61*5*1000) // Refresh every 5 minutes
  })
  .catch(e => {
    console.log('Unable to load ticker', e);
    if (!attempt) {
      attempt = 0;
    }
    setTimeout(() => {
      this.load(attempt + 1);
    }, 1000)
  })
}
