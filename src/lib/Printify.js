const React = window.React = require('react');
import BigNumber from 'bignumber.js';
import _ from 'lodash';

// For pretty printing in the UI
const Printify = {
  lightenZeros(number, numDecimals) {
    if (!_.isString(number)) {
      throw new Error('lightenZeros only takes in strings');
    }

    if (numDecimals !== undefined) {
      number = new BigNumber(number).toFixed(numDecimals);
    }

    let emph = number.replace(/\.?0+$/, '');
    let unemphMatch = number.match(/\.?0+$/);
    let unemph;
    if (unemphMatch !== null) {
      unemph = <span className="lightenZeros__unemph">{unemphMatch[0]}</span>
    }
    // Formats a number into a react element with 0s unemphasized
    return <span className="lightenZeros">{emph}{unemph}</span>;
  },
  lighten(input) {
    if (!_.isString(input)) {
      throw new Error('lighten only takes in strings');
    }
    return <span className="lightenZeros"><span className="lightenZeros__unemph">{input}</span></span>;
  },
};

export default Printify;
