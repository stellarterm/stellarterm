const React = window.React = require('react');
import BigNumber from 'bignumber.js';
import _ from 'lodash';

// For pretty printing in the UI
const Printify = {
  lightenZeros(number, numDecimals) {
    if (!_.isString(number)) {
      console.error('lightenZeros only takes in strings. Got type: ' + typeof number);
      return <span className="lightenZeros">{number}</span>;
    }

    if (numDecimals !== undefined) {
      number = new BigNumber(number).toFixed(numDecimals);
    }

    let wholeAmount = number.replace(/\..*/,'');
    let remaining = number.slice(wholeAmount.length);

    let emph = remaining.replace(/\.?0+$/, '');

    let unemphMatch = remaining.match(/\.?0+$/);
    let unemph;
    if (unemphMatch !== null) {
      unemph = <span className="lightenZeros__unemph">{unemphMatch[0]}</span>
    }
    // Formats a number into a react element with 0s unemphasized
    return <span className="lightenZeros">{Number(wholeAmount).toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 0})}{emph}{unemph}</span>;
  },
  lighten(input) {
    if (!_.isString(input)) {
      throw new Error('lighten only takes in strings');
    }
    return <span className="lightenZeros"><span className="lightenZeros__unemph">{input}</span></span>;
  },
};

export default Printify;
