import req from '../req.js';
import _ from 'lodash';

export default function Ticker(trigger) {
  let state = {
    ready: false,
    body: {},
  };

  req.getJson('https://api.stellarterm.com/v1/ticker.json')
  .then(tickerData => {
    state.ready = true;
    _.assign(state, tickerData);
    trigger();
  })
  .catch(e => {
    console.error(e);
    req.getJson('https://api.stellarterm.com/v1/ticker.json')
    .then(tickerData => {
      state.ready = true;
      _.assign(state, tickerData);
      trigger();
    })
    .catch(e => {
      console.error(e);
    })
  })

  return state;
}
