const React = window.React = require('react');
import AssetCard2 from './AssetCard2.jsx';
import AssetPickerNarrow from './AssetPickerNarrow.jsx';
import Stellarify from '../lib/Stellarify';
import _ from 'lodash';

export default class ShutDown extends React.Component {
  render() {
    return <div className={'ShutDown ' + this.props.className}>
    <div className="ShutDown__inside s-alert s-alert--warning">
      <h2 className="ShutDown__title">StellarTerm is shutting down on October 1 2018.</h2>
      <br />
      <p>Development of StellarTerm is unable to keep up with the latest developments of the Stellar network and can't provide the best experience that users all deserve. Unfortunately, due to lack of funding and dev time, StellarTerm will be shutting down.</p>

      <p>On October 1 2018, the web app and StellarTerm API will no longer be available. For alternatives, consider checking out <a href="https://stronghold.co/">Stronghold</a>, <a href="https://www.stellarx.com/">stellarx</a>, or the other wallets listed on https://www.stellar.org/lumens/wallets/. StellarTerm is not affiliated with these services.</p>

      <p>Thank you for all your support. Onwards.</p>
    </div></div>
  }
};
