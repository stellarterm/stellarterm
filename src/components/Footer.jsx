const React = window.React = require('react');
import Generic from './Generic.jsx';

export default class Footer extends React.Component {
  render() {
    return <div className="so-back Footer">
      <div className="so-chunk Footer__chunk">
        <div className="Footer__disclaimer">
          Cryptocurrency assets are subject to high market risks and volatility. Past performance is not indicative of future results. Investments in blockchain assets may result in loss of part or all of your investment. StellarTerm does NOT endorse ANY asset on the Stellar network. Please do your own research and use caution.
        </div>
        <div className="Footer__list">
          <p  className="Footer__list__item"><a href="#privacy">Privacy Policy</a></p>
          <p  className="Footer__list__item"><a href="#terms-of-use">Terms of use</a></p>
        </div>
      </div>
    </div>
  }
}

