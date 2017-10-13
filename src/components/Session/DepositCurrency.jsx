const React = window.React = require('react');
import Select from 'react-select';

export default class DepositCurrency extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      'selectedAsset': null
    }
  }

  _onCurrencyChange(newAsset) {
    this.setState({ 'selectedAsset': newAsset });
  }

  render() {
    const account = this.props.d.session.account;
    const allAssets = account.getSortedBalances({hideNative: true}); // From MagicSpoon.Account
    const hasAssets = allAssets.length > 0;

    let bodySection;
    if (!hasAssets) {
      bodySection = (<div>
        You haven't trusted any assets. Click here to <a href="#account/addTrust">create your first trust line</a>.
        </div>);
    } else {
      const options = allAssets.map(asset => ({ value: asset.code, label: asset.code }));
      const selectedValue = this.state.selectedAsset || options[0];
      // TODO NNS 1 - add icon via optionRenderer and valueRenderer
      const dropdown = !hasAssets ? null : (<Select
        clearable={false}
        options={options}
        value={selectedValue}
        onChange={this._onCurrencyChange.bind(this)}
      />);
      bodySection = (<div>{dropdown}</div>);
    }
    
    return <div className="deposit-currency island">
      <div className="island__header">
        Pick a currency for the deposit
      </div>
      <div className="Generic__content">
        If you want to deposit or withdraw funds, either in fiat or from other blockchains, you may use an anchor service to do so.
        <br/>
        You'll find a selection of currencies in the tabs below. Start by choosing a currency to deposit.
      </div>
      <div className="dropdown s-inputGroup__item S-flexItem-noFlex">
      {bodySection}
      </div>
    </div>
  }
}