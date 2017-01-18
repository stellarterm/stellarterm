const React = window.React = require('react');
// For pretty printing in the UI
const Printify = {
  lightenZeros(number) {
    let emph = number.replace(/\.?0+$/, '');
    let unemphMatch = number.match(/\.?0+$/);
    let unemph;
    if (unemphMatch !== null) {
      unemph = <span className="lightenZeros__unemph">{unemphMatch[0]}</span>
    }
    // Formats a number into a react element with 0s unemphasized
    return <span className="lightenZeros">{emph}{unemph}</span>;
  },
};

export default Printify;
