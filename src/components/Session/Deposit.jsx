const React = window.React = require('react');
import DepositCurrency from './Deposit/DepositCurrency.jsx';
import DepositAnchors from './Deposit/DepositAnchors.jsx';

export default class Deposit extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      'selectedAsset': null
    }
  }

  render() {
    const account = this.props.d.session.account;
    const allAssets = account.getSortedBalances({hideNative: true}); // From MagicSpoon.Account

    let currencyPicker;
    let anchors;
    if (allAssets.length == 0) {
      const noTrustLines = (<div className="Deposit__content">
        You haven't trusted any assets. Click here to <a href="#account/addTrust">create your first trust line</a>.
        </div>);
      currencyPicker = noTrustLines;
      anchors = noTrustLines;
    } else {
      currencyPicker = (
        <div className="Deposit__dropdown s-inputGroup__item S-flexItem-noFlex">
          <DepositCurrency
            d={this.props.d}
            allAssets={allAssets}
            selectedAsset={this.state.selectedAsset || allAssets[0].code}
            onCurrencyChange={ newAsset => this.setState({ 'selectedAsset': newAsset }) }
            />
        </div>
      );
      anchors = (<DepositAnchors
        d={this.props.d}
        selectedAssetCode={this.state.selectedAsset || allAssets[0].code}
        />);
    }

    return (
      <div>
        <div className="so-back islandBack islandBack--t">
          <div className="island">
            <div className="island__header">
              Pick a currency for the deposit
            </div>
            <div className="Deposit__content">
              If you want to deposit or withdraw funds, either in fiat or from other blockchains, you may use an anchor service to do so.
              <br/>
              You'll find a selection of currencies in the tabs below. Start by choosing a currency to deposit.
            </div>
            {currencyPicker}
          </div>
        </div>
        <div className="so-back islandBack">
          <div className="island">
            <div className="island__header">
              Anchors accepting deposits
            </div>
            {anchors}
          </div>
        </div>
      </div>
    );
  }
}