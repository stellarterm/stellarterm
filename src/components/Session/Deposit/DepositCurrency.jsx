const React = window.React = require('react');
const Assets = require('../../../assets');
import Select from 'react-select';

export default class DepositCurrency extends React.Component {
  constructor(props) {
    super(props);
  }

  _optionRenderer(option) {
    let logo = Assets[option.value];
    if (!logo) {
      logo = Assets['unknown'];
    }

    return (
      <div className="Deposit__dropdown">
        <img className="Deposit__dropdown_img" src={logo}/>
        <div>{option.label}</div>
      </div>
    );
  }

  render() {
    const codes = Array.from(new Set(this.props.allAssets.map(asset => asset.code)));
    const options = codes.map(code => ({ value: code, label: code }));
    const selectedValue = { value: this.props.selectedAsset, label: this.props.selectedAsset };
    
    return (
      <div>
        <Select
          clearable={false}
          options={options}
          value={selectedValue}
          onChange={(newValue) => this.props.onCurrencyChange(newValue.value)}
          optionRenderer={this._optionRenderer.bind(this)}
          valueRenderer={this._optionRenderer.bind(this)}
        />
      </div>
    );
  }
}