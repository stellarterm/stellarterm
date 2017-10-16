const React = window.React = require('react');
import Select from 'react-select';

export default class DepositCurrency extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const options = this.props.allAssets.map(asset => ({ value: asset.code, label: asset.code }));
    const selectedValue = { value: this.props.selectedAsset, label: this.props.selectedAsset };
    
    return (
      <div>
        <Select
          clearable={false}
          options={options}
          value={selectedValue}
          onChange={(newValue) => this.props.onCurrencyChange(newValue.value)}
        />
      </div>
    );
  }
}