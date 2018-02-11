const React = window.React = require('react');
import AssetCard2 from './AssetCard2.jsx';
import MagicSpoon from '../lib/MagicSpoon';

export default class DepositModal extends React.Component {
  constructor(props) {
    super(props);
    this.unsubModal = this.props.d.modal.event.sub(() => {this.forceUpdate()});
    this.unsubSession = this.props.d.session.event.sub(() => {this.forceUpdate()});
    this.state = {};
  }
  componentDidMount() {
  }
  componentWillUnmount() {
    this.unsubModal();
    this.unsubSession();
  }

  render() {
    let d = this.props.d;
    let asset = d.modal.inputData;

    return <div className="GlobalModal">
      <div className="GlobalModal__header">
        Instructions for depositing {asset.code}
      </div>
      <div className="GlobalModal__content">
        <div>
          <p className="DepositModal__addressLabel">Your deposit address</p>
          <p className="DepositModal__address">{d.session.account.account_id}</p>
        </div>
        <div className="DepositModal__assetCard">
          <AssetCard2 code={asset.code} issuer={asset.issuer} />
        </div>
      </div>
      <div className="GlobalModal__navigation">
        <button className="s-button s-button--light" onClick={() => {d.modal.handlers.cancel()}}>Cancel</button>
      </div>
    </div>
  }
}
